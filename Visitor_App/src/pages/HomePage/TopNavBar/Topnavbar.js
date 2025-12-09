import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ReactSession } from 'react-client-session';
import { FaBell } from 'react-icons/fa';
import { FiEdit2, FiKey, FiLogOut } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";
import CustomAlert from '../../../CustomAlert';
import './Topnavbar.css';
import { Fingerprint } from 'lucide-react';
import { AnimatePresence } from "framer-motion";
import { Image } from 'react-bootstrap';
import { SERVER_PORT } from '../../../constant';
import localprofilePic from '../profile.png';


function bufferToBase64(buffer) {
  if (!buffer) return '';
  if (typeof buffer === 'string') return buffer;
  if (buffer.data) {
    return btoa(
      new Uint8Array(buffer.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
  }
  return '';
}

export default function Topnavbar({ isSidenavOpen }) {
  const [loginTime] = useState(new Date().toLocaleTimeString());
  const [alerts, setAlerts] = useState([]);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [isNotificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [drawerContentOpen, setDrawerContentOpen] = useState(false);
  const [userData, setUserData] = useState({});


  const username = ReactSession.get('username');
  const name = sessionStorage.getItem('name');
  const userId = sessionStorage.getItem('userId');


  useEffect(() => {
    if (username) {
      axios.get(`${SERVER_PORT}/edit_profile/${username}`)
        .then(response => {
          const user = response.data;
          setUserData(user);
          if (user.adm_users_profileimage) {
            ReactSession.set("profileimage", user.adm_users_profileimage);
          }
        })
        .catch(error => console.error("Error fetching user data:", error));
    }
  }, [username]);

  useEffect(() => {
    const checkAttendanceStatus = async () => {
      if (!userId) {
        return;
      }

      try {
        const response = await axios.get(`${SERVER_PORT}/AttendanceStatus/${userId}`);
        const { isPunchedIn: serverPunchedIn, isPunchedOut: serverPunchedOut } = response.data;
        const currentlyPunchedIn = serverPunchedIn && !serverPunchedOut;
        setIsPunchedIn(currentlyPunchedIn);
      } catch (err) {
        console.error("Error checking attendance status:", err);
        setIsPunchedIn(false);
      }
    };
    checkAttendanceStatus();
  }, [userId]);


  // Alert system
  const showAlert = (type, title, message, onConfirm) => {
    const newAlert = { id: Date.now(), type, title, message, onConfirm };
    setAlerts(prev => [...prev, newAlert]);

    if (type !== "info") {
      setTimeout(() => {
        setAlerts(prev => prev.filter(alert => alert.id !== newAlert.id));
      }, 0);
    }
  };

  // Logout
  const handleLogout = () => {
  showAlert("info", "Information", "Are you sure you want to Logout?", (isConfirmed) => {
    if (isConfirmed) {
      sessionStorage.clear();
      navigate("/", { replace: true });
      window.location.reload();
    }
  });
};


  // Navigate to Edit Profile
  const handleeditprofile = () => {
    navigate('/editprofile');
  };

  // Navigate to Change Password
  const handlepassword = () => {
    navigate('/changePassword');
  };

  // Fixed Punch In/Out toggle function for Topnavbar component
  const handlePunchToggle = async () => {
    try {
      if (!userId || !username) {
        showAlert(
          "error",
          "Session Error",
          "Your session appears to be invalid. Please logout and login again."
        );
        return;
      }

      if (!isPunchedIn) {
        await axios.post(`${SERVER_PORT}/AttendancePunchIn`, {
          userId: parseInt(userId)
        });
        showAlert("success", "Success", "You have successfully punched in!");
        setIsPunchedIn(true);
        navigate('/attendanceadmin');

      } else {
        await axios.post(`${SERVER_PORT}/AttendancePunchOut`, {
          userId: parseInt(userId)
        });
        showAlert("success", "Success", "You have successfully punched out!");
        setIsPunchedIn(false);
        navigate('/home');
      }

      setTimeout(async () => {
        try {
          const statusRes = await axios.get(`${SERVER_PORT}/AttendanceStatus/${userId}`);
          const serverIsPunchedIn = statusRes.data.isPunchedIn && !statusRes.data.isPunchedOut;
          setIsPunchedIn(serverIsPunchedIn);
        } catch (verifyErr) {
          console.error("Status verification failed:", verifyErr);
        }
      }, 1000);

    } catch (err) {
      let errorMessage = "Failed to complete punch operation. Please try again.";

      if (err.response?.status === 404) {
        errorMessage = "User not found. Please check your session and try again.";
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data.message || "Invalid request. Please try again.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      showAlert("error", "Operation Failed", errorMessage);

      try {
        const statusRes = await axios.get(`${SERVER_PORT}/AttendanceStatus/${userId}`);
        const serverIsPunchedIn = statusRes.data.isPunchedIn && !statusRes.data.isPunchedOut;
        setIsPunchedIn(serverIsPunchedIn);
      } catch (statusErr) {
        console.error("Failed to refresh status after error:", statusErr);
      }
    }
  };

  useEffect(() => {
    if (isProfileDrawerOpen || isNotificationDrawerOpen) {
      setTimeout(() => setDrawerContentOpen(true), 2);
    } else {
      setDrawerContentOpen(false);
    }
  }, [isProfileDrawerOpen, isNotificationDrawerOpen]);

  const handleImageError = (e) => {
    e.target.src = localprofilePic;
  };


  
  const getProfileImageSrc = () => {
    if (userData && userData.adm_users_profileimage && userData.adm_users_profileimage.data) {
      return `data:image/jpeg;base64,${bufferToBase64(userData.adm_users_profileimage)}`;
    }
    const profileImageFromSession = ReactSession.get('profileimage');
    if (profileImageFromSession && typeof profileImageFromSession === 'string' && profileImageFromSession.startsWith('data:image')) {
      return profileImageFromSession;
    }
    return localprofilePic;
  };

  return (
    <nav className={`top-navbar ${isSidenavOpen ? 'shift-right-unique' : ''}`}>
      <div className="home-container">
        <h1 className="company-name">Visitors Management System</h1>

        <div className="user-info">
          {/* <button
            onClick={handlePunchToggle}
            className={`p-1 py-1 bg-gray-900 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center relative overflow-hidden group hover:shadow-xl hover:scale-105 ${isPunchedIn ? 'hover:bg-red-700' : 'hover:bg-green-700'}`}
            style={{ position: 'relative', width: 42, height: 42 }}
            aria-label={isPunchedIn ? 'Punch Out' : 'Punch In'}
          >
            <span
              className={`absolute left-1 top-1 w-10 h-10 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${isPunchedIn ? 'bg-red-600' : 'bg-green-600'}`}
              style={{ zIndex: 0 }}
            ></span>

            <span
              style={{
                zIndex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                transition: 'all 0.3s ease'
              }}
              className="group-hover:scale-110"
            >
              <Fingerprint
                size={30}
                color={isPunchedIn ? '#dc2626' : '#16a34a'}
                className="transition-all duration-300 group-hover:drop-shadow-lg"
              />
            </span>

            <span
              className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium px-2 py-1 rounded transition-all duration-300 opacity-0 group-hover:opacity-100 whitespace-nowrap ${isPunchedIn ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
            >
              {isPunchedIn ? 'Punch Out' : 'Punch In'}
            </span>
          </button> */}

          <div className="notification-container">
            <button
              className="notification-icon"
              onClick={() => setNotificationDrawerOpen(true)}
            >
              <FaBell />
              <span className="badge-notification">1</span>
            </button>
          </div>

          <div className="dropdown-container" ref={profileDropdownRef}>
            <div className="profile-container">
              <button
                onClick={() => setProfileDrawerOpen(true)}
                className="profile-dropdown-trigger"
              >
                <Image
                  src={getProfileImageSrc()}
                  roundedCircle
                  alt="Admin Profile"
                  className="profile-img"
                  onError={handleImageError}
                />
              </button>
              <div className='mr-5'>
                <div className='createdby'>{username}</div>
                <div className='createdby'>Hi, {name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isNotificationDrawerOpen && (
        <div
          className={`drawer-modal${isNotificationDrawerOpen ? ' open' : ''}`}
          onClick={() => setNotificationDrawerOpen(false)}
          style={{ backdropFilter: 'blur(3px)' }}
        >
          <div
            className={`drawer-content${drawerContentOpen ? ' open' : ''}`}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
              borderTopLeftRadius: 18,
              borderBottomLeftRadius: 18,
              padding: '32px 26px',
              minHeight: '100vh',
              maxWidth: 400,
              width: '90vw',
              border: '1px solid #e0e7ff'
            }}
          >
            <div
              className="drawer-header"
              style={{
                color: '#1e293b',
                fontWeight: 700,
                fontSize: '1.25rem',
                letterSpacing: '0.5px',
                background: 'transparent',
                borderBottom: '1.5px solid #e0e7ff',
                paddingBottom: 12,
                marginBottom: 18
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaBell style={{ color: '#6366f1', fontSize: 22 }} />
                Notifications
              </span>
              <button
                className="close-btn"
                onClick={() => setNotificationDrawerOpen(false)}
                style={{
                  fontSize: '2rem',
                  color: '#6366f1',
                  background: 'none',
                  border: 'none',
                  marginLeft: 'auto'
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <ul style={{ padding: 0, margin: 0 }}>
              <li
                style={{
                  padding: '16px 0',
                  borderBottom: '1px solid #e0e7ff',
                  fontSize: '1.08rem',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 500
                }}
              >
                <span style={{ background: '#6366f1', borderRadius: '50%', width: 8, height: 8, display: 'inline-block', marginRight: 10 }}></span>
                Welcome to the new dashboard!
              </li>
              <li
                style={{
                  padding: '16px 0',
                  borderBottom: '1px solid #e0e7ff',
                  fontSize: '1.08rem',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 500
                }}
              >
                <span style={{ background: '#f59e42', borderRadius: '50%', width: 8, height: 8, display: 'inline-block', marginRight: 10 }}></span>
                Your profile was updated successfully.
              </li>
              <li
                style={{
                  padding: '16px 0',
                  fontSize: '1.08rem',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 500
                }}
              >
                <span style={{ background: '#10b981', borderRadius: '50%', width: 8, height: 8, display: 'inline-block', marginRight: 10 }}></span>
                New feature: Try dark mode!
              </li>
            </ul>
          </div>
        </div>
      )}

      {isProfileDrawerOpen && (
        <div
          className={`drawer-modal${isProfileDrawerOpen ? ' open' : ''}`}
          onClick={() => setProfileDrawerOpen(false)}
          style={{ backdropFilter: 'blur(3px)' }}
        >
          <div
            className={`drawer-content${drawerContentOpen ? ' open' : ''}`}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
              borderTopLeftRadius: 18,
              borderBottomLeftRadius: 18,
              padding: '32px 26px',
              minHeight: '100vh',
              maxWidth: 400,
              width: '90vw',
              border: '1px solid #e0e7ff'
            }}
          >
            <div
              className="drawer-header"
              style={{
                color: '#1e293b',
                fontWeight: 700,
                fontSize: '1.25rem',
                letterSpacing: '0.5px',
                background: 'transparent',
                borderBottom: '1.5px solid #e0e7ff',
                paddingBottom: 12,
                marginBottom: 18
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img
                  src={getProfileImageSrc()}
                  alt="Profile"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #6366f1',
                    marginRight: 8
                  }}
                />
                Account Options
              </span>
              <button
                className="close-btn"
                onClick={() => setProfileDrawerOpen(false)}
                style={{
                  fontSize: '2rem',
                  color: '#6366f1',
                  background: 'none',
                  border: 'none',
                  marginLeft: 'auto'
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <button
              onClick={handleeditprofile}
              className="dropdown-item"
              style={{
                color: '#1e293b',
                background: '#f1f5f9',
                borderRadius: 8,
                marginBottom: 10,
                fontWeight: 600,
                fontSize: '1.08rem',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                border: 'none',
                transition: 'background 0.2s'
              }}
            >
              <FiEdit2 className="square-icon" style={{ color: '#6366f1', fontSize: 20 }} /> Edit Profile
            </button>
            <button
              onClick={handlepassword}
              className="dropdown-item"
              style={{
                color: '#1e293b',
                background: '#f1f5f9',
                borderRadius: 8,
                marginBottom: 10,
                fontWeight: 600,
                fontSize: '1.08rem',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                border: 'none',
                transition: 'background 0.2s'
              }}
            >
              <FiKey className="square-icon" style={{ color: '#6366f1', fontSize: 20 }} /> Change Password
            </button>
            <button
              onClick={handleLogout}
              className="dropdown-item logout"
              style={{
                color: '#dc3545',
                background: '#fef2f2',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '1.08rem',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                border: 'none',
                transition: 'background 0.2s'
              }}
            >
              <FiLogOut className="square-icon" style={{ color: '#dc3545', fontSize: 20 }} /> Logout
            </button>
            <div
              className="drawer-info"
              style={{
                marginTop: 22,
                fontSize: '1rem',
                color: '#334155',
                background: '#f1f5f9',
                borderRadius: 10,
                padding: '14px 18px',
                fontWeight: 500,
                boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.06)'
              }}
            >
              <p style={{ margin: 0 }}>Login: <span style={{ color: '#6366f1', fontWeight: 700 }}>{loginTime}</span></p>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {alerts.map((alert) => (
          <CustomAlert
            key={alert.id}
            {...alert}
            onClose={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
            duration={alert.type === "info" ? 0 : 3000}
          />
        ))}
      </AnimatePresence>
    </nav>
  );
}
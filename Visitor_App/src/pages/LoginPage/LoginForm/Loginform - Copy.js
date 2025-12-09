import React, { useState, useRef } from 'react';
import { X, Check } from 'lucide-react';
import './Loginform.css';
import axios from 'axios';
import { SERVER_PORT } from '../../../constant';
import { useNavigate } from 'react-router-dom';
const illustration = '8.webp';

// --- Custom Alert Component ---
const CustomAlert = ({ type, title, message, onClose }) => {
    const isSuccess = type === 'success';
    const alertClass = isSuccess ? 'alert-success' : 'alert-error';
    const icon = isSuccess ? <Check style={{ height: '20px', width: '20px', marginRight: '0.75rem' }} /> : <X style={{ height: '20px', width: '20px', marginRight: '0.75rem' }} />;

    return (
        <div
            className={`custom-alert ${alertClass}`}
            role="alert"
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {icon}
                <div>
                    <strong style={{ fontWeight: 'bold', marginRight: '0.25rem' }}>{title}</strong>
                    <span style={{ display: 'block', /* Removed media query from inline style */ }}>{message}</span>
                </div>
            </div>
            <button
                onClick={onClose}
                style={{ marginLeft: '1rem', color: isSuccess ? '#065f46' : '#991b1b', transition: 'color 0.3s', backgroundColor: 'transparent', border: 'none', padding: 0 }}
                aria-label="Close alert"
            >
                <X style={{ height: '20px', width: '20px' }} />
            </button>
        </div>
    );
};


const VideoWithFallback = ({ videoSrc, fallbackSrc }) => {
    const [videoAvailable, setVideoAvailable] = useState(true);
    const videoRef = useRef(null);

    return (
        <>
            {videoAvailable ? (
                <video className="illustration-video" ref={videoRef} autoPlay loop muted playsInline aria-hidden="true"
                    onError={() => setVideoAvailable(false)}
                    onLoadedData={() => setVideoAvailable(true)}
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>
            ) : (
                <img src={fallbackSrc} alt="illustration fallback" className="illustration-img" />
            )}
        </>
    );
};

const Loginform = ({ setIsLoggedIn }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [alerts, setAlerts] = useState([]);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const navigate = useNavigate();
    // Function to display alerts
    const showAlert = (type, title, message) => {
        const newAlert = { id: Date.now(), type, title, message };
        setAlerts(prevAlerts => [...prevAlerts, newAlert]);

        setTimeout(() => {
            setAlerts(prevAlerts => prevAlerts.filter((a) => a.id !== newAlert.id));
        }, 3000);
    };

    const login = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            const response = await axios.post(`${SERVER_PORT}/user_login`, { username, password, });
            if (response.data.success) {
                showAlert("success", "Success!", "Login Successful.");
                sessionStorage.setStoreType("sessionStorage");
                sessionStorage.setItem("username", response.data.loginid);
                sessionStorage.setItem("userrole", response.data.UserRole);

                sessionStorage.setItem("userId", response.data.id);
                sessionStorage.setItem("name", response.data.name);

                if (response.data.avatar) {
                    let profileImage;

                    if (typeof response.data.avatar === "string" && response.data.avatar.startsWith("data:")) {
                        profileImage = response.data.avatar;
                    } else if (response.data.avatar?.type === "Buffer") {
                        const base64Image = Buffer.from(response.data.avatar.data).toString("base64");
                        profileImage = `data:image/png;base64,${base64Image}`;
                    } else {
                        profileImage = null;
                    }

                    sessionStorage.setItem("profileimage", profileImage);
                } else {
                    sessionStorage.setItem("profileimage", null);
                }

                // ---- Redirect ----
                if (setIsLoggedIn) {
                    setTimeout(() => setIsLoggedIn(true), 300);
                }
                navigate("/");

            } else {
                // ---- Handle inactive / invalid ----
                if (response.data.status === "inactive") {
                    showAlert("warning", "Account Inactive!", "Your account is not active. Please contact admin.");
                } else {
                    showAlert("error", "Login Failed!", "Invalid login credentials.");
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            showAlert("error", "Server Error!", "Something went wrong. Please try again later.");
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="login-page">
            {/* Alerts Container */}
            <div className="alerts-container">
                {alerts.map((alert) => (
                    <CustomAlert
                        key={alert.id}
                        {...alert}
                        onClose={() => setAlerts(alerts.filter((a) => a.id !== alert.id))}
                    />
                ))}
            </div>



            {/* Main Card Container with Two Columns */}
            <div className="login-card">
                {/* Left Column: Illustration */}
                <div className="illustration-container">
                    <VideoWithFallback fallbackSrc={illustration} videoSrc="/Logistics.mp4" />
                </div>



                {/* Right Column: Form */}
                <div className="form-content-wrapper">
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 className="form-title">Welcome Back!</h2>
                        <p className="form-subtitle">
                            Let's Login to Your Account
                        </p>
                    </div>

                    <form onSubmit={login} className="form-style">
                        {/* Username Field */}
                        <div className="input-group">
                            <label htmlFor="username" className="input-label">Username</label>
                            <div className="input-wrapper">
                                {/* <User className="input-icon" /> */}
                                <input
                                    id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                                    className="form-input"
                                    placeholder="" required // Removed placeholder text
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="input-group">
                            <label htmlFor="password" className="input-label">Password</label>
                            <div className="input-wrapper">
                                {/* <Lock className="input-icon" /> */}
                                <input
                                    id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="form-input"
                                    placeholder="" required
                                />
                            </div>
                        </div>

                        {/* Login Button */}
                        <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
                            <button
                                type="submit" disabled={isLoggingIn} id='login-btn'
                                className="form-btn"
                                style={{ width: '50%', maxWidth: '100px' }} // Adjusted max-width for button
                            >
                                {isLoggingIn ? (
                                    <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : 'Login'}
                            </button>
                        </div>

                        {/* External Toggle Links (Static placeholders) */}
                        <div className="external-links-container">
                            <a href="#" style={{ cursor: "pointer", transition: 'color 0.3s' }} className="hover-underline" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
                            {/* "Don't have an account? Login now" style link */}
                            <div className="toggle-links-group" style={{ color: '#1a1a1a', fontSize: '0.875rem', fontWeight: 500 }}>
                                Don't have an account?
                                <a href="#" style={{ cursor: "pointer", transition: 'color 0.3s' }} className="hover-underline" onClick={(e) => e.preventDefault()}>Sign up now</a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Loginform;
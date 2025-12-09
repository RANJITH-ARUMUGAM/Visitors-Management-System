import React, { useEffect, useState } from "react";
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaUserPlus, FaSearch, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { SERVER_PORT } from '../../../constant';
import CustomAlert from "../../../CustomAlert";

export default function User({ setTitle }) {
  const navigate = useNavigate();
  const [userActivity, setUserActivity] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const showAlert = (type, title, message, onConfirm) => {
    const newAlert = { id: Date.now(), type, title, message, onConfirm };
    setAlerts(prev => [...prev, newAlert]);

    if (type !== "info") {
      setTimeout(() => {
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== newAlert.id));
      }, 3000);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`${SERVER_PORT}/userlist_getalldata`);
      if (response.status === 200) {
        setUserActivity(response.data.data);
      } else {
        showAlert("error", "Error", "Failed to fetch users.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showAlert("error", "Error", "An error occurred while fetching users.");
    }
  };

  const filteredUsers = userActivity.filter(user =>
    Object.values(user)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const displayedUsers = filteredUsers.slice(startIndex, startIndex + recordsPerPage);

  const handleEditUser = (user) => {
    navigate("/adminUser/AdminEdituser", { state: { userId: user.adm_users_id } });
  };

  const handleAddUser = () => {
    navigate("/adminUser/AdminAdduser");
  };

  const handleDeleteUser = (user) => {
    showAlert(
      "info",
      "Delete Admin",
      `Are you sure you want to delete <b>${user.adm_users_firstname} ${user.adm_users_lastname}</b>? This action cannot be undone.`,
      (isConfirmed) => {
        if (isConfirmed) {
          axios.delete(`${SERVER_PORT}/userlist_deleteuser/${user.adm_users_id}`)
            .then((response) => {
              if (response.status === 200) {
                showAlert("success", "Deleted", "User deleted successfully.");
                fetchAllUsers();
              } else {
                showAlert("error", "Error", "Failed to delete user.");
              }
            })
            .catch((error) => {
              console.error("Error deleting user:", error);
              showAlert("error", "Error", "An error occurred while deleting the user.");
            });
        }
      }
    );
  };

  useEffect(() => {
    setTitle("Admin Users");
    fetchAllUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, recordsPerPage]);

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <Container fluid className="min-vh-100 mt-3">
      <Row className="mb-2 align-items-center">
        <Col md={6}>
          <div className="position-relative">
            <FaSearch
              className="position-absolute top-50 translate-middle-y text-muted"
              style={{ left: '15px' }}
            />
            <Form.Control
              type="text"
              placeholder="Search by module code, name, application..."
              className="rounded-pill shadow-sm ps-5 border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </Col>
        <Col md={6} className="d-flex justify-content-end mt-3 mt-md-0">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleAddUser}
              className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill border-0 shadow-sm"
              style={{ background: 'linear-gradient(45deg, #1bf107, #44a706)', fontWeight: 'bold' }}
            >
              <FaUserPlus size={18} /> Add
            </Button>
          </motion.div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
            <table >
              <thead >
                <tr>
                  <th>S.No</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Login ID</th>
                  <th>Role Name</th>
                  <th>Status</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.length > 0 ? (
                  displayedUsers.map((activity, index) => (
                    <motion.tr
                      key={activity.adm_users_id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 }}
                      style={{ backgroundColor: '#fff', borderBottom: index === displayedUsers.length - 1 ? 'none' : '1px solid #ddd', transition: 'background-color 0.2s' }}
                    >
                      <td>{startIndex + index + 1}</td>
                      <td>{activity.adm_users_firstname}</td>
                      <td>{activity.adm_users_lastname}</td>
                      <td>{activity.adm_users_loginid}</td>
                      <td>{activity.adm_users_defaultroleid}</td>
                      <td className="border-0 py-2 px-3">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="badge px-2 py-1 rounded-pill fw-normal"
                          style={{
                            background: activity.adm_users_status === true
                              ? 'linear-gradient(90deg, #8ed334 0%, #35b910 100%)'
                              : activity.adm_users_status === false
                                ? 'rgba(206, 20, 20, 1)'
                                : 'linear-gradient(100deg, #4142a2 0%, #06b6d4 100%)',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                          }}
                        >
                          {activity.adm_users_status === true
                            ? 'Active'
                            : activity.adm_users_status === false
                              ? 'Inactive'
                              : 'N/A'}
                        </motion.span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-end">
                          <Button variant="outline-success" size="sm" onClick={() => handleEditUser(activity)}>
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(activity)}>
                            <FaTrashAlt />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', fontStyle: 'italic', color: '#999', padding: '20px' }}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Col>
      </Row>

      <motion.div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', color: '#6c757d' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ color: '#6c757d', fontSize: '14px' }}>
          Showing {Math.min(startIndex + 1, filteredUsers.length)} to {Math.min(startIndex + recordsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ backgroundColor: 'transparent', border: '1px solid #ddd', color: '#6c757d', padding: '8px 15px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500', transition: 'background-color 0.2s' }}>
            <FaArrowLeft /> Previous
          </Button>
          <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ backgroundColor: 'transparent', border: '1px solid #ddd', color: '#6c757d', padding: '8px 15px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500', transition: 'background-color 0.2s' }}>
            Next <FaArrowRight />
          </Button>
        </div>
      </motion.div>
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: '1000' }}>
        {alerts.map((alert) => (
          <CustomAlert
            key={alert.id}
            {...alert}
            onClose={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
            duration={alert.type === "info" ? 0 : 3000}
          />
        ))}
      </div>
    </Container>
  );
}
import React, { useEffect, useState } from "react";
import { Container, Form, Button, Modal, Alert, Spinner, Table, Card } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight, FaPlusCircle, FaSearch, FaBriefcase, FaInfoCircle, FaCheckCircle, FaTrashAlt, FaEdit, FaUserPlus } from "react-icons/fa";
import { PlusCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Import motion for animations
import axios from "axios";
import "../../Adminstor/AdminUsers/UserList.css";
import CustomAlert from "../../../CustomAlert";
import { SERVER_PORT } from '../../../constant';


const Departments = ({ setTitle }) => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  useEffect(() => {
    setTitle("Department List");
    fetchDepartments();
  }, []);

  const showAlert = (type, title, message, onConfirm) => {
    const newAlert = { id: Date.now(), type, title, message, onConfirm };
    setAlerts((prev) => [...prev, newAlert]);
    if (type !== "info") {
      setTimeout(() => {
        setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== newAlert.id));
      }, 3000);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${SERVER_PORT}/department_getalldata`);
      if (response.status === 200) {
        setDepartments(response.data.data);
      } else {
        setError("Failed to fetch departments.");
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError("An error occurred while fetching departments.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async () => {
    try {
      await axios.delete(`${SERVER_PORT}/department_delete/${selectedDept.department_id}`);
      showAlert("success", "Deleted", "Department deleted successfully.");
      setDepartments((prev) => prev.filter(d => d.department_id !== selectedDept.department_id));
    } catch (err) {
      console.error("Delete error:", err);
      showAlert("error", "Error", "An error occurred during deletion.");
    } finally {
      setShowModal(false);
    }
  };

  const filtered = departments.filter(dept => dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const activeDepartments = departments.filter(d => d.status).length;
  const inactiveDepartments = departments.length - activeDepartments;

  const summaryVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };


  return (
    <Container fluid className="bg-light min-vh-100 mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-md p-2 font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Department Management</h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="xs" onClick={() => navigate('/departmentsadd')} className="d-flex align-items-center gap-1 px-3 py-1 border-0 shadow-lg" style={{ background: 'linear-gradient(45deg, #1bf107ff, #44a706ff)', borderRadius: '15px', fontWeight: '600' }}>
            <FaUserPlus size={20} /> Add
          </Button>
        </motion.div>
      </div>

      {/* Summary Cards with Animations */}
      <motion.div
        className="row mb-4"
        variants={summaryVariants}
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.2 }}
      >
        <div className="col-md-4">
          <Card className="shadow-sm">
            <Card.Body className="d-flex align-items-center gap-3">
              <FaBriefcase className="text-primary" size={30} />
              <div>
                <Card.Title className="h3 text-muted mb-0 text-center">Total Departments</Card.Title>
                <Card.Text className="h4 fw-bold mb-0 text-center">{departments.length}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="shadow-sm">
            <Card.Body className="d-flex align-items-center gap-3">
              <FaCheckCircle className="text-success" size={30} />
              <div>
                <Card.Title className="h3 text-muted mb-0 text-center">Active</Card.Title>
                <Card.Text className="h4 fw-bold mb-0 text-center">{activeDepartments}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="shadow-sm">
            <Card.Body className="d-flex align-items-center gap-3">
              <FaInfoCircle className="text-danger" size={30} />
              <div>
                <Card.Title className="h3 text-muted mb-0 text-center">Inactive</Card.Title>
                <Card.Text className="h4 fw-bold mb-0 text-center">{inactiveDepartments}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </div>
      </motion.div>




      {/* Table Controls - Search & Entries */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">
        <div className="d-flex gap-2 w-100 w-md-auto">
          <Form.Select
            className="w-auto"
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n} entries</option>
            ))}
          </Form.Select>
        </div>
        <div className="col-md-6">
          <div className="position-relative">
            <FaSearch
              className="position-absolute top-50 translate-middle-y text-muted"
              style={{ left: '15px', zIndex: 10 }}
            />
            <Form.Control
              type="text"
              placeholder="Search employees by name, email, or phone..."
              className="border-0 shadow-sm ps-5"
              style={{
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                fontSize: '15px'
              }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            <table responsive hover className="mb-4">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <motion.tbody
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.10 }}
              >
                {paginated.length > 0 ? (
                  paginated.map(dept => (
                    <motion.tr key={dept.department_id} variants={itemVariants}>
                      <td>{dept.department_name}</td>
                      <td>{dept.department_description}</td>
                      <td className="border-0 py-2 px-2">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className={`badge px-3 py-2 rounded-pill fw-normal`}
                          style={{
                            background: dept.status === true
                              ? 'linear-gradient(90deg, #8ed334ff 0%, #35b910ff 100%)'
                              : dept.status === false
                                ? 'rgba(206, 20, 20, 1)'
                                : 'linear-gradient(100deg, #4142a2ff 0%, #06b6d4 100%)',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                          }}
                        >
                          {dept.status === true ? 'Active' : dept.status === false ? 'Inactive' : 'N/A'}
                        </motion.span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-end">
                          <Button
                            variant=""
                            size="sm"
                            onClick={() => navigate('/departmentedit', { state: { id: dept.id } })}
                            className="p-2 border-0 rounded-circle"
                            style={{
                              color: '#166534',
                              width: '36px',
                              height: '36px'
                            }}
                          >
                            <FaEdit size={19} />
                          </Button>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => { setSelectedDept(dept); setShowModal(true); }}
                          >
                            <FaTrashAlt size={19} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">No departments found.</td>
                  </tr>
                )}
              </motion.tbody>
            </table>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3">
              <span className="text-muted small">
                Showing {Math.min((currentPage - 1) * perPage + 1, filtered.length)} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
              </span>
              <div className="d-flex gap-2 mt-2 mt-md-0">
                <Button variant="light" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="d-flex align-items-center">
                  <FaArrowLeft className="me-1" /> Previous
                </Button>
                <Button variant="light" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="d-flex align-items-center">
                  Next <FaArrowRight className="ms-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the department "<strong>{selectedDept?.department_name}</strong>"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteDepartment}>Delete</Button>
        </Modal.Footer>
      </Modal>
      <div style={{ padding: "20px" }}>
        {alerts.map((alert) => (
          <CustomAlert
            key={alert.id}
            {...alert}
            onClose={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
            duration={alert.type === "info" ? 0 : 3000}
          />
        ))}
      </div>
    </Container>
  );
};

export default Departments;
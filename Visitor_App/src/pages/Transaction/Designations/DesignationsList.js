import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Pagination, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight, FaSearch, FaBriefcase, FaCheckCircle, FaExclamationCircle, FaPlusCircle, FaEdit, FaTrashAlt, FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import "../../Adminstor/AdminUsers/UserList.css";
import { SERVER_PORT } from '../../../constant';

const DesignationsList = ({ setTitle }) => {
  const navigate = useNavigate();

  const [designations, setDesignations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTitle && setTitle('Designation List');
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${SERVER_PORT}/GMS_getall_designations`);
      setDesignations(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch designations.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedDesignation && selectedDesignation.id) {
      try {
        await axios.delete(`${SERVER_PORT}/GMS_delete_designation/${selectedDesignation.id}`);
        setDesignations(prev => prev.filter(d => d.id !== selectedDesignation.id));
      } catch (err) {
        console.error("Deletion error:", err);
      } finally {
        setShowModal(false);
      }
    }
  };

  const filtered = designations.filter(d =>
    d.designations_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Summary calculations
  const totalDesignations = designations.length;
  const activeDesignations = designations.filter(d => d.designations_status === 'Active').length;
  const inactiveDesignations = totalDesignations - activeDesignations;

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <Container fluid className="bg-light min-vh-100 mt-3">
      {/* Header and Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-md p-2 font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Designation Management</h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="xs" onClick={() => navigate('/designationsadd')} className="d-flex align-items-center gap-1 px-3 py-1 border-0 shadow-lg" style={{ background: 'linear-gradient(45deg, #1bf107ff, #44a706ff)', borderRadius: '15px', fontWeight: '600' }}>
            <FaUserPlus size={20} /> Add
          </Button>
        </motion.div>
      </div>

      {/* Summary Cards with Animations */}
      <div className="row g-3 mb-4">
        <motion.div className="col-md-4" variants={cardVariants} initial="hidden" animate="visible">
          <Card className="shadow-sm">
            <Card.Body className="d-flex align-items-center gap-3">
              <FaBriefcase className="text-primary" size={36} />
              <div>
                <Card.Title className="h3 text-muted mb-0 text-center">Total Designations</Card.Title>
                <Card.Text className="h4 fw-bold mb-0 text-center">{totalDesignations}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
        <motion.div className="col-md-4" variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="shadow-sm">
            <Card.Body className="d-flex align-items-center gap-3">
              <FaCheckCircle className="text-success" size={36} />
              <div>
                <Card.Title className="h3 text-muted mb-0 text-center">Active</Card.Title>
                <Card.Text className="h4 fw-bold mb-0 text-center">{activeDesignations}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
        <motion.div className="col-md-4" variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Card className="shadow-sm">
            <Card.Body className="d-flex align-items-center gap-3">
              <FaExclamationCircle className="text-danger" size={36} />
              <div>
                <Card.Title className="h3 text-muted mb-0 text-center">Inactive</Card.Title>
                <Card.Text className="h4 fw-bold mb-0 text-center">{inactiveDesignations}</Card.Text>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </div>

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

      {/* Designations Table */}
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
                  <th>Designation Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <motion.tbody
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
                {paginated.length > 0 ? (
                  paginated.map(designation => (
                    <motion.tr key={designation.id} variants={rowVariants}>
                      <td>{designation.designations_name}</td>
                      <td className="border-0 py-2 px-2">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="badge px-3 py-2 rounded-pill fw-normal"
                          style={{
                            background: designation.designations_status === 'Active'
                              ? 'linear-gradient(90deg, #8ed334ff 0%, #35b910ff 100%)'
                              : designation.designations_status === 'Inactive'
                                ? 'rgba(206, 20, 20, 1)'
                                : 'linear-gradient(100deg, #4142a2ff 0%, #06b6d4 100%)',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                          }}
                        >
                          {designation.designations_status === 'Active'
                            ? 'Active'
                            : designation.designations_status === 'Inactive'
                              ? 'Inactive'
                              : 'N/A'}
                        </motion.span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-end">
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => navigate('/designationedit', { state: { id: designation.id } })}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setSelectedDesignation(designation);
                              setShowModal(true);
                            }}
                          >
                            <FaTrashAlt />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-muted py-4">No designations found.</td>
                  </tr>
                )}
              </motion.tbody>
            </table>

            {/* Pagination Controls */}
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
          Are you sure you want to delete the designation "<strong>{selectedDesignation?.designations_name}</strong>"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DesignationsList;
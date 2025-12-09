import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Pagination, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../Admin/UserList.css";
import { SERVER_PORT } from '../../../constant';


const DesignationsList = ({setTitle}) => {
  const navigate = useNavigate();

  const [designations, setDesignations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [error, setError] = useState(null);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${SERVER_PORT}/GMS_getall_designations`);
      setDesignations(res.data);
      console.log("Fetched designations:", res.data);

    } catch (err) {
      console.error(err);
      setError('Failed to fetch designations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTitle("Designations List");
    fetchDesignations();
  }, []);

  
  const filtered = designations.filter(d => d.designations_name && d.designations_name.toLowerCase().includes(searchTerm.toLowerCase()));
  console.log('searchTerm:', searchTerm);
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  console.log('designations', designations);
  console.log('filtered', filtered);
  console.log('paginated', paginated);


  const handleDelete = async () => {
    try {
      await axios.delete(`${SERVER_PORT}/GMS_delete_designations/${selectedDesignation.id}`);
      setDesignations(prev => prev.filter(d => d.id !== selectedDesignation.id));
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError('Failed to delete designation');
    }
  };

  return (
    <Container fluid className="employee-container">
      <div className="table-header">
        <h4 className="mb-0">Designation Management</h4>
      </div>

      <div className="table-controls">
        <Form.Select className="entries-dropdown" value={perPage} onChange={e => setPerPage(Number(e.target.value))}>
          {[10, 25, 50, 100].map(n => (
            <option key={n} value={n}>{n} entries</option>
          ))}
        </Form.Select>
        <Form.Control
          className="search-input"
          type="text"
          placeholder="Search designations..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <Button className="add-visitor-btn" onClick={() => navigate('/designationsfrom')}>
          <PlusCircle size={20} /> Add
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <table >
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(designation => (
                <tr key={designation.id}>
                  <td>{designation.designations_name}</td>
                  <td><span className="status">{designation.designations_status}</span></td>
                  <td className="actions">
                    <button style={{ color: 'green' }} onClick={() => navigate(`/designationsfrom/edit/${designation.id}`)}>
                      <i className="pl-5 fa-solid fa-pen-to-square"></i>
                    </button>
                    <button className="pr-5" style={{ color: '#c40202' }} onClick={() => { setSelectedDesignation(designation); setShowModal(true); }}>
                      <i className="pl-5 fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <Button className="page-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              <FaArrowLeft />
            </Button>
            <span>{currentPage}</span>
            <Button className="page-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              <FaArrowRight />
            </Button>
          </div>

          <div className="mt-2">
            Showing {Math.min((currentPage - 1) * perPage + 1, filtered.length)} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
          </div>
        </>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the designation "{selectedDesignation?.name}"?
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

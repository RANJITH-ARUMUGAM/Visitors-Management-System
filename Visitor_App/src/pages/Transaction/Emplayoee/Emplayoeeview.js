import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Spinner, Alert, Badge, Table, Form
} from 'react-bootstrap';
import axios from 'axios';
import "../../Adminstor/AdminUsers/UserList.css";
import { SERVER_PORT } from '../../../constant'; 

const ViewEmployee = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Employee');

  const fetchEmployee = async () => {
    try {
      const res = await axios.get(`${SERVER_PORT}/get_byid_employeesview/${id}`);
      if (res.status === 200 && res.data) {
        setEmployee(res.data);
      } else {
        setError('Employee not found.');
      }
    } catch (err) {
      console.error('Error fetching employee:', err);
      setError('An error occurred while fetching employee details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!employee || !employee.employee) {
    return (
      <Container className="py-5 text-center">
        <p>Employee not found.</p>
      </Container>
    );
  }

  const emp = employee.employee;
  const visitors = employee.visitors || [];

  return (
    <Container fluid className="p-3">
      {/* Header */}
      <Row>
        <Col md={12}>
          <Card className="border-0 shadow-lg">
            <Card.Body>
              <Row>
                <Col md={2} className="text-center">
                  <img
                    src={'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png'}
                    alt="Employee"
                    className="img-fluid rounded mb-3 shadow-lg"
                    style={{ width: 120, height: 120, objectFit: 'cover' }}
                  />
                </Col>
                <Col md={10}>
                  <h4 className="mb-1">{emp.name}</h4>
                  <p className="text-uppercase text-warning mb-3" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {emp.designation}
                  </p>
                  <p className="mb-1">{emp.email}</p>
                  <p className="mb-0">{emp.phone}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Row className="mt-3">
        <Col md={12}>
          <div className="d-flex">
            {['Employee', 'Visitors', 'Pre-Registers'].map(tab => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'primary' : 'light'}
                className={`me-2 rounded-0`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'Employee' && <i className="bi bi-person-fill me-1"></i>}
                {tab === 'Visitors' && <i className="bi bi-people-fill me-1"></i>}
                {tab === 'Pre-Registers' && <i className="bi bi-calendar-check me-1"></i>}
                {tab}
              </Button>
            ))}
          </div>
        </Col>
      </Row>

      {/* Tab Content */}
      <Row className="mt-3">
        <Col md={12}>
          {activeTab === 'Employee' && (
            <Card className="border-0 shadow-lg">
              <Card.Body>
                <h5 className="mb-4 fw-bold">Employee Information</h5>
                <Row>
                  <Col md={6}>
                    <Row className="mb-3">
                      <Col sm={4} className="fw-bold">Name</Col>
                      <Col sm={8}>: {emp.name}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col sm={4} className="fw-bold">E-Mail</Col>
                      <Col sm={8}>: {emp.email}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col sm={4} className="fw-bold">Gender</Col>
                      <Col sm={8}>: {emp.gender}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col sm={4} className="fw-bold">Designation</Col>
                      <Col sm={8}>: {emp.designation}</Col>
                    </Row>
                  </Col>
                  <Col md={6}>
                    <Row className="mb-3">
                      <Col sm={4} className="fw-bold">Phone</Col>
                      <Col sm={8}>: {emp.phone}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col sm={4} className="fw-bold">Joining Date</Col>
                      <Col sm={8}>: {new Date(emp.joining_date).toLocaleDateString()}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col sm={4} className="fw-bold">Department</Col>
                      <Col sm={8}>: {emp.department}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col sm={4} className="fw-bold">Status</Col>
                      <Col sm={8}>: 
                        <Badge bg={emp.status === 'Active' ? 'success' : 'secondary'} className="rounded-pill py-1 px-2">
                           {emp.status}
                        </Badge>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'Visitors' && (
            <Card className="border-0 shadow-lg mt-3">
              <Card.Body>
                <h5 className="mb-4 fw-bold">Visitors Information</h5>

                <table bordered responsive hover className="text-center align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>NAME</th>
                      <th>E-MAIL</th>
                      <th>CHECK-IN</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.length > 0 ? (
                      visitors.map((v, i) => (
                        <tr key={i}>
                          <td>{v.visitor_name}</td>
                          <td>{v.email}</td>
                          <td>{v.entry_time}</td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="action-btn view"
                                // onClick={() => handleView(visitor.id)}
                                title="View Details"
                              >
                                👁️
                              </button>
                              <button
                                className="action-btn edit"
                                // onClick={() => handleEdit(visitor.id)}
                                title="Edit Visitor"
                              >
                                ✏️
                              </button>
                              <button
                                className="action-btn delete"
                                // onClick={() => handleDelete(visitor.id, visitor.name)}
                                title="Delete Visitor"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-muted">No visitor records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="mt-2 text-muted">
                  Showing {visitors.length} of {visitors.length} entries
                </div>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'Pre-Registers' && (
            <Card className="border-0 shadow-lg">
              <Card.Body>
                <h5 className="mb-4">Pre-Registers Information</h5>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Form.Select size="sm" style={{ width: "100px" }}>
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </Form.Select>
                  <Form.Control type="text" size="sm" placeholder="Search:" style={{ width: "200px" }} />
                </div>

                <table bordered responsive hover className="text-center align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>NAME</th>
                      <th>E-MAIL</th>
                      <th>EXPECTED DATE</th>
                      <th>EXPECTED TIME</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Hans Müller</td>
                      <td>hans@example.com</td>
                      <td>19 Feb 2025</td>
                      <td>09:25 PM</td>
                      <td>
                        <button
                          className="action-btn view"
                          // onClick={() => handleView(visitor.id)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button
                          className="action-btn edit"
                          // onClick={() => handleEdit(visitor.id)}
                          title="Edit Visitor"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn delete"
                          // onClick={() => handleDelete(visitor.id, visitor.name)}
                          title="Delete Visitor"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-muted mb-0">Showing 1 to 1 of 1 entry</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Activation Reminder */}
      <Row className="mt-3">
        <Col md={12} className="text-end text-muted">
          <small>Activate Windows</small><br />
          <small>Go to Settings to activate Windows.</small>
        </Col>
      </Row>
      <style jsx>{`
        
        .action-btn {
          padding: 6px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          gap: 10px;
          white-space: nowrap;
        }
        
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        
        .action-btn.view {
          background-color: #6C757D;
          color: white;
        }
        
        .action-btn.edit {
          background-color: #007BFF;
          color: white;
        }
        
        .action-btn.delete {
          background-color: #DC3545;
          color: white;
        }
        
        
      `}</style>
    </Container>
  );
};

export default ViewEmployee;

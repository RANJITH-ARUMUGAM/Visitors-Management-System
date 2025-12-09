import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Modal,
  Spinner
} from 'react-bootstrap';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../Adminstor/AdminUsers/UserList.css';
import { SERVER_PORT } from '../../../constant';


const DesignationForm = (setTitle) => {

  useEffect(() => {
    setTitle("Designation Form");
  }, []);

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [designation, setDesignation] = useState({
    designations_name: '',
    designations_status: 'Active',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [alertModal, setAlertModal] = useState({
    show: false,
    title: '',
    message: '',
    variant: 'success',
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchDesignation = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${SERVER_PORT}/GMS_getbyid_designations/${id}`);
          setDesignation(response.data);
        } catch (err) {
          console.error('Fetch designation error:', err);
          setAlertModal({
            show: true,
            title: 'Error',
            message: 'Failed to load designation details',
            variant: 'danger',
          });
        } finally {
          setLoading(false);
        }
      };
      fetchDesignation();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDesignation(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!designation.designations_name.trim()) {
      newErrors.designations_name = 'Designation name is required';
    } else if (designation.designations_name.trim().length < 2) {
      newErrors.designations_name = 'Designation name must be at least 2 characters';
    }
    if (!designation.designations_status) {
      newErrors.designations_status = 'Status is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditMode) {
        await axios.put(`${SERVER_PORT}/GMS_update_designations/${id}`, designation);
      } else {
        await axios.post(`${SERVER_PORT}/GMS_createnew_designations`, designation);
      }

      setAlertModal({
        show: true,
        title: 'Success',
        message: `Designation ${isEditMode ? 'updated' : 'created'} successfully.`,
        variant: 'success',
      });
    } catch (err) {
      console.error('Designation submission error:', err);
      setAlertModal({
        show: true,
        title: 'Error',
        message: err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} designation.`,
        variant: 'danger',
      });
      setIsSubmitting(false);
    }
  };

  const handleAlertClose = () => {
    setAlertModal({ ...alertModal, show: false });
    if (alertModal.variant === 'success') {
      navigate('/designationslist');
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Button variant="outline-secondary" className="me-3" onClick={() => navigate('/designationslist')}>
              <ArrowLeft size={20} />
            </Button>
            <h4 className="mb-0">{isEditMode ? 'Edit Designation' : 'Add New Designation'}</h4>
          </div>
        </Card.Header>

        <Card.Body>
          <Form noValidate onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Designation Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="designations_name"
                    placeholder="Enter designation name"
                    value={designation.designations_name}
                    onChange={handleChange}
                    isInvalid={!!errors.designations_name}
                  />
                  <Form.Control.Feedback type="invalid">{errors.designations_name}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Status <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="designations_status"
                    value={designation.designations_status}
                    onChange={handleChange}
                    isInvalid={!!errors.designations_status}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.designations_status}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={() => navigate('/designationslist')} className="me-3">
                Cancel
              </Button>
              <Button variant="primary" className="d-flex align-items-center" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (<><Save size={18} className="me-2" /> {isEditMode ? 'Update' : 'Save'}</>)}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Modal Alert */}
      <Modal show={alertModal.show} onHide={handleAlertClose} centered>
        <Modal.Header closeButton className={`bg-${alertModal.variant} text-white`}>
          <Modal.Title>{alertModal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{alertModal.message}</Modal.Body>
        <Modal.Footer>
          <Button variant={alertModal.variant} onClick={handleAlertClose}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DesignationForm;

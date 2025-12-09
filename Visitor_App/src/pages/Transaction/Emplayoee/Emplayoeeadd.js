import React, { useState, useEffect } from 'react';
import {
  Container, Form, Row, Col, Button, Image, Spinner, Modal
} from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { SERVER_PORT } from '../../../constant';


const EmployeeAdd = ({ setTitle }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    joining_date: '',
    gender: '',
    department: '',
    designation: '',
    status: 'Active',
    password: '',
    confirm_password: '',
    about: '',
    image: '',
  });

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingDesignations, setLoadingDesignations] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Alert Modal State
  const [alertModal, setAlertModal] = useState({
    show: false,
    title: '',
    message: '',
    variant: 'danger',
  });

  const handleAlertClose = () => {
    setAlertModal(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
    setTitle && setTitle('Add Employee');
    fetchDepartments();
    fetchDesignations();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const res = await axios.get(`${SERVER_PORT}/department_getalldata`);

      let departmentsData = [];
      if (Array.isArray(res.data)) {
        departmentsData = res.data;
      } else if (res.data && Array.isArray(res.data[0])) {
        departmentsData = res.data[0];
      } else if (res.data && Array.isArray(res.data.data)) {
        departmentsData = res.data.data;
      }

      setDepartments(departmentsData);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
      setAlertModal({
        show: true,
        title: 'Error',
        message: 'Failed to load departments. Please try again.',
        variant: 'danger'
      });
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchDesignations = async () => {
    try {
      setLoadingDesignations(true);
      const res = await axios.get(`${SERVER_PORT}/GMS_getall_designations`);

      console.log('Departments API response:', res.data);

      const designationData = Array.isArray(res.data) ? res.data :
        Array.isArray(res.data[0]) ? res.data[0] : [];

      setDesignations(designationData);
    } catch (err) {
      console.error('Error fetching designations:', err);
      setDesignations([]);
      setAlertModal({
        show: true,
        title: 'Error',
        message: 'Failed to load designations. Please try again.',
        variant: 'danger'
      });
    } finally {
      setLoadingDesignations(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setForm(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (form.password !== form.confirm_password) {
      setAlertModal({
        show: true,
        title: 'Validation Error',
        message: 'Passwords do not match.',
        variant: 'danger'
      });
      setSubmitting(false);
      return;
    }

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '') data.append(key, value);
      });

      const res = await axios.post(`${SERVER_PORT}/add_employees`, data);

      if (res.status === 200 || res.status === 201) {
        setAlertModal({
          show: true,
          title: 'Success',
          message: 'Employee added successfully!',
          variant: 'success'
        });
        setTimeout(() => navigate('/employees'), 1500);
      } else {
        setAlertModal({
          show: true,
          title: 'Submission Failed',
          message: 'Failed to add employee.',
          variant: 'danger'
        });
      }
    } catch (err) {
      console.error('Error:', err);
      setAlertModal({
        show: true,
        title: 'Server Error',
        message: err.response?.data?.message || 'An error occurred while submitting.',
        variant: 'danger'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <h4 className="mb-3">Add New Employee</h4>

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

      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>First Name</Form.Label>
            <Form.Control
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </Col>
          <Col md={6}>
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </Col>

          <Col md={6}>
            <Form.Label>Phone Number</Form.Label>
            <PhoneInput
              international
              defaultCountry="US"
              value={form.phone}
              onChange={(value) => setForm(prev => ({ ...prev, phone: value }))}
              required
              className="form-control"
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Joining Date</Form.Label>
            <Form.Control
              type="date"
              name="joining_date"
              value={form.joining_date}
              onChange={handleChange}
              required
            />
          </Col>
          <Col md={6}>
            <Form.Label>Gender</Form.Label>
            <Form.Select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Department</Form.Label>
            <Form.Select
              name="department"
              value={form.department}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Department --</option>
              {loadingDepartments ? (
                <option disabled>Loading departments...</option>
              ) : (
                departments.map((dept, i) => (
                  <option key={i} value={dept.department_name}>
                    {dept.department_name}
                  </option>
                ))
              )}
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Label>Designation</Form.Label>
            <Form.Select
              name="designation"
              value={form.designation}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Designation --</option>
              {loadingDesignations ? (
                <option disabled>Loading designations...</option>
              ) : (
                designations.map((des, i) => (
                  <option key={i} value={des.designations_name}>
                    {des.designations_name}
                  </option>
                ))
              )}
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Label>About</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="about"
              value={form.about}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </Col>
          <Col md={6}>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="confirm_password"
              value={form.confirm_password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
          </Col>
          <Col md={6}>
            {preview && <Image src={preview} thumbnail width={100} height={100} />}
          </Col>
        </Row>

        <div className="d-flex justify-content-start gap-2">
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" />
                <span className="ms-2">Submitting...</span>
              </>
            ) : 'Submit'}
          </Button>
          <Button
            type="reset"
            variant="secondary"
            onClick={() => {
              setForm({
                ...form,
                image: '',
                password: '',
                confirm_password: ''
              });
              setPreview(null);
            }}
          >
            Reset
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default EmployeeAdd;

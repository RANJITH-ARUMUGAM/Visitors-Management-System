import React, { useState, useEffect } from 'react';
import {
  Container, Form, Row, Col, Button, Image, Spinner, Modal
} from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import "../../Adminstor/AdminUsers/UserList.css";
import { SERVER_PORT } from '../../../constant'; 


const EmployeeEdit = ({ setTitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state?.id;

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
    about: '',
    image: '',
  });

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', variant: 'danger' });

  useEffect(() => {
    setTitle && setTitle('Edit Employee');
    if (!id) {
      showAlert("Error", "No employee ID provided.", "danger");
      return;
    }
    fetchEmployee();
    fetchDepartments();
    fetchDesignations();
  }, []);

  const fetchEmployee = async () => {
    try {
      const res = await axios.get(`${SERVER_PORT}/get_employee_by_id/${id}`);
      if (res.status === 200 && res.data?.data) {
        const emp = res.data.data;
        setForm({
          first_name: emp.gms_first_name || '',
          last_name: emp.gms_last_name || '',
          email: emp.gms_email || '',
          phone: emp.gms_phone || '',
          joining_date: emp.gms_joining_date?.split('T')[0] || '',
          gender: emp.gms_gender || '',
          department: emp.gms_department || '',
          designation: emp.gms_designation || '',
          status: emp.gms_status || 'Active',
          about: emp.gms_about || '',
          image: '',
        });
        if (emp.gms_image) setPreview(emp.gms_image);
      }
    } catch (err) {
      console.error('Error fetching employee:', err);
      showAlert('Error', 'Failed to load employee data', 'danger');
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${SERVER_PORT}/department_getalldata`);
      const departmentsData = Array.isArray(res.data) ? res.data :
        Array.isArray(res.data[0]) ? res.data[0] :
          res.data?.data || [];
      setDepartments(departmentsData);
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Failed to load departments', 'danger');
    }
  };

  const fetchDesignations = async () => {
    try {
      const res = await axios.get(`${SERVER_PORT}/GMS_getall_designations`);
      const designationsData = Array.isArray(res.data) ? res.data :
        Array.isArray(res.data[0]) ? res.data[0] : [];
      setDesignations(designationsData);
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Failed to load designations', 'danger');
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
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '') data.append(key, value);
      });

      const res = await axios.put(`${SERVER_PORT}/update_employee/${id}`, data);

      if (res.status === 200) {
        showAlert('Success', 'Employee updated successfully!', 'success');
        setTimeout(() => navigate('/employees'), 1500);
      } else {
        showAlert('Error', 'Failed to update employee', 'danger');
      }
    } catch (err) {
      console.error(err);
      showAlert('Server Error', err.response?.data?.message || 'Update failed.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const showAlert = (title, message, variant) => {
    setAlertModal({ show: true, title, message, variant });
  };

  const handleAlertClose = () => setAlertModal(prev => ({ ...prev, show: false }));

  return (
    <Container className="py-4">
      <h4 className="mb-3">Edit Employee</h4>

      {/* Alert Modal */}
      <Modal show={alertModal.show} onHide={handleAlertClose} centered>
        <Modal.Header closeButton className={`bg-${alertModal.variant} text-white`}>
          <Modal.Title>{alertModal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{alertModal.message}</Modal.Body>
        <Modal.Footer>
          <Button variant={alertModal.variant} onClick={handleAlertClose}>OK</Button>
        </Modal.Footer>
      </Modal>

      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <Row className="mb-3">
          <Col md={6}><Form.Label>First Name</Form.Label>
            <Form.Control name="first_name" value={form.first_name} onChange={handleChange} required />
          </Col>
          <Col md={6}><Form.Label>Last Name</Form.Label>
            <Form.Control name="last_name" value={form.last_name} onChange={handleChange} required />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}><Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
          </Col>
          <Col md={6}><Form.Label>Phone Number</Form.Label>
            <PhoneInput
              international defaultCountry="US" value={form.phone}
              onChange={(value) => setForm(prev => ({ ...prev, phone: value }))}
              required className="form-control"
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}><Form.Label>Joining Date</Form.Label>
            <Form.Control type="date" name="joining_date" value={form.joining_date} onChange={handleChange} required />
          </Col>
          <Col md={6}><Form.Label>Gender</Form.Label>
            <Form.Select name="gender" value={form.gender} onChange={handleChange} required>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}><Form.Label>Department</Form.Label>
            <Form.Select name="department" value={form.department} onChange={handleChange} required>
              <option value="">-- Select Department --</option>
              {departments.map((d, i) => (
                <option key={i} value={d.department_name}>{d.department_name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6}><Form.Label>Designation</Form.Label>
            <Form.Select name="designation" value={form.designation} onChange={handleChange} required>
              <option value="">-- Select Designation --</option>
              {designations.map((d, i) => (
                <option key={i} value={d.designations_name}>{d.designations_name}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}><Form.Label>Status</Form.Label>
            <Form.Select name="status" value={form.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </Col>
          <Col md={6}><Form.Label>About</Form.Label>
            <Form.Control as="textarea" rows={2} name="about" value={form.about} onChange={handleChange} />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}><Form.Label>Image</Form.Label>
            <Form.Control type="file" name="image" accept="image/*" onChange={handleChange} />
          </Col>
          <Col md={6}>
            {preview && <Image src={preview} thumbnail />}
          </Col>
        </Row>

        <div className="d-flex justify-content-start gap-2">
          <Button type="submit" disabled={submitting} className="mt-3 edit-btn" style={{ backgroundColor: "#3CB371" }}>{submitting ? (<><Spinner as="span" size="sm" animation="border" /> <span className="ms-2">Saving...</span></>) : 'Save'}</Button>
          <Button className="mt-3 edit-btn" style={{ backgroundColor: "#E53935" }} onClick={() => window.history.back()}>Cancel</Button>
        </div>



      </Form>
    </Container>
  );
};

export default EmployeeEdit;

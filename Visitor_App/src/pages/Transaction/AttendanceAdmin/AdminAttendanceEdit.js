import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { SERVER_PORT } from '../../../constant';


// Convert duration object {hours, minutes, seconds} to "HH:MM:SS" string
const durationObjToTimeString = (obj) => {
  if (!obj) return "00:00:00";
  const h = obj.hours || 0;
  const m = obj.minutes || 0;
  const s = obj.seconds || 0;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Convert "HH:MM:SS" string to duration object
const timeStringToDurationObj = (timeStr) => {
  if (!timeStr || timeStr === "00:00:00") return null;
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return { hours, minutes, seconds };
};

// Validate time format (HH:MM:SS)
const isValidTimeFormat = (timeStr) => {
  if (!timeStr) return true; // Allow empty for optional fields
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  return timeRegex.test(timeStr);
};

const AdminAttendanceEdit = ({ setTitle }) => {

  useEffect(() => {
    setTitle("Admin Attendance");
  }, []);

  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    status: '',
    check_in: '',
    check_out: '',
    break_time: '',
    late_by: '',
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAttendanceRecord();
  }, []);

  const fetchAttendanceRecord = async () => {
    try {
      const res = await axios.get(`${SERVER_PORT}/AttendanceEditEMP/${id}`);
      const data = res.data.data;

      setFormData({
        employee_id: data?.gms_userid || '',
        name: data?.gms_name || '',
        status: data?.gms_status || '',
        check_in: data?.gms_checkin || '',
        check_out: data?.gms_checkout || '',
        break_time: durationObjToTimeString(data?.gms_breakduration),
        late_by: durationObjToTimeString(data?.gms_lateduration),
      });
    } catch (err) {
      console.error('Error fetching attendance record:', err);
      alert('Failed to load attendance record.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (!formData.check_in) {
      newErrors.check_in = 'Check-in time is required';
    } else if (!isValidTimeFormat(formData.check_in)) {
      newErrors.check_in = 'Invalid time format. Use HH:MM:SS';
    }

    // Validate optional time fields if they have values
    if (formData.check_out && !isValidTimeFormat(formData.check_out)) {
      newErrors.check_out = 'Invalid time format. Use HH:MM:SS';
    }

    if (formData.break_time && !isValidTimeFormat(formData.break_time)) {
      newErrors.break_time = 'Invalid time format. Use HH:MM:SS';
    }

    if (formData.late_by && !isValidTimeFormat(formData.late_by)) {
      newErrors.late_by = 'Invalid time format. Use HH:MM:SS';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare payload with proper format conversions
    const payload = {
      employee_id: formData.employee_id,
      name: formData.name,
      status: formData.status,
      check_in: formData.check_in,
      check_out: formData.check_out || null,
      break_time: formData.break_time ? timeStringToDurationObj(formData.break_time) : null,
      late_by: formData.late_by ? timeStringToDurationObj(formData.late_by) : null,
    };

    try {
      await axios.put(`${SERVER_PORT}/AttendanceEditUpdateEMP/${id}`, payload);
      alert('Attendance record updated successfully!');
      navigate('/admin-attendance');
    } catch (err) {
      console.error('Error updating attendance:', err);
      alert('Update failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading attendance record...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Edit Attendance Record</h2>
      <Card className="w-full p-1 relative">
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Employee ID</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.employee_id}
                  disabled
                  className="bg-light"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Employee Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  disabled
                  className="bg-light"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  isInvalid={!!errors.status}
                  required
                >
                  <option value="">-- Select Status --</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late Login">Late Login</option>
                  <option value="LOP">LOP</option>
                  <option value="Permission">Permission</option>
                  <option value="WFH">Work From Home</option>
                  <option value="Uninformed">Uninformed</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.status}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Check-In Time <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="check_in"
                  value={formData.check_in}
                  onChange={handleChange}
                  placeholder="HH:MM:SS (e.g., 09:00:00)"
                  isInvalid={!!errors.check_in}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.check_in}
                </Form.Control.Feedback>

              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Check-Out Time</Form.Label>
                <Form.Control
                  type="text"
                  name="check_out"
                  value={formData.check_out}
                  onChange={handleChange}
                  placeholder="HH:MM:SS (e.g., 18:00:00)"
                  isInvalid={!!errors.check_out}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.check_out}
                </Form.Control.Feedback>

              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Break Time Duration</Form.Label>
                <Form.Control
                  type="text"
                  name="break_time"
                  value={formData.break_time}
                  onChange={handleChange}
                  placeholder="HH:MM:SS (e.g., 01:00:00)"
                  isInvalid={!!errors.break_time}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.break_time}
                </Form.Control.Feedback>

              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Late By Duration</Form.Label>
                <Form.Control
                  type="text"
                  name="late_by"
                  value={formData.late_by}
                  onChange={handleChange}
                  placeholder="HH:MM:SS (e.g., 00:30:00)"
                  isInvalid={!!errors.late_by}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.late_by}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <div className="md:col-span-3 flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => navigate('/attendanceadmin')}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </Button>
              <Button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-indigo-700">
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AdminAttendanceEdit;
import React, { useState, useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { SERVER_PORT } from '../../../constant';
import { Button } from "@mui/material";
import CustomAlert from '../../../CustomAlert';


export default function AddUser({ setTitle }) {

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    adm_users_id: "",
    adm_users_loginid: "",
    adm_users_password: "", // Added password field
    adm_users_email: "",
    adm_users_title: "",
    adm_users_firstname: "",
    adm_users_lastname: "",
    adm_users_mobile: "",
    adm_users_profileImage: "",
    adm_users_address1: "",
    adm_users_address2: "",
    adm_users_address3: "",
    adm_users_dob: "",
    adm_users_gender: "",
    adm_users_phoneextn: "",
    adm_users_deptid: "",
    adm_users_jobid: "",
    adm_users_positionid: "",
    adm_users_islocked: false,
    adm_users_defaultroleid: "",
    adm_users_lastactivitydate: "",
    adm_users_status: true,
    created_on: "",
    created_by: "Admin",
    modified_on: "",
    modified_by: "",
  });

  const today = new Date().toISOString().split('T')[0];
  useEffect(() => {
    setTitle("Add User");
  });
  const [alerts, setAlerts] = useState([]);

  const showAlert = (type, title, message) => {
    const newAlert = { id: Date.now(), type, title, message };
    setAlerts([...alerts, newAlert]);

    setTimeout(() => {
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== newAlert.id));
    }, 3000);
  };

  const handlePhoneChange = (e) => {
    const newPhone = e.target.value.replace(/\D/g, "");
    setFormData((prevFormData) => ({
      ...prevFormData,
      adm_users_mobile: newPhone,
    }));
    const phoneRegex = /^[1-9][0-9]*$/;
    if (!phoneRegex.test(newPhone)) {
      showAlert("error", "Error!", "Invalid Mobile Number.");
    }
  };

  const titles = ['Mr.', 'Ms.', 'Mrs.'];
  const gender = ['Male', 'Female', 'Others'];

  // Fetch departments and roles from DB
  useEffect(() => {
    // Fetch departments
    axios.get(`${SERVER_PORT}/department_getalldata`)
      .then(res => {
        if (res.data && res.data.data) {
          setDepartments(res.data.data.filter(dep => dep.status === true));
        }
      })
      .catch(err => console.log('Department fetch error:', err));

    // Fetch roles
    axios.get(`${SERVER_PORT}/rolesload`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setRoles(res.data.filter(role => role.Roles_Status_Converted === 'Active'));
        }
      })
      .catch(err => console.log('Roles fetch error:', err));
  }, []);

  const job = ['Developer', 'Tester', 'Designer'];
  const position = ['Full-Time', 'Part-Time', 'Contract'];
  // Handle input changes
  const handleDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Submit the form data
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Find the role ID from the role name
    const selectedRole = roles.find(role => role.Roles_RoleName === formData.adm_users_defaultroleid);
    if (!selectedRole) {
        showAlert("error", "Error!", "Please select a valid role.");
        return;
    }

    const updatedData = {
        ...formData,
        adm_users_defaultroleid: selectedRole.Roles_Id, // Pass the role ID to the backend
        created_on: today
    };

    try {
      console.log(updatedData);
      const response = await axios.post(`${SERVER_PORT}/userlist_adduser`, updatedData);
      if (response.status === 200) {
        showAlert("success", "Success!", "User added successfully!");
      } else {
        showAlert("error", "Error!", "Failed to add user.");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      if (error.response && error.response.status === 400) {
        showAlert("warning", "Warning!", "Fill the required fields.");
      } else {
        showAlert("error", "Error!", "Something went wrong.");
      }
    }
  };

  return (
    <div className="edit-container">
      <Form onSubmit={handleSubmit}>
        <div className="edit-right-section">
          {/* Common Details Section */}
          <div className="section employee-details">
            <h4>User Details</h4>
            <Row>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Username</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_loginid" value={formData.adm_users_loginid} minLength={4} maxLength={25} onChange={handleDataChange} required autoComplete="off" /></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Password</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="password" name="adm_users_password" value={formData.adm_users_password} onChange={handleDataChange} required autoComplete="off"/></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Email</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_email" value={formData.adm_users_email} minLength={4} maxLength={25} onChange={handleDataChange} required /></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Mobile</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_mobile" value={formData.adm_users_mobile} minLength={10} maxLength={10} onChange={handlePhoneChange} required /></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Title</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" as="select" name="adm_users_title" value={formData.adm_users_title} onChange={handleDataChange} required>
                <option value="">-- SELECT --</option>
                {titles.map((title) => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </Form.Control></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">First Name</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_firstname" value={formData.adm_users_firstname} minLength={4} maxLength={25} onChange={handleDataChange} required /></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Last Name</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_lastname" value={formData.adm_users_lastname} maxLength={25} onChange={handleDataChange} required /></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Gender</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" as="select" name="adm_users_gender" value={formData.adm_users_gender} onChange={handleDataChange} required>
                <option value="">-- SELECT --</option>
                {gender.map((gen) => (
                  <option key={gen} value={gen}>{gen}</option>
                ))}</Form.Control></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Date of Birth</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="date" name="adm_users_dob" max={today} value={formData.adm_users_dob} onChange={handleDataChange} required /></Form.Group></Col>
            </Row>
          </div>

          {/* Address Details */}
          <div className="section address-details">
            <h4>Address Details</h4>
            <Row>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Address 1</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_address1" value={formData.adm_users_address1} onChange={handleDataChange} required /></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Address 2</Form.Label><Form.Control className="edit-form-control" type="text" name="adm_users_address2" value={formData.adm_users_address2} onChange={handleDataChange} /></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Address 3</Form.Label><Form.Control className="edit-form-control" type="text" name="adm_users_address3" value={formData.adm_users_address3} onChange={handleDataChange} /></Form.Group></Col>
            </Row>
          </div>

          {/* Employee Details */}
          <div className="section employee-details">
            <h4>Job Role Details</h4>
            <Row>
              <Col>
                <Form.Group className="edit-form-group">
                  <Form.Label className="edit-form-label">Department</Form.Label><Form.Text className="text-danger">*</Form.Text>
                  <Form.Control className="edit-form-control" as="select" name="adm_users_deptid" value={formData.adm_users_deptid} onChange={handleDataChange} required>
                    <option value="">-- SELECT --</option>
                    {departments.map((dept) => (
                      <option key={dept.department_id} value={dept.department_name}>{dept.department_name}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="edit-form-group">
                  <Form.Label className="edit-form-label">Role</Form.Label><Form.Text className="text-danger">*</Form.Text>
                  <Form.Control className="edit-form-control" as="select" name="adm_users_defaultroleid" value={formData.adm_users_defaultroleid} onChange={handleDataChange} required>
                    <option value="">-- SELECT --</option>
                    {roles.map((role) => (
                      <option key={role.Roles_Id} value={role.Roles_Id}>{role.Roles_RoleName}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="edit-form-group">
                  <Form.Label className="edit-form-label">Job</Form.Label><Form.Text className="text-danger">*</Form.Text>
                  <Form.Control className="edit-form-control" as="select" name="adm_users_jobid" value={formData.adm_users_jobid} onChange={handleDataChange} required>
                    <option value="">-- SELECT --</option>
                    {job.map((jobid) => (
                      <option key={jobid} value={jobid}>{jobid}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="edit-form-group">
                  <Form.Label className="edit-form-label">Position</Form.Label><Form.Text className="text-danger">*</Form.Text>
                  <Form.Control className="edit-form-control" as="select" name="adm_users_positionid" value={formData.adm_users_positionid} onChange={handleDataChange} required>
                    <option value="">-- SELECT --</option>
                    {position.map((positionid) => (
                      <option key={positionid} value={positionid}>{positionid}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="edit-form-group">
                  <Form.Label className="edit-form-label">Phone Extension</Form.Label><Form.Text className="text-danger">*</Form.Text>
                  <Form.Control className="edit-form-control" type="text" name="adm_users_phoneextn" value={formData.adm_users_phoneextn} onChange={handleDataChange} required />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* User Activity */}
          <div className="section user-activity">
            <h4>Account Status</h4>
            <Row>
              <Col>
                <Form.Group className="edit-form-group">
                  <Form.Label className="edit-form-label">Is Locked</Form.Label>
                  <Form.Check
                    type="switch"
                    id="adm_users_islocked"
                    label={formData.adm_users_islocked ? "Locked" : "Unlocked"}
                    checked={formData.adm_users_islocked}
                    onChange={(e) => setFormData({ ...formData, adm_users_islocked: e.target.checked })}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="edit-form-group">
                  <Form.Label className="edit-form-label">Status</Form.Label>
                  <Form.Check
                    type="switch"
                    id="adm_users_status"
                    label={formData.adm_users_status ? "Active" : "Inactive"}
                    checked={formData.adm_users_status}
                    onChange={(e) => setFormData({ ...formData, adm_users_status: e.target.checked })}
                  />
                </Form.Group>
              </Col>

            </Row>
          </div>

        </div>
        <Col>
          <Button className="mt-3 edit-btn" type="submit" style={{ color: "white", backgroundColor: " #3CB371", margin: "10px" }}>Save</Button>
          <Button className="mt-3 edit-btn" style={{ color: "white", backgroundColor: "#E53935", margin: "10px" }} onClick={() => window.history.back()}>Cancel</Button>
        </Col>
      </Form>
      <div style={{ padding: "20px" }}>
        {/* Render alerts dynamically */}
        {alerts.map((alert) => (
          <CustomAlert key={alert.id} {...alert} onClose={() => setAlerts(alerts.filter((a) => a.id !== alert.id))} />
        ))}
      </div>
    </div>
  );
}
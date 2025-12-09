import React, { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import CustomAlert from "../../../CustomAlert";
import { SERVER_PORT } from '../../../constant';


export default function DepartmentEdit({ setTitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const departmentId = location.state?.departmentId;

  const [departmentName, setDepartmentName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  const showAlert = (type, title, message) => {
    const newAlert = { id: Date.now(), type, title, message };
    setAlerts((prev) => [...prev, newAlert]);
    if (type !== "info") {
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== newAlert.id));
      }, 3000);
    }
  };

  const fetchDepartmentDetails = async () => {
    try {
      const res = await axios.get(`${SERVER_PORT}/department_getbyid/${departmentId}`);
      const data = res.data?.data[0];
      setDepartmentName(data.department_name);
      setDescription(data.department_description);
      setStatus(data.status);
    } catch (err) {
      showAlert("error", "Error", "Failed to load department details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${SERVER_PORT}/department_update/${departmentId}`, {
        department_name: departmentName,
        department_description: description,
        status,
      });

      if (response.data.success) {
        showAlert("success", "Updated", "Department updated successfully.");
        setTimeout(() => navigate("/departments"), 1000);
      } else {
        showAlert("error", "Error", response.data.message || "Update failed.");
      }
    } catch (err) {
      showAlert("error", "Error", "An error occurred while updating.");
    }
  };

  useEffect(() => {
    setTitle("Edit Department");
    if (departmentId) fetchDepartmentDetails();
  }, [departmentId]);

  if (loading) return <Spinner animation="border" variant="primary" className="m-4" />;

  return (
    <div className="form-container">
      <h3>Edit Department</h3>
      <Form onSubmit={handleUpdate}>
        <Form.Group className="mb-3">
          <Form.Label>Department Name</Form.Label>
          <Form.Control
            type="text"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select value={status} onChange={(e) => setStatus(e.target.value === "true")}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Form.Select>
        </Form.Group>

        <Button type="submit" variant="primary">
          Update
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate("/departments")}
          className="ms-2"
        >
          Cancel
        </Button>
      </Form>

      {alerts.map((alert) => (
        <CustomAlert
          key={alert.id}
          {...alert}
          onClose={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
        />
      ))}
    </div>
  );
}

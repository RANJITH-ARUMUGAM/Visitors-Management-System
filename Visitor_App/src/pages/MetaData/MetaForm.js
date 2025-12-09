import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Row, Col, Container, Button, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SERVER_PORT } from '../../constant';


const MetaForm = (setTitle) => {


  useEffect(() => {
    setTitle("Book Appointment");
  }, []);


  const [headerData, setHeaderData] = useState({
    GEN_Metahdr_ID: '',
    GEN_Metahdr_Category: '',
    GEN_Metahdr_CategoryName: '',
    GEN_Metahdr_Status: false,
  });

  const [detailData, setDetailData] = useState([]);
  const [isDisabled, setDisabled] = useState(true);

  const handleHeaderChange = (e) => {
    const { name, type, checked, value } = e.target;
    setHeaderData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const fetchDetailData = async () => {
    try {
      const response = await axios.get(`${SERVER_PORT}/metadata_Detail`);
      if (response.status === 200) {
        const data = response.data;
        setDetailData(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching metadata details:", error);
      setDetailData([]);
    }
  };

  useEffect(() => {
    fetchDetailData();
  }, []);

  const handleHeader = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${SERVER_PORT}/metadata_Header`, headerData);
      if (response.status === 200) {
        alert("Header submitted successfully!");
        setDisabled(false);
      } else {
        alert("Failed to submit header");
      }
    } catch (error) {
      console.error("Error submitting header:", error);
      alert("Header submission error");
    }
  };

  const handleDetails = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${SERVER_PORT}/metadata_Details`, detailData);
      if (response.status === 200) {
        alert("Detail data submitted successfully!");
      } else {
        alert("Failed to submit detail data");
      }
    } catch (error) {
      console.error("Error submitting detail data:", error);
      alert("Detail submission error");
    }
  };

  const handleDetailChange = (e, index) => {
    const { name, type, checked, value } = e.target;
    const updated = [...detailData];
    updated[index][name] = type === 'checkbox' ? checked : value;
    setDetailData(updated);
  };

  const addRow = () => {
    const newRow = {
      GEN_Metadtl_ID: '',
      GEN_Metahdr_ID: '',
      GEN_Metadtl_Value1: '',
      GEN_Metadtl_Value2: '',
      GEN_Metadtl_Value3: '',
      GEN_Metadtl_Value4: '',
      GEN_Metadtl_Value5: '',
      GEN_Metadtl_Value6: '',
      GEN_Metadtl_Value7: '',
      GEN_Metadtl_Value8: '',
      GEN_Metadtl_Status: false,
    };
    setDetailData([...detailData, newRow]);
  };

  return (
    <Container fluid className="employee-container">
      {/* Header Form */}
      <Form onSubmit={handleHeader}>
        <div className="border p-4 rounded bg-light mb-4">
          <h5 className="mb-3">Header Section</h5>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Header ID</Form.Label>
              <Form.Control
                type="number"
                name="GEN_Metahdr_ID"
                value={headerData.GEN_Metahdr_ID}
                onChange={handleHeaderChange}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Header Category</Form.Label>
              <Form.Control
                type="text"
                name="GEN_Metahdr_Category"
                value={headerData.GEN_Metahdr_Category}
                onChange={handleHeaderChange}
                required
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Header CategoryName</Form.Label>
              <Form.Control
                type="text"
                name="GEN_Metahdr_CategoryName"
                value={headerData.GEN_Metahdr_CategoryName}
                onChange={handleHeaderChange}
                required
              />
            </Col>
            <Col md={6}>
              <Form.Label>Status</Form.Label><br />
              <Form.Check
                type="switch"
                name="GEN_Metahdr_Status"
                label={headerData.GEN_Metahdr_Status ? "Active" : "Inactive"}
                checked={headerData.GEN_Metahdr_Status}
                onChange={handleHeaderChange}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Button type="submit" variant="primary" className="me-2">Submit</Button>
              <Button type="reset" variant="secondary">Clear</Button>
            </Col>
          </Row>
        </div>
      </Form>

      {/* Detail Form */}
      <Form onSubmit={handleDetails}>
        <div className="border p-4 rounded bg-light mb-4">
          <h5 className="mb-3">Detail Section</h5>

          <Row className="mb-3">
            <Col>
              <Button variant="secondary" onClick={addRow}>
                Add Row
              </Button>
            </Col>
          </Row>

          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Metadtl_ID</th>
                {[...Array(8)].map((_, i) => (
                  <th key={i}>Value{i + 1}</th>
                ))}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(detailData) && detailData.map((row, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <Form.Control
                      type="text"
                      name="GEN_Metadtl_ID"
                      value={row.GEN_Metadtl_ID}
                      disabled={isDisabled}
                      onChange={(e) => handleDetailChange(e, index)}
                    />
                  </td>
                  {[...Array(8)].map((_, i) => (
                    <td key={i}>
                      <Form.Control
                        type="text"
                        name={`GEN_Metadtl_Value${i + 1}`}
                        value={row[`GEN_Metadtl_Value${i + 1}`]}
                        disabled={isDisabled}
                        onChange={(e) => handleDetailChange(e, index)}
                      />
                    </td>
                  ))}
                  <td className="text-center">
                    <Form.Check
                      type="switch"
                      name="GEN_Metadtl_Status"
                      checked={row.GEN_Metadtl_Status}
                      disabled={isDisabled}
                      onChange={(e) => handleDetailChange(e, index)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Row>
            <Col>
              <Button type="submit" variant="primary" disabled={isDisabled}>
                Submit Details
              </Button>
            </Col>
          </Row>
        </div>
      </Form>
    </Container>
  );
};

export default MetaForm;

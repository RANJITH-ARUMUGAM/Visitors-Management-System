import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Button, Row, Col, Form, Card } from 'react-bootstrap';
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';
import { motion } from 'framer-motion';
import '../../Common.css';

function EditRoleModel({ setTitle }) {
    const navigate = useNavigate();
    const [organisationBusiness, setOrganisationBusinessValues] = useState([]);
    const [orgIsDisabled, setOrgIsDisabled] = useState(false);
    const [businessunit, setBusinessunitValues] = useState([]);
    const [values, setRoleValues] = useState({
        Roles_ID: null,
        Roles_Code: "",
        Roles_RoleName: "",
        Businessunit_ID: null,
        Organisation_ID: null,
        Roles_Status: false,
        Roles_Modified_BY: ReactSession.get("username"),
    });

    const { id } = useParams();

    useEffect(() => {
        setTitle("Edit Roles");
        setOrgIsDisabled(true);

        const username = ReactSession.get("username");
        setRoleValues(prevValues => ({ ...prevValues, Roles_Modified_BY: username }));


        axios.get(`${SERVER_PORT}/roles/` + id)
            .then(res => {
                setRoleValues(prevValues => ({
                    ...prevValues,
                    Roles_ID: res.data[0].Roles_ID,
                    Roles_Code: res.data[0].Roles_Code,
                    Roles_RoleName: res.data[0].Roles_RoleName,
                    Businessunit_ID: res.data[0].Businessunit_ID,
                    Organisation_ID: res.data[0].Organisation_ID,
                    Roles_Status: res.data[0].Roles_Status === 1,
                }));
            })
            .catch(err => console.log(err));
    }, [id, setTitle]);

    const handleUpdate = (e) => {
        e.preventDefault();
        axios.put(`${SERVER_PORT}/roleseditt/` + id, values)
            .then(res => {
                navigate('/roles');
                alert("Updated Successfully");
            })
            .catch(err => console.log(err));
    };

    const handleInputChange = (e) => {
        setRoleValues(prevValues => ({ ...prevValues, [e.target.name]: e.target.value }));
    };

    const handleStatusChange = (e) => {
        setRoleValues(prevValues => ({ ...prevValues, Roles_Status: e.target.checked }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Container fluid className="d-flex justify-content-center align-items-top mt-3">
                <Card className="p-4 shadow-lg border-0 rounded-4" style={{ width: '100%', maxWidth: '700px' }}>
                    <Card.Body>
                        <Card.Title as="h4" className="text-center mb-4">Edit Role</Card.Title>
                        <Form onSubmit={handleUpdate}>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Group controlId="formRoleCode">
                                        <Form.Label>Role Code</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Role Code"
                                            name="Roles_Code"
                                            value={values.Roles_Code}
                                            onChange={handleInputChange}
                                            className="rounded-pill shadow-sm"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group controlId="formRoleName">
                                        <Form.Label>Role Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Role Name"
                                            name="Roles_RoleName"
                                            value={values.Roles_RoleName}
                                            onChange={handleInputChange}
                                            className="rounded-pill shadow-sm"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={4}>
                                    <Form.Group controlId="formStatus" className="d-flex align-items-center gap-3 mt-2">
                                        <Form.Label className="mb-0">Status</Form.Label>
                                        <Form.Check
                                            type="switch"
                                            id="status-switch"
                                            name="Roles_Status"
                                            checked={values.Roles_Status}
                                            onChange={handleStatusChange}
                                        />
                                        <span className="text-muted">{values.Roles_Status ? 'Active' : 'Inactive'}</span>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="success" type="submit" className="rounded-pill px-4 shadow-sm">
                                    Save
                                </Button>
                                <Link to="/roles">
                                    <Button variant="danger" className="rounded-pill px-4 shadow-sm">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </motion.div>
    );
}

export default EditRoleModel;
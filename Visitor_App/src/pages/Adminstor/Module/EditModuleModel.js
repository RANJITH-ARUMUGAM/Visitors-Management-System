import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';

function EditModuleModel({ setTitle }) {

    useEffect(() => {
        setTitle("Edit Module");
    }, []);

    const navigate = useNavigate()
    const [DisplayValues, setDisplayValues] = useState();
    const [searchTerm, setSearchTerm] = useState('');

    const [values, setModValues] = useState({
        Module_ID: "",
        Module_Code: "",
        Module_Name: "",
        Module_Valid: null,
        Module_Modified_ON: "",
        Module_Modified_BY: ""
    })

    const { id } = useParams();

    useEffect(() => {

        const username = ReactSession.get("username");
        setDisplayValues.DisplayValues = username;

        setModValues({ ...values, Module_Modified_BY: setDisplayValues.DisplayValues });

        const current = new Date()
        const Currdate = `${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`;

        setModValues(...values.Module_Modified_ON = Currdate)


        axios.get(`${SERVER_PORT}/module/` + id)
            .then(res => {
                setModValues({
                    ...values, Module_ID: res.data[0].Module_ID,
                    Module_Code: res.data[0].Module_Code,
                    Module_Name: res.data[0].Module_Name,
                    Module_Valid: res.data[0].Module_Valid,
                });
            }).catch(err => console.log(err));
    }, [])



    const activestatusCheckboxChange = (e) => {
        const { name, checked } = e.target
        setModValues.Module_Valid = e.target.checked
        setModValues({ ...values, Module_Valid: e.target.checked })
        setModValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };


    const handleUpdate = (event) => {
        event.preventDefault();

        axios.put(`${SERVER_PORT}/moduleedit/${setDisplayValues.DisplayValues}/` + id, values)
            .then(res => {

                if (res.data.message === 'Code already exists') {
                    alert('Code already exists');
                } else {
                    if (res.data.message === 'Name already exists') {
                        alert('Name already exists');
                    } else {
                        alert("Saved Successfully")
                        navigate('/module')
                    }
                }
            }).catch(err => console.log(err));
    };




    return (

        <div className="employee-container">
            {/* Navigation Links Header */}
            <div className="d-flex align-items-center mb-4" style={{ minHeight: '30px' }}>
                <Link style={{ fontSize: '14px', color: 'black', paddingRight: '8px' }} to='/Home'>Administration</Link>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" style={{ color: '#5D6D7E', margin: '0 4px' }} fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                </svg>
                <Link style={{ fontSize: '14px', color: 'black', paddingRight: '8px', paddingLeft: '4px' }} to="/module">Module</Link>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" style={{ color: '#5D6D7E', margin: '0 4px' }} fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                </svg>
                <span style={{ fontSize: '14px', color: '#73879C', paddingLeft: '4px' }}>Edit Module</span>
            </div>

            <div className="x_panel" style={{
                minWidth: 550,
                maxWidth: 700,
                margin: "0 auto",
                width: "100%",
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.13)',
                padding: '24px 24px'
            }}>
                <form onSubmit={handleUpdate}>
                    <div className="d-flex justify-content-center align-items-start" style={{ minHeight: '90px', marginTop: '0px' }}>
                        <Row className="w-100 text-center justify-content-center align-items-start" style={{ margin: 0 }}>
                            <Col md={2} className="d-flex flex-column align-items-center justify-content-start">
                                <Form.Group controlId="Project_Name" className="w-100">
                                    <Form.Label className="label-style">Application<span className="star"></span></Form.Label>
                                    <Form.Control Searchable value={'CGM'} disabled className="text-center" />
                                </Form.Group>
                            </Col>
                            <Col md={3} className="d-flex flex-column align-items-center justify-content-start">
                                <Form.Group controlId="Module_Code" className="w-100">
                                    <Form.Label className="label-style">Code <span className="star"></span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="Module_Code"
                                        required
                                        onChange={e => setModValues({ ...values, Module_Code: (e.target.value).toUpperCase() })}
                                        style={{ textTransform: "uppercase", textAlign: "center" }}
                                        defaultValue={values.Module_Code}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} className="d-flex flex-column align-items-center justify-content-start">
                                <Form.Group controlId="Module_Name" className="w-100">
                                    <Form.Label className="label-style">Name <span className="star"></span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="Account_Desc"
                                        required
                                        onChange={e => setModValues({ ...values, Module_Name: e.target.value })}
                                        defaultValue={values.Module_Name}
                                        className="text-center"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2} className="d-flex flex-column align-items-center justify-content-start">
                                <Form.Group controlId="Module_Value" className="w-100">
                                    <Form.Label className="label-style">Status</Form.Label>
                                    <div className="form-check form-switch d-flex justify-content-center">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            id="flexSwitchCheckChecked"
                                            checked={values.Module_Valid}
                                            onChange={activestatusCheckboxChange}
                                            name="Module_Valid"
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="flexSwitchCheckChecked"
                                            style={{ marginLeft: 8 }}
                                        >
                                            {values.Module_Valid ? 'On' : 'Off'}
                                        </label>
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                    <div className="d-flex justify-content-end mt-3">
                        <Button variant="success" type="submit">
                            Save
                        </Button>
                        <Link to="/module">
                            <Button variant="danger" type="button" style={{ marginLeft: "10px" }}>
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>

            </div>

        </div>

    )
}

export default EditModuleModel;
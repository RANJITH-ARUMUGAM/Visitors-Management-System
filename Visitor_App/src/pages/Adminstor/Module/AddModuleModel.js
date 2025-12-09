import axios from "axios"
import React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Form, Button, Row, Col } from "react-bootstrap"
import Searchable from "react-searchable-dropdown";
import { SERVER_PORT } from '../../../constant';
import '../../../App.css'
import { ReactSession } from 'react-client-session';
import '../../Common.css'


function AddModuleModel({ setTitle }) {

    useEffect(() => {
        setTitle("Add Module");
    }, []);

    const navigate = useNavigate()
    const [DisplayValues, setDisplayValues] = useState();

    const [values, setModValues] = useState({
        Module_Code: "",
        Module_Name: "",
        Module_Valid: true,
        Module_Created_BY: "",
        Module_Created_ON: "",
    });


    useEffect(() => {

        const username = ReactSession.get("username");
        setDisplayValues.DisplayValues = username;

        setModValues({ ...values, Module_Created_BY: setDisplayValues.DisplayValues });
        const current = new Date()
        const Currdate = `${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`;
        setModValues({ ...values, Module_Created_ON: Currdate })
    },
        []);



    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`${SERVER_PORT}/moduleadd/${setDisplayValues.DisplayValues}`, values)
            .then(res => {
                if (res.data.message === 'Code already exists') {
                    alert('Code already exists');
                } else {
                    if (res.data.message === 'Name already exists') {
                        alert('Name already exists');
                    } else {
                        alert('Saved Successfully')
                        navigate('/module')
                    }
                }
            }).catch(err => console.log(err));
    };


    return (

        <div className="employee-container">
            {/* Navigation Links Header */}
            <div style={{ backgroundColor: '#f7faf8', borderBottom: '1px solid #dcdcdc' }}>
                <Row className="align-items-center">
                    <Col xs={12}>
                        <div className="d-flex justify-content-between align-items-center flex-nowrap" style={{ gap: '16px', flexWrap: 'nowrap', paddingLeft: '4px', paddingRight: '24px' }}>
                            <div className="d-flex align-items-center flex-nowrap" style={{ gap: '8px', fontSize: '14px', color: 'black' }}>
                                <Link to='/Home' style={{ color: 'black', textDecoration: 'none' }}>Administration</Link>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" style={{ color: '#5D6D7E' }} fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                                </svg>
                                <Link to="/module" style={{ color: 'black', textDecoration: 'none' }}>Module</Link>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" style={{ color: '#5D6D7E' }} fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                                </svg>
                                <span style={{ color: '#73879C' }}>Add Module</span>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '75vh', marginTop: '32px' }}>
                <div className="x_panel" style={{ minWidth: 750, maxWidth: 1000, width: '100%', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.93)', padding: '32px 24px' }}>
                    <Form onSubmit={handleSubmit} >
                        <Row className="mb-2">
                            <Col md={2}>
                                <Form.Group controlId="Project_Name">
                                    <Form.Label className="label-style">Application<span className="star"></span></Form.Label>
                                    <Form.Control Searchable value={'CGM'} disabled>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId="Module_Code" onChange={e => setModValues({ ...values, Module_Code: (e.target.value).toUpperCase() })}  >
                                    <Form.Label className="label-style">Code <span className="star"></span></Form.Label>
                                    <Form.Control style={{ textTransform: "uppercase" }} type="text" name="Module_Code" required
                                        title='please enter the code'
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="Module_Name" onChange={e => setModValues({ ...values, Module_Name: e.target.value })}>
                                    <Form.Label className="label-style">Name <span className="star"></span></Form.Label>
                                    <Form.Control type="text" name="Module_Name" required
                                        title='please enter the Module Name'
                                    />

                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex align-items-center" style={{ gap: '12px', marginTop: '12px' }}>
                            <Button variant="success" type="submit" size="md">
                                Save
                            </Button>
                            <Link to="/module">
                                <Button variant="danger" type="button" size="md">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </Form>
                </div>
            </div>
        </div>

    )
};

export default AddModuleModel;
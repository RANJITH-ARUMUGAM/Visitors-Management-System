import axios from "axios"
import React from "react"
import Select from 'react-select';
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Form, Button, Row, Col } from "react-bootstrap"
import Searchable from "react-searchable-dropdown";
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';

function AddProgramModel({ setTitle }) {

    useEffect(() => {
        setTitle("Add Program");
    }, []);

    const navigate = useNavigate()

    const [module, setModValues] = useState([])
    const [DisplayValues, setDisplayValues] = useState();

    const [values, setProgValues] = useState({
        Businessunit_ID: ReactSession.get("buid"),
        Organisation_ID: ReactSession.get("ouid"),
        Program_Code: "",
        Program_Name: "",
        Program_ModuleID: "select",
        Program_Valid: true,
        Program_Created_BY: "",
        Program_Nav_Name: ""
    })



    useEffect(() => {
        const username = ReactSession.get("username");
        setDisplayValues.DisplayValues = username;

        setProgValues({ ...values, Program_Created_BY: setDisplayValues.DisplayValues });
        console.log(setDisplayValues.DisplayValues)

        axios.get(`${SERVER_PORT}/moduleactive`)
            .then(res => (setModValues(res.data)))
            .catch(err => console.log(err));
    }, [])


    function changeModuleIdFilters(selectedOption) {
        setProgValues({ ...values, Program_ModuleID: selectedOption.value })
        setProgValues.Program_ModuleID = selectedOption.value
        values.Program_ModuleID = selectedOption.value

    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (values.Program_ModuleID === "select") {
            alert("Please select module")
        } else {
            axios.post(`${SERVER_PORT}/programadd/${setDisplayValues.DisplayValues}`, values)
                .then(res => {

                    if (res.data.message === 'Code already exists') {
                        alert('Code already exists');
                    } else if (res.data.message === 'Name already exists') {
                        alert('Name already exists');
                    } else if (res.data.message === 'Display Name already exists') {
                        alert('Display Name already exists');
                    } else {
                        alert('Added Successfully')
                        // console.log(res)
                        navigate('/program')
                    }
                }).catch(err => console.log(err));
        }
    }




    return (
        <div className="employee-container">
            {/* Header: Breadcrumb */}
            <div style={{ borderBottom: '1px solid #dcdcdc', padding: '8px 0 0 0' }}>
                <Row className="align-items-center">
                    <Col xs={12}>
                        <div className="d-flex justify-content-between align-items-center flex-nowrap" style={{ gap: '16px', flexWrap: 'nowrap', paddingLeft: '16px', paddingRight: '24px' }}>
                            <div className="d-flex align-items-center flex-nowrap" style={{ gap: '8px', fontSize: '14px', color: 'black' }}>
                                <Link style={{ color: 'black', textDecoration: 'none' }} to='/Home'>Administration</Link>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" style={{ color: '#5D6D7E' }} fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                                </svg>
                                <Link style={{ color: 'black', textDecoration: 'none' }} to="/program">Program</Link>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" style={{ color: '#5D6D7E' }} fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                                </svg>
                                <span style={{ color: '#73879C' }}>Add Program</span>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
            {/* Centered Form Container */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh', marginTop: '32px' }}>
                <div className="x_panel" style={{
                    minWidth: 600,
                    maxWidth: 700,
                    width: '100%',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.98)',
                    padding: '24px 14px'
                }}>
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-2">
                            <Col md={6}>
                                <Form.Group controlId="Module_ID">
                                    <Form.Label className="label-style">
                                        Module<span className="star"></span>
                                    </Form.Label>
                                    <Select
                                        options={module.map(rel => ({
                                            value: rel.Module_ID,
                                            label: `${rel.Module_Name}`,
                                        }))}
                                        isSearchable
                                        onChange={changeModuleIdFilters}
                                        placeholder="Select Module"
                                        noOptionsMessage={() => 'No Module found'}
                                        required
                                        title="Please select the Module"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="Program_Code" onChange={e => setProgValues({ ...values, Program_Code: (e.target.value).toUpperCase() })}  >
                                    <Form.Label className="label-style">Program Code <span className="star"></span></Form.Label>
                                    <Form.Control type="text" name="Program_Code" required
                                        title='please enter the code'
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-2">
                            <Col md={6}>
                                <Form.Group controlId="Program_Nav_Name" onChange={e => setProgValues({ ...values, Program_Nav_Name: e.target.value })}>
                                    <Form.Label className="label-style">Display Name <span className="star"></span></Form.Label>
                                    <Form.Control type="text" name="Program_Nav_Name" required
                                        title='please enter the Program Nav Name'
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="Program_Name" onChange={e => setProgValues({ ...values, Program_Name: e.target.value })}>
                                    <Form.Label className="label-style">Program Name <span className="star"></span></Form.Label>
                                    <Form.Control type="text" name="Program_Name" required
                                        title='please enter the Program Name'
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="d-flex align-items-center" style={{ gap: '12px', marginTop: '16px' }}>
                            <Button variant="success" type="submit" size="md">
                                Save
                            </Button>
                            <Link to="/program">
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
}

export default AddProgramModel;
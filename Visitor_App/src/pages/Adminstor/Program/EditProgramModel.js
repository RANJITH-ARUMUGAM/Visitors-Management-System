import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Select from 'react-select';
import { useNavigate } from "react-router-dom";
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';

function EditProgramModel({ setTitle }) {

    useEffect(() => {
        setTitle("Edit Program");
    }, []);

    const navigate = useNavigate()

    const [module, setModValues] = useState([])
    const [data, setDatawithoutfil] = useState([])
    const [DisplayValues, setDisplayValues] = useState();

    const [values, setProgValues] = useState({
        Program_ID: "",
        Program_Code: "",
        Program_Name: "",
        Program_ModuleID: "select",
        Program_Valid: null,
        Program_Modified_ON: "",
        Program_Modified_BY: "",
        Program_Nav_Name: ""
    })

    const { id } = useParams();

    useEffect(() => {

        const username = ReactSession.get("username");
        setDisplayValues.DisplayValues = username;

        setProgValues({ ...values, Program_Modified_BY: setDisplayValues.DisplayValues });
        console.log(setDisplayValues.DisplayValues)

        axios.get(`${SERVER_PORT}/moduleload`)
            .then(res => (setModValues(res.data), setDatawithoutfil(res.data)))
            .catch(err => console.log(err));

        //const {id} = useParams();
        axios.get(`${SERVER_PORT}/program/` + id)
            .then(res => {
                setProgValues({
                    ...values, Program_ID: res.data[0].Program_ID,
                    Program_Code: res.data[0].Program_Code,
                    Program_Name: res.data[0].Program_Name,
                    Program_Valid: res.data[0].Program_Valid,
                    Program_ModuleID: res.data[0].Program_ModuleID,
                    Program_Nav_Name: res.data[0].Program_Nav_Name
                });
            }).catch(err => console.log(err));
    }, [])



    const activestatusCheckboxChange = (e) => {
        const { name, checked } = e.target

        setProgValues.Program_Valid = e.target.checked
        setProgValues({ ...values, Program_Valid: e.target.checked })
        setProgValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };



    function changeModuleIdFilters(selectedOption) {
        setProgValues({ ...values, Program_ModuleID: selectedOption.value })
        setProgValues.Program_ModuleID = selectedOption.value
        values.Program_ModuleID = selectedOption.value
    }
    /*    function changemoduleclick(e){
           setProgValues({...values,Program_ModuleID:e.target.value})
           setProgValues.Program_ModuleID = e.target.value
       } */

    const handleUpdate = (event) => {
        event.preventDefault();

        if (values.Program_ModuleID === "select") {
            alert("Please select module")
        } else {
            axios.put(`${SERVER_PORT}/programedit/${setDisplayValues.DisplayValues}/` + id, values)
                .then(res => {

                    if (res.data.message === 'Code already exists') {
                        alert('Code already exists');
                    } else if (res.data.message === 'Name already exists') {
                        alert('Name already exists');
                    } else if (res.data.message === 'Display Name already exists') {
                        alert('Display Name already exists');
                    } else {
                        alert("Updated Successfully")
                        navigate('/program')
                    }
                }).catch(err => console.log(err));
        }
    }





    return (
        <div className="Form-page" style={{ minHeight: '91.1vh', backgroundColor: 'rgb(241, 245, 245)', overflowX: 'hidden' }}>
            <div className="x_panel" style={{
                minWidth: 600,
                maxWidth: 900,
                margin: "32px auto 0 auto",
                width: "100%",
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.13)',
                padding: '14px 14px'
            }}>
                <Form onSubmit={handleUpdate}>
                    <div className="d-flex align-items-start" style={{ minHeight: '120px', marginTop: '0px' }}>
                        <Row className="w-100 " style={{ margin: 0 }}>
                            <Col md={4} className="d-flex flex-column">
                                <Form.Group controlId="Module_ID" className="w-100">
                                    <Form.Label className="label-style">
                                        Module<span className="star"></span>
                                    </Form.Label>
                                    <Select
                                        options={module.map(mod => ({
                                            value: mod.Module_ID,
                                            label: `${mod.Module_Name}`,
                                        }))}
                                        isSearchable
                                        value={module.find(mod => mod.Module_ID === values.Program_ModuleID)
                                            ? {
                                                value: values.Program_ModuleID,
                                                label: `${module.find(mod => mod.Module_ID === values.Program_ModuleID).Module_Name}`
                                            } : null}
                                        onChange={changeModuleIdFilters}
                                        placeholder="Select Module"
                                        noOptionsMessage={() => 'No Module found'}
                                        required
                                        title="Please select the Module"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3} className="d-flex flex-column align-items-center justify-content-start">
                                <Form.Group controlId="Program_Code" className="w-100">
                                    <Form.Label className="label-style">Code <span className="star"></span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="Program_Code"
                                        required
                                        onChange={e => setProgValues({ ...values, Program_Code: (e.target.value).toUpperCase() })}
                                        style={{ textTransform: "uppercase" }}
                                        defaultValue={values.Program_Code}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3} className="d-flex flex-column align-items-center justify-content-start">
                                <Form.Group controlId="Program_Name" className="w-100">
                                    <Form.Label className="label-style">Program Name <span className="star"></span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="Program_Name"
                                        required
                                        onChange={e => setProgValues({ ...values, Program_Name: e.target.value })}
                                        defaultValue={values.Program_Name}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                    <Row>
                        <Col md={4}>
                            <Form.Group controlId="Program_Nav_Name">
                                <Form.Label className="label-style">Display Name <span className="star"></span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="Program_Nav_Name"
                                    required
                                    onChange={e => setProgValues({ ...values, Program_Nav_Name: e.target.value })}
                                    defaultValue={values.Program_Nav_Name}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2} className="d-flex flex-column align-items-center justify-content-start">
                            <Form.Group controlId="Program_Value" className="w-100">
                                <Form.Label className="label-style">Status</Form.Label>
                                <div className="form-check form-switch d-flex justify-content-center">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="flexSwitchCheckChecked"
                                        checked={values.Program_Valid}
                                        onChange={activestatusCheckboxChange}
                                        name="Program_Valid"
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="flexSwitchCheckChecked"
                                        style={{ marginLeft: 8 }}
                                    >
                                        {values.Program_Valid ? 'On' : 'Off'}
                                    </label>
                                </div>
                            </Form.Group>
                        </Col>
                        <div className="d-flex justify-content-end mt-0">
                            <Button variant="success" type="submit">
                                Save
                            </Button>
                            <Link to="/program">
                                <Button variant="danger" type="button" style={{ marginLeft: "10px" }}>
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </Row>
                </Form>
            </div>
        </div>
    )
}

export default EditProgramModel;
import axios from "axios";
import React, { useState, useEffect } from "react";
import Select from 'react-select';
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Row, Col, Table } from "react-bootstrap";
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';


function RoleProgram({ setTitle }) {

    useEffect(() => {
        setTitle("Roles & Programs");
    }, []);

    const navigate = useNavigate();
    const [role, setRoleValues] = useState([]);
    const [pro, setProValues] = useState([]);
    const [selectedPrograms, setselectedPrograms] = useState([]);
    const [saveButtonDisable, setSaveButtonDisable] = useState([]);
    const [Module, setModuleValues] = useState([]);
    const [ProwithoutfilValues, setProwithoutfilValues] = useState([]);
    const [ProgramValues, setProgramValues] = useState([]);
    const [OrganisationBusiness, setOrganisationBusinessValues] = useState([])
    const [OrgIsDisabled, setOrgIsDisabled] = useState()
    const [Businessunit, setbusinessunitValues] = useState([])
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [values, setRoleProgramValues] = useState({
        Businessunit_ID: null,
        Organisation_ID: null,
        RolePrograms_ProgramID: "select",
        RolePrograms_RoleID: "select",
        RolePrograms_Valid: true,
        RolePrograms_Module_ID: "select",
        RolePrograms_Created_ON: "",
        RolePrograms_Created_BY: ReactSession.get("username"),
        RolePrograms_StatusCheck: true
    });
    useEffect(() => {
        setSaveButtonDisable(false);
        const username = ReactSession.get("username");
        const selectedfy = ReactSession.get("selectedfy")
        setRoleProgramValues({ ...values, RolePrograms_Created_BY: username });
        axios.get(`${SERVER_PORT}/userroleroles`)
            .then(res => setRoleValues(res.data))
            .catch(err => console.log(err));
    }, []);
    function changeRoleIdFilters(selectedOption) {
        setRoleProgramValues({ ...values, RolePrograms_RoleID: selectedOption.value });
        setRoleProgramValues.RolePrograms_RoleID = selectedOption.value
        setSelectedRole(selectedOption);
        setSelectedModule(null);
        values.RolePrograms_RoleID = selectedOption.value
        axios.get(`${SERVER_PORT}/rolepromodule`)
            .then(res => setModuleValues(res.data))
            .catch(err => console.log(err));
        setSaveButtonDisable(false);
        setModuleValues([])
        setselectedPrograms([])
    };
    function changeModuleIdFilters(selectedOption) {
        setRoleProgramValues({ ...values, RolePrograms_Module_ID: selectedOption.value });
        setRoleProgramValues.RolePrograms_Module_ID = selectedOption.value;
        setSelectedModule(selectedOption);
        values.RolePrograms_Module_ID = selectedOption.value;
        axios.get(`${SERVER_PORT}/roleproprogram/${setRoleProgramValues.RolePrograms_Module_ID}`)
            .then(res => {
                setProValues(res.data);
                setProwithoutfilValues(res.data);
            })
            .catch(err => console.log(err));
        axios.get(`${SERVER_PORT}/progavail/${setRoleProgramValues.RolePrograms_RoleID}/${setRoleProgramValues.RolePrograms_Module_ID}`)
            .then(res => {
                if (res.data.Status === 'NotAvailable') {
                    getCheck();
                } else if (res.data.Status === 'Available') {
                    axios.post(`${SERVER_PORT}/findprogid/${setRoleProgramValues.RolePrograms_RoleID}/${setRoleProgramValues.RolePrograms_Module_ID}`, values)
                        .then(res => {
                            setProgramValues.ProgramValues = (res.data[0].RolePrograms_ProgramID);
                            getCheck();
                        });
                }
            })
            .catch(err => console.log(err));
        setSaveButtonDisable(false)
        setselectedPrograms([])
    }
    function getCheck() {
        axios.get(`${SERVER_PORT}/roleprodefault/${setRoleProgramValues.RolePrograms_RoleID}/${setRoleProgramValues.RolePrograms_Module_ID}`)
            .then(res => {
                const roleProgram = res.data.map(rolePro => ({
                    proId: rolePro.RolePrograms_ProgramID,
                    selected: rolePro.RolePrograms_StatusCheck ? "Active" : "InActive"
                }));
                if (res.data.length === 0) {
                    roleProgram.forEach(pro => {
                        pro.selected = "InActive";
                    });
                }
                setselectedPrograms(roleProgram);
            })
            .catch(err => console.log(err));
    }
    function handleCheckboxChange(event, proId) {
        const isChecked = event.target.checked;
        console.log(selectedPrograms)
        const updatedPrograms = [...selectedPrograms];
        const proIndex = updatedPrograms.findIndex(pro => pro.proId === proId);
        if (isChecked) {
            if (proIndex === -1) {
                updatedPrograms.push({ proId, selected: "Active" });
            } else {
                updatedPrograms[proIndex] = { ...updatedPrograms[proIndex], selected: "Active" };
            }
        } else {
            if (proIndex !== -1) {
                updatedPrograms[proIndex] = { ...updatedPrograms[proIndex], selected: "InActive" };
            }
        }
        setselectedPrograms(updatedPrograms);
        setSaveButtonDisable(false);
    };
    const handleClear = () => {
        setSelectedRole(null);
        setSelectedModule(null);
        setModuleValues([]);
        setselectedPrograms([]);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (values.RolePrograms_RoleID === "select") {
            alert("Please select the role name");
        } else if (values.RolePrograms_Module_ID === "select") {
            alert("Please select the module name");
        } else {
            const insertPromises = selectedPrograms.map(pro => {
                const { proId, selected } = pro;
                const programRoleStatusCheck = selected === "Active";
                return axios.post(`${SERVER_PORT}/roleproadd/${proId}/${programRoleStatusCheck}`, values)
                    .then(res => {
                        console.log(res.data);
                    })
                    .catch(err => console.log(err));
            });
            setSaveButtonDisable(true);
            Promise.all(insertPromises).then(() => {
                alert('Saved Successfully');
                navigate('/roleprogram');
            });
        }
    };





    return (
        <div className="employee-container">
            {/* Form Panel */}
            <div className="x_panel" style={{
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.83)',
                marginTop: '32px',
                padding: '32px 24px',
                minWidth: 900,
                maxWidth: 900,
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
                <Form onSubmit={handleSubmit}>
                    <Row className="ml-1 mb-4">
                        <Col md={6}>
                            <Form.Group controlId="Roles_ID">
                                <Form.Label className="label-style" style={{ fontWeight: 500, color: '#2e5c3b' }}>
                                    Role<span className="star"></span>
                                </Form.Label>
                                <Select
                                    options={role.map(rel => ({
                                        value: rel.Roles_ID,
                                        label: `${rel.Roles_RoleName}`,
                                    }))}
                                    id='roleSelect'
                                    isSearchable
                                    onChange={changeRoleIdFilters}
                                    value={selectedRole}
                                    placeholder="Select Role"
                                    noOptionsMessage={() => 'No Role found'}
                                    required
                                    title="Please select the Role"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            minHeight: 38,
                                            fontSize: 14
                                        })
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="Module_ID">
                                <Form.Label className="label-style" style={{ fontWeight: 500, color: '#2e5c3b' }}>
                                    Module<span className="star"></span>
                                </Form.Label>
                                <Select
                                    options={Module.map(rel => ({
                                        value: rel.Module_ID,
                                        label: `${rel.Module_Name}`,
                                    }))}
                                    id='moduleSelect'
                                    isSearchable
                                    onChange={changeModuleIdFilters}
                                    value={selectedModule}
                                    placeholder="Select Module"
                                    noOptionsMessage={() => 'No Module found'}
                                    required
                                    title="Please select the Module"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            minHeight: 38,
                                            fontSize: 14
                                        })
                                    }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="table-responsive-custom ">
                        <table >
                            <thead>
                                <tr >
                                    <th style={{ minWidth: '40px' }}>Program</th>
                                    <th style={{ minWidth: '50px' }}>Role Mapping</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pro.map(pr => {
                                    const selectedProgram = selectedPrograms.find(p => p.proId === pr.Program_ID);
                                    return (
                                        <tr key={pr.Program_ID}>
                                            <td style={{ color: '#222' }}>{pr.Program_Nav_Name}</td>
                                            <td>
                                                <Form.Group controlId={`Program_NameYes-${pr.Program_ID}`} className="mb-0">
                                                    <div className="custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            id={`Active-${pr.Program_ID}`}
                                                            className="custom-checkbox-input"
                                                            name={`pro-${pr.Program_ID}`}
                                                            checked={selectedProgram?.selected === "Active"}
                                                            onChange={(e) => handleCheckboxChange(e, pr.Program_ID, "Active")}
                                                            defaultValue={selectedPrograms.RolePrograms_StatusCheck}
                                                        />
                                                        <label htmlFor={`Active-${pr.Program_ID}`} className="mb-0"></label>
                                                    </div>
                                                </Form.Group>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="d-flex align-items-center" style={{ gap: '14px', marginTop: '18px' }}>
                        <Button variant="success" type="submit" disabled={saveButtonDisable} size="md" style={{ background: 'linear-gradient(45deg, #1af107a7, #44a706)', minWidth: 100, fontWeight: 500 }}>
                            Save
                        </Button>
                        <Link to="/roleprogram">
                            <Button variant="danger" type="button" onClick={handleClear} style={{ background: 'linear-gradient(45deg, #f10707ff, #c90808ff)', marginLeft: "10px", minWidth: 100, fontWeight: 500 }}>
                                Clear
                            </Button>
                        </Link>
                    </div>
                </Form>
            </div>

        </div>
    );
}
export default RoleProgram;

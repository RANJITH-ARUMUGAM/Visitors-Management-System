import axios from "axios"
import React from "react"
import Select from 'react-select';
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Form, Button, Row, Col, Table } from "react-bootstrap"
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';

function UserRole({ setTitle }) {

    useEffect(() => {
        setTitle("Users & Roles");
    }, []);

    const navigate = useNavigate()

    const [role, setRoleValues] = useState([])
    const [user, setUserValues] = useState([])
    const [DisplayValues, setDisplayValues] = useState();
    const [RolewithoutfilValues, setRolewithoutfilValues] = useState();
    const [UserwithoutfilValues, setUserwithoutfilValues] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [UserRolwithoutfilValues, setUserRolwithoutfilValues] = useState([]);
    const [UserID, setUserID] = useState([])
    const [savebuttondisable, setSaveButtonDisable] = useState([]);
    const [OrgIsDisabled, setOrgIsDisabled] = useState()

    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedBU, setSelectedBU] = useState(null);
    const [selectedOU, setSelectedOU] = useState(null);



    const [values, setUserRoleValues] = useState({
        Role_ID: null,
        User_ID: "",
        UserRole_Status: true,
        UserRole_StatusCheck: "",
        created_by: ReactSession.get("username"),
    })


    useEffect(() => {
        setOrgIsDisabled(true)

        const username = ReactSession.get("username");
        setDisplayValues.DisplayValues = username;

        setUserRoleValues({ ...values, created_by: setDisplayValues.DisplayValues });
        console.log(setDisplayValues.DisplayValues)

        axios.get(`${SERVER_PORT}/userroleroles`)
            .then(res => (setRoleValues(res.data), setRolewithoutfilValues(res.data), console.log(res.data)))
            .catch(err => console.log(err));

    }, [])





    function changeRoleIdFilters(selectedOption) {
        setUserRoleValues({ ...values, Role_ID: selectedOption.value });
        setUserRoleValues.Role_ID = selectedOption.value;
        setSelectedRole(selectedOption)
        values.Role_ID = selectedOption.value;

        axios.get(`${SERVER_PORT}/userroleuser`)
            .then(res => {
                setUserValues(res.data);
                setUserwithoutfilValues(res.data);
            })
            .catch(err => console.log(err));

        axios.get(`${SERVER_PORT}/useravail/${setUserRoleValues.Role_ID}`)
            .then(res => {
                if (res.data.Status === 'NotAvailable') {

                    getCheck();

                } else if (res.data.Status === 'Available') {
                    axios.post(`${SERVER_PORT}/finduserid/${setUserRoleValues.Role_ID}`, values)
                        .then(res => {
                            setUserID.UserID = (res.data[0].User_ID);
                            getCheck();
                        });
                }
            })
            .catch(err => console.log(err));

        setSaveButtonDisable(false)

    };


    function getCheck() {
        axios.get(`${SERVER_PORT}/userroledefault/${setUserRoleValues.Role_ID}`)
            .then(res => {
                const roleUsers = res.data.map(userRole => ({
                    userId: userRole.User_ID,
                    selected: userRole.UserRole_StatusCheck ? "Active" : "InActive"
                }));

                if (res.data.length === 0) {
                    roleUsers.forEach(user => {
                        user.selected = "InActive";
                    });
                }
                setSelectedUsers(roleUsers);
            })
            .catch(err => console.log(err));
    };



    const handleCheckboxChange = (event, userId, value) => {
        const isChecked = event.target.checked;
        const updatedUsers = [...selectedUsers];
        const userIndex = updatedUsers.findIndex(user => user.userId === userId);

        if (isChecked) {
            if (userIndex === -1) {
                updatedUsers.push({ userId, selected: "Active" });
            } else {
                updatedUsers[userIndex] = { ...updatedUsers[userIndex], selected: "Active" };
            }
        } else {
            if (userIndex !== -1) {
                updatedUsers[userIndex] = { ...updatedUsers[userIndex], selected: "InActive" };
            }
        }

        setSelectedUsers(updatedUsers);
        setSaveButtonDisable(false)
    };



    function handleClear() {

        setOrgIsDisabled(true)
        setSelectedRole(null);
        setSelectedBU(null);
        setSelectedOU(null);
        setSelectedUsers([])
        setUserRoleValues([...UserRolwithoutfilValues]);

    };





    const handleSubmit = (e) => {
        e.preventDefault();

        if (values.Role_ID === "select") {
            alert("Please select the role name")
        }
        else {
            const insertPromises = selectedUsers.map(user => {
                const { userId, selected } = user;
                const userRoleStatusCheck = selected === "Active";

                return axios.post(`${SERVER_PORT}/userroleadd/${userId}/${userRoleStatusCheck}`, values)
                    .then(res => {
                        console.log(res.data);
                    })
                    .catch(err => console.log(err));
            });

            setSaveButtonDisable(true)
            Promise.all(insertPromises).then(() => {
                alert('Saved Successfully');
                navigate('/userrole');
            });
        }
    };



    return (

        <div className="employee-container">
            <div className="x_panel" style={{
                minWidth: 400,
                maxWidth: 700,
                width: '100%',
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.9)',
                padding: '24px 14px',
                margin: '30px auto 0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Form onSubmit={handleSubmit}>
                    <Row className="ml-1">
                        <Col md={7}>
                            <Form.Group controlId="Roles_ID">
                                <Form.Label className="label-style">
                                    Role<span className="star"></span>
                                </Form.Label>
                                <Select
                                    options={role.map(rel => ({
                                        value: rel.Roles_ID,
                                        label: `${rel.Roles_RoleName}`,
                                    }))}
                                    isSearchable
                                    onChange={changeRoleIdFilters}
                                    value={selectedRole}
                                    placeholder="Select Roles"
                                    noOptionsMessage={() => 'No Roles found'}
                                    required
                                    title="Please select the Roles"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="mt-4 mb-4">
                        <table>
                            <thead>
                                <tr>
                                    <th>Users Login ID</th>
                                    <th>Role Mapping</th>
                                </tr>
                            </thead>
                            <tbody>
                                {user.map(user => {
                                    const selectedUser = selectedUsers.find(u => u.userId === user.Users_ID);
                                    return (
                                        <tr key={user.Users_ID}>
                                            <td>{user.Users_LoginID}</td>
                                            <td>
                                                <Form.Group controlId={`User_LoginIDYes-${user.Users_ID}`} className="mb-0">
                                                    <div className="custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            id={`Active-${user.Users_ID}`}
                                                            className="custom-checkbox-input"
                                                            name={`user-${user.Users_ID}`}
                                                            checked={selectedUser?.selected === "Active"}
                                                            onChange={(e) => handleCheckboxChange(e, user.Users_ID, "Active")}
                                                        />
                                                        <label htmlFor={`Active-${user.Users_ID}`} className="mb-0"></label>
                                                    </div>
                                                </Form.Group>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="d-flex align-items-center" style={{ gap: '12px', marginTop: '16px' }}>
                        <Button variant="success" type="submit" disabled={!!savebuttondisable} size="md" style={{ background: 'linear-gradient(45deg, #1af107a7, #44a706)', minWidth: 90, fontWeight: 500 }}>
                            Save
                        </Button>
                        <Link to="/userrole">
                            <Button variant="danger" type="button" onClick={handleClear} style={{ background: 'linear-gradient(45deg, #f10707ff, #c90808ff)', marginLeft: "10px", minWidth: 90, fontWeight: 500 }}>
                                Clear
                            </Button>
                        </Link>
                    </div>
                </Form>
            </div>
        </div>

    )
}

export default UserRole;




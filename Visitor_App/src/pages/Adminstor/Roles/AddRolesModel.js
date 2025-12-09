import axios from "axios"
import React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Form, Button, Row, Col } from "react-bootstrap"
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';

function AddRolesModel({ setTitle }) {

    useEffect(() => {
        setTitle("Add Roles");
    }, []);

    const navigate = useNavigate()
    const [OrgIsDisabled, setOrgIsDisabled] = useState()
    const [DisplayValues, setDisplayValues] = useState();

    const [values, setRoleValues] = useState({
        Roles_Code: "",
        Roles_RoleName: "",
        Businessunit_ID: null,
        Organisation_ID: null,
        Roles_Status: true,
        Roles_Created_BY: ReactSession.get("username"),


    })


    useEffect(() => {
        setOrgIsDisabled(true)
        const username = ReactSession.get("username");
        setDisplayValues.DisplayValues = username;

        setRoleValues({ ...values, Roles_Created_BY: setDisplayValues.DisplayValues });
        console.log(setDisplayValues.DisplayValues)
    }, [])




    



    function desconchange(e) {

        const inputValue = e.target.value;
        const trimmedValue = inputValue.trim(); // Remove leading/trailing spaces
        const cleanedValue = trimmedValue.replace(/\s+/g, ' ');  // Replace multiple spaces with a single space


        setRoleValues.Roles_RoleName = cleanedValue
        console.log(cleanedValue)
        var matches = (setRoleValues.Roles_RoleName).match(/\s/g);
        console.log(matches)

        if (setRoleValues.Roles_RoleName.length === 0) {
            setRoleValues.Roles_Code = ''
            setRoleValues({
                ...values, Roles_RoleName: e.target.value,
                Roles_Code: setRoleValues.Roles_Code
            })
        }

        if (matches === null) {

            setRoleValues.Roles_Code = ((setRoleValues.Roles_RoleName).split(" ")[0].slice(0, 3)).toUpperCase()

        } else if (matches.length >= 2) {

            setRoleValues.Roles_Code = ((setRoleValues.Roles_RoleName).split(" ")[0].slice(0, 1) + (setRoleValues.Roles_RoleName).split(" ")[1].slice(0, 1) + (setRoleValues.Roles_RoleName).split(" ")[2].slice(0, 1)).toUpperCase()

        } else if (matches.length === 1) {

            setRoleValues.Roles_Code = ((setRoleValues.Roles_RoleName).split(" ")[0].slice(0, 1) + (setRoleValues.Roles_RoleName).split(" ")[1].slice(0, 2)).toUpperCase()

        }


        axios.get(`${SERVER_PORT}/rolecodecheck/${setRoleValues.Roles_Code}`)
            .then(res => {
                console.log(res)
                if (res.data.Status === 'Available') {
                    axios.get(`${SERVER_PORT}/rolecodemaxnum/${setRoleValues.Roles_Code}`)
                        .then(res => {
                            console.log(res.data[0].codemaxnum)
                            let nextnum = parseInt(res.data[0].codemaxnum) + 1
                            console.log(nextnum)
                            if ((nextnum.toString()).length === 1) {
                                nextnum = '0' + nextnum.toString()
                                setRoleValues.Roles_Code = setRoleValues.Roles_Code + (isNaN(nextnum) ? '00' : nextnum)
                                setRoleValues({
                                    ...values, Roles_RoleName: e.target.value,
                                    Roles_Code: setRoleValues.Roles_Code
                                })
                                return (console.log(values.Roles_Code))
                            } else {
                                setRoleValues.Roles_Code = setRoleValues.Roles_Code + (isNaN(nextnum) ? '00' : nextnum)
                                setRoleValues({
                                    ...values, Roles_RoleName: setRoleValues.Roles_RoleName,
                                    Roles_Code: setRoleValues.Roles_Code
                                })
                                return (console.log(values.Roles_Code))
                            }
                        })

                } else if (res.data.Status === 'NotAvailable') {

                    setRoleValues({
                        ...values, Roles_RoleName: cleanedValue,
                        Roles_Code: (cleanedValue ? setRoleValues.Roles_Code + '00' : ' ')
                    })
                }
            })
            .catch(err => console.log(err))
    }


    const handleSubmit = (e) => {
        e.preventDefault();


        axios.post(`${SERVER_PORT}/rolesadd`, values)
            .then(res => {
                if (res.data.message === 'Code already exists') {
                    alert('Code already exists');
                } else {
                    if (res.data.message === 'Name already exists') {
                        alert('Name already exists');
                    } else {
                        alert('Added Successfully')
                        // console.log(res)
                        navigate('/roles')
                    }
                }
            }).catch(err => console.log(err));

    }

    return (
        <div className="employee-container">
            <div
                className="x_panel"
                style={{
                    minWidth: 400,
                    maxWidth: 700,
                    width: '100%',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.97)',
                    padding: '32px 24px',
                    margin: '40px auto 0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <Row className="mb-2">
                        <Col md={5}>
                            <Form.Group controlId="Roles_Code">
                                <Form.Label className="label-style">Role Code <span className="star"></span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="Roles_Code"
                                    required
                                    style={{ textTransform: "uppercase" }}
                                    defaultValue={values.Roles_Code.slice(0, 5)}
                                    title='please enter the code'
                                    disabled
                                />
                            </Form.Group>
                        </Col>
                        <Col md={7}>
                            <Form.Group controlId="Roles_RoleName" onKeyUpCapture={desconchange}>
                                <Form.Label className="label-style">Role Name <span className="star"></span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="Roles_RoleName"
                                    required
                                    title='please enter the Roles Name'
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="d-flex align-items-center" style={{ gap: '12px', marginTop: '16px' }}>
                        <Button variant="success" type="submit" size="md">
                            Save
                        </Button>
                        <Link to="/roles">
                            <Button variant="danger" type="button" size="md">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </Form>
            </div>
        </div>
    )
}

export default AddRolesModel;




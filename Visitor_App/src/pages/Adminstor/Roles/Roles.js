import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Container, Row, Col, Button, Tooltip, OverlayTrigger, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUserPlus, FaEdit, FaTrashAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { SERVER_PORT } from '../../../constant';
import '../../Common.css';
import { motion } from 'framer-motion';

function Roles({ setTitle }) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState([]);
    const [error, setError] = useState('Child Record Present - Cannot be Deleted');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [sortDirection, setSortDirection] = useState({
        Roles_Code: 'DOWN',
        Roles_RoleName: 'DOWN',
        Roles_Status_Converted: 'DOWN',
    });

    useEffect(() => {
        setTitle("Roles");
    }, [setTitle]);

    useEffect(() => {
        axios.get(`${SERVER_PORT}/rolesload`)
            .then(res => {
                const activeRecords = res.data.filter(record => record.Roles_Status_Converted === 'Active');
                setData(activeRecords);
            })
            .catch(err => console.log(err));
    }, []);

    const deleteClick = (id) => {
        if (window.confirm('Are you sure you want to Delete?')) {
            axios.delete(`${SERVER_PORT}/rolesdlt/` + id)
                .then(res => {
                    if (res.data.Status === 'Success') {
                        alert("Deleted Successfully");
                        axios.get(`${SERVER_PORT}/rolesload`)
                            .then(res => {
                                const activeRecords = res.data.filter(record => record.Roles_Status_Converted === 'Active');
                                setData(activeRecords);
                            })
                            .catch(err => console.log(err));
                    } else {
                        setError(res.data.Error);
                        alert(res.data.Error);
                    }
                })
                .catch(err => console.log(err));
        }
    };

    const sortData = (prop) => {
        const direction = sortDirection[prop] === 'UP' ? 'DOWN' : 'UP';
        const sortedData = [...data].sort((a, b) => {
            if (direction === 'UP') {
                return (a[prop] > b[prop]) ? 1 : -1;
            } else {
                return (a[prop] < b[prop]) ? 1 : -1;
            }
        });
        setData(sortedData);
        setSortDirection({ ...sortDirection, [prop]: direction });
    };

    const getStatusBadge = (status) => {
        const isInactive = status === 'Inactive';
        return (
            <span
                className={`badge ${isInactive ? 'badge-danger' : 'badge-success'}`}
                style={{
                    backgroundColor: isInactive ? '#f8d7da' : '#d4edda',
                    color: isInactive ? '#721c24' : '#155724',
                    padding: '5px 10px',
                    borderRadius: '12px',
                    fontWeight: '500',
                }}
            >
                {status}
            </span>
        );
    };

    const filteredData = data.filter(role =>
        (role.Roles_Code?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (role.Roles_RoleName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (role.Roles_Status_Converted?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <Container fluid className="min-vh-100 mt-3">
            <Row className="mb-2 align-items-center">
                <Col md={6}>
                    <div className="position-relative">
                        <FaSearch
                            className="position-absolute top-50 translate-middle-y text-muted"
                            style={{ left: '15px' }}
                        />
                        <Form.Control
                            type="text"
                            placeholder="Search by role code, name, or status..."
                            className="rounded-pill shadow-sm ps-5 border-0"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </Col>
                <Col md={6} className="d-flex justify-content-end mt-3 mt-md-0">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            onClick={() => navigate('/addroles')}
                            className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill border-0 shadow-sm"
                            style={{ background: 'linear-gradient(45deg, #1bf107, #44a706)', fontWeight: 'bold' }}
                        >
                            <FaUserPlus size={18} /> Add
                        </Button>
                    </motion.div>
                </Col>
            </Row>

            <Row>
                <Col xs={12}>
                    <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
                        <table>
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th onClick={() => sortData('Roles_Code')}>
                                        Role Code <span className="ms-1">{sortDirection.Roles_Code === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th onClick={() => sortData('Roles_RoleName')}>
                                        Role Name <span className="ms-1">{sortDirection.Roles_RoleName === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th onClick={() => sortData('Roles_Status_Converted')}>
                                        Status <span className="ms-1">{sortDirection.Roles_Status_Converted === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th className="text-end">Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((rol, index) => (
                                        <motion.tr
                                            key={rol.Roles_ID}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <td className="py-2">{indexOfFirstItem + index + 1}</td>
                                            <td className="py-2">{rol.Roles_Code}</td>
                                            <td className="py-2">{rol.Roles_RoleName}</td>
                                            <td className="border-0 py-2 px-3">
                                                <motion.span
                                                    whileHover={{ scale: 1.05 }}
                                                    className={`badge px-2 py-1 rounded-pill fw-normal`}
                                                    style={{
                                                        background: rol.Roles_Status_Converted === 'Active'
                                                            ? 'linear-gradient(90deg, #8ed334ff 0%, #35b910ff 100%)'
                                                            : rol.Roles_Status_Converted === 'Inactive'
                                                                ? 'rgba(206, 20, 20, 1)'
                                                                : 'linear-gradient(100deg, #4142a2ff 0%, #06b6d4 100%)',
                                                        color: '#fff',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                                                    }}
                                                >
                                                    {rol.Roles_Status_Converted || 'N/A'}
                                                </motion.span>
                                            </td>
                                            <td className="py-2 text-center">
                                                <div className="d-flex justify-content-end">
                                                    <Button variant="outline-success" size="sm" onClick={() => navigate(`/editroles/${rol.Roles_ID}`)}>
                                                        <FaEdit />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => { deleteClick(rol.Roles_ID) }}>
                                                        <FaTrashAlt />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-2 text-muted">No roles found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Col>
            </Row>

            <motion.div
                className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <span className="text-muted small">
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                </span>
                <div className="d-flex gap-2 mt-2 mt-md-0">
                    <Button
                        variant="light"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="d-flex align-items-center"
                    >
                        <FaArrowLeft className="me-1" /> Previous
                    </Button>
                    <Button
                        variant="light"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="d-flex align-items-center"
                    >
                        Next <FaArrowRight className="ms-1" />
                    </Button>
                </div>
            </motion.div>
        </Container>
    );
};

export default Roles;
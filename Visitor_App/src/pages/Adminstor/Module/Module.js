import React, { useEffect, useState } from "react";
import axios from 'axios';
import { FaSearch, FaUserPlus, FaEdit, FaTrashAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Form, Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { SERVER_PORT } from '../../../constant';
import '../../Common.css';
import { motion } from 'framer-motion';

function Module({ setTitle }) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Updated to 5 as per your request
    const [sortDirection, setSortDirection] = useState({
        Module_Code: 'DOWN',
        Module_Name: 'DOWN',
        Module_Valid_Converted: 'DOWN',
    });

    useEffect(() => {
        setTitle("Module");
    }, [setTitle]);

    useEffect(() => {
        axios.get(`${SERVER_PORT}/moduleload`)
            .then(res => {
                const activeRecords = res.data.filter(record => record.Module_Valid_Converted === 'Active');
                setData(activeRecords);
            })
            .catch(err => console.log(err));
    }, []);

    const deleteClick = (id) => {
        if (window.confirm('Are you sure you want to Delete?')) {
            axios.delete(`${SERVER_PORT}/moduledlt/` + id)
                .then(res => {
                    if (res.data.Status === 'Success') {
                        alert("Deleted Successfully");
                        // Refetch and set data again
                        axios.get(`${SERVER_PORT}/moduleload`)
                            .then(res => {
                                const activeRecords = res.data.filter(record => record.Module_Valid_Converted === 'Active');
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


    const filteredData = data.filter(mod =>
        (mod.Module_Application?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (mod.Module_Code?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (mod.Module_Name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (mod.Module_Valid_Converted?.toLowerCase().includes(searchTerm.toLowerCase()))
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
                            placeholder="Search by module code, name, application..."
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
                            onClick={() => navigate('/addmodule')}
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
                            <thead >
                                <tr>
                                    <th >S.No</th>
                                    <th >Application</th>
                                    <th onClick={() => sortData('Module_Code')}>
                                        Module Code{' '}
                                        <span className="ms-1">{sortDirection.Module_Code === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th onClick={() => sortData('Module_Name')}>
                                        Module Name{' '}
                                        <span className="ms-1">{sortDirection.Module_Name === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th onClick={() => sortData('Module_Valid_Converted')}>
                                        Status{' '}
                                        <span className="ms-1">{sortDirection.Module_Valid_Converted === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((mod, index) => (
                                        <motion.tr
                                            key={mod.Module_ID}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <td className="py-2">{indexOfFirstItem + index + 1}</td>
                                            <td className="py-2">{mod.Module_Application}</td>
                                            <td className="py-2">{mod.Module_Code}</td>
                                            <td className="py-2">{mod.Module_Name}</td>
                                            <td className="border-0 py-2 px-3">
                                                <motion.span
                                                    whileHover={{ scale: 1.05 }}
                                                    className={`badge px-2 py-1 rounded-pill fw-normal`}
                                                    style={{
                                                        background: mod.Module_Valid_Converted === 'Active'
                                                            ? 'linear-gradient(90deg, #8ed334ff 0%, #35b910ff 100%)'
                                                            : mod.Module_Valid_Converted === 'Inactive'
                                                                ? 'rgba(206, 20, 20, 1)'
                                                                : 'linear-gradient(100deg, #4142a2ff 0%, #06b6d4 100%)',
                                                        color: '#fff',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                                                    }}
                                                >
                                                    {mod.Module_Valid_Converted || 'N/A'}
                                                </motion.span>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-end">
                                                    <Button variant="outline-success" size="sm" onClick={() => navigate(`/editmodule/${mod.Module_ID}`)}>
                                                        <FaEdit />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => { deleteClick(mod.Module_ID) }}>
                                                        <FaTrashAlt />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-2 text-muted">No modules found.</td>
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

export default Module;
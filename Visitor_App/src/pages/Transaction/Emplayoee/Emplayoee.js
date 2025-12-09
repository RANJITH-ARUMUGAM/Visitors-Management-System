import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Spinner, Alert, Modal, Table, Card } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight, FaSearch, FaUserTie, FaBuilding, FaCheckCircle, FaExclamationCircle, FaUserPlus, FaEye, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import "../../Adminstor/AdminUsers/UserList.css";
import { SERVER_PORT } from '../../../constant';

const Employees = ({ setTitle }) => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);

    useEffect(() => {
        setTitle && setTitle('Employee List');
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${SERVER_PORT}/get_all_employees`);
            if (res.status === 200) {
                setEmployees(res.data);
            } else {
                setError('Failed to fetch employees.');
            }
        } catch (err) {
            console.error('Error fetching employees:', err);
            setError('An error occurred while fetching employees.');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const filtered = employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    // Summary calculations
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.gms_status === 'Active').length;
    const inactiveEmployees = totalEmployees - activeEmployees;

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    const tableRowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            x: 20,
            transition: { duration: 0.3 }
        }
    };




    return (
        <Container fluid className="bg-light min-vh-100 mt-3">
            {/* Header and Add Button */}
            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-3">
                <div>
                    <h2 className="text-lg p-2 font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Employee Management</h2>
                    <p className="text-sm fs-6 mb-3 mb-lg-0">Manage and monitor your team effectively</p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="xs" onClick={() => navigate('/employeeadd')} className="d-flex align-items-center gap-1 px-3 py-1 border-0 shadow-lg" style={{ background: 'linear-gradient(45deg, #1bf107ff, #44a706ff)', borderRadius: '15px', fontWeight: '600' }}>
                        <FaUserPlus size={20} /> Add
                    </Button>
                </motion.div>
            </motion.div>

            {/* Summary Cards */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="row g-4 mb-5"
            >
                {[
                    {
                        title: 'Total Employees',
                        value: totalEmployees,
                        icon: FaUserTie,
                        color: '#0508c4ff',
                        bg: 'linear-gradient(135deg, #0a0c68ff, #d7cbf4ff)'
                    },
                    {
                        title: 'Active Employees',
                        value: activeEmployees,
                        icon: FaCheckCircle,
                        color: '#03885cff',
                        bg: 'linear-gradient(135deg, #09593eff, #08ffb1ff)'
                    },
                    {
                        title: 'Inactive Employees',
                        value: inactiveEmployees,
                        icon: FaExclamationCircle,
                        color: '#af0606ff',
                        bg: 'linear-gradient(135deg, #960505ff, #ecc2c2ff)'
                    }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        variants={cardVariants}
                        className="col-lg-4 col-md-6"
                        onHoverStart={() => setHoveredCard(index)}
                        onHoverEnd={() => setHoveredCard(null)}
                    >
                        <motion.div
                            whileHover={{
                                y: -10,
                                rotateY: 5,
                                scale: 1.02
                            }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="card border-0 shadow-lg h-100 overflow-hidden position-relative"
                            style={{
                                borderRadius: '20px',
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div
                                className="position-absolute top-0 start-0 w-100 h-100"
                                style={{
                                    background: stat.bg,
                                    opacity: hoveredCard === index ? 0.1 : 0,
                                    transition: 'opacity 0.3s ease'
                                }}
                            />
                            <div className="card-body p-4 position-relative">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div
                                        className="p-3 rounded-circle d-flex align-items-center justify-content-center"
                                        style={{
                                            background: stat.bg,
                                            color: 'white',
                                            width: '70px',
                                            height: '70px'
                                        }}
                                    >
                                        <stat.icon size={43} />
                                    </div>
                                    <div className="text-end">
                                        <motion.div
                                            className="display-4 fw-bold"
                                            style={{ color: stat.color }}
                                            animate={{
                                                scale: hoveredCard === index ? 1.1 : 1
                                            }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {stat.value}
                                        </motion.div>
                                    </div>
                                </div>
                                <h5 className="card-title text-muted mb-0 fw-semibold">
                                    {stat.title}
                                </h5>
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Table Controls */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">
                <div className="d-flex gap-2 w-100 w-md-auto">
                    <Form.Select
                        className="w-auto"
                        value={perPage}
                        onChange={(e) => {
                            setPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        {[10, 25, 50, 100].map((n) => (
                            <option key={n} value={n}>{n} entries</option>
                        ))}
                    </Form.Select>
                </div>
                <div className="col-md-6">
                    <div className="position-relative">
                        <FaSearch
                            className="position-absolute top-50 translate-middle-y text-muted"
                            style={{ left: '15px', zIndex: 10 }}
                        />
                        <Form.Control
                            type="text"
                            placeholder="Search employees by name, email, or phone..."
                            className="border-0 shadow-sm ps-5"
                            style={{
                                borderRadius: '12px',
                                backgroundColor: '#f8fafc',
                                fontSize: '15px'
                            }}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded shadow-sm">
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" />
                    </div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : (
                    <>
                        <table responsive hover className="mb-4">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Joining Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <motion.tbody initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.10 } } }}>
                                {paginated.length > 0 ? (
                                    paginated.map((emp, index) => (
                                        <motion.tr
                                            key={emp.gms_employee_id || emp.id}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            transition={{ delay: index * 0.05 }}
                                            className="border-0"
                                            style={{
                                                borderBottom: '1px solid #f1f5f9',
                                                transition: 'all 0.3s ease'
                                            }}
                                            whileHover={{
                                                backgroundColor: '#f8fafc',
                                                scale: 1.01,
                                                transition: { duration: 0.2 }
                                            }}
                                        >
                                            <td className="border-0 py-1 px-1">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div
                                                        className="rounded-circle overflow-hidden"
                                                        style={{ width: '50px', height: '50px' }}
                                                    >
                                                        <img
                                                            src={
                                                                emp.gms_employee_avatar ||
                                                                (() => {
                                                                    // Array of color backgrounds
                                                                    const bgColors = [
                                                                        '6366f1', // blue
                                                                        '06b6d4', // cyan
                                                                        'f59e42', // orange
                                                                        '10b981', // green
                                                                        'f43f5e', // pink
                                                                        'fbbf24', // yellow
                                                                        'a21caf', // purple
                                                                        'e11d48'  // red
                                                                    ];
                                                                    // Pick color based on employee id or name
                                                                    let idx = 0;
                                                                    if (emp.id) {
                                                                        idx = emp.id % bgColors.length;
                                                                    } else if (emp.name) {
                                                                        idx = emp.name.charCodeAt(0) % bgColors.length;
                                                                    }
                                                                    return `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=${bgColors[idx]}&color=fff`;
                                                                })()
                                                            }
                                                            alt={emp.name}
                                                            className="w-100 h-100 object-fit-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold text-dark mb-1">{emp.name}</div>
                                                        <div className="text-muted small">{emp.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="border-0 py-4 px-4">
                                                <div className="text-dark">{emp.phone}</div>
                                            </td>
                                            <td className="border-0 py-4 px-4">
                                                <div className="text-dark">
                                                    {emp.gms_joining_date ? new Date(emp.gms_joining_date).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="border-0 py-4 px-4">
                                                <motion.span
                                                    whileHover={{ scale: 1.05 }}
                                                    className={`badge px-3 py-2 rounded-pill fw-normal`}
                                                    style={{
                                                        background: emp.gms_status === 'Active'
                                                            ? 'linear-gradient(90deg, #8ed334ff 0%, #35b910ff 100%)'
                                                            : emp.gms_status === 'Inactive'
                                                                ? 'rgba(206, 20, 20, 1)'
                                                                : 'linear-gradient(100deg, #4142a2ff 0%, #06b6d4 100%)',
                                                        color: '#fff',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                                                    }}
                                                >
                                                    {emp.gms_status || 'N/A'}
                                                </motion.span>
                                            </td>
                                            <td className="border-0 py-2 px-2 text-end">
                                                <div className="d-flex justify-content-end ">
                                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                        <Button
                                                            variant=""
                                                            size="sm"
                                                            onClick={() => emp.id && navigate(`/viewemplayoee/${emp.id}`)}
                                                            className="p-2 border-0 rounded-circle"
                                                            style={{
                                                                color: '#0369a1',
                                                                width: '36px',
                                                                height: '36px'
                                                            }}
                                                        >
                                                            <FaEye size={19} />
                                                        </Button>
                                                    </motion.div>
                                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                        <Button
                                                            variant=""
                                                            size="sm"
                                                            onClick={() => navigate('/employeeedit', { state: { id: emp.id } })}
                                                            className="p-2 border-0 rounded-circle"
                                                            style={{
                                                                color: '#166534',
                                                                width: '36px',
                                                                height: '36px'
                                                            }}
                                                        >
                                                            <FaEdit size={19} />
                                                        </Button>
                                                    </motion.div>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-4">No employees found.</td>
                                    </tr>
                                )}
                            </motion.tbody>
                        </table>

                        {/* Pagination */}
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3">
                            <span className="text-muted small">
                                Showing {Math.min((currentPage - 1) * perPage + 1, filtered.length)} to{' '}
                                {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
                            </span>
                            <div className="d-flex gap-2 mt-2 mt-md-0">
                                <Button variant="light" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="d-flex align-items-center">
                                    <FaArrowLeft className="me-1" /> Previous
                                </Button>
                                <Button variant="light" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="d-flex align-items-center">
                                    Next <FaArrowRight className="ms-1" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Container>
    );
};
export default Employees;

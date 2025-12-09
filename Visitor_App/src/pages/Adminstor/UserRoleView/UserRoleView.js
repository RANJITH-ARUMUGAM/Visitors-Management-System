// import React, { useEffect, useState } from "react";
// import axios from 'axios'
// import { Container, Row, Col, Pagination } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
// import { SERVER_PORT } from '../../../constant';
// import { ReactSession } from 'react-client-session';

// function UserRoleView({ setTitle }) {


//     useEffect(() => {
//         setTitle("User Role View");
//     }, []);

//     const [data, setData] = useState([]);
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 100;

//     useEffect(() => {
//         axios.get(`${SERVER_PORT}/UserRoleView`)
//             .then(res => setData(res.data))
//             .catch(err => console.log(err));
//     }, []);

//     // Sorting functions (if used in UI)
//     function sortResult3(prop, asc) {
//         let direction = asc;
//         let sortedData = [...data].sort((a, b) => {
//             if (direction) {
//                 return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
//             } else {
//                 return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
//             }
//         });
//         setData(sortedData);
//     }
//     function sortResult4(prop, asc) {
//         let direction = asc;
//         let sortedData = [...data].sort((a, b) => {
//             if (direction) {
//                 return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
//             } else {
//                 return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
//             }
//         });
//         setData(sortedData);
//     }
//     function sortResult5(prop, asc) {
//         let direction = asc;
//         let sortedData = [...data].sort((a, b) => {
//             if (direction) {
//                 return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
//             } else {
//                 return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
//             }
//         });
//         setData(sortedData);
//     }

//     // Pagination
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
//     const totalPages = Math.ceil(data.length / itemsPerPage);

//     const handlePageChange = (pageNumber) => {
//         if (pageNumber >= 1 && pageNumber <= totalPages) {
//             setCurrentPage(pageNumber);
//         }
//     };

//     const renderPaginationItems = () => {
//         let paginationItems = [];
//         if (totalPages <= 3) {
//             for (let page = 1; page <= totalPages; page++) {
//                 paginationItems.push(
//                     <Pagination.Item
//                         key={page}
//                         active={page === currentPage}
//                         onClick={() => handlePageChange(page)}
//                     >
//                         {page}
//                     </Pagination.Item>
//                 );
//             }
//         } else {
//             paginationItems.push(
//                 <Pagination.Item
//                     key={1}
//                     active={currentPage === 1}
//                     onClick={() => handlePageChange(1)}
//                 >
//                     1
//                 </Pagination.Item>
//             );
//             if (currentPage > 3) {
//                 paginationItems.push(<Pagination.Ellipsis key="start-ellipsis" />);
//             }
//             const startPage = Math.max(2, currentPage - 1);
//             const endPage = Math.min(totalPages - 1, currentPage + 1);
//             for (let page = startPage; page <= endPage; page++) {
//                 paginationItems.push(
//                     <Pagination.Item
//                         key={page}
//                         active={page === currentPage}
//                         onClick={() => handlePageChange(page)}
//                     >
//                         {page}
//                     </Pagination.Item>
//                 );
//             }
//             if (currentPage < totalPages - 2) {
//                 paginationItems.push(<Pagination.Ellipsis key="end-ellipsis" />);
//             }
//             paginationItems.push(
//                 <Pagination.Item
//                     key={totalPages}
//                     active={currentPage === totalPages}
//                     onClick={() => handlePageChange(totalPages)}
//                 >
//                     {totalPages}
//                 </Pagination.Item>
//             );
//         }
//         return paginationItems;
//     };

//     return (
//         <Container fluid className="employee-container">
//             <div className="page-header">
//                 <Row className="align-items-center">
//                     <Col md={6}>
//                         <h4 style={{ fontStyle: 'italic' }}> User Role View </h4>
//                     </Col>
//                 </Row>
//             </div>
//             <Row>
//                 <Col xs={12}>
//                     <div className="table-scroll">
//                         <table>
//                             <thead>
//                                 <tr>
//                                     <th>S.No</th>
//                                     <th>
//                                         <div className="header-cell d-flex">
//                                             <span className="clickable" onClick={() => sortResult3('Roles_RoleName', true)}>
//                                                 Role
//                                             </span>
//                                         </div>
//                                     </th>
//                                     <th style={{ width: '300px' }}>
//                                         <div className="header-cell d-flex">
//                                             <span className="clickable" onClick={() => sortResult4('Users_FirstName', true)}>
//                                                 First Name
//                                             </span>
//                                         </div>
//                                     </th>
//                                     <th style={{ width: '150px' }}>
//                                         <div className="header-cell d-flex">
//                                             <span className="clickable" onClick={() => sortResult5('Users_LoginID', true)}>
//                                                 Login Id
//                                             </span>
//                                         </div>
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {currentItems.map((hdr, index) => (
//                                     <tr key={hdr.UserRole_ID}>
//                                         <td style={{ width: '60px', textAlign: 'center' }}>{indexOfFirstItem + index + 1}</td>
//                                         <td style={{ width: '220px' }}>{hdr.Roles_RoleName}</td>
//                                         <td style={{ width: '300px' }}>{hdr.Users_FirstName}</td>
//                                         <td style={{ width: '150px' }}>{hdr.Users_LoginID}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                     {/* Pagination */}
//                     <div className="pagination-container">
//                         <Pagination className="pagination-sm d-flex align-items-center">
//                             <Pagination.Prev
//                                 onClick={() => handlePageChange(currentPage - 1)}
//                                 disabled={currentPage === 1}
//                             />
//                             {renderPaginationItems()}
//                             <Pagination.Next
//                                 onClick={() => handlePageChange(currentPage + 1)}
//                                 disabled={currentPage === totalPages}
//                             />
//                         </Pagination>
//                     </div>
//                 </Col>
//             </Row>
//         </Container>
//     );
// }
// export default UserRoleView;

import React, { useEffect, useState } from "react";
import axios from 'axios'
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaSearch } from 'react-icons/fa';
import { SERVER_PORT } from '../../../constant';
import '../../Common.css';
import { motion } from 'framer-motion';

function UserRoleView({ setTitle }) {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [sortDirection, setSortDirection] = useState({
        Roles_RoleName: 'DOWN',
        Users_FirstName: 'DOWN',
        Users_LoginID: 'DOWN',
    });

    useEffect(() => {
        setTitle("User Role View");
    }, [setTitle]);

    useEffect(() => {
        axios.get(`${SERVER_PORT}/UserRoleView`)
            .then(res => setData(res.data))
            .catch(err => console.log(err));
    }, []);

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

    const filteredData = data.filter(item =>
        (item.Roles_RoleName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.Users_FirstName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.Users_LoginID?.toLowerCase().includes(searchTerm.toLowerCase()))
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
                        <input
                            type="text"
                            placeholder="Search by role name, user name, or login ID..."
                            className="form-control rounded-pill shadow-sm ps-5 border-0"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </Col>
            </Row>

            <Row>
                <Col xs={12}>
                    <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
                        <table>
                            <thead>
                                <tr>
                                    <th className="py-2">S.No</th>
                                    <th className="py-2 cursor-pointer" onClick={() => sortData('Roles_RoleName')}>
                                        Role Name <span className="ms-1">{sortDirection.Roles_RoleName === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th className="py-2 cursor-pointer" onClick={() => sortData('Users_FirstName')}>
                                        User Name <span className="ms-1">{sortDirection.Users_FirstName === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th className="py-2 cursor-pointer" onClick={() => sortData('Users_LoginID')}>
                                        Login ID <span className="ms-1">{sortDirection.Users_LoginID === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((hdr, index) => (
                                        <motion.tr
                                            key={hdr.UserRole_ID}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <td className="py-2">{indexOfFirstItem + index + 1}</td>
                                            <td className="py-2">{hdr.Roles_RoleName}</td>
                                            <td className="py-2">{hdr.Users_FirstName}</td>
                                            <td className="py-2">{hdr.Users_LoginID}</td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-muted">No user roles found.</td>
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

export default UserRoleView;
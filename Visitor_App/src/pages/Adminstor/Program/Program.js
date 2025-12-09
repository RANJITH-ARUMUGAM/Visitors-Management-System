// import React, { useEffect, useState } from "react";
// import axios from 'axios'
// import { Container, Row, Col, Button, ButtonToolbar, Tooltip, OverlayTrigger, Pagination } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import { SERVER_PORT } from '../../../constant';
// import { ReactSession } from 'react-client-session';
// import '../../Common.css'



// function Program({ setTitle }) {

//     useEffect(() => {
//         setTitle("Program");
//     }, []);


//     const [data, setData] = useState([])
//     const [datawithoutfilter, setDatawithoutfil] = useState([])
//     const [error, setError] = useState('Child Record Present - Cannot be Deleted')
//     // Pagination
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 100;
//     // Filter Constant
//     const [filteredDistinctValSt, setfilteredDistinctValSt] = useState([]);
//     const [filteredValSt, setfilteredValSt] = useState([]);
//     const [SelectedItemsSt, setSelectedItemsSt] = useState('')
//     const [showModalSt, setShowModalSt] = useState(false);
//     const [FilteronClickLightSt, setFilteronClickLightSt] = useState(false);
//     const [valueSelectedSt, setvalueSelectedSt] = useState(false);
//     const [filteredDistinctVal3, setfilteredDistinctVal3] = useState([]);
//     const [filteredDistinctVal4, setfilteredDistinctVal4] = useState([]);
//     const [filteredVal3, setfilteredVal3] = useState([]);
//     const [filteredVal4, setfilteredVal4] = useState([]);
//     const [SelectedItems3, setSelectedItems3] = useState('')
//     const [SelectedItems4, setSelectedItems4] = useState('')
//     const [FilteronClickLight3, setFilteronClickLight3] = useState(false);
//     const [FilteronClickLight4, setFilteronClickLight4] = useState(false);
//     const [showModal3, setShowModal3] = useState(false);
//     const [showModal4, setShowModal4] = useState(false);
//     const [valueSelected1, setvalueSelected1] = useState(false);
//     const [valueSelected2, setvalueSelected2] = useState(false);
//     const [InitialData, setInitialData] = useState([]);
//     const [ActiveData, setActiveData] = useState([]);
//     const [InActiveData, setInActiveData] = useState([]);
//     const [FilterdDepData, setFilterdDepData] = useState([]);
//     var [sortasc, setSortasc] = useState({
//         sortdirection1: "",
//         sortdirection2: "",
//         sortdirection3: "",
//         sortdirection4: "",
//     })
//     useEffect(() => {
//         setSortasc.sortdirection1 = 'DOWN';
//         setSortasc.sortdirection2 = 'DOWN';
//         setSortasc.sortdirection3 = 'DOWN';
//         setSortasc.sortdirection4 = 'DOWN';
//         axios.get(`${SERVER_PORT}/programload`)
//             .then(res => {
//                 const activeRecords = res.data.filter(record => record.Program_Valid_Converted === 'Active');
//                 const InactiveRecords = res.data.filter(record => record.Program_Valid_Converted == 'Inactive');
//                 setData(activeRecords);
//                 setDatawithoutfil(res.data);
//                 setInitialData(res.data);
//                 setActiveData(activeRecords);
//                 setInActiveData(InactiveRecords)
//             })
//             .catch(err => console.log(err));
//     }, [])
//     const deleteClick = (id) => {
//         if (window.confirm('Are you sure you want to Delete? ')) {
//             axios.delete(`${SERVER_PORT}/programdlt/` + id)
//                 .then(res => {
//                     if (res.data.Status === 'Success') {
//                         alert("Deleted Successfully")
//                         //navigate('/program')
//                         axios.get(`${SERVER_PORT}/programload`)
//                             .then(res => {
//                                 const activeRecords = res.data.filter(record => record.Program_Valid_Converted === 'Active');
//                                 const InactiveRecords = res.data.filter(record => record.Program_Valid_Converted == 'Inactive');
//                                 setData(activeRecords);
//                                 setDatawithoutfil(res.data);
//                                 setInitialData(res.data);
//                                 setActiveData(activeRecords);
//                                 setInActiveData(InactiveRecords)
//                             })
//                             .catch(err => console.log(err));
//                     } else {
//                         setError(res.data.Error)
//                         alert(error && error)
//                     }
//                 })
//                 .catch(err => console.log(err))
//         }
//     }
//     //filter function// 
//     function sortResult1(prop, asc) {
//         if (setSortasc.sortdirection1 === 'DOWN') {
//             asc = true
//             setSortasc.sortdirection1 = 'UP'
//         } else {
//             asc = false
//             setSortasc.sortdirection1 = 'DOWN'
//         }
//         var sortedData = [...data].sort(function (a, b) {
//             if (asc) {
//                 return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
//             }
//             else {
//                 return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
//             }
//         });
//         setData(sortedData, []);
//     }
//     function sortResult2(prop, asc) {
//         if (setSortasc.sortdirection2 === 'DOWN') {
//             asc = true
//             setSortasc.sortdirection2 = 'UP'
//         } else {
//             asc = false
//             setSortasc.sortdirection2 = 'DOWN'
//         }
//         var sortedData = [...data].sort(function (a, b) {
//             if (asc) {
//                 return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
//             }
//             else {
//                 return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
//             }
//         });
//         setData(sortedData, []);
//     }
//     function sortResult3(prop, asc) {
//         if (setSortasc.sortdirection3 === 'DOWN') {
//             asc = true
//             setSortasc.sortdirection3 = 'UP'
//         } else {
//             asc = false
//             setSortasc.sortdirection3 = 'DOWN'
//         }
//         var sortedData = [...data].sort(function (a, b) {
//             if (asc) {
//                 return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
//             }
//             else {
//                 return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
//             }
//         });
//         setData(sortedData, []);
//     }
//     function sortResult4(prop, asc) {
//         if (setSortasc.sortdirection4 === 'DOWN') {
//             asc = true
//             setSortasc.sortdirection4 = 'UP'
//         } else {
//             asc = false
//             setSortasc.sortdirection4 = 'DOWN'
//         }
//         var sortedData = [...data].sort(function (a, b) {
//             if (asc) {
//                 return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
//             }
//             else {
//                 return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
//             }
//         });
//         setData(sortedData, []);
//     }
//     /* //////////////////////////////////////////////////////////////////////////////////////////////////// */
//     function changeValid(val) {
//         if (val === "Active") {
//             return <span style={{ backgroundColor: '#d4edda', color: '#155724', padding: '5px', borderRadius: '5px' }}>Active</span>
//         } else if (val === "Inactive") {
//             return <span style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '5px', borderRadius: '5px' }}>Inactive</span>;
//         } /* else {
//              return <span style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '5px', borderRadius: '5px' }}>Not Found</span>;
//         } */
//     }
//     // ------------------------status FILTER STARTS-----------------------/
//     const colDropdownfilterSt = (e) => {
//         e.stopPropagation();
//         if (!Array.isArray(InitialData) || InitialData.length === 0) {
//             setfilteredValSt([]);
//             setShowModalSt(true);
//             return;
//         }
//         const uniqueValues = Array.from(new Set(InitialData.map(item => item.Program_Valid_Converted)))
//             .map(value => ({ Program_Valid_Converted: value }));
//         const sortedValues = uniqueValues.sort((a, b) => {
//             const aIsSelected = SelectedItemsSt.includes(a.Program_Valid_Converted);
//             const bIsSelected = SelectedItemsSt.includes(b.Program_Valid_Converted);
//             if (aIsSelected && !bIsSelected) {
//                 return -1;
//             }
//             if (!aIsSelected && bIsSelected) {
//                 return 1;
//             }
//             return 0;
//         });
//         setfilteredValSt(sortedValues);
//         setfilteredDistinctValSt(uniqueValues);
//         setvalueSelectedSt(false)
//         setShowModalSt(true);
//     };
//     //--------------------------------Status ednds here----------------------------------------------
//     /* -----------------------------3-Program----STARTS---------------------- */
//     const colDropdownfilter3 = (e) => {
//         e.stopPropagation();
//         if (!Array.isArray(InitialData) || InitialData.length === 0) {
//             setfilteredVal3([]);
//             setShowModal3(true);
//             return;
//         }
//         var uniqueValues;
//         if (SelectedItemsSt == 'Inactive' && SelectedItems4.length > 0) {
//             uniqueValues = Array.from(new Set(FilterdDepData.map(item => item.Program_Nav_Name)))
//                 .map(value => ({ Program_Nav_Name: value }));
//         }
//         else if (SelectedItemsSt == 'Active' || SelectedItemsSt == '' && SelectedItems4.length === 0) {
//             uniqueValues = Array.from(new Set(ActiveData.map(item => item.Program_Nav_Name)))
//                 .map(value => ({ Program_Nav_Name: value }));
//         }
//         else if (SelectedItemsSt == 'Active' || SelectedItemsSt == '' && SelectedItems4.length > 0) {
//             uniqueValues = Array.from(new Set(FilterdDepData.map(item => item.Program_Nav_Name)))
//                 .map(value => ({ Program_Nav_Name: value }));
//         }
//         else {
//             uniqueValues = Array.from(new Set(InActiveData.map(item => item.Program_Nav_Name)))
//                 .map(value => ({ Program_Nav_Name: value }));
//         }
//         const sortedValues = uniqueValues.sort((a, b) => {
//             const aIsSelected = SelectedItems3.includes(a.Program_Nav_Name);
//             const bIsSelected = SelectedItems3.includes(b.Program_Nav_Name);
//             if (aIsSelected && !bIsSelected) {
//                 return -1;
//             }
//             if (!aIsSelected && bIsSelected) {
//                 return 1;
//             }
//             return 0;
//         });
//         setfilteredVal3(sortedValues);
//         setfilteredDistinctVal3(sortedValues);
//         setvalueSelected1(false)
//         setvalueSelected2(true)
//         setShowModal3(true);
//     };
//     /* -----------------------------3-CITY-ENDS------------------------- */
//     /* -----------------------------4-STATE----STARTS---------------------- */
//     const colDropdownfilter4 = (e) => {
//         e.stopPropagation();
//         if (!Array.isArray(InitialData) || InitialData.length === 0) {
//             setShowModal4(true);
//             return;
//         }
//         let uniqueValues;
//         if (SelectedItemsSt == 'Inactive' && SelectedItems3.length > 0) {
//             uniqueValues = Array.from(new Set(FilterdDepData.map(item => item.Module_Name)))
//                 .map(value => ({ Module_Name: value }));
//         }
//         else if (SelectedItemsSt == 'Active' || SelectedItemsSt == '' && SelectedItems3.length === 0) {
//             uniqueValues = Array.from(new Set(ActiveData.map(item => item.Module_Name)))
//                 .map(value => ({ Module_Name: value }));
//         }
//         else if (SelectedItemsSt == 'Active' || SelectedItemsSt == '' && SelectedItems3.length > 0) {
//             uniqueValues = Array.from(new Set(FilterdDepData.map(item => item.Module_Name)))
//                 .map(value => ({ Module_Name: value }));
//         }
//         else {
//             uniqueValues = Array.from(new Set(InActiveData.map(item => item.Module_Name)))
//                 .map(value => ({ Module_Name: value }));
//         }
//         const sortedValues = uniqueValues.sort((a, b) => {
//             const aIsSelected = SelectedItems4.includes(a.Module_Name);
//             const bIsSelected = SelectedItems4.includes(b.Module_Name);
//             if (aIsSelected && !bIsSelected) {
//                 return -1;
//             }
//             if (!aIsSelected && bIsSelected) {
//                 return 1;
//             }
//             return 0;
//         });
//         setfilteredVal4(sortedValues);
//         setfilteredDistinctVal4(uniqueValues);
//         setvalueSelected2(false)
//         setShowModal4(true);
//     };
//     // Calculate the current items to be displayed on the current page
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
//     // Determine the total number of pages
//     const totalPages = Math.ceil(data.length / itemsPerPage);
//     // Handler for page change
//     const handlePageChange = (pageNumber) => {
//         if (pageNumber >= 1 && pageNumber <= totalPages) {
//             setCurrentPage(pageNumber);
//         }
//     };
//     const renderPaginationItems = () => {
//         let paginationItems = [];
//         if (totalPages <= 3) {
//             // Show all pages if there are 5 or less
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
//             // More than 5 pages, show first, last, and ellipsis
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
//             {/* Header: Breadcrumb and +Add button on one line */}
//             <Row className="align-items-center">
//                 <Col xs={12}>
//                     <div className="d-flex justify-content-between align-items-center flex-nowrap" style={{ gap: '16px', flexWrap: 'nowrap' }}>
//                         {/* Breadcrumb */}
//                         <div className="d-flex align-items-center flex-nowrap" style={{ gap: '8px', fontSize: '15px', color: 'black' }}>
//                             <Link className="custom-Nav-header" to='/Home' style={{ color: 'black', textDecoration: 'none' }}>Administration</Link>
//                             <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" style={{ color: '#5D6D7E' }} fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
//                                 <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
//                             </svg>
//                             <span className="custom-Nav-Sub-header" style={{ color: '#73879C' }}>Program</span>
//                         </div>
//                         {/* +Add Button */}
//                         <Button type="button" className="btn-custom1 btn-sm" variant="success">
//                             <Link to="/addprogram" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
//                                 <OverlayTrigger
//                                     placement="top"
//                                     overlay={<Tooltip id="tooltip-top" className="small-tooltip">Add</Tooltip>}
//                                 >
//                                     <span className="button-content" style={{ display: 'flex', alignItems: 'center' }}>
//                                         <span className="icon-circle1">
//                                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" style={{ fontWeight: 'bold' }} fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
//                                                 <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
//                                             </svg>
//                                         </span>
//                                         <span className="text" style={{ marginLeft: '4px' }}>Add</span>
//                                     </span>
//                                 </OverlayTrigger>
//                             </Link>
//                         </Button>
//                     </div>
//                 </Col>
//             </Row>
//             <Row>
//                 <Col xs={12}>
//                     <div className="table-scroll">
//                         <table>
//                             <thead>
//                                 <tr>
//                                     <th style={{ minWidth: "60px" }}>S.No</th>
//                                     <th style={{ minWidth: "150px" }}>
//                                         <div className="header-cell d-flex">
//                                             <span className="clickable" onClick={(e) => sortResult1('Program_Code', true)}>
//                                                 Program Code<span>{setSortasc.sortdirection1 === "DOWN" ? '▼' : '▲'}</span>
//                                             </span>
//                                         </div>
//                                     </th>
//                                     <th style={{ width: '350px' }}>
//                                         <div className="header-cell d-flex">
//                                             <span className="clickable" onClick={(e) => sortResult2('Program_Nav_Name', true)}>
//                                                 Program Name<span>{setSortasc.sortdirection2 === "DOWN" ? '▼' : '▲'}</span>
//                                             </span>
//                                             <span className="filter-container d-flex">
//                                                 <svg onClick={colDropdownfilter3} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-filter" viewBox="0 0 16 16">
//                                                     <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5" />
//                                                 </svg>
//                                                 <div className={FilteronClickLight3 ? 'led-yellow' : ''} style={{ marginLeft: '8px' }}></div>
//                                             </span>
//                                         </div>
//                                     </th>
//                                     <th style={{ width: '350px' }}>
//                                         <div className="header-cell d-flex">
//                                             <span className="clickable" onClick={(e) => sortResult3('Module_Name', true)}>
//                                                 Module Name<span>{setSortasc.sortdirection3 === "DOWN" ? '▼' : '▲'}</span>
//                                             </span>
//                                             <span className="filter-container d-flex">
//                                                 <svg onClick={colDropdownfilter4} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-filter" viewBox="0 0 16 16">
//                                                     <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5" />
//                                                 </svg>
//                                                 <div className={FilteronClickLight4 ? 'led-yellow' : ''} style={{ marginLeft: '8px' }}></div>
//                                             </span>
//                                         </div>
//                                     </th>
//                                     <th style={{ width: '120px' }}>
//                                         <div className="header-cell d-flex">
//                                             <span className="clickable" onClick={(e) => sortResult4('Program_Valid_Converted', true)}>
//                                                 Status<span>{setSortasc.sortdirection4 === "DOWN" ? '▼' : '▲'}</span>
//                                             </span>
//                                             <span className="filter-container d-flex">
//                                                 <svg onClick={colDropdownfilterSt} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-filter" viewBox="0 0 16 16">
//                                                     <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5" />
//                                                 </svg>
//                                                 <div className={FilteronClickLightSt ? 'led-yellow-Orange' : ''} style={{ marginLeft: '8px' }}></div>
//                                             </span>
//                                         </div>
//                                     </th>
//                                     <th style={{ minWidth: "100px", paddingLeft: '30px' }}>Options</th>
//                                 </tr>
//                             </thead>
//                             <tbody  >
//                                 {currentItems.map((Pro, index) => (
//                                     <tr key={Pro.Program_ID}>
//                                         <td style={{ width: '60px' }} >{indexOfFirstItem + index + 1}</td>
//                                         <td style={{ width: '150px' }} >{Pro.Program_Code}</td>
//                                         <td style={{ width: '350px' }} >{Pro.Program_Nav_Name}</td>
//                                         <td style={{ width: '350px' }} >{Pro.Module_Name}</td>
//                                         <td style={{ width: '120px' }} >{changeValid(Pro.Program_Valid_Converted.toString())}</td>
//                                         <td style={{ width: '100px' }} >
//                                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
//                                                 {/* Edit Button */}
//                                                 <Button className="p-1" style={{ minWidth: 0 }}>
//                                                     <OverlayTrigger
//                                                         placement="top"
//                                                         overlay={<Tooltip id="tooltip-top" className="small-tooltip">Edit</Tooltip>}
//                                                     >
//                                                         <Link to={`/editprogram/${Pro.Program_ID}`} style={{ color: 'green', display: 'flex', alignItems: 'center' }}>
//                                                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
//                                                                 <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
//                                                                 <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
//                                                             </svg>
//                                                         </Link>
//                                                     </OverlayTrigger>
//                                                 </Button>
//                                                 {/* Delete Button */}
//                                                 <Button className="p-1" style={{ minWidth: 0 }} onClick={() => deleteClick(Pro.Program_ID)}>
//                                                     <OverlayTrigger
//                                                         placement="top"
//                                                         overlay={<Tooltip id="tooltip-top" className="small-tooltip">Delete</Tooltip>}
//                                                     >
//                                                         <span style={{ color: 'red', display: 'flex', alignItems: 'center' }}>
//                                                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
//                                                                 <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
//                                                             </svg>
//                                                         </span>
//                                                     </OverlayTrigger>
//                                                 </Button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                         {/* Pagination */}
//                         <div className="pagination-container">
//                             <Pagination className="pagination-sm d-flex align-items-center">
//                                 <Pagination.Prev
//                                     onClick={() => handlePageChange(currentPage - 1)}
//                                     disabled={currentPage === 1}
//                                 />
//                                 {renderPaginationItems()}
//                                 <Pagination.Next
//                                     onClick={() => handlePageChange(currentPage + 1)}
//                                     disabled={currentPage === totalPages}
//                                 />
//                             </Pagination>
//                         </div>
//                     </div>
//                 </Col>
//             </Row>
//         </Container >
//     );
// };
// export default Program

import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Container, Row, Col, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUserPlus, FaEdit, FaTrashAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { SERVER_PORT } from '../../../constant';
import '../../Common.css';
import { motion } from 'framer-motion';

function Program({ setTitle }) {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [sortDirection, setSortDirection] = useState({
        Program_Code: 'DOWN',
        Program_Nav_Name: 'DOWN',
        Module_Name: 'DOWN',
        Program_Valid_Converted: 'DOWN',
    });

    useEffect(() => {
        setTitle("Program");
    }, [setTitle]);

    useEffect(() => {
        axios.get(`${SERVER_PORT}/programload`)
            .then(res => {
                const activeRecords = res.data.filter(record => record.Program_Valid_Converted === 'Active');
                setData(activeRecords);
            })
            .catch(err => console.log(err));
    }, []);

    const deleteClick = (id) => {
        if (window.confirm('Are you sure you want to Delete?')) {
            axios.delete(`${SERVER_PORT}/programdlt/` + id)
                .then(res => {
                    if (res.data.Status === 'Success') {
                        alert("Deleted Successfully");
                        axios.get(`${SERVER_PORT}/programload`)
                            .then(res => {
                                const activeRecords = res.data.filter(record => record.Program_Valid_Converted === 'Active');
                                setData(activeRecords);
                            })
                            .catch(err => console.log(err));
                    } else {
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

    const filteredData = data.filter(prog =>
        (prog.Program_Code?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prog.Program_Nav_Name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prog.Module_Name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (prog.Program_Valid_Converted?.toLowerCase().includes(searchTerm.toLowerCase()))
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
                            placeholder="Search by program code, name, module..."
                            className="form-control rounded-pill shadow-sm ps-5 border-0"
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
                            onClick={() => navigate('/addprogram')}
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
                        <table >
                            <thead >
                                <tr>
                                    <th >S.No</th>
                                    <th onClick={() => sortData('Program_Code')}>
                                        Program Code <span className="ms-1">{sortDirection.Program_Code === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th onClick={() => sortData('Program_Nav_Name')}>
                                        Program Name <span className="ms-1">{sortDirection.Program_Nav_Name === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th onClick={() => sortData('Module_Name')}>
                                        Module Name <span className="ms-1">{sortDirection.Module_Name === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th onClick={() => sortData('Program_Valid_Converted')}>
                                        Status <span className="ms-1">{sortDirection.Program_Valid_Converted === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th className="text-center">Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((prog, index) => (
                                        <motion.tr
                                            key={prog.Program_ID}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <td className="py-2">{indexOfFirstItem + index + 1}</td>
                                            <td className="py-2">{prog.Program_Code}</td>
                                            <td className="py-2">{prog.Program_Nav_Name}</td>
                                            <td className="py-2">{prog.Module_Name}</td>
                                            <td className="border-0 py-2 px-3">
                                                <motion.span
                                                    whileHover={{ scale: 1.05 }}
                                                    className={`badge px-2 py-1 rounded-pill fw-normal`}
                                                    style={{
                                                        background: prog.Program_Valid_Converted === 'Active'
                                                            ? 'linear-gradient(90deg, #8ed334ff 0%, #35b910ff 100%)'
                                                            : prog.Program_Valid_Converted === 'Inactive'
                                                                ? 'rgba(206, 20, 20, 1)'
                                                                : 'linear-gradient(100deg, #4142a2ff 0%, #06b6d4 100%)',
                                                        color: '#fff',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                                                    }}
                                                >
                                                    {prog.Program_Valid_Converted || 'N/A'}
                                                </motion.span>
                                            </td>
                                            <td className="py-2 text-center">
                                                <div className="d-flex justify-content-end">
                                                    <Button variant="outline-success" size="sm" onClick={() => navigate(`/editprogram/${prog.Program_ID}`)}>
                                                        <FaEdit />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => { deleteClick(prog.Program_ID) }}>
                                                        <FaTrashAlt />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">No programs found.</td>
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

export default Program;
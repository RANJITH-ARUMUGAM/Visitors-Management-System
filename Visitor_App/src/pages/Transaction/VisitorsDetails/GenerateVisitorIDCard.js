import React, { useState, useRef, useEffect } from 'react';
import { Button, Modal, Container, Row, Col, Pagination, InputGroup, FormControl } from 'react-bootstrap';
import { BsPerson, BsPrinter, BsQrCode, BsSearch, BsClock, BsEye } from 'react-icons/bs';
import QRCode from 'react-qr-code';
import axios from 'axios';
import './VisitorPass.css';
import '../../Adminstor/AdminUsers/UserList.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import QRious from 'qrious';
import { SERVER_PORT } from '../../../constant';


const GenerateVisitorIDCard = ({ setTitle, visitor, visitorId, showCard = true, onClose }) => {

  useEffect(() => {
    setTitle("Generate Visitor ID-Card");
  }, [setTitle]);


  const [showBackSide, setShowBackSide] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [visitorsData, setVisitorsData] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const printRef = useRef(null);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const getTimeAgo = (date) => {
    const now = new Date();
    const visitDate = new Date(date);
    const diffMs = now - visitDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(visitDate);
  };

  const currentDateTime = new Date();

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await axios.get(`${SERVER_PORT}/allvisitors`);
      if (res.data?.success) {
        const all = res.data.data || [];
        // Sort by most recent first
        const sortedVisitors = all.sort((a, b) => new Date(b.created_on || b.visit_date || Date.now()) - new Date(a.created_on || a.visit_date || Date.now()));
        setVisitorsData(sortedVisitors);
        console.log('====================================');
        console.log('All visitors:', res.data);
        console.log('====================================');

        // Set current visitor if visitorId prop is provided
        if (visitorId) {
          const matched = sortedVisitors.find(v => v.id === visitorId);
          if (matched) setSelectedVisitor(matched);
        } else if (visitor) {
          setSelectedVisitor(visitor);
        } else if (sortedVisitors.length > 0) {
          setSelectedVisitor(sortedVisitors[0]); // Select most recent by default
        }
      }
    } catch (err) {
      console.error("Visitor fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredVisitors = visitorsData.filter(visitor => {
    const matchesSearch = searchTerm === '' ||
      (visitor.visitor_name || visitor.GMS_VisitorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visitor.visitor_from || visitor.GMS_VisitorFrom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visitor.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || visitor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalItems = filteredVisitors.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVisitors = filteredVisitors.slice(startIndex, endIndex);

  // Recent visitors - top 6 most recent
  const recentVisitors = visitorsData.slice(0, 6);

  const current = selectedVisitor;

  const qrCodeData = current ? JSON.stringify({
    visitorId: current.id || visitorId || 'V2025050001',
    name: current.visitor_name || current.GMS_VisitorName || 'N/A',
    from: current.visitor_from || current.GMS_VisitorFrom || 'N/A',
    toMeet: current.to_meet || current.GMS_ToMeet || 'N/A',
    purpose: current.purpose || current.GMS_VisitPurpose || 'N/A',
    vehicle: current.vehicle_no || current.GMS_VehicleNo || 'N/A',
    issuedBy: 'Security Desk',
    date: formatDate(currentDateTime),
    time: formatTime(currentDateTime),
  }) : '';

  const handlePrint = () => {
    if (!current) return;

    const printArea = document.createElement('div');
    printArea.id = 'printable-card';
    printArea.className = 'print-container';

    // Build front side
    const front = document.createElement('div');
    front.className = 'visitor-smart-card';
    front.innerHTML = `
    <div class="card-headerprint">
      <h3>COMPANY</h3>
      <span class="visitor-type">VISITOR</span>
    </div>
    <div class="card-body">
      <div class="photo-container">
        <img src="http://localhost:5000/visitor-image/${current.id}" alt="Visitor" class="visitor-photo" />
      </div>
      <div class="visitor-info">
        <div class="info-row"><span class="label">ID:</span><span class="value">${current.id}</span></div>
        <div class="info-row"><span class="label">Name:</span><span class="value">${current.visitor_name || current.GMS_VisitorName}</span></div>
        <div class="info-row"><span class="label">Company:</span><span class="value">${current.visitor_from || current.GMS_VisitorFrom}</span></div>
        <div class="info-row"><span class="label">To Meet:</span><span class="value">${current.to_meet || current.GMS_ToMeet}</span></div>
        <div class="info-row"><span class="label">Date:</span><span class="value">${formatDate(currentDateTime)}</span></div>
        <div class="info-row"><span class="label">Time In:</span><span class="value">${formatTime(current.created_on)}</span></div>
        <div class="info-row mb-0"><span class="label">Address:</span><span class="value">Company name1/40, 1st street, Guindy. Chennai-60.</span></div>
      </div>
    </div>
    <div class="card-footer">
      <div class="validity">Valid ${formatDate(currentDateTime)}</div>
    </div>
  `;

    // Build back side with QR
    const back = document.createElement('div');
    back.className = 'visitor-pass-back';
    back.innerHTML = `
    <div class="qr-code-container">
      <div id="qr-print-code" class="qr-print-code"></div>
      <p class="qr-instructions">Scan this code for visitor details</p>
    </div>
    <div class="emergency-contact">
      <p>In case of emergency, please contact:</p>
      <p><strong>Security: +1 234 567 8000</strong></p>
    </div>
  `;

    printArea.appendChild(front);
    printArea.appendChild(back);
    document.body.appendChild(printArea);

    // Generate QR Code
    setTimeout(() => {
      const qr = new QRious({
        element: document.createElement('canvas'),
        value: JSON.stringify({
          visitorId: current.id,
          name: current.visitor_name || current.GMS_VisitorName,
          from: current.visitor_from || current.GMS_VisitorFrom,
          toMeet: current.to_meet || current.GMS_ToMeet,
          purpose: current.purpose || current.GMS_VisitPurpose,
          vehicle: current.vehicle_no || current.GMS_VehicleNo,
          issuedBy: 'Security Desk',
          date: formatDate(currentDateTime),
          time: formatTime(currentDateTime),
        }),
        size: 250,
        level: 'H'
      });

      document.getElementById('qr-print-code').appendChild(qr.element);

      setTimeout(() => {
        window.print();
        document.body.removeChild(printArea);
      }, 500);
    }, 100);
  };

  const handleSendEmail = async () => {
    if (!current || !(current.email || current.GMS_VisitorEmail)) {
      alert('No email found for this visitor.');
      return;
    }

    const payload = {
      email: current.email || current.GMS_VisitorEmail,
      visitor: {
        id: current.id,
        name: current.visitor_name || current.GMS_VisitorName,
        from: current.visitor_from || current.GMS_VisitorFrom,
        toMeet: current.to_meet || current.GMS_ToMeet,
        purpose: current.purpose || current.GMS_VisitPurpose,
        vehicle: current.vehicle_no || current.GMS_VehicleNo,
        date: formatDate(currentDateTime),
        time: formatTime(current.created_on),
      },
    };

    try {
      const res = await axios.post(`${SERVER_PORT}/sendVisitorIDEmail`, payload);
      alert(res.data.message || 'Email sent successfully!');
    } catch (err) {
      console.error(err);
      alert('Error sending visitor ID card via email.');
    }
  };


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleVisitorSelect = (visitor) => {
    setSelectedVisitor(visitor);
    setShowBackSide(false);
  };

  if (loading) {
    return (
      <Container fluid className="employee-container">
        <div className="d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary me-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mb-0">Loading visitor data...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="mt-2">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 text-left rounded-xl shadow">All Visitors</h2>
      <h1 className="font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Generate Virtual ID cards!!!</h1>
      <Row className="g-4">
        {/* Left Column - Tables */}
        <Col xl={9} lg={8} className="pe-lg-4">
          {/* All Visitors Table with Enhanced Search and Filters */}
          <div className="table-responsive">
            <div className="d-flex justify-content-right gap-3 mb-0 mt-2">
              <InputGroup style={{ width: '300px' }}>
                <InputGroup.Text><BsSearch /></InputGroup.Text>
                <FormControl
                  placeholder="Search visitors..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </InputGroup>
              <select
                className="form-select"
                style={{ width: '150px' }}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="Accepted">Accepted</option>
                <option value="Pending">Pending</option>
                <option value="Checked Out">Checked Out</option>
              </select>
            </div>
            <table >
              <thead>
                <tr>
                  {/* <th>ID</th> */}
                  <th>Name</th>
                  <th>From</th>
                  <th>To Meet</th>
                  <th>Status</th>
                  <th>Visit Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentVisitors.length > 0 ? (
                  currentVisitors.map((v) => (
                    <tr key={v.id} className={current?.id === v.id ? 'table-Accepted' : ''}>
                      {/* <td className="">
                        <span className="badge bg-light text-dark">#{v.id}</span>
                      </td> */}
                      <td className="fw-medium text-start">{v.visitor_name || v.GMS_VisitorName}</td>
                      <td className="">{v.visitor_from || v.GMS_VisitorFrom}</td>
                      <td className="">{v.to_meet_employeename} <br /> <span style={{ fontSize: "12px", color: "#555" }}> Role: {v.emp_designation || v.adm_role_id} </span>
                      </td>
                      <td className="">
                        <span className={`badge ${v.status === 'Accepted' ? 'bg-success' :
                          v.status === 'Pending' ? 'bg-warning' :
                            v.status === 'Rejected' ? 'bg-danger' :
                              v.status === 'Checked Out' ? 'bg-primary' :
                                'bg-secondary'
                          }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {formatDate(v.created_on)}
                      </td>
                      <td className="text-center m-0">
                        <Button
                          size="sm"
                          variant={current?.id === v.id ? "primary" : "outline-primary"}
                          onClick={() => handleVisitorSelect(v)}
                          className="d-flex align-items-center justify-content-center mx-auto p-0 px-1 py-1"
                          style={{ minWidth: '100px' }}
                        >
                          <BsEye className="me-1" size={12} />
                          {current?.id === v.id ? 'Selected' : 'View'}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <BsPerson size={48} className="mb-3 opacity-50" />
                      <p className="mb-0">No visitors found matching your criteria</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} visitors
              </div>
              <Pagination className="mb-0">
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />

                {/* Smart pagination display */}
                {(() => {
                  const pages = [];
                  const showPages = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                  let endPage = Math.min(totalPages, startPage + showPages - 1);

                  if (endPage - startPage + 1 < showPages) {
                    startPage = Math.max(1, endPage - showPages + 1);
                  }

                  if (startPage > 1) {
                    pages.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>);
                    if (startPage > 2) pages.push(<Pagination.Ellipsis key="start-ellipsis" />);
                  }

                  for (let page = startPage; page <= endPage; page++) {
                    pages.push(
                      <Pagination.Item
                        key={page}
                        Accepted={page === currentPage}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Pagination.Item>
                    );
                  }

                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) pages.push(<Pagination.Ellipsis key="end-ellipsis" />);
                    pages.push(<Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>{totalPages}</Pagination.Item>);
                  }

                  return pages;
                })()}

                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Col>

        {/* Right Column - Current Card */}
        <Col xl={2} lg={8} className="ps-lg-0">
          {current ? (
            <div >
              {/* ID Card Display */}
              <div ref={printRef} className="flipperContainer">
                <div className={`flipper ${showBackSide ? 'flipped' : ''}`}>

                  {/* FRONT */}
                  <div className="cardFront relative flex flex-col items-center bg-white rounded-[20px] shadow-xl overflow-hidden cursor-pointer" onClick={() => setShowBackSide(true)} >
                    {/* Header Image */}
                    <div
                      className="w-full h-28"
                      style={{
                        backgroundImage: `url('https://orig00.deviantart.net/db12/f/2012/038/5/0/blood_splatter_background_by_pudgey77-d4ozy89.jpg')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    ></div>

                    {/* Profile Photo */}
                    <div
                      className="relative -mt-12 w-24 h-24 rounded-full border-4 border-white shadow-lg bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${SERVER_PORT}/visitor-image/${current.id})`
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }}
                    ></div>

                    {/* Name & Company */}
                    <h1 className="mt-4 text-lg font-semibold text-gray-800">
                      {current.visitor_name || current.GMS_VisitorName}
                    </h1>
                    <h4 className="text-sm text-gray-500">
                      @{(current.company || 'Visitor').replace(/\s+/g, '_').toLowerCase()}
                    </h4>

                    {/* Purpose & Meeting */}
                    <p className="mt-3 px-4 text-xs text-gray-600 text-center">
                      {current.purpose || 'Business meeting'}. Meeting with {current.to_meet || current.GMS_ToMeet}.
                    </p>
                  </div>

                  {/* BACK */}
                  <div
                    className="cardBack relative bg-gray-900 text-white rounded-[20px] shadow-xl overflow-hidden cursor-pointer"
                    onClick={() => setShowBackSide(false)}
                  >
                    {/* Back Overlay */}
                    <div className="absolute inset-0 bg-black/50"></div>

                    <div className="relative z-10 p-1 h-full flex flex-col justify-center items-center space-y-4 text-sm">
                      {/* QR Code */}
                      <QRCode value={qrCodeData} className="qr-code" size={150} level="H" />
                      <p className="text-xs">Scan this code for visitor details</p>

                      {/* Emergency Contact */}
                      <div className="text-center text-xs mt-4">
                        <p>In case of emergency, please contact:</p>
                        <p>Security: +1 234 567 8900</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>



              {/* Card Controls */}
              <div className="ml-4 d-flex justify-content-right align-items-right mt-4">
                <div className="ml-4 d-flex flex-row gap-2 justify-content-right align-items-right">
                  <Button variant="primary" onClick={handlePrint} className="d-flex align-items-center py-1 px-1">
                    <BsPrinter className="me-2" />
                    Print
                  </Button>

                  <Button variant="success" onClick={handleSendEmail} className="d-flex align-items-center py-1 px-1">
                    <i className="bi bi-envelope-fill me-2"></i>
                    Send
                  </Button>

                  <Button variant="dark" onClick={() => setShowQRModal(true)} className="d-flex align-items-center py-1 px-1">
                    <BsQrCode className="me-2" />
                    QR
                  </Button>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-5">
              <BsPerson size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No visitor selected</h5>
              <p className="text-muted">Click on a visitor from the list to view their ID card</p>
            </div>
          )}
        </Col>
      </Row>

      {/* QR Modal */}
      {current && (
        <Modal show={showQRModal} onHide={() => setShowQRModal(false)} size="sm" centered>
          <Modal.Header closeButton className="border-0 pb-0"> {/* Remove border, add padding bottom */}
            <Modal.Title id="visitor-qr-code-title" className="h5 text-primary fw-bold"> {/* Smaller, primary color, bold title */}
              Visitor QR Code
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="text-center pt-2 pb-4 px-4"> {/* Adjusted padding */}
            <div className="qr-code-display p-3 bg-light rounded shadow-sm d-inline-block"> {/* Background, rounded corners, shadow */}
              {/* Use the correct value for the QR code, e.g., just the ID */}
              <QRCode
                value={qrCodeData} // IMPORTANT: Only encode the ID to prevent overflow
                size={220} // Slightly reduced size for better fit in a 'sm' modal, still highly scannable
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                level="H" // High error correction for better scannability even if slightly damaged
              />
            </div>

            {/* Visitor Data */}
            <div className="visitor-details"> {/* Increased top margin */}
              <p className="mb-1 text-sm text-muted fw-semibold">Visitor ID: <span className="text-dark">{current.id}</span></p> {/* Semi-bold label, dark ID */}
              <h4 className="text-sm font-weight-bold text-dark mb-0"> {/* Slightly larger, darker name */}
                {current.visitor_name || current.GMS_VisitorName || 'N/A'}
              </h4>
            </div>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0 d-flex justify-content-around"> {/* Remove border, no top padding, space buttons evenly */}
            <Button variant="outline-secondary" onClick={() => setShowQRModal(false)} className="flex-grow-1 mx-2"> {/* Outline style, grows, horizontal margin */}
              Close
            </Button>
            <Button variant="primary" onClick={handlePrint} className="flex-grow-1 mx-2"> {/* Grows, horizontal margin */}
              <i className="fas fa-print me-2"></i> Print
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default GenerateVisitorIDCard;
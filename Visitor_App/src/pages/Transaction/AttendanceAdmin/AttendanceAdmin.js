import React, { useState, useEffect } from 'react';
import { Container, Button, Form, Modal, Offcanvas } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight, FaUserCheck, FaUserTimes, FaClock, FaUserShield, FaHome, FaBan } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import '../../Adminstor/AdminUsers/UserList.css';
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';


ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function bufferToBase64(buffer) {
  if (!buffer) return '';
  // If buffer is already a base64 string, just return it
  if (typeof buffer === 'string') return buffer;
  // If buffer is an object with a data property (array of bytes)
  if (buffer.data) buffer = buffer.data;
  return btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
}

const Attendance = ({ setTitle }) => {
  // useEffect(() => {
  //   sessionStorage.clear();
  // }, []);

  const navigate = useNavigate();
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [attendanceSummary, setAttendanceSummary] = useState([
    { label: 'Present', count: 0, change: '+0', color: '#43a047', bgColor: '#1b5e20' },      // Dark green
    { label: 'Absent', count: 0, change: '+0', color: '#c62828', bgColor: '#6d1b1b' },       // Dark red
    { label: 'Late Login', count: 0, change: '+0', color: '#fbc02d', bgColor: '#795548' },   // Dark yellow/brown
    { label: 'Permission', count: 0, change: '+0', color: '#0288d1', bgColor: '#003c5f' },   // Dark blue
    { label: 'WFH', count: 0, change: '+0', color: '#7c4dff', bgColor: '#311b92' },          // Dark purple
    { label: 'LOP', count: 0, change: '+0', color: '#757575', bgColor: '#212121' },          // Dark gray
  ]);
  // --- Monthly Report State ---
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [monthlyLabels, setMonthlyLabels] = useState([]);
  const [monthlyCounts, setMonthlyCounts] = useState([]);

  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerList, setDrawerList] = useState([]);

  useEffect(() => {
    setTitle("Admin Attendance");
    fetchTotalEmployees();
    fetchAttendanceSummary();
    fetchAttendance();
    fetchMonthlyReport();
    // eslint-disable-next-line
  }, []);

  // --- Parse Time Interval ---
  const parseTimeInterval = (interval) => {
    if (!interval) return { hours: 0, minutes: 0, seconds: 0 };
    if (typeof interval === 'string') {
      const timeMatch = interval.match(/(\d+):(\d+):(\d+)/);
      if (timeMatch) {
        return {
          hours: parseInt(timeMatch[1], 10) || 0,
          minutes: parseInt(timeMatch[2], 10) || 0,
          seconds: parseInt(timeMatch[3], 10) || 0
        };
      }
      const parts = interval.split(':');
      if (parts.length === 3) {
        return {
          hours: parseInt(parts[0], 10) || 0,
          minutes: parseInt(parts[1], 10) || 0,
          seconds: parseInt(parts[2], 10) || 0
        };
      }
    }
    return { hours: 0, minutes: 0, seconds: 0 };
  };

  // --- Format Time Display ---
  const formatTimeDisplay = (interval) => {
    if (!interval) return '-';

    // Handle object format: {hours, minutes, seconds}
    if (typeof interval === 'object') {
      const hours = interval.hours || 0;
      const minutes = interval.minutes || 0;
      const seconds = interval.seconds || 0;
      if (hours === 0 && minutes === 0 && seconds === 0) return '-';
      if (seconds > 0) {
        return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
      }
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }

    // Handle number (assume minutes)
    if (typeof interval === 'number') {
      const hours = Math.floor(interval / 60);
      const minutes = interval % 60;
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }

    // Handle string (HH:MM:SS)
    if (
      interval === '00:00:00' ||
      interval === '0:00:00' ||
      interval === '00:00' ||
      interval === '0:00'
    ) {
      return '-';
    }
    const { hours, minutes, seconds } = parseTimeInterval(interval);
    if (hours === 0 && minutes === 0 && seconds === 0) return '-';
    if (seconds > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  // --- Check Production Hours Sufficiency ---
  const isProductionHoursSufficient = (hoursData) => {
    if (!hoursData) return false;
    const { hours, minutes } = parseTimeInterval(hoursData);
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= 480;
  };

  // --- Get Status Badge Class ---
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'bg-success';
      case 'absent':
        return 'bg-danger';
      case 'late login':
      case 'late':
        return 'bg-warning text-dark';
      case 'lop':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  // --- Fetch Total Employees ---
  const fetchTotalEmployees = async () => {
    try {
      const res = await axios.get(`${SERVER_PORT}/CountofTotalEMP`);
      setTotalEmployees(res.data.total_employees);
      ReactSession.set("CountofTotalEMP", res.data.total_employees);
    } catch (error) {
      console.error('Error fetching total employees:', error);
    }
  };


  // --- Fetch Attendance Summary ---
  const fetchAttendanceSummary = async () => {
    try {
      const res = await axios.get(`${SERVER_PORT}/AttendanceStatusEMP`);
      const apiSummary = res.data;
      const updatedSummary = attendanceSummary.map(item => {
        const apiItem = apiSummary.find(s => s.status && item.label &&
          s.status.toLowerCase() === item.label.toLowerCase());
        return {
          ...item,
          count: apiItem ? apiItem.count : 0
        };
      });
      setAttendanceSummary(updatedSummary);
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    }
  };

  // --- Fetch Attendance Data (Alternative with proper uniqueness) ---
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${SERVER_PORT}/AttendanceDeltailsEMP`);

      // If you want unique records per user, use this approach
      // Otherwise, use the simpler version above
      const uniqueAttendance = res.data?.reduce((acc, current) => {
        // Make sure userid exists and is valid
        if (!current.userid) {
          acc.push(current); // Include records without userid
          return acc;
        }

        const existingIndex = acc.findIndex(item =>
          item.userid && item.userid === current.userid
        );

        if (existingIndex === -1) {
          acc.push(current);
        } else {
          // Compare dates properly
          const currentDate = current.createddate ? new Date(current.createddate) : new Date(0);
          const existingDate = acc[existingIndex].createddate ? new Date(acc[existingIndex].createddate) : new Date(0);

          if (currentDate > existingDate) {
            acc[existingIndex] = current;
          }
        }
        return acc;
      }, []) || [];

      // Normalize status property
      const normalizedAttendance = uniqueAttendance.map(emp => ({
        ...emp,
        status: emp.status || emp.gms_status || ''
      }));

      setAttendanceList(normalizedAttendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceList([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch Monthly Report Data ---
  const fetchMonthlyReport = async () => {
    try {
      const res = await axios.get(`${SERVER_PORT}/MonthlyAttendanceReport/2025`); // or dynamic year
      const data = res.data;

      setMonthlyReport(data);

      const labels = data.map(item => item.month);
      setMonthlyLabels(labels);

      setMonthlyCounts({
        Present: data.map(d => parseInt(d.present)),
        Absent: data.map(d => parseInt(d.absent)),
        'Late Login': data.map(d => parseInt(d.late)),
        Permission: data.map(d => parseInt(d.permission)),
        WFH: data.map(d => parseInt(d.wfh)),
        LOP: data.map(d => parseInt(d.lop))
      });

    } catch (error) {
      console.error('Error loading monthly report:', error);
      setMonthlyReport([]);
      setMonthlyLabels([]);
      setMonthlyCounts({});
    }
  };


  // --- Bar Chart Data ---
  const barChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Present',
        backgroundColor: '#43a047',
        data: monthlyCounts.Present || [],
      },
      {
        label: 'Absent',
        backgroundColor: '#c62828',
        data: monthlyCounts.Absent || [],
      },
      {
        label: 'Late Login',
        backgroundColor: '#fbc02d',
        data: monthlyCounts['Late Login'] || [],
      },
      {
        label: 'Permission',
        backgroundColor: '#0288d1',
        data: monthlyCounts.Permission || [],
      },
      {
        label: 'WFH',
        backgroundColor: '#7c4dff',
        data: monthlyCounts.WFH || [],
      },
      {
        label: 'LOP',
        backgroundColor: '#757575',
        data: monthlyCounts.LOP || [],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
    elements: {
      bar: {
        barPercentage: 0.08,
        categoryPercentage: 0.08,
      },
    },
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }
    try {
      await axios.delete(`${SERVER_PORT}/AttendanceDeleteEMP/${id}`);
      setAttendanceList(prev => prev.filter(item => item.id !== id));
      fetchAttendanceSummary();
      alert('Attendance record deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete attendance record');
    }
  };

  const handleCardClick = (statusLabel) => {
    setDrawerTitle(statusLabel + ' Employees');
    setDrawerList(
      attendanceList.filter(emp => {
        const s = (emp.status || emp.gms_status || '').trim().toLowerCase();
        const label = statusLabel.trim().toLowerCase();
        // For "Late Login" also match "late"
        if (label === 'late login') return s === 'late login' || s === 'late';
        return s === label;
      })
    );
    setShowDrawer(true);
  };

  const filtered = attendanceList.filter(employee =>
    employee && employee.name &&
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedData = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const absentEmployees = attendanceList.filter(e => e.status?.toLowerCase() === 'absent');

  // Map icons and dynamic colors for each summary type
  const summaryIcons = {
    Present: <FaUserCheck size={28} color="#43a047" />,      // Green
    Absent: <FaUserTimes size={28} color="#c62828" />,       // Red
    'Late Login': <FaClock size={28} color="#fbc02d" />,     // Yellow
    Permission: <FaUserShield size={28} color="#0288d1" />,  // Blue
    WFH: <FaHome size={28} color="#7c4dff" />,               // Purple
    LOP: <FaBan size={28} color="#757575" />,                // Gray
  };

  return (
    <Container fluid className="employee-container">
      <div className="bg-white shadow-sm p-1 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Attendance Details Today</h2>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <small className="fw-bold">
              Total <span className="bg-red-100 px-1 rounded">{totalEmployees}+</span> number of employees!!!
            </small>
          </div>
          <div className="d-flex align-items-center">
            <span className="me-2 fw-bold">Total Absentees Today</span>
            <div className="d-flex align-items-center">
              <div className="avatar-group position-relative d-flex">
                {(absentEmployees.length > 0 ? absentEmployees.slice(0, 3) : Array(3).fill({ avatar: null }))
                  .map((emp, index) => (
                    <img
                      key={index}
                      src={
                        emp.images && emp.images.data
                          ? `data:image/jpeg;base64,${bufferToBase64(emp.images.data)}`
                          : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
                      }
                      alt="avatar"
                      className="avatar-img rounded-circle border border-red"
                      style={{
                        width: '40px',
                        height: '40px',
                        objectFit: 'cover',
                        position: 'relative',
                        left: `${index * -10}px`,
                        zIndex: 10 - index,
                      }}
                    />
                  ))}
                {absentEmployees.length > 3 && (
                  <span
                    className="avatar-img avatar-more text-white bg-warning d-flex justify-content-center align-items-center rounded-circle border border-white"
                    style={{
                      width: '40px',
                      height: '40px',
                      left: `-30px`,
                      zIndex: 7,
                      position: 'relative',
                      fontSize: '0.75rem',
                    }}
                  >
                    +{absentEmployees.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {attendanceSummary.map((item, i) => (
            <div className="col-md-2 col-sm-4 col-6 mb-3" key={i}>
              <div
                className="attendance-summary-card d-flex flex-column justify-content-between"
                style={{
                  background: `linear-gradient(135deg, ${item.bgColor} 80%, #181c22 100%)`,
                  border: `2px solid ${item.bgColor}`,
                  minHeight: 100,
                  color: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.81)',
                  padding: '16px 12px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={() => handleCardClick(item.label)} // <-- Add click handler
              >
                {/* Decorative background circle - dark, subtle */}
                <div
                  style={{
                    position: 'absolute',
                    right: -30,
                    top: -30,
                    width: 80,
                    height: 80,
                    background: 'rgba(24,28,34,0.18)',
                    borderRadius: '50%',
                    zIndex: 0,
                  }}
                />
                <div className="fw-bold fs-6 mb-1" style={{ color: '#fff', textAlign: 'left', zIndex: 1 }}>
                  {item.label}
                </div>
                <div className="d-flex align-items-center flex-grow-1" style={{ zIndex: 1 }}>
                  <span style={{ fontSize: 40, marginRight: 12, display: 'flex', alignItems: 'center' }}>
                    {summaryIcons[item.label]
                      ? React.cloneElement(summaryIcons[item.label], { color: "#fff", size: 40 })
                      : <FaUserCheck size={40} color="#fff" />}
                  </span>
                  <span style={{ fontSize: 28, fontWeight: 700, flex: 1, textAlign: 'center' }}>
                    {item.count}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

        <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Admin Attendance</h2>
      <div className="bg-white shadow-sm p-1 rounded mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 w-full md:w-auto">
            <Form.Select
              className="border rounded-md py-2 px-2 text-sm w-28"
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[10, 25, 50, 100].map(n => (
                <option key={n} value={n}>{n} entries</option>
              ))}
            </Form.Select>
            <Form.Control
              className="border rounded-md py-2 px-2 text-sm w-32"
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Status</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Break</th>
                <th>Late</th>
                <th>Production Hours</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">Loading...</td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((employee, index) => (
                  <tr key={employee.id || index}>
                    <td>
                      <div>{employee.createddate ? new Date(employee.createddate).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={
                            employee.images && employee.images.data
                              ? `data:image/jpeg;base64,${bufferToBase64(employee.images.data)}`
                              : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
                          }
                          alt={employee.name}
                          className="rounded-circle border border-red me-2"
                          style={{ width: '40px', height: '40px' }}
                        />
                        <div>
                          <div className="fw-medium">{employee.name}</div>
                          <div className="small text-muted">{employee.department}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td>{employee.checkin || '-'}</td>
                    <td>{employee.checkout || '-'}</td>
                    <td>{formatTimeDisplay(employee.break)}</td>
                    <td>{formatTimeDisplay(employee.late)}</td>
                    <td>
                      <span className={`badge ${isProductionHoursSufficient(employee.productionhours) ? 'bg-success' : 'bg-warning text-black'}`}>
                        {formatTimeDisplay(employee.productionhours)}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'green' }} onClick={() => navigate(`/adminattendanceedit/${employee.id}`)}>
                        <i className="fa-solid fa-user-pen"></i>
                      </span>
                      <span className="pr-5" style={{ color: '#c40202' }} onClick={() => handleDelete(employee.id)}>
                        <i className="pl-5 fa-solid fa-trash"></i>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
          <div className="text-muted">
            Showing {filtered.length > 0 ? (currentPage - 1) * perPage + 1 : 0} to{' '}
            {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <FaArrowLeft />
            </Button>
            <span>{currentPage}</span>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <FaArrowRight />
            </Button>
          </div>
        </div>
      </div>

      {/* --- Monthly Report Region --- */}
      <div className="bg-white shadow-sm p-1 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Monthly Attendance Report</h2>
        <div className="row">
          {/* Left: Bar Chart */}
          <div className="col-12 col-md-6 mb-4 mb-md-0">
            <div>
              {monthlyLabels.length > 0 ? (
                <Bar
                  data={barChartData}
                  options={{
                    ...barChartOptions,
                    elements: {
                      bar: {
                        barPercentage: 0.2,
                        categoryPercentage: 0.6,  // spacing between grouped bars
                      },
                    },
                  }}
                />
              ) : (
                <div className="text-center text-muted py-5">No monthly data available.</div>
              )}
            </div>
          </div>
          {/* Right: Monthly Table - Admin Attendance Style */}
          <div className="col-12 col-md-6">
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th> Present </th>
                    <th>Absent
                    </th>
                    <th>Late
                    </th>
                    <th>Permission
                    </th>
                    <th>WFH
                    </th>
                    <th>LOP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyReport && monthlyReport.length > 0 ? (
                    monthlyReport.map((row, idx) => (
                      <tr key={idx}>
                        <td><strong>{row.month}</strong></td>
                        <td>
                          <span className="badge" style={{ background: "#43a047" }}>{row.present}</span>
                        </td>
                        <td>
                          <span className="badge" style={{ background: "#c62828" }}>{row.absent}</span>
                        </td>
                        <td>
                          <span className="badge" style={{ background: "#fbc02d", color: "#333" }}>{row.late}</span>
                        </td>
                        <td>
                          <span className="badge" style={{ background: "#0288d1" }}>{row.permission}</span>
                        </td>
                        <td>
                          <span className="badge" style={{ background: "#7c4dff" }}>{row.wfh}</span>
                        </td>
                        <td>
                          <span className="badge" style={{ background: "#757575" }}>{row.lop}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">No monthly data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- Employee List Drawer --- */}
      <Offcanvas
        show={showDrawer}
        onHide={() => setShowDrawer(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{drawerTitle}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {drawerList.length === 0 ? (
            <div className="text-muted text-center py-4">No employees found.</div>
          ) : (
            <ul className="list-group">
              {drawerList.map(emp => (
                <li key={emp.id} className="list-group-item d-flex align-items-center">
                  <img
                    src={emp.images && emp.images.data
                      ? `data:image/jpeg;base64,${bufferToBase64(emp.images.data)}`
                      : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
                    }
                    alt={emp.name}
                    className="rounded-circle me-2"
                    style={{ width: 36, height: 36 }}
                  />
                  <div>
                    <div className="fw-bold">{emp.name}</div>
                    <div className="small text-muted">{emp.department}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
};

export default Attendance;
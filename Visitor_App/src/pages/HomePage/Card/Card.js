import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Eye, Calendar, ClipboardList, Award, ShieldAlert,
  Car, Package, Ticket, Truck, Box, Download, Bell,
  Building2, CheckCircle, XCircle, UserX, UserPlus
} from 'lucide-react';
import axios from "axios";
import { SERVER_PORT } from '../../../constant';

const Card = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-md ${className}`}
    onClick={onClick}
    style={onClick ? { cursor: 'pointer' } : {}}
  >
    {children}
  </div>
);

const Badge = ({ status }) => {
  const statusConfig = {
    'Checked-in': { color: 'bg-green-100 text-green-800', text: 'Checked-in' },
    'Accepted': { color: 'bg-green-100 text-green-800', text: 'Accepted' },
    'Checked-out': { color: 'bg-red-100 text-red-800', text: 'Checked-out' },
    'Pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
    'Inbound': { color: 'bg-blue-100 text-blue-800', text: 'Inbound' },
    'Outbound': { color: 'bg-purple-100 text-purple-800', text: 'Outbound' },
    'Approved': { color: 'bg-green-100 text-green-800', text: 'Approved' },
    'Denied': { color: 'bg-red-100 text-red-800', text: 'Denied' },
    'Outward': { color: 'bg-red-500 text-white-800', text: 'Outward' },
    'Inward': { color: 'bg-green-500 text-white-800', text: 'Inward' }
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

// Reusable pagination component
const PaginationControls = ({
  currentPage,
  onPageChange,
  itemsPerPage,
  totalItems,
  searchValue,
  onSearchChange,
  placeholder = "Search..."
}) => (
  <div className="flex justify-between mb-2">
    <input
      type="text"
      value={searchValue}
      onChange={onSearchChange}
      placeholder={placeholder}
      className="px-1 py-.5 text-xs border rounded w-2/3"
    />
    <div>
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="px-1 py-.5 text-xs border rounded mr-1"
      >
        Prev
      </button>
      <span className="text-xs">{currentPage}</span>
      <button
        onClick={() => {
          const nextPage = currentPage * itemsPerPage < totalItems ? currentPage + 1 : currentPage;
          onPageChange(nextPage);
        }}
        className="px-1 py-.5 text-xs border rounded ml-1"
      >
        Next
      </button>
    </div>
  </div>
);

// Reusable table row for summary drawer
const SummaryListItem = ({ item, type }) => {
  const renderContent = () => {
    switch (type) {
      case 'totalEmployeesList':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              <strong className="text-gray-800">{item.gms_first_name} {item.gms_last_name}</strong>
            </div>
            <div className="ml-6 text-gray-600">
              <div>📧 {item.gms_email}</div>
              <div>📅 Joined: {new Date(item.gms_joining_date).toLocaleDateString()}</div>
              <div>🆔 ID: {item.id}</div>
            </div>
          </div>
        );

      case 'visitors-today':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-green-600" />
              <strong className="text-gray-800">{item.gms_visitorname}</strong>
            </div>
            <div className="ml-6 text-gray-600">
              <div>🏢 From: {item.gms_visitorfrom}</div>
              <div>🕐 Entry: {item.gms_intime}</div>
              <div>👤 To Meet: {item.gms_tomeet}</div>
              <div>📞 Contact: {item.gms_mobileno}</div>
              <div>📄 Status: <Badge status={item.gms_status || 'Visited'} /></div>
            </div>
          </div>
        );

      case 'visitors-month':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-purple-600" />
              <strong className="text-gray-800">{item.gms_visitorname}</strong>
            </div>
            <div className="ml-6 text-gray-600">
              <div>🏢 From: {item.gms_visitorfrom}</div>
              <div>📞 Contact: {item.gms_mobileno}</div>
              <div>👤 Host: {item.gms_tomeet}</div>
              <div>🕐 In: {item.gms_intime}</div>
              <div>🕐 Out: {item.gms_outtime || '—'}</div>
              <div>📄 Status: <Badge status={item.gms_status || 'Visited'} /></div>
            </div>
          </div>
        );

      case 'current-visitors':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-orange-600" />
              <strong className="text-gray-800">{item.gms_visitorname}</strong>
            </div>
            <div className="ml-6 text-gray-600">
              <div>🏢 From: {item.gms_visitorfrom}</div>
              <div>📞 Contact: {item.gms_mobileno}</div>
              <div>👤 To Meet: {item.gms_tomeet}</div>
              <div>🕐 Entry: {item.gms_intime}</div>
              <div>📄 Status: <Badge status={item.gms_status || 'Inside'} /></div>
            </div>
          </div>
        );

      case 'pending-approvals':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-red-600" />
              <strong className="text-gray-800">{item.gms_visitorname}</strong>
            </div>
            <div className="ml-6 text-gray-600">
              <div>🏢 From: {item.gms_visitorfrom || 'N/A'}</div>
              <div>👤 To Meet: {item.gms_tomeet}</div>
              <div>📝 Purpose: {item.gms_visitpurpose || 'General Visit'}</div>
              <div>📞 Contact: {item.gms_mobileno}</div>
              <div>📄 Status: <Badge status="Pending" /></div>
            </div>
          </div>
        );

      case 'vehicles-inside':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Car size={16} className="text-indigo-600" />
              <strong className="text-gray-800">{item.GMS_vehicle_number}</strong>
            </div>
            <div className="ml-6 text-gray-600">
              <div>🚗 Type: {item.GMS_vehicle_type}</div>
              <div>👤 Driver: {item.GMS_driver_name}</div>
              <div>📞 Contact: {item.GMS_driver_contact_number}</div>
              <div>🕐 Entry: {item.GMS_entry_time}</div>
              <div>✅ Security: Cleared</div>
            </div>
          </div>
        );

      case 'material-movements':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-teal-600" />
              <strong className="text-gray-800">{item.GMS_material_name}</strong>
            </div>
            <div className="ml-6 text-gray-600">
              <div>📦 Type: {item.GMS_material_type}</div>
              <div>📊 Quantity: {item.GMS_quantity} {item.GMS_unit}</div>
              <div>📍 Route: {item.GMS_source_location} → {item.GMS_destination_location}</div>
              <div>🚚 Transport: {item.GMS_vehicle_number}</div>
              <div>📄 Status: <Badge status={item.GMS_movement_type} /></div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <li className="border rounded-md p-3 bg-gray-50 hover:bg-gray-100">
      {renderContent()}
    </li>
  );
};

// Reusable summary card component
const SummaryCard = ({ label, value, icon, gradient, data, type, onClick }) => {
  const cardContent = (
    <div
      className={`h-47 relative overflow-hidden transform-gpu transition-all duration-500 ease-out hover:rotate-x-12 hover:rotate-y-6 hover:scale-110 hover:-translate-z-8 rounded-2xl shadow-2xl hover:shadow-4xl text-white bg-gradient-to-br ${gradient} ${data?.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/15 transform translate-z-1"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent opacity-0 hover:opacity-100 transition-all duration-700 transform hover:translate-z-2"></div>
      <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent opacity-0 hover:opacity-80 transition-all duration-500 transform hover:scale-110"></div>
      <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm opacity-0 hover:opacity-100 transition-all duration-500 transform hover:translate-z-3"></div>
      <div className="absolute -inset-2 bg-gradient-to-br opacity-20 blur-md transform translate-z-negative-1 hover:translate-z-negative-2 transition-transform duration-500"></div>

      <div className="relative z-20 flex flex-col justify-between h-full p-3 transform hover:translate-z-4 transition-transform duration-500">
        <div className="flex items-between space-x-2 h-full pl-0 pt-3 pb-4 transform hover:translate-z-3 transition-transform duration-400">
          <div className="bg-white/25 backdrop-blur-lg p-4 rounded-2xl border border-white/40 shadow-2xl transform hover:rotate-y-6 hover:scale-125 transition-all duration-300">
            {React.cloneElement(icon, { size: 50, className: "text-white drop-shadow-2xl filter brightness-125" })}
          </div>

          <div className="flex flex-col justify-center h-full transform hover:translate-x-1 transition-transform duration-300">
            <p className="text-sm opacity-95 font-medium tracking-wide uppercase mb-1 drop-shadow-md">{label}</p>
            <p className="text-2xl font-bold tracking-tight drop-shadow-lg filter brightness-110 transform hover:scale-105 transition-transform duration-300">{value}</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 overflow-hidden rounded-2xl">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full" style={{ animation: 'wave1 2s ease-in-out infinite' }}></div>
        <div className="absolute -top-8 -left-8 w-28 h-28 bg-white/15 rounded-full" style={{ animation: 'wave2 2.5s ease-in-out infinite 0.3s' }}></div>
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/20 rounded-full" style={{ animation: 'wave3 3s ease-in-out infinite 0.6s' }}></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/8 rounded-full" style={{ animation: 'ripple1 2.2s ease-in-out infinite' }}></div>
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/12 rounded-full" style={{ animation: 'ripple2 2.8s ease-in-out infinite 0.4s' }}></div>
        <div className="absolute -bottom-10 -left-10 w-30 h-30 bg-white/10 rounded-full" style={{ animation: 'ripple3 3.2s ease-in-out infinite 0.8s' }}></div>
      </div>

      <div className="absolute top-4 right-4 w-2 h-2 bg-white/30 rounded-full opacity-0 hover:opacity-100 transform hover:translate-z-8 hover:rotate-45 transition-all duration-700 animate-pulse"></div>
      <div className="absolute top-8 right-8 w-1 h-1 bg-white/40 rounded-full opacity-0 hover:opacity-100 transform hover:translate-z-6 hover:rotate-90 transition-all duration-500 animate-pulse delay-200"></div>
      <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-white/25 rounded-full opacity-0 hover:opacity-100 transform hover:translate-z-5 hover:-rotate-45 transition-all duration-600 animate-pulse delay-400"></div>
    </div>
  );

  return data?.length > 0 ? (
    <div onClick={() => onClick({ title: label, data, type })}>
      {cardContent}
    </div>
  ) : (
    cardContent
  );
};

// Summary drawer component
const SummaryDrawer = ({ drawerData, onClose, searchQuery, setSearchQuery, currentPage, setCurrentPage }) => {
  const itemsPerPage = 5;

  const filteredData = drawerData?.data?.filter((item) => {
    const searchTerm = searchQuery.toLowerCase();
    switch (drawerData.type) {
      case 'totalEmployeesList':
        return (
          (item.gms_first_name || '').toLowerCase().includes(searchTerm) ||
          (item.gms_last_name || '').toLowerCase().includes(searchTerm) ||
          (item.gms_email || '').toLowerCase().includes(searchTerm)
        );
      case 'visitors-today':
      case 'visitors-month':
      case 'current-visitors':
      case 'pending-approvals':
        return (
          (item.gms_visitorname || '').toLowerCase().includes(searchTerm) ||
          (item.gms_visitorfrom || '').toLowerCase().includes(searchTerm) ||
          (item.gms_tomeet || '').toLowerCase().includes(searchTerm) ||
          (item.gms_mobileno || '').toLowerCase().includes(searchTerm)
        );
      case 'vehicles-inside':
        return (
          (item.GMS_vehicle_number || '').toLowerCase().includes(searchTerm) ||
          (item.GMS_driver_name || '').toLowerCase().includes(searchTerm) ||
          (item.GMS_vehicle_type || '').toLowerCase().includes(searchTerm)
        );
      case 'material-movements':
        return (
          (item.GMS_material_name || '').toLowerCase().includes(searchTerm) ||
          (item.GMS_material_type || '').toLowerCase().includes(searchTerm) ||
          (item.GMS_source_location || '').toLowerCase().includes(searchTerm) ||
          (item.GMS_destination_location || '').toLowerCase().includes(searchTerm)
        );
      default:
        return true;
    }
  }) || [];

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const exportToCSV = () => {
    const csvRows = [];
    const headers = Object.keys(drawerData.data[0] || {}).join(',');
    csvRows.push(headers);
    drawerData.data.forEach((row) => {
      const values = Object.values(row).map((val) => `"${val}"`);
      csvRows.push(values.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${drawerData.title.replace(/\s+/g, '_')}_export.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end mt-20">
      <div className="bg-white w-full max-w-lg p-4 overflow-y-auto shadow-lg rounded-l-lg relative">
        <div className="flex justify-between items-center border-b pb-2 mb-3">
          <h3 className="text-lg font-semibold text-gray-700">
            {drawerData.title} ({filteredData.length} records)
          </h3>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
            >
              <Download size={16} className="inline-block mr-1" /> Export
            </button>
            <button
              onClick={onClose}
              className="text-red-500 text-lg font-bold hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>

        <div className="mb-3">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <ul className="space-y-2 max-h-[400px] overflow-y-auto text-sm">
          {paginatedData.map((item, idx) => (
            <SummaryListItem key={idx} item={item} type={drawerData.type} />
          ))}
          {paginatedData.length === 0 && (
            <li className="text-gray-500 text-center py-8">
              <div className="text-4xl mb-2">📭</div>
              <div>No matching records found.</div>
            </li>
          )}
        </ul>

        <div className="flex justify-between items-center mt-4 text-sm border-t pt-3">
          <span className="text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              ← Prev
            </button>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
              {currentPage}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => (endIndex < filteredData.length ? p + 1 : p))
              }
              disabled={endIndex >= filteredData.length}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Cards({ setTitle }) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({});
  const [liveVisitors, setLiveVisitors] = useState([]);
  const [upcomingVisitors, setUpcomingVisitors] = useState([]);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [frequentVisitors, setFrequentVisitors] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);

  const [totalEmployeesList, settotalEmployeesList] = useState([]);
  const [visitorsTodayList, setvisitorsTodayList] = useState([]);
  const [currentlyInsideList, setcurrentlyInsideList] = useState([]);
  const [pendingApprovalsList, setpendingApprovalsList] = useState([]);
  const [vehiclesInsideList, setvehiclesInsideList] = useState([]);
  const [materialMovementsTodayList, setmaterialMovementsTodayList] = useState([]);
  const [totalVisitorsThisMonthList, settotalVisitorsThisMonthList] = useState([]);

  const [searchLiveVisitors, setSearchLiveVisitors] = useState('');
  const [searchupcomingVisitors, setsearchUpcomingVisitors] = useState('');
  const [searchRecentVisitors, setsearchRecentVisitors] = useState('');
  const [searchfrequentVisitors, setsearchFrequentVisitors] = useState('');
  const [searchsecurityAlerts, setsearchSecurityAlerts] = useState('');

  const [pageLiveVisitors, setpageLiveVisitors] = useState(1);
  const [pageupcomingVisitors, setpageUpcomingVisitors] = useState(1);
  const [pageRecentVisitors, setpageRecentVisitors] = useState(1);
  const [pagefrequentVisitors, setpageFrequentVisitors] = useState(1);
  const [pageSecurityAlerts, setpageSecurityAlerts] = useState(1);

  const [drawerData, setDrawerData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  useEffect(() => {
    setTitle("Cards");
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${SERVER_PORT}/Dashboard_combined_view_VW`);
      const dashboardData = res.data.dashboard_data || {};

      setSummary(dashboardData.summary || {});
      setLiveVisitors(dashboardData.liveVisitors || []);
      setUpcomingVisitors(dashboardData.upcomingVisitors || []);
      setRecentVisitors(dashboardData.recentVisitors || []);
      setFrequentVisitors(dashboardData.frequentVisitors || []);
      setSecurityAlerts(dashboardData.securityAlerts || []);

      settotalEmployeesList(dashboardData.totalEmployeesList || []);
      setvisitorsTodayList(dashboardData.visitorsTodayList || []);
      setcurrentlyInsideList(dashboardData.currentlyInsideList || []);
      setpendingApprovalsList(dashboardData.pendingApprovalsList || []);
      setvehiclesInsideList(dashboardData.vehiclesInsideList || []);
      setmaterialMovementsTodayList(dashboardData.materialMovementsTodayList || []);
      settotalVisitorsThisMonthList(dashboardData.totalVisitorsThisMonthList || []);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (liveVisitors && liveVisitors.length > 0) {
        setSummary(prev => ({
          ...prev,
          currentlyInside: liveVisitors.filter(v => v.status === 'Accepted').length,
        }));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [liveVisitors]);

  const handleManualCheckout = async (gateEntryId, modifiedBy) => {
    try {
      const response = await axios.post(`${SERVER_PORT}/manual-checkout`, {
        gateEntryId,
        modifiedBy,
      });
      if (response.status === 200) {
        alert('Visitor successfully checked out.');
        fetchDashboardData();
      } else {
        alert('Manual checkout failed. Please try again.');
      }
    } catch (error) {
      console.error('Manual checkout error:', error);
      alert(
        error.response?.data?.message || 'An error occurred during manual checkout.'
      );
    }
  };

  const handleUpcomingAction = async (id, action) => {
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    try {
      await axios.put(`${SERVER_PORT}/updateappointments/${id}`, {
        gms_status: newStatus
      });

      const response = await axios.get(`${SERVER_PORT}/preBookings/${id}`);
      setUpcomingVisitors(prev =>
        prev.map(visitor =>
          visitor.id === id ? { ...visitor, status: response.data.data?.gms_status || newStatus } : visitor
        )
      );
      console.log(`${action} for upcoming visitor ID: ${id}`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const handleFlagVisitor = (id, isVIP) => {
    setFrequentVisitors(prev =>
      prev.map(visitor =>
        visitor.id === id ? { ...visitor, isVIP: isVIP, isSuspicious: !isVIP } : visitor
      )
    );
    console.log(`Visitor ID ${id} flagged as ${isVIP ? 'VIP' : 'Suspicious'}`);
  };

  const handleSecurityAlertAction = (id, action) => {
    console.log(`Security alert ID ${id}: ${action}`);
    if (action === 'Clear') {
      setSecurityAlerts(prev => prev.filter(alert => alert.id !== id));
    }
  };

  const handleQuickAction = (action) => {
    const actionMap = {
      'Register New Visitor': () => navigate('/gate/AddGateEntry'),
      'Generate GatePass': () => navigate('/GenerateVisitorIDCard'),
      'Add Material Movement': () => navigate('/MaterialMovementModule'),
      'Log Vehicle Entry': () => navigate('/LogVehicleEntryModul')
    };

    if (actionMap[action]) {
      actionMap[action]();
    } else {
      alert(`Action: ${action} - (This would open a form/modal or navigate in a real application)`);
    }
  };

  const summaryCards = [
    {
      label: "Visitors (Today)",
      value: summary.totalVisitorsToday,
      icon: <Eye />,
      gradient: "from-green-500 to-green-700",
      data: visitorsTodayList,
      key: "visitors-today"
    },
    {
      label: "Visitors (This Month)",
      value: summary.totalVisitorsThisMonth,
      icon: <Calendar />,
      gradient: "from-emerald-500 to-emerald-700",
      data: totalVisitorsThisMonthList,
      key: "visitors-month"
    },
    {
      label: "Currently Inside",
      value: summary.currentlyInside,
      icon: <Building2 />,
      gradient: "from-blue-500 to-blue-700",
      data: currentlyInsideList,
      key: "current-visitors"
    },
    {
      label: "Pending Approvals",
      value: summary.pendingApprovals,
      icon: <ClipboardList />,
      gradient: "from-yellow-500 to-yellow-700",
      data: pendingApprovalsList,
      key: "pending-approvals"
    },
  ];

  const quickActions = [
    { label: 'Register New Visitor', icon: <UserPlus />, color: 'bg-blue-600' },
    { label: 'Generate GatePass', icon: <Ticket />, color: 'bg-green-600' },
    { label: 'Export Daily Report', icon: <Download />, color: 'bg-teal-600' },
    { label: 'Notify Security', icon: <Bell />, color: 'bg-red-600' },
  ];

  const closeDrawer = () => {
    setDrawerData(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
          .table-container::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .table-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .table-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }
          .table-container::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
          @keyframes wave1 {
            0% { transform: scale(0) rotate(0deg); opacity: 0.8; }
            50% { transform: scale(1.2) rotate(180deg); opacity: 0.4; }
            100% { transform: scale(2) rotate(360deg); opacity: 0; }
          }
          @keyframes wave2 {
            0% { transform: scale(0) rotate(0deg); opacity: 0.7; }
            50% { transform: scale(1.1) rotate(180deg); opacity: 0.35; }
            100% { transform: scale(1.8) rotate(360deg); opacity: 0; }
          }
          @keyframes wave3 {
            0% { transform: scale(0) rotate(0deg); opacity: 0.6; }
            50% { transform: scale(1) rotate(180deg); opacity: 0.3; }
            100% { transform: scale(1.6) rotate(360deg); opacity: 0; }
          }
          @keyframes ripple1 {
            0% { transform: scale(0) rotate(45deg); opacity: 0.6; }
            40% { transform: scale(1.3) rotate(225deg); opacity: 0.3; }
            100% { transform: scale(2.2) rotate(405deg); opacity: 0; }
          }
          @keyframes ripple2 {
            0% { transform: scale(0) rotate(-45deg); opacity: 0.5; }
            45% { transform: scale(1.1) rotate(-225deg); opacity: 0.25; }
            100% { transform: scale(1.9) rotate(-405deg); opacity: 0; }
          }
          @keyframes ripple3 {
            0% { transform: scale(0) rotate(90deg); opacity: 0.7; }
            50% { transform: scale(1.4) rotate(270deg); opacity: 0.35; }
            100% { transform: scale(2.4) rotate(450deg); opacity: 0; }
          }
        `}
      </style>

      <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-8 text-center" style={{ textShadow: '0px 13px 10px rgb(0, 0, 0)' }}>
        Visitors Management Dashboard
      </h1>

      <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Summary Cards</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 mb-8 pl-2" style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}>
        {summaryCards.map((item, idx) => (
          <SummaryCard
            key={idx}
            label={item.label}
            value={item.value}
            icon={item.icon}
            gradient={item.gradient}
            data={item.data}
            type={item.key}
            onClick={(data) => setDrawerData(data)}
          />
        ))}
      </div>

      {drawerData && (
        <SummaryDrawer
          drawerData={drawerData}
          onClose={closeDrawer}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}

      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 lg:gap-4">
        {/* Upcoming Visitor Schedule */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Upcoming Visitor Schedule</h2>
          <Card className="p-1 pt-1 mb-4">
            <PaginationControls
              currentPage={pageupcomingVisitors}
              onPageChange={setpageUpcomingVisitors}
              itemsPerPage={itemsPerPage}
              totalItems={upcomingVisitors.filter(v =>
                v.name?.toLowerCase().includes(searchupcomingVisitors.toLowerCase()) ||
                v.organization?.toLowerCase().includes(searchupcomingVisitors)
              ).length}
              searchValue={searchupcomingVisitors}
              onSearchChange={(e) => {
                setsearchUpcomingVisitors(e.target.value);
                setpageUpcomingVisitors(1);
              }}
              placeholder="Search upcoming visitors"
            />
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    <th className="px-2 py-1">Visitor & Host</th>
                    <th className="px-2 py-1">Schedule Time</th>
                    <th className="px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingVisitors.length > 0 ? (
                    upcomingVisitors
                      .filter(v => v.name?.toLowerCase().includes(searchupcomingVisitors.toLowerCase()) || v.organization?.toLowerCase().includes(searchupcomingVisitors))
                      .slice((pageupcomingVisitors - 1) * itemsPerPage, pageupcomingVisitors * itemsPerPage)
                      .map((visitor) => (
                        <tr key={visitor.id}>
                          <td className="px-2 py-1">
                            <div className="inline-flex items-center px-1 py-.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">{visitor.name} ({visitor.organization})</div>
                            <div className="text-xs font-medium text-gray-900"> TO MEET: {visitor.host}</div>
                            <div className="inline-flex items-center px-1 py-.5 font-small rounded-md shadow-sm text-xs text-white bg-yellow-500">PURPOSE: {visitor.purpose}</div>
                          </td>
                          <td className="px-2 py-1">{visitor.time}</td>
                          <td className="px-2 py-1">
                            {visitor.status === 'Pending' ? (
                              <div className="space-x-1">
                                <button
                                  onClick={() => handleUpcomingAction(visitor.id, 'approve')}
                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                </button>
                                <button
                                  onClick={() => handleUpcomingAction(visitor.id, 'deny')}
                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                                >
                                  <XCircle className="w-3 h-3 mr-1" /> Deny
                                </button>
                              </div>
                            ) : (
                              <Badge status={visitor.status} />
                            )}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td className="px-2 py-4 text-center text-gray-500" colSpan="3">No upcoming visitors scheduled.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Live Visitor Monitoring */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Live Visitor Monitoring</h2>
          <Card className="p-1 pt-1 mb-4">
            <PaginationControls
              currentPage={pageLiveVisitors}
              onPageChange={setpageLiveVisitors}
              itemsPerPage={itemsPerPage}
              totalItems={liveVisitors.filter(visitor =>
                visitor.name.toLowerCase().includes(searchLiveVisitors.toLowerCase()) ||
                visitor.phone.includes(searchLiveVisitors)
              ).length}
              searchValue={searchLiveVisitors}
              onSearchChange={(e) => {
                setSearchLiveVisitors(e.target.value);
                setpageLiveVisitors(1);
              }}
              placeholder="Search by name or phone"
            />
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    <th className="px-2 py-1">Name & Phone</th>
                    <th className="px-2 py-1">To Meet</th>
                    <th className="px-2 py-1">Time In/Out</th>
                    <th className="px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {liveVisitors.length > 0 ? (
                    liveVisitors
                      .filter(visitor => visitor.name.toLowerCase().includes(searchLiveVisitors.toLowerCase()) || visitor.phone.includes(searchLiveVisitors))
                      .slice((pageLiveVisitors - 1) * itemsPerPage, pageLiveVisitors * itemsPerPage)
                      .map((visitor) => (
                        <tr key={visitor.id}>
                          <td className="px-2 py-1">
                            <div className="flex items-center space-x-2">
                              <img
                                className="h-8 w-8 rounded-full object-cover"
                                src={`${SERVER_PORT}/visitor-image/${visitor.id}`}
                                alt={visitor.name}
                                onError={(e) => {
                                  if (!e.target.src.includes('/default-avatar.png')) {
                                    e.target.onerror = null;
                                    e.target.src = '/default-avatar.png';
                                  }
                                }}
                              />
                              <div>
                                <div className="text-xs font-medium text-gray-900">{visitor.name}</div>
                                <div className="text-xs text-gray-500">{visitor.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-1">{visitor.tomeet}</td>
                          <td className="px-2 py-1">
                            <div className="text-xs text-gray-900">
                              In: {visitor.entrytime ? visitor.entrytime : 'N/A'}{" "}
                              <CheckCircle className="w-3 h-3 mr-1 inline-flex items-center gap-1 text-xs text-green-600" />
                            </div>
                          </td>
                          <td className="px-2 py-1">
                            {visitor.status === 'Accepted' ? (
                              <button
                                onClick={() => handleManualCheckout(visitor.id)}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                              >
                                <UserX className="w-3 h-3 mr-1" /> Checkout
                              </button>
                            ) : (
                              <Badge status={visitor.status} />
                            )}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td className="px-2 py-4 text-center text-gray-500" colSpan="4">No visitors currently inside.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-2 mb-6">
        {/* Recent Visitor Log */}
        <Card className="p-1 mb-4 flex-1 min-w-0 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Recent Visitor Log</h2>
          <PaginationControls
            currentPage={pageRecentVisitors}
            onPageChange={setpageRecentVisitors}
            itemsPerPage={itemsPerPage}
            totalItems={recentVisitors.filter(v =>
              v.name?.toLowerCase().includes(searchRecentVisitors.toLowerCase())
            ).length}
            searchValue={searchRecentVisitors}
            onSearchChange={(e) => {
              setsearchRecentVisitors(e.target.value);
              setpageRecentVisitors(1);
            }}
            placeholder="Search recent visitors"
          />
          <table className="text-xs w-full">
            <thead>
              <tr>
                <th className="px-1 py-1 text-left">Name</th>
                <th className="px-1 py-1 text-left">In</th>
                <th className="px-1 py-1 text-left">Out</th>
                <th className="px-1 py-1 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentVisitors.length > 0 ? (
                recentVisitors
                  .filter(v => v.name?.toLowerCase().includes(searchRecentVisitors.toLowerCase()))
                  .slice((pageRecentVisitors - 1) * itemsPerPage, pageRecentVisitors * itemsPerPage)
                  .map((recentvisitor) => (
                    <tr key={recentvisitor.id} className="border-b">
                      <td className="px-1 py-1 truncate max-w-[80px]">{recentvisitor.name}</td>
                      <td className="px-1 py-1">{recentvisitor.timein ? recentvisitor.timein : 'N/A'}</td>
                      <td className="px-1 py-1">{recentvisitor.timeout ? recentvisitor.timeout : 'N/A'}</td>
                      <td className="px-1 py-1"><Badge status={recentvisitor.status} /></td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td className="px-1 py-2 text-center text-gray-500" colSpan="4">No recent visitor logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Frequent Visitors */}
        <Card className="p-1 mb-4 text-xs overflow-x-auto">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Frequent Visitors</h2>
          <PaginationControls
            currentPage={pagefrequentVisitors}
            onPageChange={setpageFrequentVisitors}
            itemsPerPage={itemsPerPage}
            totalItems={frequentVisitors.filter(v =>
              v.name?.toLowerCase().includes(searchfrequentVisitors.toLowerCase())
            ).length}
            searchValue={searchfrequentVisitors}
            onSearchChange={(e) => {
              setsearchFrequentVisitors(e.target.value);
              setpageFrequentVisitors(1);
            }}
            placeholder="Search frequent visitors"
          />
          <table className="text-xs w-full">
            <thead>
              <tr>
                <th className="px-1 py-1 text-left">Name</th>
                <th className="px-1 py-1 text-left">Org</th>
                <th className="px-1 py-1 text-left">Visits</th>
                <th className="px-1 py-1 text-left">Last</th>
                <th className="px-1 py-1 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {frequentVisitors.length > 0 ? (
                frequentVisitors
                  .filter(v => v.name?.toLowerCase().includes(searchfrequentVisitors.toLowerCase()))
                  .slice((pagefrequentVisitors - 1) * itemsPerPage, pagefrequentVisitors * itemsPerPage)
                  .map((visitor) => (
                    <tr key={visitor.id} className="border-b">
                      <td className="px-1 py-1 text-xs text-gray-800 truncate max-w-[80px]">{visitor.name}</td>
                      <td className="px-1 py-1 text-xs truncate max-w-[80px]">{visitor.organization}</td>
                      <td className="px-1 py-1 text-xs">{visitor.totalVisits}</td>
                      <td className="px-1 py-1 text-xs">{visitor.lastVisit}</td>
                      <td className="px-1 py-1 text-xs">
                        <div className="space-x-1">
                          <button
                            onClick={() => handleFlagVisitor(visitor.id, true)}
                            className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm ${visitor.isVIP ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-yellow-300'}`}
                          >
                            <Award className="w-3 h-3 mr-1" /> VIP
                          </button>
                          <button
                            onClick={() => handleFlagVisitor(visitor.id, false)}
                            className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm ${visitor.isSuspicious ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-300'}`}
                          >
                            <ShieldAlert className="w-3 h-3 mr-1" /> Suspicious
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td className="px-1 py-2 text-center text-gray-500" colSpan="5">No frequent visitors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        {/* Security Alerts / Watchlist */}
        <Card className="p-1 mb-4 text-xs overflow-x-auto">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Security Alerts / Watchlist</h2>
          <PaginationControls
            currentPage={pageSecurityAlerts}
            onPageChange={setpageSecurityAlerts}
            itemsPerPage={itemsPerPage}
            totalItems={securityAlerts.filter(v =>
              v.visitor?.toLowerCase().includes(searchsecurityAlerts.toLowerCase())
            ).length}
            searchValue={searchsecurityAlerts}
            onSearchChange={(e) => {
              setsearchSecurityAlerts(e.target.value);
              setpageSecurityAlerts(1);
            }}
            placeholder="Search alerts"
          />
          <table className="text-xs w-full">
            <thead>
              <tr>
                <th className="px-1 py-1 text-left">Alert</th>
                <th className="px-1 py-1 text-left">Timestamp</th>
                <th className="px-1 py-1 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {securityAlerts.length > 0 ? (
                securityAlerts
                  .filter(v => v.visitor?.toLowerCase().includes(searchsecurityAlerts.toLowerCase()))
                  .slice((pageSecurityAlerts - 1) * itemsPerPage, pageSecurityAlerts * itemsPerPage)
                  .map((alert) => (
                    <tr key={alert.id} className="bg-red-50 border-b">
                      <td className="px-1 py-1 max-w-[365px] align-top">
                        <div className="text-xs font-medium text-red-900 whitespace-normal break-words min-w-[220px]">{alert.type}: {alert.visitor}</div>
                        <div className="text-xs text-red-700 whitespace-normal break-words max-w-[300px]">{alert.notes}</div>
                      </td>
                      <td className="text-xs px-1 py-1 w-[38px] truncate text-center">{alert.timestamp}</td>
                      <td className="px-1 py-1">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleSecurityAlertAction(alert.id, 'View')}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 w-full justify-center"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleSecurityAlertAction(alert.id, 'Clear')}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 w-full justify-center"
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => handleSecurityAlertAction(alert.id, 'Alert Security')}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 w-full justify-center"
                          >
                            <Bell className="w-3 h-3 mr-1" /> Alert
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td className="px-1 py-2 text-center text-gray-500" colSpan="3">No active security alerts.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Quick Actions Panel */}
      <Card className="p-1 mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Quick Actions Panel</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAction(action.label)}
              className={`flex flex-col items-center justify-center p-4 ${action.color} text-white rounded-xl shadow-md hover:opacity-90 transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {React.cloneElement(action.icon, { className: "w-8 h-8 mb-2" })}
              <span className="text-sm font-medium text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
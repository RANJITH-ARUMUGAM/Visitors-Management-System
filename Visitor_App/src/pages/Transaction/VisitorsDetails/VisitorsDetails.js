import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, UserCheck, Search, Download, RefreshCw, MapPin, Clock, Car, Shield, AlertTriangle, Eye, Edit, LogOut, Plus, Phone, Mail, Building, User, Target, Trash2 } from 'lucide-react';
import { SERVER_PORT } from '../../../constant';

const AdvancedVisitorDashboard = ({ setTitle }) => {
  const [visitors, setVisitors] = useState([]);
  const [preBookings, setPreBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalToday: 0,
    preBooked: 0,
    currentlyInside: 0,
    checkedOut: 0,
    Pending: 0,
    Rejected: 0
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [flippedId, setFlippedId] = useState(null);
  const [page, setPage] = useState(1);
  const entriesPerPage = 5;


  const toggleFlip = (id) => {
    setFlippedId(flippedId === id ? null : id);
  };

  const navigate = useNavigate();

  useEffect(() => {
    setTitle("Visitors Details");
    fetchAllData();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, searchTerm, setTitle]);


  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchVisitors(),
        fetchPreBookings()
      ]);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitors = async () => {
    try {
      const response = await axios.get(`${SERVER_PORT}/allvisitors`);
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Invalid response format");
      }

      const transformedData = (response.data.data || []).map(visitor => ({
        id: visitor.id || "N/A",
        name: visitor.visitor_name || "Unknown",
        company: visitor.visitor_from || "N/A",
        phone: visitor.phone_number || "N/A",
        email: visitor.email || "N/A",
        toMeet: visitor.to_meet || "Unknown",
        department: "N/A",
        purpose: visitor.purpose || "N/A",
        checkIn: visitor.check_in ? new Date(visitor.check_in) : null,
        checkOut: visitor.check_out ? new Date(visitor.check_out) : null,
        status: visitor.check_out ? 'Checked Out' : (visitor.status || 'Pending'),
        originalStatus: visitor.status,
        vehicleNo: visitor.vehicle_no || "N/A",
        idType: visitor.id_type || "N/A",
        idNumber: visitor.id_number || "N/A",
        photo: visitor.image_data ? `${SERVER_PORT}/visitor-image/${visitor.id}` : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        location: determineLocation(visitor.status),
        risk: determineRiskLevel(visitor),
        type: 'visitor'
      }));

      setVisitors(transformedData);
      return transformedData;
    } catch (err) {
      console.error("Error fetching visitors:", err);
      setError("Failed to fetch visitors data");
      return [];
    }
  };

  const fetchPreBookings = async () => {
    try {
      const response = await axios.get(`${SERVER_PORT}/preBookings`);

      if (!response.data?.success) {
        console.error("API request succeeded but returned unsuccessful status");
        return [];
      }

      const preBookingData = (response.data.data || []).map(booking => {
        // Parse dates safely
        const bookingDate = booking.booking_date
          ? new Date(booking.booking_date)
          : null;

        const expectedExit = booking.expected_exit_time
          ? new Date(booking.expected_exit_time)
          : null;

        // Format dates for display
        const formattedBookingDate = bookingDate
          ? bookingDate.toLocaleDateString()
          : "N/A";

        const formattedExpectedExit = expectedExit
          ? expectedExit.toLocaleString()
          : "Not specified";

        return {
          id: `pb_${booking.gms_pre_booking_id}`, // Match your table column name
          name: booking.gms_visitor_name || "Unknown",
          company: booking.gms_visitor_from || "N/A",
          phone: booking.gms_phone_number || "N/A",
          email: booking.gms_email || "N/A",
          toMeet: booking.gms_to_meet || "Unknown",
          department: booking.department || "N/A", // Added if available
          purpose: booking.gms_purpose || "N/A",
          checkIn: null, // Will be filled when visitor arrives
          expectedExit: formattedExpectedExit,
          bookingDate: formattedBookingDate,
          bookingTime: booking.gms_booking_time || "N/A",
          status: mapOriginalStatus(booking.gms_status || 'pending'), // Added status mapping
          vehicleNo: booking.gms_vehicle_no || "N/A",
          idType: booking.gms_id_type || "N/A",
          idNumber: booking.gms_id_number || "N/A",
          photo: booking.photo_url || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
          location: "Scheduled",
          risk: calculateRiskLevel(booking), // Added risk calculation function
          type: 'prebooking',
          originalStatus: booking.gms_status || 'pending',
          createdAt: booking.gms_created_at // Keep original timestamp
        };
      });

      setPreBookings(preBookingData);
      return preBookingData;
    } catch (err) {
      console.error("Error fetching pre-bookings:", err);
      // You might want to add error handling that shows a user-friendly message
      return [];
    }
  };

  // Helper function to map backend status to frontend status
  // Update the mapOriginalStatus function
  const mapOriginalStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'accepted': 'Accepted',
      'approved': 'Accepted',
      'rejected': 'Rejected',
      'completed': 'Checked Out',
      'checked out': 'Checked Out',
      'checked in': 'Accepted'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  // Helper function to calculate risk level (example implementation)
  const calculateRiskLevel = (booking) => {
    // Implement your risk calculation logic here
    // Example: Check if visitor has completed previous visits successfully
    return 'low'; // Default to low
  };

  const determineLocation = (status) => {
    switch (status) {
      case 'Accepted':
        return 'Building A - Floor 1';
      case 'Pending':
        return 'Security Gate';
      case 'Rejected':
        return 'Blocked';
      default:
        return 'Reception';
    }
  };

  const determineRiskLevel = (visitor) => {
    if (visitor.purpose && visitor.purpose.toLowerCase().includes('security')) {
      return 'medium';
    }
    if (visitor.id_type === 'Passport') {
      return 'medium';
    }
    return 'low';
  };

  const calculateMetrics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Separate visitors and prebookings for clearer logic
    const actualVisitors = visitors; // from gms_gate_entries
    const actualPreBookings = preBookings; // from gms_pre_booking
    const allData = [...actualVisitors, ...actualPreBookings];

    // 1. Total Today - Only actual visitors who checked in today (from gms_gate_entries)
    const totalToday = actualVisitors.filter(v => {
      if (!v.checkIn) return false;
      const checkInDate = new Date(v.checkIn);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate.getTime() === today.getTime();
    }).length;

    // 2. Currently Inside - Visitors who checked in but haven't checked out
    const currentlyInside = actualVisitors.filter(v => {
      // Must have checked in
      if (!v.checkIn) return false;
      // Must not be checked out or rejected
      if (v.status === 'Checked Out' || v.status === 'Rejected') return false;
      // Must not have checkout time
      if (v.checkOut) return false;

      return true;
    }).length;

    // 3. Total Pending - From both tables
    const totalPending = allData.filter(v =>
      (v.status || '').toLowerCase() === 'pending'
    ).length;

    // 4. Pending Visitors - Only from gate entries (walk-ins)
    const pendingVisitors = actualVisitors.filter(v =>
      (v.status || '').toLowerCase() === 'pending'
    ).length;

    // 5. Pending Prebookings - Only from prebookings table (FIXED)
    const pendingPrebookings = actualPreBookings.filter(v =>
      (v.originalStatus || '').toLowerCase() === 'pending'
    ).length;

    // 6. Accepted Prebookings - Only from prebookings table
    const acceptedPrebookings = actualPreBookings.filter(v =>
      (v.status || '').toLowerCase() === 'accepted'
    ).length;

    // 7. Checked Out - Only from gate entries
    const checkedOut = actualVisitors.filter(v =>
      (v.status || '').toLowerCase() === 'checked out'
    ).length;

    // 8. Rejected/Blocked - From both tables
    const rejected = allData.filter(v =>
      (v.status || '').toLowerCase() === 'rejected'
    ).length;

    const newMetrics = {
      totalToday,
      preBooked: pendingPrebookings, // This now uses the corrected calculation
      currentlyInside,
      checkedOut,
      Pending: totalPending,
      Rejected: rejected,
      pendingVisitors,
      acceptedPrebookings
    };

    console.log('Calculated metrics:', newMetrics); // For debugging
    setMetrics(newMetrics);
  };

  useEffect(() => {
    calculateMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitors, preBookings]);

  const handleCheckout = async (visitorId) => {
    if (visitorId.toString().startsWith('pb_')) {
      alert('Cannot check out a pre-booking. Please check them in first.');
      return;
    }

    try {
      const response = await axios.put(`${SERVER_PORT}/updatevisitorstatus/${visitorId}`,
        { status: "Checked Out" }
      );

      if (response.data.success) {
        fetchAllData();
        alert('Visitor checked out successfully');
      } else {
        console.error("Failed to check out:", response.data.message);
        alert("Failed to check out visitor: " + response.data.message);
      }
    } catch (err) {
      console.error("Error checking out visitor:", err);
      alert("Failed to check out visitor. Please try again.");
    }
  };

  const handleView = (visitorId) => {
    if (visitorId.toString().startsWith('pb_')) {
      navigate(`/visitorsdetails/viewprebooking/${visitorId.replace('pb_', '')}`);
    } else {
      navigate(`/visitorsdetails/viewvisitor/${visitorId}`);
    }
  };

  const handleEdit = (visitorId) => {
    if (visitorId.toString().startsWith('pb_')) {
      navigate(`/visitorsdetails/editprebooking/${visitorId.replace('pb_', '')}`);
    } else {
      navigate(`/visitorsdetails/editvisitor/${visitorId}`);
    }
  };

  const handleDelete = async (visitorId, visitorName) => {
    if (window.confirm(`Are you sure you want to delete ?`)) {
      try {
        if (visitorId.toString().startsWith('pb_')) {
          await axios.delete(`${SERVER_PORT}/deleteprebooking/${visitorId.replace('pb_', '')}`);
        } else {
          await axios.delete(`${SERVER_PORT}/deletevisitor/${visitorId}`);
        }
        fetchAllData();
        alert('Successfully deleted');
      } catch (err) {
        console.error("Error deleting:", err);
        alert("Failed to delete. Please try again.");
      }
    }
  };

  const handleExport = () => {
    const allData = [...visitors, ...preBookings];
    const csvData = allData.map(visitor => ({
      Name: visitor.name,
      Company: visitor.company,
      Phone: visitor.phone,
      Email: visitor.email,
      'To Meet': visitor.toMeet,
      Purpose: visitor.purpose,
      'Check In': visitor.checkIn ? visitor.checkIn.toLocaleString() : 'N/A',
      'Check Out': visitor.checkOut ? visitor.checkOut.toLocaleString() : 'N/A',
      Status: visitor.status,
      'Vehicle No': visitor.vehicleNo,
      Type: visitor.type
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitors-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination
  // ...existing code...

  // ...existing code...
  // Combine visitors and preBookings for unified data
  const allData = [...visitors, ...preBookings];

  // Removed unused todayVisitors, weekVisitors, monthVisitors, checkedOutCount

  // Filtering and pagination
  const filteredVisitors = allData.filter(visitor => {
    const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.toMeet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.phone.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = false;
    const status = (visitor.status || '').toLowerCase();
    const originalStatus = (visitor.originalStatus || '').toLowerCase();

    if (filterStatus === 'all') {
      matchesFilter = true;
    } else if (filterStatus.toLowerCase() === 'accepted') {
      matchesFilter = status === 'accepted' || status === 'checked in';
    } else if (filterStatus.toLowerCase() === 'pre-booked') {
      // Pre-booked visitors are those with type 'prebooking' and originalStatus 'pending'
      matchesFilter = visitor.type === 'prebooking' && originalStatus === 'pending';
    } else if (filterStatus.toLowerCase() === 'pending') {
      matchesFilter = status === 'pending';
    } else if (filterStatus.toLowerCase() === 'rejected') {
      matchesFilter = status === 'rejected';
    } else if (filterStatus.toLowerCase() === 'checked out') {
      matchesFilter = status === 'checked out';
    } else {
      matchesFilter = status === filterStatus.toLowerCase();
    }

    return matchesSearch && matchesFilter;
  });
  const paginatedVisitors = filteredVisitors.slice((page - 1) * entriesPerPage, page * entriesPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading visitor data...</p>
          <p className="text-sm text-gray-400 mt-2">Fetching real-time information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAllData}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }


  // Add this before the return statement to debug
  console.log('All data:', allData);
  console.log('Filter status:', filterStatus);
  console.log('Search term:', searchTerm);
  console.log('Filtered visitors:', filteredVisitors);

  return (
    <div className="min-h-screen mt-3">

      <style jsx>{`
        .flipperContainer {
          border-radius: 30px;
          perspective: 1000px;
          width: 240px;
          height: 320px;
          position: relative;
          margin: 0 auto;
        }
        .flipper {
          transition: transform 0.6s;
          transform-style: preserve-3d;
          border-radius: 35px;
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
        }
        .flipper.flipped {
          transform: rotateY(180deg);
        }
        .cardFront,
        .cardBack {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 20px;
        }
        .cardBack {
          transform: rotateY(180deg);
        }

      `}</style>

      <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-8 text-center" style={{ textShadow: '0px 13px 10px rgb(0, 0, 0)' }}>
        Visitors Dashboard
      </h1>

      {/* Header */}
      <div className="mb-3">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow w-150">Visitor Management System</h2>
            {/* Removed real-time monitoring UI */}
          </div>
          <div className="flex space-x-3">
            <button className="bg-green-500 text-white  text-sm px-2 py-2 rounded-lg hover:bg-green-700 flex items-center" onClick={() => navigate('/visitorsdetails/AddGateEntry')}>
              <Plus className="w-4 h-4 mr-2" />
              New Visitor
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-gray-300 rounded-xl p-3 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow relative overflow-hidden min-h-[200px]">
          <Users className="absolute right-2 bottom-2 w-24 h-24 text-blue-400 opacity-60 pointer-events-none select-none" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-md text-black-600 mb-2 whitespace-nowrap">Total Today</p>
              <p className="text-3xl font-bold text-blue-600">{metrics.totalToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-300 rounded-xl p-3 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow relative overflow-hidden min-h-[180px]">
          <UserCheck className="absolute right-2 bottom-2 w-24 h-24 text-green-400 opacity-60 pointer-events-none select-none" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-md text-black-600 mb-2 whitespace-nowrap">Currently Inside</p>
              <p className="text-3xl font-bold text-green-600">{metrics.currentlyInside}</p>
              <p className="text-xs text-gray-500 mt-2">Real-time count</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-300 rounded-xl p-3 shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow relative overflow-hidden min-h-[180px]">
          <Calendar className="absolute right-2 bottom-2 w-24 h-24 text-purple-400 opacity-60 pointer-events-none select-none" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-md text-black-600 mb-2 whitespace-nowrap">Pre-Booked</p>
              <p className="text-3xl font-bold text-purple-600">{metrics.preBooked}</p>
              <p className="text-xs text-purple-600 mt-2 whitespace-nowrap">Upcoming visits</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-300 rounded-xl p-3 shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-shadow relative overflow-hidden min-h-[180px]">
          <Clock className="absolute right-2 bottom-2 w-24 h-24 text-orange-400 opacity-60 pointer-events-none select-none" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-md text-black-600 mb-2">Pending</p>
              <p className="text-3xl font-bold text-orange-600">{metrics.Pending}</p>
              <p className="text-xs text-orange-600 mt-2 whitespace-nowrap">Awaiting approval</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-300 rounded-xl p-3 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow relative overflow-hidden min-h-[180px]">
          <LogOut className="absolute right-2 bottom-2 w-24 h-24 text-blue-400 opacity-60 pointer-events-none select-none" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-md text-black-600 mb-2">Checked Out/day</p>
              <p className="text-3xl font-bold text-blue-600">{metrics.checkedOut}</p>
              <p className="text-xs text-blue-600 mt-2 whitespace-nowrap">Visitors left</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-300 rounded-xl p-3 shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow relative overflow-hidden min-h-[180px]">
          <Shield className="absolute right-2 bottom-2 w-24 h-24 text-red-400 opacity-60 pointer-events-none select-none" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-md text-black-600 mb-2">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{metrics.Rejected}</p>
              <p className="text-xs text-red-500 mt-2 whitespace-nowrap">Security alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Controls */}
      <div className="rounded-xl p-2 shadow-lg mb-2">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-semibold mb-2 px-2 text-gray-800 text-center rounded-xl shadow">Visitor Management</h2>
          <div className="flex space-x-3">
            <select
              className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button
              className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-100 flex items-center transition-colors"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-100 flex items-center transition-colors"
              onClick={fetchAllData}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search visitors, companies, hosts, or phone numbers..."
                className="w-full pl-10 pr-4 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reset to first page
                }}
              />
            </div>
          </div>
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1); // Reset to first page
            }}
          >
            <option value="all">All Status ({allData.length})</option>
            <option value="Accepted">Checked In ({metrics.currentlyInside})</option>
            <option value="pre-booked">Pre-booked ({metrics.preBooked})</option>
            <option value="Pending">Pending ({metrics.Pending})</option>
            <option value="Rejected">Rejected ({metrics.Rejected})</option>
            <option value="Checked Out">Checked Out ({metrics.checkedOut})</option>
          </select>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              className={`px-2 py-1.5 text-sm transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={`px-2 py-1.5 text-sm transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>

        {/* Visitor Cards/List */}
        {viewMode === 'grid' ? (
          <div className="flex flex-wrap gap-2 justify-start">
            {paginatedVisitors.slice(0, 5).map((visitor) => (
              <div key={visitor.id} className="flipperContainer mb-2">
                <div className={`flipper ${flippedId === visitor.id ? 'flipped' : ''}`}>
                  {/* Card Front */}
                  <div className="cardFront bg-whitesmoke-100 pb-2 rounded-[20px] shadow-xl overflow-hidden flex flex-col" onClick={() => toggleFlip(visitor.id)}>
                    {/* Top Header */}
                    <div
                      className="bg-indigo-300 h-32 relative flex justify-center"
                      style={{
                        backgroundImage: visitor.status === 'Accepted'
                          ? `url('https://wallpaperstudio10.com/static/wpdb/wallpapers/1920x1080/174849.jpg')`
                          : visitor.status === 'Pending'
                            ? `url('https://orig00.deviantart.net/db12/f/2012/038/5/0/blood_splatter_background_by_pudgey77-d4ozy89.jpg')`
                            : `url('https://wallpaperstudio10.com/static/wpdb/wallpapers/1920x1080/174849.jpg')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className="absolute left-1/2 -bottom-12 transform -translate-x-1/2">
                        <div
                          className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${visitor.photo})`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Name & Handle */}
                    <div className="mt-14 text-center">
                      <h1 className="text-lg font-semibold text-gray-800 m-0">{visitor.name}</h1>
                      <h4 className="text-sm text-gray-500 font-normal">
                        @{visitor.company.replace(/\s+/g, '_').toLowerCase()}
                      </h4>
                    </div>

                    {/* Bio */}
                    <div className="mt-3 px-6 text-center">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {visitor.purpose || 'Business meeting'}. Meeting with {visitor.toMeet}.
                        {visitor.type === 'prebooking' && visitor.bookingTime ? ` Scheduled for ${visitor.bookingTime}` : ''}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="text-center">
                      <span className="bg-white/90 text-gray-800 px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide shadow">
                        {visitor.originalStatus}
                      </span>
                    </div>

                    {/* Social Icons */}
                    <div className="flex justify-center gap-2 mt-2">
                      <button className="text-blue-600 hover:text-blue-800" onClick={() => handleView(visitor.id)} title="View Details"><Eye className="w-5 h-5" /></button>
                      {visitor.status !== 'Checked Out' && visitor.status !== 'Rejected' && (<button className="text-green-600 hover:text-green-800" onClick={() => handleEdit(visitor.id)} title="Edit"><Edit className="w-5 h-5" /></button>)}
                      {visitor.status === 'Accepted' && (<button className="text-red-600 hover:text-red-800" onClick={() => handleCheckout(visitor.id)} title="Check Out"><LogOut className="w-5 h-5" /></button>)}
                      <button className="text-red-600 hover:text-blue-800" onClick={() => handleDelete(visitor.id)} title="Delete"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>

                  {/* Card Back */}
                  <div className="cardBack rounded-[35px] shadow-xl overflow-hidden relative" onClick={() => toggleFlip(visitor.id)}>
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: visitor.status === 'Accepted'
                          ? `url('https://wallpaperstudio10.com/static/wpdb/wallpapers/1920x1080/174849.jpg')`
                          : visitor.status === 'Pending'
                            ? `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=500&fit=crop&crop=entropy&cs=tinysrgb')`
                            : `url('https://wallpaperstudio10.com/static/wpdb/wallpapers/1920x1080/174849.jpg')`
                      }}
                    ></div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40"></div>

                    {/* Content */}
                    <div className="relative z-10 p-6 h-full flex flex-col justify-center text-white">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{visitor.phone}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm truncate">{visitor.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Building className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{visitor.company}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">Meeting: {visitor.toMeet}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Target className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">Purpose: {visitor.purpose}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Car className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">Vehicle: {visitor.vehicleNo}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">Location: {visitor.location}</span>
                        </div>
                        {visitor.expectedExit && (
                          <div className="flex items-center space-x-3">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">
                              Expected Exit: {formatTime(visitor.expectedExit)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden mt-0">
            <table className="w-full">
              <thead>
                <tr>
                  <th >Visitor</th>
                  <th >Meeting</th>
                  <th >Time</th>
                  <th >Status</th>
                  <th >Location</th>
                  <th >Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedVisitors.length > 0 ? (
                  paginatedVisitors.map((visitor) => (
                    <tr key={visitor.id}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={visitor.photo}
                              alt={visitor.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                            <div className="text-sm text-gray-500">{visitor.company}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{visitor.toMeet}</div>
                        <div className="text-sm text-gray-500">{visitor.purpose}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {visitor.checkIn ? (
                          <div>
                            <div className="text-sm text-gray-900">{formatTime(visitor.checkIn)}</div>
                            {visitor.checkOut && (
                              <div className="text-sm text-gray-500">{formatTime(visitor.checkOut)}</div>
                            )}
                          </div>
                        ) : visitor.bookingTime ? (
                          <div className="text-sm text-gray-900">{visitor.bookingTime}</div>
                        ) : (
                          <div className="text-sm text-gray-500">N/A</div>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(visitor.status)}`}>
                          {visitor.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {visitor.location}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleView(visitor.id)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {visitor.status !== 'Checked Out' && visitor.status !== 'Rejected' && (
                            <button
                              className="text-green-600 hover:text-green-800"
                              onClick={() => handleEdit(visitor.id)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                             className="text-red-600 hover:text-blue-800"
                              onClick={() => handleDelete(visitor.id)}
                              title="Delete"
                              >
                            <Trash2 className="w-4 h-4" />
                            </button>
                          {visitor.status === 'Accepted' && (
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleCheckout(visitor.id)}
                              title="Check Out"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-3 py-2 text-center text-sm text-gray-500">
                      No visitors found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {/* Pagination */}
        <div className="flex justify-end items-center mt-4 px-2">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(page - 1) * entriesPerPage + 1}</span> to <span className="font-medium">
              {Math.min(page * entriesPerPage, filteredVisitors.length)}
            </span> of <span className="font-medium">{filteredVisitors.length}</span> visitors
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage(page + 1)}
              disabled={page * entriesPerPage >= filteredVisitors.length}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get status class
const getStatusClass = (status) => {
  switch (status) {
    case 'Accepted':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Rejected':
      return 'bg-red-100 text-red-800';
    case 'Checked Out':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default AdvancedVisitorDashboard;
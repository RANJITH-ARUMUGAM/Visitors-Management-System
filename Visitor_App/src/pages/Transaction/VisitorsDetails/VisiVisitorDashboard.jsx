import React, { useState, useEffect } from 'react';
import { Search, Users, UserCheck, LogOut, Plus, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { VisiVisitorCard } from './VisiVisitorCard';
import { VisiAddVisitorModal } from './VisiAddVisitorModal';
import { VisiEditVisitorModal } from './VisiEditVisitorModal';


const MOCK_VISITORS = [
  {
    id: 'V-001',
    name: 'Arun Kumar',
    company: 'Infosys',
    phone: '9876543210',
    email: 'arun.kumar@example.com',
    toMeet: 'Rajesh - Manager',
    department: 'HR',
    purpose: 'Interview',
    checkIn: new Date().toISOString(),
    checkOut: null,
    status: 'checked-in',
    originalStatus: 'approved',
    vehicleNo: 'TN10AB1234',
    idType: 'Aadhar',
    idNumber: '1234-5678-9876',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArunKumar',
    location: 'Inside Building',
    risk: 'low',
    type: 'visitor'
  },
  {
    id: 'V-001',
    name: 'Arun Kumar',
    company: 'Infosys',
    phone: '9876543210',
    email: 'arun.kumar@example.com',
    toMeet: 'Rajesh - Manager',
    department: 'HR',
    purpose: 'Interview',
    checkIn: new Date().toISOString(),
    checkOut: null,
    status: 'checked-in',
    originalStatus: 'approved',
    vehicleNo: 'TN10AB1234',
    idType: 'Aadhar',
    idNumber: '1234-5678-9876',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArunKumar',
    location: 'Inside Building',
    risk: 'low',
    type: 'visitor'
  },
  {
    id: 'V-001',
    name: 'Arun Kumar',
    company: 'Infosys',
    phone: '9876543210',
    email: 'arun.kumar@example.com',
    toMeet: 'Rajesh - Manager',
    department: 'HR',
    purpose: 'Interview',
    checkIn: new Date().toISOString(),
    checkOut: null,
    status: 'checked-in',
    originalStatus: 'approved',
    vehicleNo: 'TN10AB1234',
    idType: 'Aadhar',
    idNumber: '1234-5678-9876',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArunKumar',
    location: 'Inside Building',
    risk: 'low',
    type: 'visitor'
  },
  {
    id: 'V-002',
    name: 'Priya Sharma',
    company: 'TCS',
    phone: '9898989898',
    email: 'priya.tcs@example.com',
    toMeet: 'CEO',
    department: 'Admin',
    purpose: 'Presentation',
    checkIn: null,
    checkOut: new Date().toISOString(),
    status: 'checked-out',
    originalStatus: 'completed',
    vehicleNo: 'MH20AC4567',
    idType: 'PAN',
    idNumber: 'ABCDE1234F',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaSharma',
    location: 'Departed',
    risk: 'low',
    type: 'visitor'
  }
];

const MOCK_PREBOOKINGS = [
  {
    id: 'PB-001',
    name: 'John Doe',
    company: 'Wipro',
    phone: '9000000000',
    email: 'john.doe@example.com',
    toMeet: 'CTO',
    department: 'IT',
    purpose: 'Demo',
    bookingDate: new Date().toISOString(),
    bookingTime: '11:30 AM',
    expectedExit: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
    checkIn: null,
    checkOut: null,
    status: 'pre-booked',
    originalStatus: 'pending',
    vehicleNo: 'KA01AB9999',
    idType: 'Driving License',
    idNumber: 'DL-XX-123456',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe',
    location: 'Scheduled',
    risk: 'low',
    type: 'prebooking'
  }
];

const VisiVisitorDashboard = ({ setTitle }) => {
  const [visitors, setVisitors] = useState([]);
  const [preBookings, setPreBookings] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // keep these helpers from your original file (unchanged behaviour)
  const determineLocation = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'approved':
      case 'checked-in':
        return 'Inside Building';
      case 'checked-out':
        return 'Departed';
      case 'pending':
        return 'Waiting';
      case 'rejected':
        return 'Denied Entry';
      default:
        return 'Unknown';
    }
  };

  const determineRiskLevel = (visitor) => {
    if (String(visitor?.status || '').toLowerCase() === 'rejected') return 'high';
    if (String(visitor?.status || '').toLowerCase() === 'pending') return 'medium';
    return 'low';
  };

  // map statuses from backend-like strings to our display statuses (kept)
  const mapOriginalStatus = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'approved':
      case 'confirmed':
        return 'checked-in';
      case 'completed':
      case 'checked out':
        return 'checked-out';
      case 'pending':
        return 'pre-booked';
      case 'rejected':
      case 'cancelled':
        return 'rejected';
      default:
        return 'pre-booked';
    }
  };

  // load mock data (simulates API load)
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // small delay to mimic loading feel (you can remove if you prefer instant)
      await new Promise(resolve => setTimeout(resolve, 400));

      // transform mock visitors to expected shape (if needed)
      const transformedVisitors = MOCK_VISITORS.map(v => ({
        ...v,
        // ensure dates are consistent strings
        checkIn: v.checkIn ? new Date(v.checkIn).toISOString() : null,
        checkOut: v.checkOut ? new Date(v.checkOut).toISOString() : null,
        status: v.status || 'pre-booked',
        location: determineLocation(v.status),
        risk: determineRiskLevel(v)
      }));

      const transformedPre = MOCK_PREBOOKINGS.map(b => ({
        ...b,
        bookingDate: b.bookingDate ? new Date(b.bookingDate).toISOString() : null,
        expectedExit: b.expectedExit ? new Date(b.expectedExit).toISOString() : null,
        status: mapOriginalStatus(b.originalStatus || b.status || 'pending'),
        location: b.location || 'Scheduled',
        risk: determineRiskLevel(b)
      }));

      setVisitors(transformedVisitors);
      setPreBookings(transformedPre);
    } catch (err) {
      console.error(err);
      setError('Failed to load mock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // derive filtered list based on activeTab and searchTerm
  useEffect(() => {
    let allData = [];

    switch (activeTab) {
      case 'visitors':
        allData = visitors;
        break;
      case 'prebookings':
        allData = preBookings;
        break;
      case 'checked-in':
        allData = visitors.filter(v => v.status === 'checked-in');
        break;
      case 'checked-out':
        allData = visitors.filter(v => v.status === 'checked-out');
        break;
      default:
        allData = [...visitors, ...preBookings];
    }

    if (searchTerm && searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      allData = allData.filter(visitor =>
        String(visitor.name || '').toLowerCase().includes(q) ||
        String(visitor.email || '').toLowerCase().includes(q) ||
        String(visitor.company || '').toLowerCase().includes(q) ||
        String(visitor.purpose || '').toLowerCase().includes(q) ||
        String(visitor.toMeet || '').toLowerCase().includes(q)
      );
    }

    setFilteredVisitors(allData);
  }, [searchTerm, visitors, preBookings, activeTab]);

  // Stats
  const stats = {
    total: visitors.length + preBookings.length,
    checkedIn: visitors.filter(v => v.status === 'checked-in').length,
    checkedOut: visitors.filter(v => v.status === 'checked-out').length,
    preBooked: preBookings.length
  };

  // Action handlers — operate on mock state only
  const handleAddVisitor = (visitorData) => {
    const newId = `V-${Math.floor(Math.random() * 9000) + 100}`;
    const newVisitor = {
      id: newId,
      name: visitorData.name || 'New Visitor',
      company: visitorData.company || 'N/A',
      phone: visitorData.phone || 'N/A',
      email: visitorData.email || 'N/A',
      toMeet: visitorData.hostPerson || 'N/A',
      department: visitorData.department || 'N/A',
      purpose: visitorData.purpose || 'N/A',
      checkIn: visitorData.status === 'checked-in' ? new Date().toISOString() : null,
      checkOut: null,
      status: visitorData.status === 'pre-booked' ? 'pre-booked' : 'checked-in',
      originalStatus: visitorData.status === 'pre-booked' ? 'pending' : 'approved',
      vehicleNo: visitorData.vehicleNo || 'N/A',
      idType: visitorData.idType || 'N/A',
      idNumber: visitorData.idNumber || 'N/A',
      imageUrl: visitorData.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(visitorData.name || 'new').replace(/\s+/g, '')}`,
      location: determineLocation(visitorData.status),
      risk: determineRiskLevel(visitorData),
      type: 'visitor'
    };

    setVisitors(prev => [newVisitor, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleEditVisitor = (updated) => {
    setVisitors(prev => prev.map(v => (v.id === updated.id ? { ...v, ...updated } : v)));
    setPreBookings(prev => prev.map(pb => (pb.id === updated.id ? { ...pb, ...updated } : pb)));
    setIsEditModalOpen(false);
    setSelectedVisitor(null);
  };

  const handleDeleteVisitor = (visitorId) => {
    // safe delete for both lists
    if (!window.confirm('Are you sure you want to delete this visitor?')) return;
    setVisitors(prev => prev.filter(v => v.id !== visitorId));
    setPreBookings(prev => prev.filter(pb => pb.id !== visitorId));
  };

  const handleCheckOut = (visitorId) => {
    if (!window.confirm('Are you sure you want to check out this visitor?')) return;
    setVisitors(prev => prev.map(v => v.id === visitorId ? { ...v, status: 'checked-out', checkOut: new Date().toISOString() } : v));
  };

  const handleApproveVisitor = (visitorId) => {
    setPreBookings(prev => {
      // move prebooking to visitors as approved/checked-in
      const pb = prev.find(p => p.id === visitorId);
      if (!pb) return prev;
      const approved = {
        ...pb,
        id: `V-${Math.floor(Math.random() * 9000) + 100}`,
        status: 'checked-in',
        originalStatus: 'approved',
        checkIn: new Date().toISOString(),
        type: 'visitor'
      };
      setVisitors(vPrev => [approved, ...vPrev]);
      return prev.filter(p => p.id !== visitorId);
    });
  };

  const handleRejectVisitor = (visitorId) => {
    if (!window.confirm('Are you sure you want to reject this visitor?')) return;
    // mark as rejected in whichever list it is
    setVisitors(prev => prev.map(v => v.id === visitorId ? { ...v, status: 'rejected', originalStatus: 'rejected' } : v));
    setPreBookings(prev => prev.map(pb => pb.id === visitorId ? { ...pb, status: 'rejected', originalStatus: 'rejected' } : pb));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-700">Loading visitor data...</p>
        </div>
      </div>
    );
  }

  // bg-gradient-to-br from-blue-50 to-indigo-100

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Visitor Management</h1>
            <p className="text-slate-600 mt-2">Manage and track all visitors and pre-bookings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadData}
              className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Visitor
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-800">
            ×
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Visitors</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Checked In</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.checkedIn}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Checked Out</p>
              <p className="text-3xl font-bold text-slate-600 mt-2">{stats.checkedOut}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
              <LogOut className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pre Booked</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.preBooked}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-3 shadow-lg border border-slate-200 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search visitors by name, email, company, purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All', icon: Users },
              { id: 'visitors', label: 'Visitors', icon: UserCheck },
              { id: 'prebookings', label: 'Pre-bookings', icon: Calendar },
              { id: 'checked-in', label: 'Checked In', icon: UserCheck },
              { id: 'checked-out', label: 'Checked Out', icon: LogOut }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center px-2 py-1 rounded-lg transition-colors ${activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visitors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVisitors.map((visitor) => (
          <VisiVisitorCard
            key={visitor.id}
            visitor={visitor}
            onEdit={() => {
              setSelectedVisitor(visitor);
              setIsEditModalOpen(true);
            }}
            onDelete={() => handleDeleteVisitor(visitor.id)}
            onCheckOut={() => handleCheckOut(visitor.id)}
            onApprove={() => handleApproveVisitor(visitor.id)}
            onReject={() => handleRejectVisitor(visitor.id)}
          />
        ))}
      </div>

      {filteredVisitors.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-600">No visitors found</p>
          <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Modals */}
      <VisiAddVisitorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddVisitor}
      />

      <VisiEditVisitorModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVisitor(null);
        }}
        onSubmit={handleEditVisitor}
        visitor={selectedVisitor}
      />
    </div>
  );
}

export default VisiVisitorDashboard;
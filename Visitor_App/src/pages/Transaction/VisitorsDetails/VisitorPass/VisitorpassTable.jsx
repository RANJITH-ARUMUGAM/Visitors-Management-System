import React, { useState } from 'react';
import { Search, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle, Filter, Shield } from 'lucide-react';

const mockVisitors = [
  {
    id: 'V001',
    name: 'John Smith',
    purpose: 'Business Meeting',
    passType: 'daily',
    checkInTime: '09:15 AM',
    checkOutTime: null,
    status: 'active',
    contactNumber: '+1 234-567-8901',
    host: 'Sarah Johnson',
    passGenerated: true,
    passGeneratedTime: '09:10 AM'
  },
  {
    id: 'V002',
    name: 'Emily Davis',
    purpose: 'Interview',
    passType: 'daily',
    checkInTime: '10:30 AM',
    checkOutTime: '02:45 PM',
    status: 'checked-out',
    contactNumber: '+1 234-567-8902',
    host: 'Michael Chen',
    passGenerated: true,
    passGeneratedTime: '10:25 AM'
  },
  {
    id: 'V003',
    name: 'Robert Wilson',
    purpose: 'Contract Work',
    passType: 'weekly',
    checkInTime: '08:00 AM',
    checkOutTime: null,
    status: 'active',
    contactNumber: '+1 234-567-8903',
    host: 'Lisa Anderson',
    passGenerated: true,
    passGeneratedTime: '07:55 AM'
  },
  {
    id: 'V004',
    name: 'Maria Garcia',
    purpose: 'Delivery',
    passType: 'daily',
    checkInTime: '11:00 AM',
    checkOutTime: null,
    status: 'expired',
    contactNumber: '+1 234-567-8904',
    host: 'David Brown',
    passGenerated: true,
    passGeneratedTime: '10:55 AM'
  },
  {
    id: 'V005',
    name: 'James Taylor',
    purpose: 'Maintenance',
    passType: 'daily',
    checkInTime: '07:30 AM',
    checkOutTime: null,
    status: 'suspicious',
    contactNumber: '+1 234-567-8905',
    host: 'Jennifer White',
    passGenerated: true,
    passGeneratedTime: '07:25 AM'
  },
  {
    id: 'V006',
    name: 'Patricia Martinez',
    purpose: 'Training',
    passType: 'monthly',
    checkInTime: '09:00 AM',
    checkOutTime: null,
    status: 'active',
    contactNumber: '+1 234-567-8906',
    host: 'Robert Lee',
    passGenerated: true,
    passGeneratedTime: '08:55 AM'
  },
  {
    id: 'V007',
    name: 'Daniel Brown',
    purpose: 'Consultation',
    passType: 'daily',
    checkInTime: '11:30 AM',
    checkOutTime: null,
    status: 'active',
    contactNumber: '+1 234-567-8907',
    host: 'Amanda Wilson',
    passGenerated: true,
    passGeneratedTime: '11:25 AM'
  },
  {
    id: 'V008',
    name: 'Sophia Johnson',
    purpose: 'Site Tour',
    passType: 'daily',
    checkInTime: '02:00 PM',
    checkOutTime: '04:30 PM',
    status: 'checked-out',
    contactNumber: '+1 234-567-8908',
    host: 'Kevin Martinez',
    passGenerated: true,
    passGeneratedTime: '01:55 PM'
  }
];

const VisitorpassTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [visitors] = useState(mockVisitors);

  const visitorsWithPasses = visitors.filter(visitor => visitor.passGenerated);

  const filteredVisitors = visitorsWithPasses.filter(visitor => {
    const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || visitor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-gradient-to-r from-blue-100 to-emerald-100 text-blue-800 border border-blue-200',
      'checked-out': 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200',
      expired: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200',
      suspicious: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200'
    };

    const icons = {
      active: <CheckCircle className="h-3 w-3 mr-1" />,
      'checked-out': <XCircle className="h-3 w-3 mr-1" />,
      expired: <AlertCircle className="h-3 w-3 mr-1" />,
      suspicious: <AlertCircle className="h-3 w-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    );
  };

  const getPassTypeBadge = (type) => {
    const styles = {
      daily: 'bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 border border-blue-200',
      weekly: 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-200',
      monthly: 'bg-gradient-to-r from-purple-50 to-fuchsia-50 text-purple-700 border border-purple-200'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[type]}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const statusCounts = {
    all: visitorsWithPasses.length,
    active: visitorsWithPasses.filter(v => v.status === 'active').length,
    'checked-out': visitorsWithPasses.filter(v => v.status === 'checked-out').length,
    expired: visitorsWithPasses.filter(v => v.status === 'expired').length,
    suspicious: visitorsWithPasses.filter(v => v.status === 'suspicious').length
  };

  const getFilterButtonStyle = (status) => {
    const activeGradients = {
      all: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      active: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      'checked-out': 'bg-gradient-to-r from-gray-500 to-slate-600',
      expired: 'bg-gradient-to-r from-red-500 to-rose-600',
      suspicious: 'bg-gradient-to-r from-amber-500 to-yellow-600'
    };

    const inactiveGradients = {
      all: 'bg-gradient-to-r from-blue-500 to-indigo-100 hover:from-blue-200 hover:to-indigo-200',
      active: 'bg-gradient-to-r from-emerald-500 to-teal-100 hover:from-emerald-200 hover:to-teal-200',
      'checked-out': 'bg-gradient-to-r from-gray-500 to-slate-100 hover:from-gray-200 hover:to-slate-200',
      expired: 'bg-gradient-to-r from-red-500 to-rose-100 hover:from-red-200 hover:to-rose-200',
      suspicious: 'bg-gradient-to-r from-amber-500 to-yellow-100 hover:from-amber-200 hover:to-yellow-200'
    };

    return statusFilter === status
      ? `${activeGradients[status]} text-white shadow-md`
      : `${inactiveGradients[status]} text-gray-700`;
  };

  return (
    <div className="mt-10 border border-black rounded-lg overflow-hidden">
      <div className="p-3">
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="p-2 text-md font-bold text-gray-800 flex items-center px-2">
              <Shield className="h-6 w-6 mr-2 text-blue-500" />
              Generated Visitor Passes
            </h2>
            <div className="relative w-full lg:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search visitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-gray-50 border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-sm w-full"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center">
              <Filter className="h-5.5 w-5.5 text-blue-500 mr-1.5" />
              <span className="text-md font-bold text-gray-700">Filter by status:</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {['all', 'active', 'checked-out', 'expired', 'suspicious'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1.5 rounded-lg text-md font-semibold transition-all duration-200 flex items-center ${getFilterButtonStyle(status)}`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  <span className={`ml-1.5 text-[15px] px-1.5 py-0.5 rounded-full`}>
                    {statusCounts[status]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1024px]">
          <thead>
            <tr>
              <th>
                Pass ID
              </th>
              <th>
                Visitor
              </th>
              <th>
                Purpose
              </th>
              <th>
                Pass Type
              </th>
              <th>
                Generated
              </th>
              <th>
                Check In
              </th>
              <th>
                Check Out
              </th>
              <th>
                Status
              </th>
              <th>
                Host
              </th>
              <th>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100">
            {filteredVisitors.map((visitor, index) => (
              <tr key={visitor.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-gray-800">
                  {visitor.id}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div>
                    <div className="text-xs font-semibold text-gray-800">{visitor.name}</div>
                    <div className="text-[11px] text-gray-600">{visitor.contactNumber}</div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                  {visitor.purpose}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {getPassTypeBadge(visitor.passType)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs font-semibold text-blue-600">
                  {visitor.passGeneratedTime}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                  {visitor.checkInTime}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                  {visitor.checkOutTime || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {getStatusBadge(visitor.status)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                  {visitor.host}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex space-x-1">
                    <button
                      className="bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-600 p-1 rounded hover:shadow-sm transition-all duration-200"
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 text-emerald-600 p-1 rounded hover:shadow-sm transition-all duration-200"
                      title="Edit Pass"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="bg-gradient-to-r from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 text-red-600 p-1 rounded hover:shadow-sm transition-all duration-200"
                      title="Revoke Pass"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredVisitors.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500 text-xs font-medium">No generated passes found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default VisitorpassTable;
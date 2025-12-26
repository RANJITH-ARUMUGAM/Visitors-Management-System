import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, UserCheck, LogOut, Mail, Phone, Building, Calendar, Edit, Check, X, Clock, Briefcase, Car, CreditCard, MoreVertical, MapPin, AlertTriangle, User } from 'lucide-react';

export function VisiVisitorCard({ visitor, onEdit, onDelete, onCheckOut, onApprove, onReject }) {
  const [showActions, setShowActions] = useState(false);

  const getStatusConfig = () => {
    switch (visitor.status) {
      case 'checked-in':
        return {
          gradient: 'from-emerald-500 to-green-600',
          bgGradient: 'bg-gradient-to-br from-emerald-50 to-green-50',
          borderColor: 'border-emerald-200',
          textColor: 'text-emerald-700',
          icon: <UserCheck className="h-4 w-4" />,
          label: 'Checked In',
          shadow: 'shadow-emerald-100/50',
          hoverShadow: 'hover:shadow-emerald-200/60',
          bgLight: 'bg-emerald-50'
        };
      case 'checked-out':
        return {
          gradient: 'from-slate-500 to-gray-600',
          bgGradient: 'bg-gradient-to-br from-slate-50 to-gray-50',
          borderColor: 'border-slate-200',
          textColor: 'text-slate-700',
          icon: <LogOut className="h-4 w-4" />,
          label: 'Checked Out',
          shadow: 'shadow-slate-100/50',
          hoverShadow: 'hover:shadow-slate-200/60',
          bgLight: 'bg-slate-50'
        };
      case 'pre-booked':
        return {
          gradient: 'from-blue-500 to-indigo-600',
          bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          icon: <Calendar className="h-4 w-4" />,
          label: 'Pre Booked',
          shadow: 'shadow-blue-100/50',
          hoverShadow: 'hover:shadow-blue-200/60',
          bgLight: 'bg-blue-50'
        };
      case 'rejected':
        return {
          gradient: 'from-red-500 to-rose-600',
          bgGradient: 'bg-gradient-to-br from-red-50 to-rose-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          icon: <X className="h-4 w-4" />,
          label: 'Rejected',
          shadow: 'shadow-red-100/50',
          hoverShadow: 'hover:shadow-red-200/60',
          bgLight: 'bg-red-50'
        };
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          bgGradient: 'bg-gradient-to-br from-gray-50 to-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          icon: <Clock className="h-4 w-4" />,
          label: 'Unknown',
          shadow: 'shadow-gray-100/50',
          hoverShadow: 'hover:shadow-gray-200/60',
          bgLight: 'bg-gray-50'
        };
    }
  };

  const statusConfig = getStatusConfig();

  const formatSafeDate = (date) => {
    if (!date) return 'Not available';
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) return 'Invalid date';
      return format(parsedDate, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Date error';
    }
  };

  const getDisplayTime = () => {
    switch (visitor.status) {
      case 'checked-in':
        return `Check-in: ${formatSafeDate(visitor.checkIn)}`;
      case 'checked-out':
        return `Check-out: ${formatSafeDate(visitor.checkOut)}`;
      case 'pre-booked':
        return visitor.bookingDate ? `Scheduled: ${formatSafeDate(visitor.bookingDate)}` : 'Scheduled';
      default:
        return '';
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className={`group relative bg-white border-2 ${statusConfig.borderColor} ${statusConfig.shadow} ${statusConfig.hoverShadow} transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl overflow-hidden h-full flex flex-col`}>
      {/* Gradient Header */}
      <div className={`h-2 bg-gradient-to-r ${statusConfig.gradient} flex-shrink-0`} />

      {/* Main Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Header Section - Optimized for side-by-side */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar - Smaller for side-by-side */}
          <div className="relative flex-shrink-0">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${statusConfig.gradient} p-0.5 shadow-md`}>
              <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                {visitor.imageUrl && visitor.imageUrl !== 'N/A' ? (
                  <img
                    src={visitor.imageUrl}
                    alt={visitor.name}
                    className="w-full h-full rounded-xl object-cover"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${visitor.name}`;
                    }}
                  />
                ) : (
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-br from-slate-600 to-slate-800 bg-clip-text text-transparent">
                    {getInitials(visitor.name)}
                  </span>
                )}
              </div>
            </div>
            {/* Status Indicator */}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br ${statusConfig.gradient} border-2 border-white shadow-md`} />
          </div>

          {/* Visitor Info - Takes remaining space */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate">{visitor.name}</h3>
                <div className="flex items-center gap-1.5 text-slate-600 mt-0.5">
                  <Building className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="text-sm truncate">{visitor.company}</span>
                </div>
              </div>

              {/* Status Badge - Compact */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.bgGradient} ${statusConfig.textColor} border ${statusConfig.borderColor} flex-shrink-0`}>
                {statusConfig.icon}
                <span className="hidden sm:inline">{statusConfig.label}</span>
                <span className="sm:hidden">{statusConfig.label.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          {/* Actions Dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1.5">
                <button
                  onClick={() => {
                    onEdit();
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>

                {visitor.status === 'checked-in' && (
                  <button
                    onClick={() => {
                      onCheckOut();
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Check Out
                  </button>
                )}

                {visitor.status === 'pre-booked' && (
                  <>
                    <button
                      onClick={() => {
                        onApprove();
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        onReject();
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </>
                )}

                <hr className="my-1.5 border-slate-200" />

                <button
                  onClick={() => {
                    onDelete();
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information Grid - Optimized for side-by-side */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
              <Mail className="h-3 w-3 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 truncate">Email</p>
              <p className="text-xs font-medium text-slate-900 truncate">{visitor.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
              <Phone className="h-3 w-3 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500">Phone</p>
              <p className="text-xs font-medium text-slate-900 truncate">{visitor.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
              <User className="h-3 w-3 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500">To Meet</p>
              <p className="text-xs font-medium text-slate-900 truncate">{visitor.toMeet}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-3 w-3 text-orange-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500">Purpose</p>
              <p className="text-xs font-medium text-slate-900 truncate">{visitor.purpose}</p>
            </div>
          </div>
        </div>

        {/* Additional Information - Compact */}
        {(visitor.vehicleNo && visitor.vehicleNo !== 'N/A') || (visitor.idNumber && visitor.idNumber !== 'N/A') ? (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {visitor.vehicleNo && visitor.vehicleNo !== 'N/A' && (
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                  <Car className="h-3 w-3 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">Vehicle</p>
                  <p className="text-xs font-medium text-slate-900 truncate">{visitor.vehicleNo}</p>
                </div>
              </div>
            )}

            {visitor.idNumber && visitor.idNumber !== 'N/A' && (
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-6 h-6 bg-pink-100 rounded flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-3 w-3 text-pink-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">ID</p>
                  <p className="text-xs font-medium text-slate-900 truncate">{visitor.idNumber}</p>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Footer - Compact and optimized for side-by-side */}
        <div className="mt-auto pt-3 border-t border-slate-100">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{getDisplayTime()}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium truncate">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{visitor.location}</span>
              </span>

              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getRiskColor(visitor.risk)}`}>
                <AlertTriangle className="h-3 w-3" />
                {visitor.risk?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showActions && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
}
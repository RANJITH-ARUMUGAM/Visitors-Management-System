import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { SERVER_PORT } from '../../../constant';
import { FileText, User, Mail, Phone, Briefcase, Calendar, Clock, CreditCard, Car, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';

const ViewAppointment = ({ setTitle }) => {
  useEffect(() => {
    setTitle("View Appointment");
  }, []);

  const { id } = useParams();
  const [preBooking, setPreBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreBookingData = async () => {
      try {
        const response = await axios.get(`${SERVER_PORT}/preBookings/${id}`);
        if (response.data && response.data.success) {
          setPreBooking(response.data.data);
        } else {
          throw new Error("Pre-booking not found");
        }
      } catch (err) {
        setError(err.message || "Failed to load pre-booking data");
        console.error("Error fetching pre-booking:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreBookingData();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.put(`${SERVER_PORT}/updateappointments/${id}`, {
        gms_status: newStatus
      });
      // Refresh data
      const response = await axios.get(`${SERVER_PORT}/preBookings/${id}`);
      setPreBooking(response.data.data);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid date";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Error formatting time:", e);
      return "Invalid time";
    }
  };


  const sendWhatsAppMessage = () => {
    if (!preBooking?.gms_mobileno) {
      alert("Visitor phone number not available");
      return;
    }

    // Format phone number (remove any non-digit characters)
    const phoneNumber = preBooking.gms_mobileno.replace(/\D/g, '');
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    // Open in new tab
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading pre-booking data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!preBooking) {
    return <div className="p-4 text-center">Pre-booking not found</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-2 mt-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start mb-6 gap-6">

        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-teal-600 to-blue-700 flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-white">
          <img
            src={`${SERVER_PORT}/visitor-image/${preBooking.gms_gateentry_id || preBooking.id}`}
            alt={preBooking.gms_visitor_name || "Visitor"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '';
              e.target.parentElement.classList.add('bg-gradient-to-br', 'from-teal-400', 'to-blue-500');
            }}
          />
        </div>

        <div className="w-full md:w-auto md:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {preBooking.gms_visitor_name || "N/A"}
          </h1>
          <p className="text-gray-600 mb-1">
            <Mail className="inline mr-2" size={16} />
            {preBooking.gms_email || "N/A"}
          </p>
          <p className="text-gray-600">
            <Phone className="inline mr-2" size={16} />
            {preBooking.gms_phone_number || "N/A"}
          </p>
          {preBooking.gms_status === "Pending" && (
            <div className="flex gap-4">
              <button className="px-6 py-2 bg-green-500 text-white font-semibold rounded-md flex items-center gap-2 hover:bg-green-600 transition-colors" onClick={() => handleStatusUpdate("Accepted")}>Accept</button>
              <button className="px-6 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors" onClick={() => handleStatusUpdate("Rejected")}>Reject</button>
            </div>
          )}

          {preBooking.gms_status === "Accepted" && !preBooking.gms_outtime && (
            <div className="flex gap-4">
              <button className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md flex items-center gap-2 hover:bg-blue-600 transition-colors" onClick={sendWhatsAppMessage}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21l1.9-5.7a8.5 8.5 0 113.8 3.8z"></path>
                </svg>
                Send WhatsApp
              </button>
            </div>
          )}
        </div>

        <div className="ml-auto flex flex-col items-end">
          <span className={`px-3 py-1 rounded-full text-sm font-medium mb-3 ${preBooking.gms_status === "pending" ? "bg-yellow-100 text-yellow-800" :
            preBooking.gms_status === "approved" ? "bg-green-100 text-green-800" :
              preBooking.gms_status === "rejected" ? "bg-red-100 text-red-800" :
                "bg-gray-100 text-gray-800"
            }`}>
            {preBooking.gms_status?.toUpperCase() || "N/A"}
          </span>

          {preBooking.gms_status === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate("approved")}
                className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center gap-1 hover:bg-green-600"
              >
                <CheckCircle size={16} />
                Approve
              </button>
              <button
                onClick={() => handleStatusUpdate("rejected")}
                className="px-4 py-2 bg-red-500 text-white rounded-md flex items-center gap-1 hover:bg-red-600"
              >
                <XCircle size={16} />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-gray-200 my-6"></div>

      {/* Details Section */}
      <div>
        <div className="border rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-800">Pre-Booking Details</h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="p-1 border-b border-r bg-gray-50 font-medium w-1/4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-600" />
                    Visitor Name
                  </div>
                </td>
                <td className="p-1 border-b">{preBooking.gms_visitor_name || "N/A"}</td>
                <td className="p-1 border-b border-r bg-gray-50 font-medium w-1/4">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-gray-600" />
                    Company
                  </div>
                </td>
                <td className="p-1 border-b">{preBooking.gms_visitor_from || "N/A"}</td>
              </tr>
              <tr>
                <td className="p-1 border-b border-r bg-gray-50 font-medium">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-600" />
                    Phone
                  </div>
                </td>
                <td className="p-1 border-b">{preBooking.gms_phone_number || "N/A"}</td>
                <td className="p-1 border-b border-r bg-gray-50 font-medium">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-600" />
                    Email
                  </div>
                </td>
                <td className="p-1 border-b">{preBooking.gms_email || "N/A"}</td>
              </tr>
              <tr>
                <td className="p-1 border-b border-r bg-gray-50 font-medium">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-600" />
                    To Meet
                  </div>
                </td>
                <td className="p-1 border-b">{preBooking.gms_to_meet || "N/A"}</td>
                <td className="p-1 border-b border-r bg-gray-50 font-medium">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-600" />
                    Purpose
                  </div>
                </td>
                <td className="p-1 border-b">{preBooking.gms_purpose || "N/A"}</td>
              </tr>
              <tr>
                <td className="p-1 border-b border-r bg-gray-50 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-600" />
                    Booking Date
                  </div>
                </td>
                <td className="p-1 border-b">{formatDate(preBooking.gms_booking_date)}</td>
                <td className="p-1 border-b border-r bg-gray-50 font-medium">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-600" />
                    Booking Time
                  </div>
                </td>
                <td className="p-1 border-b">{formatTime(preBooking.gms_booking_time)}</td>
              </tr>
              <tr>
                <td className="p-1 border-b border-r bg-gray-50 font-medium">
                  <div className="flex items-center gap-2">
                    <ClockIcon size={16} className="text-gray-600" />
                    Expected Exit
                  </div>
                </td>
                <td className="p-1 border-b">{formatTime(preBooking.gms_expected_exit_time)}</td>
                <td className="p-1 border-b border-r bg-gray-50 font-medium">
                  <div className="flex items-center gap-2">
                    <Car size={16} className="text-gray-600" />
                    Vehicle No
                  </div>
                </td>
                <td className="p-1 border-b">{preBooking.gms_vehicle_no || "N/A"}</td>
              </tr>
              <tr>
                <td className="p-1 border-b border-r bg-gray-50 font-medium">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-gray-600" />
                    ID Type
                  </div>
                </td>
                <td className="p-1 border-b">{preBooking.gms_id_type || "N/A"}</td>
                <td className="p-1 border-b border-r bg-gray-50 font-medium">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-gray-600" />
                    ID Number
                  </div>
                </td>
                <td className="p-1 border-b">{preBooking.gms_id_number || "N/A"}</td>
              </tr>
              <tr>
                <td className="p-1 border-r bg-gray-50 font-medium">
                  <div className="flex items-center gap-2">
                    <ClockIcon size={16} className="text-gray-600" />
                    Created At
                  </div>
                </td>
                <td className="p-1 border-r bg-gray-50 font-small">
                  {new Date(preBooking.gms_created_at).toLocaleString()}
                </td>
                <td >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewAppointment;
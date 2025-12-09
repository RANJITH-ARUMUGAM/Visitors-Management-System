import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SERVER_PORT } from '../../../constant';
import { User, Phone, Mail, Building, Calendar, Clock, CreditCard, Car } from 'lucide-react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white p-6 rounded-xl shadow-md ${className}`}>
    {children}
  </div>
);

const EditAppointment = ({ setTitle }) => {
  useEffect(() => {
    setTitle("Edit Pre-Booking");
  }, []);

  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null });

  const [preBooking, setPreBooking] = useState({
    gms_visitor_name: '',
    gms_phone_number: '',
    gms_email: '',
    gms_visitor_from: '',
    gms_to_meet: '',
    gms_purpose: '',
    gms_booking_date: '',
    gms_booking_time: '',
    gms_expected_exit_time: '',
    gms_id_type: '',
    gms_id_number: '',
    gms_vehicle_no: '',
    gms_status: 'pending'
  });

  // Fetch pre-booking data
  useEffect(() => {
    const fetchPreBookingData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${SERVER_PORT}/preBookings/${id}`);

        if (response.data && response.data.success) {
          const data = response.data.data;
          setPreBooking({
            gms_visitor_name: data.gms_visitor_name || '',
            gms_phone_number: data.gms_phone_number || '',
            gms_email: data.gms_email || '',
            gms_visitor_from: data.gms_visitor_from || '',
            gms_to_meet: data.gms_to_meet || '',
            gms_purpose: data.gms_purpose || '',
            gms_booking_date: data.gms_booking_date || '',
            gms_booking_time: data.gms_booking_time || '',
            gms_expected_exit_time: data.gms_expected_exit_time || '',
            gms_id_type: data.gms_id_type || '',
            gms_id_number: data.gms_id_number || '',
            gms_vehicle_no: data.gms_vehicle_no || '',
            gms_status: data.gms_status || 'pending'
          });
        } else {
          throw new Error("No pre-booking data found");
        }
      } catch (error) {
        console.error("Error fetching pre-booking data:", error);
        setSubmitStatus({ loading: false, error: "Failed to load pre-booking data. Please try again." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreBookingData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreBooking(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'gms_visitor_name', 'gms_phone_number', 'gms_email',
      'gms_visitor_from', 'gms_to_meet', 'gms_purpose',
      'gms_booking_date', 'gms_booking_time', 'gms_id_type', 'gms_id_number'
    ];

    requiredFields.forEach(field => {
      if (!preBooking[field]?.trim()) {
        newErrors[field] = "This field is required";
      }
    });

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (preBooking.gms_email && !emailPattern.test(preBooking.gms_email)) {
      newErrors.gms_email = "Please enter a valid email address";
    }

    const phonePattern = /^\d{10,15}$/;
    if (preBooking.gms_phone_number && !phonePattern.test(preBooking.gms_phone_number.replace(/\D/g, ''))) {
      newErrors.gms_phone_number = "Please enter a valid phone number (10-15 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitStatus({ loading: true, error: null });
      const response = await axios.put(
        `${SERVER_PORT}/pre-bookings/${id}`,
        preBooking
      );

      if (response.data.success) {
        setSubmitStatus({ loading: false, error: null });
        alert('Pre-booking updated successfully');
        navigate('/pre-bookings');
      } else {
        throw new Error(response.data.message || "Failed to update pre-booking");
      }
    } catch (error) {
      setSubmitStatus({
        loading: false,
        error: error.response?.data?.message || error.message || "Error updating pre-booking"
      });
      console.error('Update error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/pre-bookings');
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading Appointment data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 overflow-hidden">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 rounded-xl shadow mt-1">Visitor Information</h2>
      <Card className="w-full p-2 relative mx-0">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Visitor Information */}
          <div className="relative">
            <label className="block text-sm font-small text-gray-800 mb-1">
              Visitor Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="gms_visitor_name"
                value={preBooking.gms_visitor_name}
                onChange={handleChange}
                className={`w-full pl-10 p-1 border text-sm rounded-md ${errors.gms_visitor_name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.gms_visitor_name && (
                <p className="mt-1 text-sm text-red-600">{errors.gms_visitor_name}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-small text-gray-800 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                name="gms_phone_number"
                value={preBooking.gms_phone_number}
                onChange={handleChange}
                className={`w-full pl-10 p-1 border text-sm rounded-md ${errors.gms_phone_number ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="1234567890"
              />
              {errors.gms_phone_number && (
                <p className="mt-1 text-sm text-red-600">{errors.gms_phone_number}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-small text-gray-800 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="gms_email"
                value={preBooking.gms_email}
                onChange={handleChange}
                className={`w-full pl-10 p-1 border text-sm rounded-md ${errors.gms_email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.gms_email && (
                <p className="mt-1 text-sm text-red-600">{errors.gms_email}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-small text-gray-800 mb-1">
              Visitor From (Company/City) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="gms_visitor_from"
                value={preBooking.gms_visitor_from}
                onChange={handleChange}
                className={`w-full pl-10 p-1 border text-sm rounded-md ${errors.gms_visitor_from ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.gms_visitor_from && (
                <p className="mt-1 text-sm text-red-600">{errors.gms_visitor_from}</p>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="md:col-span-4 m-0 p-0">
            <h2 className="text-lg font-medium text-gray-800 border-b">
              Booking Details
            </h2>
          </div>

          <div className="relative">
            <label className="block text-sm font-small text-gray-800 mb-1">
              To Meet <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="gms_to_meet"
                value={preBooking.gms_to_meet}
                onChange={handleChange}
                className={`w-full pl-10 p-1 border text-sm rounded-md ${errors.gms_to_meet ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.gms_to_meet && (
                <p className="mt-1 text-sm text-red-600">{errors.gms_to_meet}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-small text-gray-800 mb-1">
              Purpose <span className="text-red-500">*</span>
            </label>
            <textarea
              name="gms_purpose"
              value={preBooking.gms_purpose}
              onChange={handleChange}
              rows={1}
              className={`w-full p-1 text-sm border rounded-md ${errors.gms_purpose ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.gms_purpose && (
              <p className="mt-1 text-sm text-red-600">{errors.gms_purpose}</p>
            )}
          </div>

          {/* <div className="relative">
            <label className="block text-sm font-small text-gray-800 mb-1">
              Booking Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                name="gms_booking_date"
                value={preBooking.gms_booking_date}
                onChange={handleChange}
                className={`w-full pl-10 p-1 border text-sm rounded-md ${errors.gms_booking_date ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.gms_booking_date && (
                <p className="mt-1 text-sm text-red-600">{errors.gms_booking_date}</p>
              )}
            </div>
          </div> */}

          <div className="relative">
            <label className="block text-sm font-small text-gray-800 mb-1">
              Booking Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="time"
                name="gms_booking_time"
                value={preBooking.gms_booking_time}
                onChange={handleChange}
                className={`w-full pl-10 p-1 border text-sm rounded-md ${errors.gms_booking_time ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.gms_booking_time && (
                <p className="mt-1 text-sm text-red-600">{errors.gms_booking_time}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-small text-gray-800 mb-1">
              Expected Exit Time
            </label>
            <div className="relative">
              <input
                type="time"
                name="gms_expected_exit_time"
                value={preBooking.gms_expected_exit_time}
                onChange={handleChange}
                className="w-full pl-10 p-1 border text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Identification Details */}
          <div className="md:col-span-4 p-0 m-0">
            <h2 className="text-lg font-medium text-gray-800 border-b">
              Identification Details
            </h2>
          </div>

          <div className="relative p-0 m-0">
            <label className="block text-sm font-small text-gray-800 mb-1">
              ID Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="gms_id_type"
                value={preBooking.gms_id_type}
                onChange={handleChange}
                className={`w-full pl-10 p-1 border text-sm rounded-md ${errors.gms_id_type ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select ID Type</option>
                <option value="Aadhar">Aadhar Card</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Other">Other</option>
              </select>
              {errors.gms_id_type && (
                <p className="mt-1 text-sm text-red-600">{errors.gms_id_type}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-small text-gray-800 mb-1">
              ID Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="gms_id_number"
                value={preBooking.gms_id_number}
                onChange={handleChange}
                className={`w-full pl-10 p-1 border text-sm rounded-md ${errors.gms_id_number ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.gms_id_number && (
                <p className="mt-1 text-sm text-red-600">{errors.gms_id_number}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-small text-gray-800 mb-1">
              Vehicle Number
            </label>
            <div className="relative">
              <input
                type="text"
                name="gms_vehicle_no"
                value={preBooking.gms_vehicle_no}
                onChange={handleChange}
                className="w-full pl-10 p-1 border text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Status */}
          <div className="relative">  
            <label className="block text-sm font-small text-gray-800">
              Status
            </label>
            <select
              name="gms_status"
              value={preBooking.gms_status}
              onChange={handleChange}
              className="w-full p-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-4 flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitStatus.loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 transition-colors"
            >
              {submitStatus.loading ? 'Saving...' : 'Save'}
            </button>
          </div>

          {submitStatus.error && (
            <div className="md:col-span-2 p-3 bg-red-100 text-red-700 rounded-md">
              {submitStatus.error}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default EditAppointment;
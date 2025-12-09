import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { SERVER_PORT } from '../../../constant';



// If lucide-react is not available, these can be replaced with simple SVG icons or emojis.
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const PhoneIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>);
const MailIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>);
const BuildingIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building"><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>);
const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>);
const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const CarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-car"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.6-.4-1-1-1h-1V9c0-.6-.4-1-1-1H9c-.6 0-1 .4-1 1v4H2c-.6 0-1 .4-1 1v3c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>);
const IdCardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>);


const Appointment = () => {
    const [formData, setFormData] = useState({
        gms_visitor_name: '',
        gms_phone_number: '',
        gms_email: '',
        gms_visitor_from: '',
        gms_to_meet: '',
        gms_purpose: '',
        gms_booking_date: '',
        gms_booking_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        gms_expected_exit_time: '',
        gms_id_type: '',
        gms_id_number: '',
        gms_vehicle_no: '',
    });

    const [bookings, setBookings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = [
            'gms_visitor_name', 'gms_phone_number', 'gms_email',
            'gms_visitor_from', 'gms_to_meet', 'gms_purpose',
            'gms_booking_date', 'gms_booking_time', 'gms_id_type', 'gms_id_number'
        ];

        const missingFields = requiredFields.filter(field => !formData[field]);
        if (missingFields.length > 0) {
            setModalMessage(`Please fill in all required fields: ${missingFields.join(', ').replace(/gms_/g, '').replace(/_/g, ' ')}`);
            setShowModal(true);
            return;
        }

        // Prepare data for backend
        const dataToSend = {
            visitor_name: formData.gms_visitor_name,
            phone_number: formData.gms_phone_number,
            email: formData.gms_email,
            visitor_from: formData.gms_visitor_from,
            to_meet: formData.gms_to_meet,
            purpose: formData.gms_purpose,
            booking_date: formData.gms_booking_date,
            booking_time: formData.gms_booking_time,
            expected_exit_time: formData.gms_expected_exit_time || null,
            id_type: formData.gms_id_type,
            id_number: formData.gms_id_number,
            vehicle_no: formData.gms_vehicle_no || null
        };

        try {
            const response = await axios.post(`${SERVER_PORT}/appointments`, dataToSend);

            if (response.data) {
                setModalMessage(`Booking successfully submitted! ID: ${response.data.booking_id}`);
                // Add to bookings list with proper field names
                setBookings(prev => [...prev, {
                    gms_pre_booking_id: response.data.booking_id,
                    gms_visitor_name: formData.gms_visitor_name,
                    gms_phone_number: formData.gms_phone_number,
                    gms_email: formData.gms_email,
                    gms_visitor_from: formData.gms_visitor_from,
                    gms_to_meet: formData.gms_to_meet,
                    gms_purpose: formData.gms_purpose,
                    gms_booking_date: formData.gms_booking_date,
                    gms_booking_time: formData.gms_booking_time,
                    gms_expected_exit_time: formData.gms_expected_exit_time,
                    gms_id_type: formData.gms_id_type,
                    gms_id_number: formData.gms_id_number,
                    gms_vehicle_no: formData.gms_vehicle_no,
                    gms_status: response.data.status,
                    gms_created_at: new Date().toISOString()
                }]);

                // Reset form
                setFormData({
                    gms_visitor_name: '',
                    gms_phone_number: '',
                    gms_email: '',
                    gms_visitor_from: '',
                    gms_to_meet: '',
                    gms_purpose: '',
                    gms_booking_date: '',
                    gms_booking_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                    gms_expected_exit_time: '',
                    gms_id_type: '',
                    gms_id_number: '',
                    gms_vehicle_no: '',
                });
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Could not connect to the server';
            setModalMessage(`Error: ${errorMsg}`);
        } finally {
            setShowModal(true);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setModalMessage('');
    };

    return (
        <div className="min-h-screen mt-1">
            <div className="shadow-xl rounded-xl p-1 sm:p-8 lg:p-10">
                <h1 className="text-3xl sm:text-4xl font-semibold text-center text-indigo-600 mb-4">
                    Appointments Here!
                </h1>

                {/* Visitor Details */}
                <h2 className="text-xl font-semibold text-indigo-600 border-b mb-3">Visitor Information</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <label htmlFor="gms_visitor_name" className="block text-xs font-medium text-gray-700 mb-1">Visitor Name <span className="text-red-500">*</span></label>
                        <div className="relative flex items-center gap-1">
                            <UserIcon className="absolute left-3 text-gray-400" />
                            <input
                                type="text"
                                id="gms_visitor_name"
                                name="gms_visitor_name"
                                value={formData.gms_visitor_name}
                                onChange={handleChange}
                                className="pl-3 text-xs py-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="gms_phone_number" className="block text-xs font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                        <div className="relative flex items-center gap-1">
                            <PhoneIcon className="absolute left-3 text-gray-400" />
                            <input
                                type="tel"
                                id="gms_phone_number"
                                name="gms_phone_number"
                                value={formData.gms_phone_number}
                                onChange={handleChange}
                                className="pl-3 text-xs py-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                placeholder="+1234567890"
                                required
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="gms_email" className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <div className="relative flex items-center gap-1">
                            <MailIcon className="absolute left-3 text-gray-400" />
                            <input
                                type="email"
                                id="gms_email"
                                name="gms_email"
                                value={formData.gms_email}
                                onChange={handleChange}
                                className="pl-3 text-xs py-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                placeholder="john.doe@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="gms_visitor_from" className="block text-xs font-medium text-gray-700 mb-1">Visitor From (Company/City) <span className="text-red-500">*</span></label>
                        <div className="relative flex items-center gap-1">
                            <BuildingIcon className="absolute left-3 text-gray-400" />
                            <input
                                type="text"
                                id="gms_visitor_from"
                                name="gms_visitor_from"
                                value={formData.gms_visitor_from}
                                onChange={handleChange}
                                className="pl-3 text-xs py-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                placeholder="Acme Corp / New York"
                                required
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="gms_to_meet" className="block text-xs font-medium text-gray-700 mb-1">To Meet (Employee Name) <span className="text-red-500">*</span></label>
                        <div className="relative flex items-center gap-1">
                            <UserIcon className="absolute left-3 text-gray-400" />
                            <input
                                type="text"
                                id="gms_to_meet"
                                name="gms_to_meet"
                                value={formData.gms_to_meet}
                                onChange={handleChange}
                                className="pl-3 text-xs py-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                placeholder="Jane Smith"
                                required
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="gms_purpose" className="block text-xs font-medium text-gray-700 mb-1">Purpose of Visit <span className="text-red-500">*</span></label>
                        <textarea
                            id="gms_purpose"
                            name="gms_purpose"
                            value={formData.gms_purpose}
                            onChange={handleChange}
                            rows="1"
                            className="text-xs pl-3 py-4 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                            placeholder="Meeting with Jane Smith regarding project X"
                            required
                        ></textarea>
                    </div>

                    {/* Booking Details */}
                    <div className="md:col-span-4 mb-0">
                        <h2 className="text-xl font-semibold text-indigo-600 border-b mb-0">Booking Details</h2>
                    </div>

                    <div className="relative mb-0">
                        <label htmlFor="gms_booking_date" className="block text-xs font-medium text-gray-700 mb-1">Booking Date <span className="text-red-500">*</span></label>
                        <div className="relative flex items-center gap-1">
                            <CalendarIcon className="absolute left-3 text-gray-400" />
                            <input
                                type="date"
                                id="gms_booking_date"
                                name="gms_booking_date"
                                value={formData.gms_booking_date}
                                onChange={handleChange}
                                className="pl-3 text-xs py-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                required
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="gms_booking_time" className="block text-xs font-medium text-gray-700 mb-1">Booking Time <span className="text-red-500">*</span></label>
                        <div className="relative flex items-center gap-1">
                            <ClockIcon className="absolute left-3 text-gray-400" />
                            <input
                                type="time"
                                id="gms_booking_time"
                                name="gms_booking_time"
                                value={formData.gms_booking_time}
                                onChange={handleChange}
                                className="pl-3 text-xs py-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                disabled
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="gms_expected_exit_time" className="block text-xs font-medium text-gray-700 mb-1">Expected Exit Time</label>
                        <div className="relative flex items-center gap-1">
                            <ClockIcon className="absolute left-3 text-gray-400" />
                            <input
                                type="time"
                                id="gms_expected_exit_time"
                                name="gms_expected_exit_time"
                                value={formData.gms_expected_exit_time}
                                onChange={handleChange}
                                className="pl-3 text-xs py-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                            />
                        </div>
                    </div>

                    {/* ID and Vehicle Details */}
                    <div className="relative">
                        <label htmlFor="gms_id_type" className="block text-xs font-medium text-gray-700 mb-1">ID Type <span className="text-red-500">*</span></label>
                        <div className="relative flex items-center gap-1">
                            <IdCardIcon className="absolute left-3 text-gray-400" />
                            <select
                                id="gms_id_type"
                                name="gms_id_type"
                                value={formData.gms_id_type}
                                onChange={handleChange}
                                className="pl-3 text-xs py-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-white"
                                required
                            >
                                <option value="">Select ID Type</option>
                                <option value="Aadhar">Aadhar Card</option>
                                <option value="Passport">Passport</option>
                                <option value="DriversLicense">Driver's License</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="gms_id_number" className="block text-xs font-medium text-gray-700 mb-1">ID Number <span className="text-red-500">*</span></label>
                        <div className="relative flex items-center gap-1">
                            <IdCardIcon className="absolute left-3 text-gray-400" />
                            <input
                                type="text"
                                id="gms_id_number"
                                name="gms_id_number"
                                value={formData.gms_id_number}
                                onChange={handleChange}
                                className="pl-3 text-xs py-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                placeholder="1234 5678 9012"
                                required
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="gms_vehicle_no" className="block text-xs font-medium text-gray-700 mb-1">Vehicle Number (Optional)</label>
                        <div className="relative flex items-center gap-1">
                            <CarIcon className="absolute left-3 text-gray-400" />
                            <input
                                type="text"
                                id="gms_vehicle_no"
                                name="gms_vehicle_no"
                                value={formData.gms_vehicle_no}
                                onChange={handleChange}
                                className="pl-3 text-xs py-2.5 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                placeholder="AB12 CD3456"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-4 flex -mt-10 justify-end gap-3">
                        <button type="submit"
                            className="w-full sm:w-auto px-4 py-0 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                        >
                            Add 
                        </button>
                        <button type="cencel"
                            className="w-full sm:w-auto px-2 py-1 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                        >
                            Cencel
                        </button>
                    </div>
                </form>

                {/* Submitted Bookings Display (for demonstration) */}
                {bookings.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h2 className="text-xl font-semibold text-indigo-600 mb-4">Submitted Bookings (Demo)</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded-lg shadow-md">
                                <thead>
                                    <tr className="bg-indigo-50 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                                        <th className="px-4 py-3 rounded-tl-lg">Visitor Name</th>
                                        <th className="px-4 py-3">Purpose</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Time</th>
                                        <th className="px-4 py-3 rounded-tr-lg">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {bookings.map((booking) => (
                                        <tr key={booking.gms_pre_booking_id} className="hover:bg-gray-50 transition duration-150">
                                            <td className="px-4 py-3 whitespace-nowrap">{booking.gms_visitor_name}</td>
                                            <td className="px-4 py-3">{booking.gms_purpose}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{booking.gms_booking_date}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{booking.gms_booking_time}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    {booking.gms_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Custom Modal for Messages */}
                {showModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification</h3>
                            <p className="text-gray-700 mb-6">{modalMessage}</p>
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointment;

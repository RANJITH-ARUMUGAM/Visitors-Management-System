import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Phone, Briefcase, MapPin, FileText, Calendar, Clock, Award, UserCheck } from 'lucide-react';
import { SERVER_PORT } from '../../../constant';


const ViewVisitor = ({ setTitle }) => {

    useEffect(() => {
        setTitle("View Visitors");
    }, []);

    const { id } = useParams();
    const [visitor, setVisitor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVisitorData = async () => {
            try {
                const response = await axios.get(`${SERVER_PORT}/viewvisitors/${id}`);
                if (response.data && response.data.length > 0) {
                    setVisitor(response.data[0]);
                } else {
                    throw new Error("Visitor not found");
                }
            } catch (err) {
                setError(err.message || "Failed to load visitor data");
                console.error("Error fetching visitor:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVisitorData();
    }, [id]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            await axios.put(`${SERVER_PORT}/updateviewvisitorstatus/${id}`, {
                gms_status: newStatus
            });
            // Refresh visitor data
            const response = await axios.get(`${SERVER_PORT}/editvisitors/${id}`);
            setVisitor(response.data[0]);
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status");
        }
    };

    const handleCheckout = async () => {
        try {
            const checkoutTime = new Date().toISOString();
            await axios.put(`${SERVER_PORT}/updatevisitor/${id}`, {
                GMS_Outtime: checkoutTime,
                GMS_Status: "Checked Out"
            });
            // Refresh visitor data
            const response = await axios.get(`${SERVER_PORT}/editvisitors/${id}`);
            setVisitor(response.data[0]);
        } catch (err) {
            console.error("Error checking out visitor:", err);
            alert("Failed to check out visitor");
        }
    };

    const sendWhatsAppMessage = () => {
        if (!visitor?.gms_mobileno) {
            alert("Visitor phone number not available");
            return;
        }

        // Format phone number (remove any non-digit characters)
        const phoneNumber = visitor.gms_mobileno.replace(/\D/g, '');
        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/${phoneNumber}`;
        // Open in new tab
        window.open(whatsappUrl, '_blank');
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            console.error("Error formatting date:", e);
            return "Invalid date";
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading visitor data...</div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">
                <p>Error: {error}</p>
            </div>
        );
    }

    if (!visitor) {
        return <div className="p-4 text-center">Visitor not found</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-2 mt-2">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start mb-6 gap-6">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-teal-600 to-blue-700 flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-white">
                    <img src={`${SERVER_PORT}/visitor-image/${visitor.gms_gateentry_id || visitor.id}`} alt={visitor.gms_visitor_name || "Visitor"} className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '';
                            e.target.parentElement.classList.add('bg-gradient-to-br', 'from-teal-400', 'to-blue-500');
                        }}
                    />
                </div>
                <div className="flex flex-col items-center md:items-start">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">{visitor.gms_visitorname || "N/A"}</h1>
                    <p className="text-gray-600 mb-1">{visitor.gms_emailid || "N/A"}</p>
                    <p className="text-gray-600 mb-4">{visitor.gms_mobileno || "N/A"}</p>

                    {visitor.gms_status === "Pending" && (
                        <div className="flex gap-4">
                            <button
                                className="px-6 py-2 bg-green-500 text-white font-semibold rounded-md flex items-center gap-2 hover:bg-green-600 transition-colors"
                                onClick={() => handleStatusUpdate("Checked In")}
                            >
                                <UserCheck size={18} />
                                Accept
                            </button>
                            <button
                                className="px-6 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors"
                                onClick={() => handleStatusUpdate("Rejected")}
                            >
                                Reject
                            </button>
                        </div>
                    )}

                    {visitor.gms_status === "Accepted" && !visitor.gms_outtime && (
                        <div className="flex gap-4">
                            <button
                                className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md flex items-center gap-2 hover:bg-blue-600 transition-colors"
                                onClick={sendWhatsAppMessage}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 21l1.9-5.7a8.5 8.5 0 113.8 3.8z"></path>
                                </svg>
                                Send WhatsApp
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-px bg-gray-200 my-6"></div>

            <div>
                <div className="border rounded-lg overflow-hidden">
                    <h2 className="text-xl font-semibold text-gray-800">Basic Info</h2>
                    <table className="w-full border-collapse">
                        <tbody>
                            <tr>
                                <td className="p-1 border-b border-r bg-gray-50 font-small w-1/4">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-gray-600" />
                                        Name
                                    </div>
                                </td>
                                <td className="p-1 border-b w-1/4">{visitor.gms_visitorname || "N/A"}</td>
                                <td className="p-1 border-b border-r bg-gray-50 font-small w-1/4">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-gray-600" />
                                        E-Mail
                                    </div>
                                </td>
                                <td className="p-1 border-b w-1/4">{visitor.gms_emailid || "N/A"}</td>
                            </tr>
                            <tr>
                                <td className="p-1 border-b border-r bg-gray-50 font-small">
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-gray-600" />
                                        Phone
                                    </div>
                                </td>
                                <td className="p-1 border-b">{visitor.gms_mobileno || "N/A"}</td>
                                <td className="p-1 border-b border-r bg-gray-50 font-small">
                                    <div className="flex items-center gap-2">
                                        <UserCheck size={16} className="text-gray-600" />
                                        Employee
                                    </div>
                                </td>
                                <td className="p-1 border-b">{visitor.gms_tomeet || "N/A"}</td>
                            </tr>
                            <tr>
                                <td className="p-1 border-b border-r bg-gray-50 font-small">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-gray-600" />
                                        Purpose
                                    </div>
                                </td>
                                <td className="p-1 border-b">{visitor.gms_visitpurpose || "N/A"}</td>
                                <td className="p-1 border-b border-r bg-gray-50 font-small">
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={16} className="text-gray-600" />
                                        Company Name
                                    </div>
                                </td>
                                <td className="p-1 border-b">{visitor.gms_visitorfrom || "N/A"}</td>
                            </tr>
                            <tr>
                                <td className="p-1 border-b border-r bg-gray-50 font-small">
                                    <div className="flex items-center gap-2">
                                        <Award size={16} className="text-gray-600" />
                                        National ID
                                    </div>
                                </td>
                                <td className="p-1 border-b">{visitor.gms_identificationno || "N/A"}</td>
                                <td className="p-1 border-b border-r bg-gray-50 font-small">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-600" />
                                        Check-In
                                    </div>
                                </td>
                                <td className="p-1 border-b">{formatDate(visitor.gms_intime)}</td>
                            </tr>
                            <tr>
                                <td className="p-1 border-b border-r bg-gray-50 font-small">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-gray-600" />
                                        Status
                                    </div>
                                </td>
                                <td className="p-1 border-b font-small">
                                    <span className={`px-2 py-1 rounded-full text-sm font-small ${visitor.gms_status === "Pending" ? "bg-yellow-100 text-yellow-800 font-small" :
                                        visitor.gms_status === "Accepted" ? "bg-green-100 text-green-800 font-small" :
                                            visitor.gms_status === "Rejected" ? "bg-red-100 text-red-800 font-small" :
                                                visitor.gms_status === "Checked Out" ? "bg-blue-100 text-blue-800 font-small" :
                                                    "bg-gray-100 text-gray-800 font-small"
                                        }`}>
                                        {visitor.gms_status || "N/A"}
                                    </span>
                                </td>
                                <td className="p-1 border-b border-r bg-gray-50 font-small">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-gray-600" />
                                        Check-Out
                                    </div>
                                </td>
                                <td className="p-1 border-b">{formatDate(visitor.gms_outtime)}</td>
                            </tr>
                            <tr>
                                <td className="p-1 border-r bg-gray-50 font-small">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-gray-600" />
                                        Address
                                    </div>
                                </td>
                                <td className="p-1">{visitor.gms_address || "N/A"}</td>
                                <td ></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ViewVisitor;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SERVER_PORT } from '../../../constant';


const Card = ({ children, className = '' }) => (
  <div className={`bg-white p-6 rounded-xl shadow-md ${className}`}>
    {children}
  </div>
);

const EditVisitor = ({ setTitle }) => {
  useEffect(() => {
    setTitle("Visitors Details");
  }, []);

  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null });

  const [visitor, setVisitor] = useState({
    GMS_VisitorName: '',
    GMS_VisitorFrom: '',
    GMS_ToMeet: '',
    GMS_ToMeetEmail: '',
    GMS_VisitPurpose: '',
    GMS_VehicleNo: '',
    GMS_IdentificationType: '',
    GMS_IdentificationNo: '',
    GMS_MobileNo: '',
    GMS_EmailID: '',
  });

  // Fetch visitor data
  useEffect(() => {
    const fetchVisitorData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${SERVER_PORT}/editvisitors/${id}`);

        if (response.data && response.data.length > 0) {
          const visitorData = response.data[0];
          setVisitor({
            GMS_VisitorName: visitorData.gms_visitorname || '',
            GMS_VisitorFrom: visitorData.gms_visitorfrom || '',
            GMS_ToMeet: visitorData.gms_tomeet || '',
            GMS_ToMeetEmail: visitorData.gms_tomeetemail || 'NA',
            GMS_VisitPurpose: visitorData.gms_visitpurpose || '',
            GMS_VehicleNo: visitorData.gms_vehicleno || '',
            GMS_IdentificationType: visitorData.gms_identificationtype || '',
            GMS_IdentificationNo: visitorData.gms_identificationno || '',
            GMS_MobileNo: visitorData.gms_mobileno || '',
            GMS_EmailID: visitorData.gms_emailid || '',
          });
        } else {
          throw new Error("No visitor data found");
        }
      } catch (error) {
        console.error("Error fetching visitor data:", error);
        setSubmitStatus({ loading: false, error: "Failed to load visitor data. Please try again." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitorData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVisitor(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!visitor.GMS_VisitorName.trim()) {
      newErrors.GMS_VisitorName = "Visitor name is required";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (visitor.GMS_EmailID && !emailPattern.test(visitor.GMS_EmailID)) {
      newErrors.GMS_EmailID = "Please enter a valid email address";
    }

    if (visitor.GMS_ToMeetEmail && !emailPattern.test(visitor.GMS_ToMeetEmail)) {
      newErrors.GMS_ToMeetEmail = "Please enter a valid email address";
    }

    const phonePattern = /^\d{10}$/;
    if (visitor.GMS_MobileNo && !phonePattern.test(visitor.GMS_MobileNo.replace(/\D/g, ''))) {
      newErrors.GMS_MobileNo = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitStatus({ loading: true, error: null });
      const response = await axios.put(
        `${SERVER_PORT}/updatevisitor/${id}`,
        visitor
      );

      if (response.data.success) {
        setSubmitStatus({ loading: false, error: null });
        alert('Visitor updated successfully');
        navigate('/visitorsdetails/visitordetails');
      } else {
        throw new Error(response.data.message || "Failed to update visitor");
      }
    } catch (error) {
      setSubmitStatus({
        loading: false,
        error: error.response?.data?.message || error.message || "Error updating visitor"
      });
      console.error('Update error:', error);
    }
  };

  const handleCancel = () => {
    navigate('/visitorsdetails');
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading visitor data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow mt-4">Edit Visitor</h2>
      <Card className="w-full p-6 relative">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Row 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="GMS_VisitorName"
              value={visitor.GMS_VisitorName}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.GMS_VisitorName ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.GMS_VisitorName && (
              <p className="mt-1 text-sm text-red-600">{errors.GMS_VisitorName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visitor From
            </label>
            <input
              type="text"
              name="GMS_VisitorFrom"
              value={visitor.GMS_VisitorFrom}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Row 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Meet
            </label>
            <input
              type="text"
              name="GMS_ToMeet"
              value={visitor.GMS_ToMeet}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Meet Email
            </label>
            <input
              type="email"
              name="GMS_ToMeetEmail"
              value={visitor.GMS_ToMeetEmail}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.GMS_ToMeetEmail ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.GMS_ToMeetEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.GMS_ToMeetEmail}</p>
            )}
          </div>

          {/* Row 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <input
              type="text"
              name="GMS_VisitPurpose"
              value={visitor.GMS_VisitPurpose}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle No
            </label>
            <input
              type="text"
              name="GMS_VehicleNo"
              value={visitor.GMS_VehicleNo}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Row 4 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Type
            </label>
            <select
              name="GMS_IdentificationType"
              value={visitor.GMS_IdentificationType}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select ID Type</option>
              <option value="Passport">Passport</option>
              <option value="Driver's License">Driver's License</option>
              <option value="National ID">National ID</option>
              <option value="Company ID">Company ID</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Number
            </label>
            <input
              type="text"
              name="GMS_IdentificationNo"
              value={visitor.GMS_IdentificationNo}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Row 5 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="GMS_MobileNo"
              value={visitor.GMS_MobileNo}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.GMS_MobileNo ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., 1234567890"
            />
            {errors.GMS_MobileNo && (
              <p className="mt-1 text-sm text-red-600">{errors.GMS_MobileNo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="GMS_EmailID"
              value={visitor.GMS_EmailID}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.GMS_EmailID ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.GMS_EmailID && (
              <p className="mt-1 text-sm text-red-600">{errors.GMS_EmailID}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700" >
              Save
            </button>
          </div>
        </form>
      </Card >
    </div>
  );
};

export default EditVisitor; 
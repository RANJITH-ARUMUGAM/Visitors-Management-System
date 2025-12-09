import React, { useState, useEffect } from 'react';
import { ScanEye } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { SERVER_PORT } from '../../../constant';
import axios from 'axios';


const Card = ({ children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-md ${className}`}>
        {children}
    </div>
);

const EditLogVehicleEntry = ({ setTitle }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [vehicle, setVehicle] = useState(null);

    const [formData, setFormData] = useState({
        vehicleNumber: '',
        driverName: '',
        driverContactNumber: '',
        vehicleType: 'Car',
        purposeOfEntry: '',
        entryTime: new Date().toISOString().slice(0, 16),
        expectedExitTime: '',
        status: 'IN',
        securityCheck: 'Pending',
    });


    useEffect(() => {
        setTitle("Edit Vehicle Entry");
        fetchVehicle();
    }, [id, setTitle]);

    const fetchVehicle = async () => {
        try {
            const response = await axios.get(`${SERVER_PORT}/Editvehicle-entry/${id}`);
            const vehicleData = response.data;

            setVehicle(vehicleData); 

            setFormData({
                vehicleNumber: vehicleData.GMS_vehicle_number,
                driverName: vehicleData.GMS_driver_name,
                driverContactNumber: vehicleData.GMS_driver_contact_number,
                vehicleType: vehicleData.GMS_vehicle_type,
                purposeOfEntry: vehicleData.GMS_purpose_of_entry,
                entryTime: new Date(vehicleData.GMS_entry_time).toISOString().slice(0, 16),
                expectedExitTime: vehicleData.GMS_expected_exit_time
                    ? new Date(vehicleData.GMS_expected_exit_time).toISOString().slice(0, 16)
                    : '',
                status: vehicleData.GMS_status,
                securityCheck: vehicleData.GMS_security_check,
            });

        } catch (err) {
            console.error("Error fetching vehicle:", err);
            setError("Unable to fetch vehicle data.");
        } finally {
            setLoading(false);
        }
    };


    const [showScanner, setShowScanner] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${SERVER_PORT}/Editvehicle-entry/${id}`, {
                GMS_vehicle_number: formData.vehicleNumber,
                GMS_driver_name: formData.driverName,
                GMS_driver_contact_number: formData.driverContactNumber,
                GMS_vehicle_type: formData.vehicleType,
                GMS_purpose_of_entry: formData.purposeOfEntry,
                GMS_entry_time: formData.entryTime,
                GMS_expected_exit_time: formData.expectedExitTime,
                GMS_status: formData.status,
                GMS_security_check: formData.securityCheck,
            });
            navigate('/LogVehicleEntryModul');
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to update vehicle entry");
        }
    };


    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow mt-4">Edit Vehicle Entry</h2>
            <Card className="w-full p-6 relative mx-auto">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Vehicle Number */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Vehicle Number *</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                name="vehicleNumber"
                                value={formData.vehicleNumber}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowScanner(true)}
                                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                <ScanEye size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Driver Information */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Driver Name *</label>
                        <input
                            type="text"
                            name="driverName"
                            value={formData.driverName}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Driver Contact</label>
                        <input
                            type="tel"
                            name="driverContactNumber"
                            value={formData.driverContactNumber}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    {/* Vehicle Details */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle Type *</label>
                        <select
                            name="vehicleType"
                            value={formData.vehicleType}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        >
                            <option value="Car">Car</option>
                            <option value="Van">Van</option>
                            <option value="Truck">Truck</option>
                            <option value="Bike">Bike</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Purpose *</label>
                        <input
                            type="text"
                            name="purposeOfEntry"
                            value={formData.purposeOfEntry}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>

                    {/* Time Information */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Entry Time *</label>
                        <input
                            type="datetime-local"
                            name="entryTime"
                            value={formData.entryTime}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Expected Exit</label>
                        <input
                            type="datetime-local"
                            name="expectedExitTime"
                            value={formData.expectedExitTime}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    {/* Status and Security */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status *</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        >
                            <option value="IN">IN</option>
                            <option value="OUT">OUT</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Security Check *</label>
                        <select
                            name="securityCheck"
                            value={formData.securityCheck}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        >
                            <option value="Cleared">Cleared</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/LogVehicleEntryModul')}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default EditLogVehicleEntry;
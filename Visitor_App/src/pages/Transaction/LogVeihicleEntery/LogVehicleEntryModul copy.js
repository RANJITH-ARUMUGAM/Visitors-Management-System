import React, { useState, useEffect } from 'react';
import { Plus, Download, Truck, ArrowDownCircle, ArrowUpCircle, Clock, ScanEye } from 'lucide-react';




const Card = ({ children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-md ${className}`}>
        {children}
    </div>
);

const SectionTitle = ({ children, className = '' }) => (
    <h2 className={`text-xl font-semibold text-gray-800 mb-4 ${className}`}>
        {children}
    </h2>
);

const Badge = ({ status }) => {
    let colorClass = '';
    let text = '';
    switch (status) {
        case 'Checked-in':
            colorClass = 'bg-green-100 text-green-800';
            text = 'Checked-in';
            break;
        case 'Checked-out':
            colorClass = 'bg-red-100 text-red-800';
            text = 'Checked-out';
            break;
        case 'Pending':
            colorClass = 'bg-yellow-100 text-yellow-800';
            text = 'Pending';
            break;
        case 'IN':
            colorClass = 'bg-green-100 text-green-800';
            text = 'IN';
            break;
        case 'OUT':
            colorClass = 'bg-red-100 text-red-800';
            text = 'OUT';
            break;
        case 'Cleared':
            colorClass = 'bg-green-100 text-green-800';
            text = 'Cleared';
            break;
        case 'Pending': // For security check status
            colorClass = 'bg-yellow-100 text-yellow-800';
            text = 'Pending';
            break;
        default:
            colorClass = 'bg-gray-100 text-gray-800';
            text = status;
    }
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {text}
        </span>
    );
};

// --- Dummy Data (Moved from App.js, specific to this module if not shared) ---
const mockVehicleData = [
    { id: 1, number: 'KA01AB1234', type: 'Car', driver: 'Driver One', driverContactNumber: '9876543210', purpose: 'Meeting', entry: '2025-07-09T10:00', expectedExit: '2025-07-09T13:00', status: 'IN', attachments: [], securityCheck: 'Cleared' },
    { id: 2, number: 'TN05CD5678', type: 'Truck', driver: 'Driver Two', driverContactNumber: '9876543211', purpose: 'Delivery', entry: '2025-07-09T10:30', expectedExit: '2025-07-09T12:00', status: 'IN', attachments: [], securityCheck: 'Pending' },
    { id: 3, number: 'MH12EF9012', type: 'Bike', driver: 'Employee: John Doe', driverContactNumber: '9876543212', purpose: 'Work', entry: '2025-07-09T09:00', expectedExit: '2025-07-09T17:10', status: 'OUT', attachments: [], securityCheck: 'Cleared' },
    { id: 4, number: 'DL01EF7890', type: 'Van', driver: 'Sarah Connor', driverContactNumber: '9876543213', purpose: 'Pickup', entry: '2025-07-08T14:00', expectedExit: '2025-07-08T16:00', status: 'OUT', attachments: [], securityCheck: 'Cleared' },
    { id: 5, number: 'UP65GH1234', type: 'Truck', driver: 'Mike Ross', driverContactNumber: '9876543214', purpose: 'Material Drop', entry: '2025-07-09T11:00', expectedExit: '2025-07-09T14:00', status: 'IN', attachments: [], securityCheck: 'Cleared' },
];


const VehicleScanner = ({ onScanSuccess, onClose, setTitle }) => {

    useEffect(() => {
        setTitle("Cards");
    }, []);

    useEffect(() => {
        // Ensure Html5QrcodeScanner is available globally
        if (typeof window.Html5QrcodeScanner === 'undefined') {
            console.error("Html5QrcodeScanner is not loaded. Please ensure the CDN script is included in your main App component.");
            return;
        }

        const html5QrCode = new window.Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
        );

        const onScan = (decodedText, decodedResult) => {
            onScanSuccess(decodedText);
            html5QrCode.clear();
        };

        const onError = (errorMessage) => {
            console.warn("QR/Barcode scanning error:", errorMessage);
        };

        html5QrCode.render(onScan, onError);

        return () => {
            html5QrCode.clear().catch(error => console.error("Failed to clear html5QrcodeScanner", error));
        };
    }, [onScanSuccess]);

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg p-6 relative">
                <h3 className="text-lg font-semibold mb-4">Scan Vehicle Number (Simulated OCR)</h3>
                <p className="text-sm text-gray-600 mb-4">
                    In a real application, this would use OCR (e.g., Tesseract.js) to read vehicle numbers from the camera feed.
                    For this demo, you can manually enter the vehicle number after enabling the camera.
                </p>
                <div id="qr-reader" style={{ width: "100%", height: "200px" }}></div>
                <input
                    type="text"
                    placeholder="Manually enter scanned vehicle number"
                    className="mt-4 p-2 border rounded-md w-full"
                    onChange={(e) => onScanSuccess(e.target.value)}
                />
                <button
                    onClick={onClose}
                    className="mt-4 w-full bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                >
                    Close Scanner
                </button>
            </Card>
        </div>
    );
};

const AddEditVehicleModal = ({ vehicle, onClose, onSave }) => {
    const [formData, setFormData] = useState(vehicle || {
        vehicleNumber: '',
        driverName: '',
        driverContactNumber: '',
        vehicleType: 'Car',
        purposeOfEntry: '',
        entryTime: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM
        expectedExitTime: '',
        status: 'IN',
        attachments: [],
    });
    const [showScanner, setShowScanner] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleScanSuccess = (scannedText) => {
        setFormData(prev => ({ ...prev, vehicleNumber: scannedText }));
        setShowScanner(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl p-6 relative">
                <h3 className="text-lg font-semibold mb-4">{vehicle ? 'Edit Vehicle Entry' : 'Add New Vehicle Entry'}</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                name="vehicleNumber"
                                value={formData.vehicleNumber}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Driver Name</label>
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
                        <label className="block text-sm font-medium text-gray-700">Driver Contact Number</label>
                        <input
                            type="tel"
                            name="driverContactNumber"
                            value={formData.driverContactNumber}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                        <select
                            name="vehicleType"
                            value={formData.vehicleType}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        >
                            <option>Car</option>
                            <option>Van</option>
                            <option>Truck</option>
                            <option>Bike</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Purpose of Entry</label>
                        <input
                            type="text"
                            name="purposeOfEntry"
                            value={formData.purposeOfEntry}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Entry Date & Time</label>
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
                        <label className="block text-sm font-medium text-gray-700">Expected Exit Time</label>
                        <input
                            type="datetime-local"
                            name="expectedExitTime"
                            value={formData.expectedExitTime}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        >
                            <option>IN</option>
                            <option>OUT</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Attachments (Optional)</label>
                        <input
                            type="file"
                            name="attachments"
                            onChange={(e) => console.log('Attachment selected:', e.target.files[0]?.name)} // Simulate attachment
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            multiple
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Save Entry
                        </button>
                    </div>
                </form>
                {showScanner && <VehicleScanner onScanSuccess={handleScanSuccess} onClose={() => setShowScanner(false)} />}
            </Card>
        </div>
    );
};

const LogVehicleEntryModul = () => {
    const [vehicleLogs, setVehicleLogs] = useState(mockVehicleData);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDate, setFilterDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddVehicle = (newVehicle) => {
        setVehicleLogs(prev => [...prev, { ...newVehicle, id: prev.length + 1 }]);
    };

    const handleEditVehicle = (updatedVehicle) => {
        setVehicleLogs(prev => prev.map(v => (v.id === updatedVehicle.id ? updatedVehicle : v)));
    };

    const handleDeleteVehicle = (id) => {
        setVehicleLogs(prev => prev.filter(v => v.id !== id));
    };

    const filteredVehicles = vehicleLogs.filter(vehicle => {
        const matchesType = filterType === 'All' || vehicle.type === filterType;
        const matchesStatus = filterStatus === 'All' || vehicle.status === filterStatus;
        const matchesDate = !filterDate || vehicle.entry.startsWith(filterDate);
        const matchesSearch = searchTerm === '' ||
            vehicle.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.purpose.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesStatus && matchesDate && matchesSearch;
    });

    const totalEntries = vehicleLogs.length;
    const todayEntries = vehicleLogs.filter(v => v.entry.startsWith(new Date().toISOString().slice(0, 10))).length;
    const vehiclesIn = vehicleLogs.filter(v => v.status === 'IN').length;
    const vehiclesOut = vehicleLogs.filter(v => v.status === 'OUT').length;
    const pendingExit = vehicleLogs.filter(v => v.status === 'IN' && v.expectedExit && new Date(v.expectedExit) < new Date()).length;


    return (
        <div className="p-4 sm:p-6">
            <SectionTitle>Log Vehicle Entry</SectionTitle>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center space-x-3">
                        <Truck size={28} />
                        <div>
                            <p className="text-sm">Total Entries</p>
                            <p className="text-2xl font-bold">{totalEntries}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <div className="flex items-center space-x-3">
                        <ArrowDownCircle size={28} />
                        <div>
                            <p className="text-sm">Today's IN</p>
                            <p className="text-2xl font-bold">{vehiclesIn}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <div className="flex items-center space-x-3">
                        <ArrowUpCircle size={28} />
                        <div>
                            <p className="text-sm">Today's OUT</p>
                            <p className="text-2xl font-bold">{vehiclesOut}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                    <div className="flex items-center space-x-3">
                        <Clock size={28} />
                        <div>
                            <p className="text-sm">Pending Exit</p>
                            <p className="text-2xl font-bold">{pendingExit}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        placeholder="Search by Vehicle No., Driver, Purpose..."
                        className="p-2 border rounded-md shadow-sm w-full sm:w-auto"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="p-2 border rounded-md shadow-sm"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="Car">Car</option>
                        <option value="Van">Van</option>
                        <option value="Truck">Truck</option>
                        <option value="Bike">Bike</option>
                        <option value="Other">Other</option>
                    </select>
                    <select
                        className="p-2 border rounded-md shadow-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="IN">IN</option>
                        <option value="OUT">OUT</option>
                    </select>
                    <input
                        type="date"
                        className="p-2 border rounded-md shadow-sm"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowAddEditModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 flex items-center"
                    >
                        <Plus size={20} className="mr-2" /> Add New Entry
                    </button>
                    <button
                        onClick={() => alert('Exporting Vehicle Log (CSV)...')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md shadow-md hover:bg-gray-700 flex items-center"
                    >
                        <Download size={20} className="mr-2" /> Export
                    </button>
                </div>
            </div>

            {/* List View */}
            <Card>
                <SectionTitle>Vehicle Log List</SectionTitle>
                <div className="overflow-x-auto table-container max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry/Exit Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredVehicles.length > 0 ? (
                                filteredVehicles.map(vehicle => (
                                    <tr key={vehicle.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{vehicle.driver}</div>
                                            <div className="text-sm text-gray-500">{vehicle.driverContactNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.purpose}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">In: {new Date(vehicle.entry).toLocaleString()}</div>
                                            <div className="text-sm text-gray-500">Exp. Out: {vehicle.expectedExit ? new Date(vehicle.expectedExit).toLocaleString() : 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge status={vehicle.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => { setEditingVehicle(vehicle); setShowAddEditModal(true); }}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No vehicle logs found matching criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {showAddEditModal && (
                <AddEditVehicleModal
                    vehicle={editingVehicle}
                    onClose={() => { setShowAddEditModal(false); setEditingVehicle(null); }}
                    onSave={editingVehicle ? handleEditVehicle : handleAddVehicle}
                />
            )}
        </div>
    );
};

export default LogVehicleEntryModul;

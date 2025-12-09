import React, { useState, useEffect } from 'react';
import { Plus, Download, Truck, ArrowDownCircle, ArrowUpCircle, Clock } from 'lucide-react';
import { SERVER_PORT } from '../../../constant';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const Card = ({ children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-md ${className}`}>
        {children}
    </div>
);

const Badge = ({ status }) => {
    let colorClass = '';
    let text = '';
    switch (status) {
        case 'IN':
        case 'Checked-in':
            colorClass = 'bg-green-100 text-green-800';
            text = 'IN';
            break;
        case 'OUT':
        case 'Checked-out':
            colorClass = 'bg-red-100 text-red-800';
            text = 'OUT';
            break;
        case 'Pending':
            colorClass = 'bg-yellow-100 text-yellow-800';
            text = 'Pending';
            break;
        case 'Cleared':
            colorClass = 'bg-green-100 text-green-800';
            text = 'Cleared';
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

const LogVehicleEntry = ({ setTitle }) => {
    const navigate = useNavigate();
    const [vehicleLogs, setVehicleLogs] = useState([]);
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterDate, setFilterDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [drawerData, setDrawerData] = useState(null);

    useEffect(() => {
        setTitle("Vehicles Log");
    }, []);

    const fetchVehicleLogs = async () => {
        try {
            const response = await axios.get(`${SERVER_PORT}/vehicle-entry`);
            const transformedData = response.data.map(item => ({
                id: item.GMS_id,
                vehicleNumber: item.GMS_vehicle_number,
                driverName: item.GMS_driver_name,
                driverContactNumber: item.GMS_driver_contact_number,
                vehicleType: item.GMS_vehicle_type,
                purposeOfEntry: item.GMS_purpose_of_entry,
                entryTime: item.GMS_entry_time,
                expectedExitTime: item.GMS_expected_exit_time,
                outTime: item.GMS_out_time,
                status: item.GMS_status,
                securityCheck: item.GMS_security_check || 'Pending',
            }));
            setVehicleLogs(transformedData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicleLogs();
    }, [filterType, filterStatus, filterDate, searchTerm]);



    const handleCheckout = async (id) => {
        try {
            await axios.put(`${SERVER_PORT}/vehicle-entry/checkout/${id}`, {
                GMS_checkout_time: new Date().toISOString(),
                GMS_status: 'OUT'
            });
            fetchVehicleLogs();
        } catch (err) {
            alert("Failed to checkout vehicle");
        }
    };

    const handleDeleteVehicle = async (id) => {
        alert('Are you sure you want to delete this vehicle entry?');

        try {
            await axios.delete(`${SERVER_PORT}/Delvehicle-entry/${id}`);
            alert('Deleted this vehicle entry Successfully!.');
            fetchVehicleLogs();
        } catch (err) {
            alert("Failed to delete vehicle entry");
        }
    };

    const handleCardClick = (type) => {
        const filtered = {
            'Total Entries': vehicleLogs,
            "Today's IN": vehicleLogs.filter(v => new Date(v.entryTime).toDateString() === new Date().toDateString()),
            'Currently IN': vehicleLogs.filter(v => v.status === 'IN'),
            'OUT': vehicleLogs.filter(v => v.status === 'OUT'),
            'Pending Exit': vehicleLogs.filter(v => v.status === 'IN' && v.expectedExitTime && new Date(v.expectedExitTime) < new Date())
        };
        setDrawerData({ title: type, data: filtered[type].slice(0, 50) });
    };

    const closeDrawer = () => setDrawerData(null);

    const exportToCSV = (data, filename = 'vehicle_logs.csv') => {
        const headers = [
            'Vehicle Number', 'Driver Name', 'Contact Number', 'Vehicle Type', 'Purpose',
            'Entry Time', 'Expected Exit Time', 'Out Time', 'Status', 'Security Check'
        ];
        const rows = data.map(vehicle => [
            vehicle.vehicleNumber,
            vehicle.driverName,
            vehicle.driverContactNumber,
            vehicle.vehicleType,
            vehicle.purposeOfEntry,
            vehicle.entryTime ? new Date(vehicle.entryTime).toLocaleString() : '',
            vehicle.expectedExitTime ? new Date(vehicle.expectedExitTime).toLocaleString() : '',
            vehicle.outTime ? new Date(vehicle.outTime).toLocaleString() : '',
            vehicle.status,
            vehicle.securityCheck
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map(e => e.map(v => `"${v}"`).join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const totalEntries = vehicleLogs.length;
    const todayEntries = vehicleLogs.filter(v => new Date(v.entryTime).toDateString() === new Date().toDateString()).length;
    const vehiclesIn = vehicleLogs.filter(v => v.status === 'IN').length;
    const vehiclesOut = vehicleLogs.filter(v => v.status === 'OUT').length;
    const pendingExit = vehicleLogs.filter(v => v.status === 'IN' && v.expectedExitTime && new Date(v.expectedExitTime) < new Date()).length;

    const cardData = [
        { title: 'Total Entries', value: totalEntries, icon: <Truck size={46} />, gradient: 'from-blue-500 to-blue-600' },
        { title: "Today's IN", value: todayEntries, icon: <ArrowDownCircle size={46} />, gradient: 'from-green-500 to-green-600' },
        { title: 'Currently IN', value: vehiclesIn, icon: <ArrowUpCircle size={46} />, gradient: 'from-yellow-500 to-yellow-600' },
        { title: 'OUT', value: vehiclesOut, icon: <ArrowUpCircle size={46} />, gradient: 'from-blue-500 to-blue-800' },
        { title: 'Pending Exit', value: pendingExit, icon: <Clock size={46} />, gradient: 'from-red-500 to-red-600' }
    ];

    return (
        <div className="min-h-screen bg-none">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow mt-4">Vehicle Summary Cards</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-6">
                {cardData.map((card, index) => (
                    <div key={index} onClick={() => handleCardClick(card.title)} className="cursor-pointer">
                        <Card className={`bg-gradient-to-r ${card.gradient} text-white p-3`}>
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-1 rounded-full flex items-center justify-center h-14 w-14">
                                    {card.icon}
                                </div>
                                <div className="leading-tight">
                                    <p className="text-lg">{card.title}</p>
                                    <p className="flex justify-center text-xl font-bold text-white">{card.value}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>

            {drawerData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end mt-20">
                    <div className="bg-white w-full max-w-lg p-4 overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <button
                                onClick={() => exportToCSV(drawerData.data, `${drawerData.title.replace(/\s+/g, '_')}_export.csv`)}
                                className="px-4 py-2 bg-gray-700 text-white rounded-md"
                            >
                                <Download size={16} className="inline-block mr-2" /> Export
                            </button>
                            <button onClick={closeDrawer} className="text-red-500 font-bold text-xl">&times;</button>
                        </div>
                        <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                            {drawerData.data.map((v, idx) => (
                                <li key={idx} className="border rounded-md p-2">
                                    <strong>{v.vehicleNumber}</strong> - {v.driverName} ({v.status})<br />
                                    Entry: {new Date(v.entryTime).toLocaleString()}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <Card className="p-1 ">
                <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Vehicle Log List</h2>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="p-2 border rounded-md shadow-sm flex-grow"
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
                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={() => navigate('/AddLogVehicleEntry')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
                        >
                            <Plus size={16} /> Add Entry
                        </button>
                        <button
                            onClick={() => {
                                const exportData = vehicleLogs.slice(0, 50);
                                exportToCSV(exportData, 'vehicle_log_export.csv');
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md flex items-center gap-2"
                        >
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table>
                        <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>Driver</th>
                                <th>Type</th>
                                <th>Purpose</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Security</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicleLogs.length > 0 ? (
                                vehicleLogs.map((vehicle) => (
                                    <tr key={vehicle.id}>
                                        <td>
                                            <div className="font-medium text-gray-900">{vehicle.vehicleNumber}</div>
                                        </td>
                                        <td>
                                            <div className="text-sm text-gray-900">{vehicle.driverName}</div>
                                            <div className="text-sm text-gray-500">{vehicle.driverContactNumber}</div>
                                        </td>
                                        <td>
                                            {vehicle.vehicleType}
                                        </td>
                                        <td>
                                            {vehicle.purposeOfEntry}
                                        </td>
                                        <td>
                                            <div className="text-sm text-green-900">
                                                In: {new Date(vehicle.entryTime).toLocaleString()}
                                            </div>
                                            {vehicle.expectedExitTime && (
                                                <div className="text-sm text-blue-500">
                                                    Expected Out: {new Date(vehicle.expectedExitTime).toLocaleString()}
                                                </div>
                                            )}
                                            {vehicle.outTime && (
                                                <div className="text-sm text-red-500">
                                                    Out: {new Date(vehicle.outTime).toLocaleString()}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <Badge status={vehicle.status} />
                                            {vehicle.status === 'IN' && (
                                                <button
                                                    onClick={() => handleCheckout(vehicle.id)}
                                                    className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    Checkout
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            <Badge status={vehicle.securityCheck} />
                                        </td>
                                        <td>
                                            <div >
                                                <button onClick={() => navigate(`/EditLogVehicleEntry/${vehicle.id}`)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <i className="pl-5 fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button onClick={() => handleDeleteVehicle(vehicle.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <i className="pl-5 fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        No vehicle entries found matching your criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default LogVehicleEntry;
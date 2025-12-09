import React, { useState, useEffect } from 'react';
import { Plus, Download, Package, FileUp, History, List, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SERVER_PORT } from '../../../constant';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-md ${className}`}>
        {children}
    </div>
);

const Badge = ({ status }) => {
    let colorClass = '';
    let text = '';
    switch (status) {
        case 'Inward':
            colorClass = 'bg-green-100 text-green-800';
            text = 'INWARD';
            break;
        case 'Outward':
            colorClass = 'bg-red-100 text-red-800';
            text = 'OUTWARD';
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

const MaterialMovementModule = ({ setTitle }) => {
    const navigate = useNavigate();
    const [materialLogs, setMaterialLogs] = useState([]);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [filterType, setFilterType] = useState('All');
    const [filterMovement, setFilterMovement] = useState('All');
    const [filterDate, setFilterDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [drawerData, setDrawerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setTitle("Material Movement");
        fetchMaterialLogs();
    }, []);

    const fetchMaterialLogs = async () => {
        try {
            const response = await axios.get(`${SERVER_PORT}/material-movement`);
            const transformedData = response.data.map(item => ({
                id: item.GMS_id,
                name: item.GMS_material_name,
                quantity: item.GMS_quantity,
                unit: item.GMS_unit,
                movementType: item.GMS_movement_type,
                source: item.GMS_source_location,
                destination: item.GMS_destination_location,
                vehicleNumber: item.GMS_vehicle_number,
                authorizedBy: item.GMS_authorized_by,
                entryTime: item.GMS_entry_time,
                materialCode: item.GMS_material_code,
                attachments: item.GMS_attachments ? JSON.parse(item.GMS_attachments) : [],
                type: item.GMS_material_type
            }));
            setMaterialLogs(transformedData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMaterial = async (newMaterial) => {
        try {
            const response = await axios.post(`${SERVER_PORT}/AddNewmaterial-movement`, {
                GMS_material_name: newMaterial.materialName,
                GMS_quantity: newMaterial.quantity,
                GMS_unit: newMaterial.unit,
                GMS_movement_type: newMaterial.movementType,
                GMS_source_location: newMaterial.source,
                GMS_destination_location: newMaterial.destination,
                GMS_vehicle_number: newMaterial.vehicleNumber,
                GMS_authorized_by: newMaterial.authorizedBy,
                GMS_entry_time: newMaterial.entryTime,
                GMS_material_code: newMaterial.materialCode,
                GMS_attachments: JSON.stringify(newMaterial.attachments),
                GMS_material_type: newMaterial.type
            });
            fetchMaterialLogs();
            return response.data;
        } catch (err) {
            console.error("Error adding material:", err);
            throw err;
        }
    };

    const handleEditMaterial = async (updatedMaterial) => {
        try {
            const response = await axios.put(`${SERVER_PORT}/Editmaterial-movement/${updatedMaterial.id}`, {
                GMS_material_name: updatedMaterial.name,
                GMS_quantity: updatedMaterial.quantity,
                GMS_unit: updatedMaterial.unit,
                GMS_movement_type: updatedMaterial.movementType,
                GMS_source_location: updatedMaterial.source,
                GMS_destination_location: updatedMaterial.destination,
                GMS_vehicle_number: updatedMaterial.vehicleNumber,
                GMS_authorized_by: updatedMaterial.authorizedBy,
                GMS_entry_time: updatedMaterial.entryTime,
                GMS_material_code: updatedMaterial.materialCode,
                GMS_attachments: JSON.stringify(updatedMaterial.attachments),
                GMS_material_type: updatedMaterial.type
            });
            fetchMaterialLogs();
            return response.data;
        } catch (err) {
            console.error("Error updating material:", err);
            throw err;
        }
    };

    const handleDeleteMaterial = async (id) => {
        if (!window.confirm('Are you sure you want to delete this material movement?')) return;
        
        try {
            await axios.delete(`${SERVER_PORT}/Delmaterial-movement/${id}`);
            fetchMaterialLogs();
        } catch (err) {
            console.error("Error deleting material:", err);
            alert("Failed to delete material movement");
        }
    };

    const handleCardClick = (type) => {
        const filtered = {
            'Total Materials': materialLogs,
            "Today's Movements": materialLogs.filter(m => new Date(m.entryTime).toDateString() === new Date().toDateString()),
            'Inward Materials': materialLogs.filter(m => m.movementType === 'Inward'),
            'Outward Materials': materialLogs.filter(m => m.movementType === 'Outward'),
            'Raw Materials': materialLogs.filter(m => m.type === 'Raw Material')
        };
        setDrawerData({ title: type, data: filtered[type].slice(0, 50) });
    };

    const closeDrawer = () => setDrawerData(null);

    const exportToCSV = (data, filename = 'material_movement.csv') => {
        const headers = [
            'Material Name', 'Quantity', 'Unit', 'Movement Type', 'Source', 
            'Destination', 'Vehicle Number', 'Authorized By', 'Entry Time', 'Material Code', 'Type'
        ];
        const rows = data.map(material => [
            material.name,
            material.quantity,
            material.unit,
            material.movementType,
            material.source,
            material.destination,
            material.vehicleNumber || 'N/A',
            material.authorizedBy,
            material.entryTime ? new Date(material.entryTime).toLocaleString() : '',
            material.materialCode,
            material.type
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

    const totalMaterials = materialLogs.length;
    const todayMovements = materialLogs.filter(m => new Date(m.entryTime).toDateString() === new Date().toDateString()).length;
    const materialsIn = materialLogs.filter(m => m.movementType === 'Inward').length;
    const materialsOut = materialLogs.filter(m => m.movementType === 'Outward').length;
    const rawMaterials = materialLogs.filter(m => m.type === 'Raw Material').length;

    const cardData = [
        { title: 'Total Materials', value: totalMaterials, icon: <Package size={46} />, gradient: 'from-blue-500 to-blue-600' },
        { title: "Today's Movements", value: todayMovements, icon: <History size={46} />, gradient: 'from-green-500 to-green-600' },
        { title: 'Inward Materials', value: materialsIn, icon: <FileUp size={46} />, gradient: 'from-yellow-500 to-yellow-600' },
        { title: 'Outward Materials', value: materialsOut, icon: <FileUp size={46} />, gradient: 'from-purple-500 to-purple-600' },
        { title: 'Raw Materials', value: rawMaterials, icon: <List size={46} />, gradient: 'from-teal-500 to-teal-600' }
    ];

    if (loading) return <div className="text-center py-8">Loading material movements...</div>;
    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow mt-4">Material Movement Summary</h2>

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
                            {drawerData.data.map((m, idx) => (
                                <li key={idx} className="border rounded-md p-2">
                                    <strong>{m.name}</strong> - {m.movementType} ({m.quantity} {m.unit})<br />
                                    From: {m.source} | To: {m.destination}<br />
                                    Entry: {new Date(m.entryTime).toLocaleString()}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <Card className="p-1">
                <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Material Movement List</h2>
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
                            <option value="Consumables">Consumables</option>
                            <option value="Raw Material">Raw Material</option>
                            <option value="Products">Products</option>
                            <option value="Equipment">Equipment</option>
                        </select>
                        <select
                            className="p-2 border rounded-md shadow-sm"
                            value={filterMovement}
                            onChange={(e) => setFilterMovement(e.target.value)}
                        >
                            <option value="All">All Movements</option>
                            <option value="Inward">Inward</option>
                            <option value="Outward">Outward</option>
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
                            onClick={() => {
                                setEditingMaterial(null);
                                setShowAddEditModal(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
                        >
                            <Plus size={16} /> Add Entry
                        </button>
                        <button
                            onClick={() => exportToCSV(materialLogs.slice(0, 50), 'material_movement_export.csv')}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md flex items-center gap-2"
                        >
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Movement</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source/Destination</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Authorized By</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {materialLogs.length > 0 ? (
                                materialLogs
                                    .filter(material => {
                                        const matchesType = filterType === 'All' || material.type === filterType;
                                        const matchesMovement = filterMovement === 'All' || material.movementType === filterMovement;
                                        const matchesDate = !filterDate || new Date(material.entryTime).toISOString().startsWith(filterDate);
                                        const matchesSearch = searchTerm === '' ||
                                            material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            material.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            material.authorizedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            (material.vehicleNumber && material.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()));
                                        return matchesType && matchesMovement && matchesDate && matchesSearch;
                                    })
                                    .map(material => (
                                        <tr key={material.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{material.name}</div>
                                                <div className="text-sm text-gray-500">{material.type}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {material.quantity} {material.unit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge status={material.movementType} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">From: {material.source}</div>
                                                <div className="text-sm text-gray-500">To: {material.destination}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {material.vehicleNumber || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {material.authorizedBy}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(material.entryTime).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {material.materialCode}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingMaterial(material);
                                                            setShowAddEditModal(true);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMaterial(material.id)}
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
                                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                                        No material movements found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {showAddEditModal && (
                <AddEditMaterialModal
                    material={editingMaterial}
                    onClose={() => {
                        setShowAddEditModal(false);
                        setEditingMaterial(null);
                    }}
                    onSave={editingMaterial ? handleEditMaterial : handleAddMaterial}
                    onFetchVehicleLogs={() => axios.get(`${SERVER_PORT}/vehicle-entry`).then(res => res.data)}
                />
            )}
        </div>
    );
};

const AddEditMaterialModal = ({ material, onClose, onSave, onFetchVehicleLogs }) => {
    const [formData, setFormData] = useState(material || {
        materialName: '',
        quantity: '',
        unit: 'pieces',
        movementType: 'Inward',
        source: '',
        destination: '',
        vehicleNumber: '',
        authorizedBy: '',
        entryTime: new Date().toISOString().slice(0, 16),
        materialCode: '',
        attachments: [],
        type: 'Consumables'
    });
    const [showScanner, setShowScanner] = useState(false);
    const [vehicleLogs, setVehicleLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchVehicleData = async () => {
            setLoading(true);
            try {
                const data = await onFetchVehicleLogs();
                setVehicleLogs(data);
            } catch (err) {
                console.error("Error fetching vehicle logs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicleData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleScanSuccess = (scannedText) => {
        setFormData(prev => ({ ...prev, materialCode: scannedText }));
        setShowScanner(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            alert("Failed to save material movement. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl p-6 relative">
                <h3 className="text-lg font-semibold mb-4">{material ? 'Edit Material Movement' : 'Add New Material Movement'}</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Material Name*</label>
                        <input
                            type="text"
                            name="materialName"
                            value={formData.materialName}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity*</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Unit*</label>
                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        >
                            <option value="pieces">pieces</option>
                            <option value="Kg">Kg</option>
                            <option value="Liters">Liters</option>
                            <option value="boxes">boxes</option>
                            <option value="tons">tons</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Movement Type*</label>
                        <select
                            name="movementType"
                            value={formData.movementType}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        >
                            <option value="Inward">Inward</option>
                            <option value="Outward">Outward</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Source Location*</label>
                        <input
                            type="text"
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Destination Location*</label>
                        <input
                            type="text"
                            name="destination"
                            value={formData.destination}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                        <select
                            name="vehicleNumber"
                            value={formData.vehicleNumber}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            disabled={loading}
                        >
                            <option value="">Select Vehicle</option>
                            {vehicleLogs.map(v => (
                                <option key={v.GMS_id} value={v.GMS_vehicle_number}>
                                    {v.GMS_vehicle_number} ({v.GMS_driver_name})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Authorized By*</label>
                        <input
                            type="text"
                            name="authorizedBy"
                            value={formData.authorizedBy}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Entry Date & Time*</label>
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
                        <label className="block text-sm font-medium text-gray-700">Material Code*</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                name="materialCode"
                                value={formData.materialCode}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowScanner(true)}
                                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                <QrCode size={20} />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Material Type*</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        >
                            <option value="Consumables">Consumables</option>
                            <option value="Raw Material">Raw Material</option>
                            <option value="Products">Products</option>
                            <option value="Equipment">Equipment</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Attachments</label>
                        <input
                            type="file"
                            name="attachments"
                            onChange={(e) => {
                                const files = Array.from(e.target.files);
                                setFormData(prev => ({
                                    ...prev,
                                    attachments: [...prev.attachments, ...files.map(file => ({
                                        name: file.name,
                                        size: file.size,
                                        type: file.type
                                    }))]
                                }));
                            }}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            multiple
                        />
                        {formData.attachments.length > 0 && (
                            <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">Selected files:</p>
                                <ul className="text-sm text-gray-500">
                                    {formData.attachments.map((file, index) => (
                                        <li key={index}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
                                    ))}
                                </ul>
                            </div>
                        )}
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
                {showScanner && (
                    <MaterialScanner 
                        onScanSuccess={handleScanSuccess} 
                        onClose={() => setShowScanner(false)}
                        setTitle={() => {}} // Empty function as placeholder
                    />
                )}
            </Card>
        </div>
    );
};

const MaterialScanner = ({ onScanSuccess, onClose, setTitle }) => {
    useEffect(() => {
        if (typeof window.Html5QrcodeScanner === 'undefined') {
            console.error("Html5QrcodeScanner is not loaded. Please ensure the CDN script is included in your main App component.");
            return;
        }

        const html5QrCode = new window.Html5QrcodeScanner(
            "qr-reader-material",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
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
                <h3 className="text-lg font-semibold mb-4">Scan Material Code (QR/Barcode)</h3>
                <div id="qr-reader-material" style={{ width: "100%", height: "200px" }}></div>
                <p className="text-sm text-gray-600 mt-4">
                    Point your camera at a QR code or barcode.
                </p>
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

export default MaterialMovementModule;
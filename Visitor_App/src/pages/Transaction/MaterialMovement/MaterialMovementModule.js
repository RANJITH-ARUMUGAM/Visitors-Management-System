import React, { useState, useEffect } from 'react';
import { Plus, Download, Package, FileUp, History, List } from 'lucide-react';
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
        <div className="min-h-screen bg-none">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow mt-4">Material Movement Summary</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-8">
                {cardData.map((card, index) => (
                    <div key={index} onClick={() => handleCardClick(card.title)} className="cursor-pointer">
                        <Card className={`bg-gradient-to-r ${card.gradient} text-white p-3 h-[130px]`}>
                            <div className="flex items-center gap-2 h-full">
                                <div className="bg-white/20 p-2 rounded-full flex items-center justify-center h-14 w-14">
                                    {card.icon}
                                </div>
                                <div className="leading-tight flex flex-col justify-center flex-1">
                                    <p className="text-md text-center">{card.title}</p>
                                    <p className="text-xl font-bold text-white text-center">{card.value}</p>
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
                            onClick={() => navigate('/AddNewMaterialMovement')}
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
                    <table>
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Qty</th>
                                <th>Movement</th>
                                <th>Source/Destination</th>
                                <th>Vehicle</th>
                                <th>Authorized By</th>
                                <th>Time</th>
                                <th>Code</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
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
                                            <td>
                                                <div className="text-sm font-medium text-gray-900">{material.name}</div>
                                                <div className="text-sm text-gray-500">{material.type}</div>
                                            </td>
                                            <td>
                                                {material.quantity} {material.unit}
                                            </td>
                                            <td>
                                                <Badge status={material.movementType} />
                                            </td>
                                            <td>
                                                <div className="text-sm text-gray-900">From: {material.source}</div>
                                                <div className="text-sm text-gray-500">To: {material.destination}</div>
                                            </td>
                                            <td>
                                                {material.vehicleNumber || 'N/A'}
                                            </td>
                                            <td>
                                                {material.authorizedBy}
                                            </td>
                                            <td>
                                                {new Date(material.entryTime).toLocaleString()}
                                            </td>
                                            <td>
                                                {material.materialCode}
                                            </td>
                                            <td>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/EditMaterialMovement/${material.id}`)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <i className="pl-5 fa-solid fa-pen-to-square"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMaterial(material.id)}
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
                                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                                        No material movements found
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

export default MaterialMovementModule;
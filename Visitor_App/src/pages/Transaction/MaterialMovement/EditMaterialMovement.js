import React, { useState, useEffect } from 'react';
import { QrCode } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { SERVER_PORT } from '../../../constant';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-md ${className}`}>
        {children}
    </div>
);

const EditMaterialMovement = ({ setTitle }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
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
    const [vehicleLogs, setVehicleLogs] = useState([]);
    const [showScanner, setShowScanner] = useState(false);

    useEffect(() => {
        setTitle("Edit Material Movement");
        fetchMaterial();
        fetchVehicleLogs();
    }, [id]);

    const fetchMaterial = async () => {
        try {
            const response = await axios.get(`${SERVER_PORT}/Editmaterial-movement/${id}`);
            const materialData = response.data;

            setFormData({
                materialName: materialData.GMS_material_name,
                quantity: materialData.GMS_quantity,
                unit: materialData.GMS_unit,
                movementType: materialData.GMS_movement_type,
                source: materialData.GMS_source_location,
                destination: materialData.GMS_destination_location,
                vehicleNumber: materialData.GMS_vehicle_number,
                authorizedBy: materialData.GMS_authorized_by,
                entryTime: new Date(materialData.GMS_entry_time).toISOString().slice(0, 16),
                materialCode: materialData.GMS_material_code,
                attachments: materialData.GMS_attachments ? JSON.parse(materialData.GMS_attachments) : [],
                type: materialData.GMS_material_type
            });
        } catch (err) {
            console.error("Error fetching material:", err);
            setError("Unable to fetch material data.");
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicleLogs = async () => {
        try {
            const response = await axios.get(`${SERVER_PORT}/vehicle-entry`);
            setVehicleLogs(response.data);
        } catch (err) {
            console.error("Error fetching vehicle logs:", err);
        }
    };

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
            await axios.put(`${SERVER_PORT}/Editmaterial-movement/${id}`, {
                GMS_material_name: formData.materialName,
                GMS_quantity: formData.quantity,
                GMS_unit: formData.unit,
                GMS_movement_type: formData.movementType,
                GMS_source_location: formData.source,
                GMS_destination_location: formData.destination,
                GMS_vehicle_number: formData.vehicleNumber,
                GMS_authorized_by: formData.authorizedBy,
                GMS_entry_time: formData.entryTime,
                GMS_material_code: formData.materialCode,
                GMS_attachments: JSON.stringify(formData.attachments),
                GMS_material_type: formData.type
            });
            navigate('/MaterialMovementModule');
        } catch (err) {
            console.error("Error updating material:", err);
            alert("Failed to update material movement");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow mt-4">Edit Material Movement</h2>
            <Card className="w-full p-6 relative">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Material Name *</label>
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
                        <label className="block text-sm font-medium text-gray-700">Quantity *</label>
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
                        <label className="block text-sm font-medium text-gray-700">Unit *</label>
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
                        <label className="block text-sm font-medium text-gray-700">Movement Type *</label>
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
                        <label className="block text-sm font-medium text-gray-700">Source Location *</label>
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
                        <label className="block text-sm font-medium text-gray-700">Destination Location *</label>
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
                        <label className="block text-sm font-medium text-gray-700">Authorized By *</label>
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
                        <label className="block text-sm font-medium text-gray-700">Entry Date & Time *</label>
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
                        <label className="block text-sm font-medium text-gray-700">Material Code *</label>
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
                        <label className="block text-sm font-medium text-gray-700">Material Type *</label>
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
                            onClick={() => navigate('/MaterialMovementModule')}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Save
                        </button>
                    </div>
                </form>
                {showScanner && (
                    <MaterialScanner 
                        onScanSuccess={handleScanSuccess} 
                        onClose={() => setShowScanner(false)}
                        setTitle={() => {}}
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

export default EditMaterialMovement;
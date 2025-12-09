import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CustomAlert from "../../../CustomAlert";
import { SERVER_PORT } from '../../../constant';


export default function DepartmentsAdd({ setTitle }) {

    useEffect(() => {
        setTitle("Departments Add");
    }, []);

    const navigate = useNavigate();
    const [departmentName, setDepartmentName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState(true);
    const [alerts, setAlerts] = useState([]);

    const showAlert = (type, title, message) => {
        const newAlert = { id: Date.now(), type, title, message };
        setAlerts((prevAlerts) => [...prevAlerts, newAlert]);

        if (type !== "info") {
            setTimeout(() => {
                setAlerts((prev) => prev.filter((a) => a.id !== newAlert.id));
            }, 3000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!departmentName.trim()) {
            showAlert("error", "Validation", "Department name is required.");
            return;
        }

        try {
            const response = await axios.post(`${SERVER_PORT}/department_add`, {
                department_name: departmentName,
                department_description: description,
                status
            });

            if (response.data.success) {
                showAlert("success", "Added", "Department added successfully!");
                setTimeout(() => navigate("/departments"), 1000);
            } else {
                showAlert("error", "Error", response.data.message || "Failed to add department.");
            }
        } catch (err) {
            console.error("Add department error:", err);
            showAlert("error", "Error", "An error occurred while adding the department.");
        }
    };

    return (
        <div className="w-full  mx-auto p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">ADD Department</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-wrap gap-4 mb-4">
                    <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="departmentName">
                            Department Name
                        </label>
                        <input
                            id="departmentName"
                            type="text"
                            value={departmentName}
                            onChange={(e) => setDepartmentName(e.target.value)}
                            required
                            placeholder="Enter department name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="w-full md:w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
                            Status
                        </label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value === "true")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>


                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        id="description"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional description"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex space-x-4 mt-6">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Add Department
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/departments")}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            {alerts.map((alert) => (
                <CustomAlert
                    key={alert.id}
                    {...alert}
                    onClose={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
                    duration={alert.type === "info" ? 0 : 3000}
                />
            ))}
        </div>
    );
}
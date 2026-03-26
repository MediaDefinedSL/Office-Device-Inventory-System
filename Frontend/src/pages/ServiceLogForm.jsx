import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createServiceLog, getDeviceById, getServiceLogById, updateServiceLog } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    ArrowBack as BackIcon,
    Save as SaveIcon,
    Build as BuildIcon
} from '@mui/icons-material';

const ServiceLogForm = () => {
    const { deviceId, id } = useParams(); // id is the service log id if editing
    const isEditing = !!id;
    const navigate = useNavigate();
    const { user } = useAuth();
    const [device, setDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        serviceDate: new Date().toISOString().split('T')[0],
        description: '',
        servicedBy: '',
        cost: 0,
        nextServiceDate: '',
        expectedReadyDate: '',
        logType: 'Service',
        updateDeviceStatus: 'Active',
        comments: '',
        additionalServicers: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            if (user && user.role !== 'Admin' && user.role !== 'IT Admin') {
                navigate('/');
                return;
            }
            try {
                if (isEditing) {
                    const response = await getServiceLogById(id);
                    const log = response.data;
                    setDevice(log.device);
                    setFormData({
                        serviceDate: new Date(log.serviceDate).toISOString().split('T')[0],
                        description: log.description,
                        servicedBy: log.servicedBy,
                        cost: log.cost,
                        nextServiceDate: log.nextServiceDate ? new Date(log.nextServiceDate).toISOString().split('T')[0] : '',
                        expectedReadyDate: log.expectedReadyDate ? new Date(log.expectedReadyDate).toISOString().split('T')[0] : '',
                        logType: log.logType || 'Service',
                        updateDeviceStatus: log.device.status, // Keep current status
                        comments: log.comments || '',
                        additionalServicers: log.additionalServicers || ''
                    });
                } else {
                    const response = await getDeviceById(deviceId);
                    setDevice(response.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [deviceId, id, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Auto-set status to 'Under Repair' if logType is changed to 'Repair'
            if (name === 'logType' && value === 'Repair') {
                newData.updateDeviceStatus = 'Under Repair';
            }

            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                deviceId,
                cost: parseFloat(formData.cost) || 0,
                nextServiceDate: formData.nextServiceDate || undefined,
                expectedReadyDate: formData.expectedReadyDate || undefined
            };

            if (isEditing) {
                await updateServiceLog(id, dataToSend);
                alert('Service record updated successfully!');
            } else {
                await createServiceLog(dataToSend);
                alert('Service record added successfully!');
            }

            // Redirect to repair tracking if it was a repair
            if (formData.logType === 'Repair') {
                navigate('/repair-tracking');
            } else {
                navigate('/service-logs');
            }
        } catch (error) {
            console.error('Error creating service log:', error);
            const errorMessage = error.response?.data?.error || error.message;
            alert(`Failed to record service log: ${errorMessage}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
            >
                <BackIcon fontSize="small" />
                Back
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <BuildIcon />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                {isEditing ? 'Edit Service Record' : 'Record Service'}
                            </h1>
                            <p className="text-slate-500 mt-1">Logging maintenance for <span className="font-bold text-slate-700">{device?.assetTag}</span> ({device?.deviceType})</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Service Date</label>
                            <input
                                type="date"
                                name="serviceDate"
                                required
                                value={formData.serviceDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Next Service Date (Optional)</label>
                            <input
                                type="date"
                                name="nextServiceDate"
                                value={formData.nextServiceDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Serviced By</label>
                            <input
                                type="text"
                                name="servicedBy"
                                required
                                placeholder="e.g. Internal IT, External Vendor Name"
                                value={formData.servicedBy}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Additional Servicers (Optional)</label>
                            <input
                                type="text"
                                name="additionalServicers"
                                placeholder="e.g. Helper Technician, Assistant"
                                value={formData.additionalServicers}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Description of Service</label>
                        <textarea
                            name="description"
                            required
                            rows="3"
                            placeholder="Describe the maintenance performed..."
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Additional Comments (Optional)</label>
                        <textarea
                            name="comments"
                            rows="3"
                            placeholder="Any extra details or notes..."
                            value={formData.comments}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Log Type</label>
                            <select
                                name="logType"
                                value={formData.logType}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none font-bold"
                            >
                                <option value="Service">Service (Maintenance)</option>
                                <option value="Repair">Repair (Hardware Fix)</option>
                            </select>
                        </div>
                        {formData.logType === 'Repair' && (
                            <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                                <label className="text-sm font-bold text-orange-600">Expected Ready Date</label>
                                <input
                                    type="date"
                                    name="expectedReadyDate"
                                    value={formData.expectedReadyDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-orange-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none font-bold text-orange-700"
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Cost (LKR)</label>
                            <input
                                type="number"
                                name="cost"
                                min="0"
                                step="0.01"
                                value={formData.cost}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Update Device Status To</label>
                            <select
                                name="updateDeviceStatus"
                                value={formData.updateDeviceStatus}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                            >
                                <option value="Active">Active</option>
                                <option value="Under Repair">Under Repair</option>
                                <option value="Retired">Retired</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
                        >
                            <SaveIcon />
                            {isEditing ? 'Update Service Record' : 'Save Service Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceLogForm;

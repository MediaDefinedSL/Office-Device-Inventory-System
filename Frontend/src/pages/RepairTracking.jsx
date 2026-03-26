import { useState, useEffect } from 'react';
import {
    Build as BuildIcon,
    CheckCircle as CheckCircleIcon,
    History as HistoryIcon,
    Engineering as EngineeringIcon,
    DeviceUnknown as DeviceIcon,
    AccessTime as AccessTimeIcon,
    Warning as WarningIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { getDevicesUnderRepair, getRepairLogs, updateDevice, createServiceLog, getDevices, getAllServiceLogs, deleteServiceLog } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const RepairTracking = () => {
    const [devicesUnderRepair, setDevicesUnderRepair] = useState([]);
    const [repairLogs, setRepairLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('current');
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin' || user?.role === 'IT Admin';

    const fetchData = async () => {
        setLoading(true);
        try {
            try {
                // Primary: Try the specialized endpoints
                const [devicesRes, logsRes] = await Promise.all([
                    getDevicesUnderRepair(),
                    getRepairLogs()
                ]);
                setDevicesUnderRepair(devicesRes.data);
                setRepairLogs(logsRes.data);
            } catch (apiError) {
                // Fallback: If specialized endpoints fail (e.g. 404), fetch all and filter
                console.warn('Specialized endpoints failed, using fallback:', apiError);
                const [allDevicesRes, allLogsRes] = await Promise.all([
                    getDevices(),
                    getAllServiceLogs()
                ]);

                // Filter for devices under repair
                const repairDevices = allDevicesRes.data
                    .filter(d => d.status === 'Under Repair')
                    .map(device => {
                        // Manually attach latest repair log
                        const latestLog = allLogsRes.data
                            .filter(l => l.device?._id === device._id && l.logType === 'Repair')
                            .sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate))[0];
                        return { ...device, latestRepairLog: latestLog };
                    });

                // Filter for all repair logs
                const repairLogsOnly = allLogsRes.data.filter(l => l.logType === 'Repair');

                setDevicesUnderRepair(repairDevices);
                setRepairLogs(repairLogsOnly);
            }
        } catch (error) {
            console.error('Error fetching repair data:', error);
            toast.error('Failed to load repair data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getReadyStatus = (date) => {
        if (!date) return { label: 'No Date Set', color: 'text-slate-400 bg-slate-100', icon: <AccessTimeIcon fontSize="inherit" /> };

        const readyDate = new Date(date);
        readyDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = readyDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: `Overdue by ${Math.abs(diffDays)}d`, color: 'text-rose-600 bg-rose-100 animate-pulse', icon: <WarningIcon fontSize="inherit" /> };
        if (diffDays === 0) return { label: 'Ready Today', color: 'text-orange-600 bg-orange-100', icon: <AccessTimeIcon fontSize="inherit" /> };
        if (diffDays === 1) return { label: 'Ready Tomorrow', color: 'text-amber-600 bg-amber-50', icon: <AccessTimeIcon fontSize="inherit" /> };
        return { label: `Ready in ${diffDays}d`, color: 'text-blue-600 bg-blue-50', icon: <AccessTimeIcon fontSize="inherit" /> };
    };

    const handleMarkAsRepaired = async (device) => {
        try {
            await updateDevice(device._id, { status: 'Active' });

            let cost = 0;
            if (isAdmin) {
                const input = window.prompt(`Enter repair cost for ${device.assetTag} (LKR):`, '0');
                if (input !== null) {
                    const parsed = parseFloat(input);
                    if (!Number.isNaN(parsed)) cost = parsed;
                }
            }

            await createServiceLog({
                deviceId: device._id,
                serviceDate: new Date(),
                description: 'Repair completed. Device marked as Active.',
                servicedBy: 'System (Repair Tracking)',
                cost,
                logType: 'Repair'
            });

            toast.success(`${device.assetTag} marked as Active`);
            fetchData();
        } catch (error) {
            console.error('Error marking device as repaired:', error);
            toast.error('Failed to update device status');
        }
    };

    const handleCancelRepair = async (device) => {
        if (!window.confirm(`Are you sure you want to cancel the repair for ${device.assetTag}? The device status will return to Active and the initial repair log will be removed.`)) {
            return;
        }

        try {
            // 1. Update device status back to Active
            await updateDevice(device._id, { status: 'Active' });

            // 2. Delete the associated repair log if it exists
            if (device.latestRepairLog?._id) {
                await deleteServiceLog(device.latestRepairLog._id);
            }

            toast.success('Repair session cancelled');
            fetchData();
        } catch (error) {
            console.error('Error cancelling repair:', error);
            toast.error('Failed to cancel repair');
        }
    };

    const handleDeleteLog = async (logId) => {
        if (!window.confirm('Are you sure you want to delete this repair record? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteServiceLog(logId);
            toast.success('Repair record deleted');
            fetchData();
        } catch (error) {
            console.error('Error deleting repair log:', error);
            toast.error('Failed to delete repair record');
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Repair Tracking</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage and track devices currently undergoing repair</p>
                </div>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('current')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'current'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Current Repairs ({devicesUnderRepair.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Repair History
                </button>
            </div>

            {activeTab === 'current' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devicesUnderRepair.map((device) => {
                        const status = getReadyStatus(device.latestRepairLog?.expectedReadyDate);
                        return (
                            <div key={device._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                                            <BuildIcon />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[10px] font-bold px-2 py-1 bg-orange-100 text-orange-600 rounded-md uppercase tracking-wider">
                                                Under Repair
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 ${status.color}`}>
                                                {status.icon}
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">{device.assetTag}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{device.brand} {device.model}</p>

                                    {device.latestRepairLog?.description && (
                                        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Issue / Request</p>
                                            <p className="text-sm text-slate-700 italic line-clamp-2">{device.latestRepairLog.description}</p>
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <EngineeringIcon fontSize="small" className="text-slate-400" />
                                            <span>Assigned to: {device.assignedUser || 'N/A'}</span>
                                        </div>
                                        {device.latestRepairLog?.expectedReadyDate && (
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <AccessTimeIcon fontSize="small" className="text-slate-400" />
                                                <span className="font-bold">Estimated Ready: {new Date(device.latestRepairLog.expectedReadyDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <HistoryIcon fontSize="small" className="text-slate-400" />
                                            <span>Session Started: {new Date(device.updatedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 pt-0 flex flex-col gap-2">
                                    <button
                                        onClick={() => handleMarkAsRepaired(device)}
                                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                                    >
                                        <CheckCircleIcon fontSize="small" />
                                        Complete Repair
                                    </button>
                                    <button
                                        onClick={() => handleCancelRepair(device)}
                                        className="w-full py-2.5 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
                                    >
                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                        Cancel / Remove Session
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {devicesUnderRepair.length === 0 && (
                        <div className="col-span-full py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
                            <DeviceIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                            <p className="font-medium italic">No devices are currently under repair.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        {repairLogs.length > 0 && (
                            <button
                                onClick={async () => {
                                    if (window.confirm('Are you sure you want to clear the ENTIRE repair history? This will permanently delete all logs.')) {
                                        try {
                                            await Promise.all(repairLogs.map(log => deleteServiceLog(log._id)));
                                            toast.success('Repair history cleared');
                                            fetchData();
                                        } catch (err) {
                                            toast.error('Failed to clear some history items');
                                            fetchData();
                                        }
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-sm font-bold transition-all"
                            >
                                <DeleteIcon fontSize="small" />
                                Clear All History
                            </button>
                        )}
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Device</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Description</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 font-bold">Expectation</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Cost</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {repairLogs.map((log) => (
                                        <tr key={log._id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-slate-700">{new Date(log.serviceDate).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{new Date(log.serviceDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-blue-600">{log.device?.assetTag}</span>
                                                    <span className="text-[10px] font-medium text-slate-400">{log.device?.model}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600 line-clamp-1">{log.description}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.expectedReadyDate ? (
                                                    <span className="text-xs font-bold text-slate-500">
                                                        Promise: {new Date(log.expectedReadyDate).toLocaleDateString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No promise</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-bold text-slate-700">Rs. {log.cost?.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteLog(log._id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete Record"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {repairLogs.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-slate-400 italic font-medium">
                                                No repair history found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepairTracking;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend
} from 'recharts';
import {
    Devices as DevicesIcon,
    Build as BuildIcon,
    CheckCircle as ActiveIcon,
    Cancel as RetiredIcon,
    Add as AddIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { getDashboardAnalytics, getRecentServiceLogs, getUpcomingServiceLogs, getDevicesUnderRepair, getDevices, getAllServiceLogs } from '../services/api';
import { Warning as WarningIcon, Engineering as EngineeringIcon, AccessTime as AccessTimeIcon, Shield as ShieldIcon } from '@mui/icons-material';

const Dashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [upcomingServices, setUpcomingServices] = useState([]);
    const [repairDevices, setRepairDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState('Rs');
    const navigate = useNavigate();

    useEffect(() => {
        const savedCurrency = localStorage.getItem('currency') || 'Rs';
        setCurrency(savedCurrency);
        const fetchData = async () => {
            try {
                const results = await Promise.allSettled([
                    getDashboardAnalytics(),
                    getRecentServiceLogs(),
                    getUpcomingServiceLogs()
                ]);

                console.log('[Dashboard] Raw analytics response:', results[0]);

                if (results[0].status === 'fulfilled') {
                    setAnalytics(results[0].value.data);
                } else {
                    console.error('Analytics fetch failed:', results[0].reason);
                }

                if (results[1].status === 'fulfilled') {
                    setRecentActivity(results[1].value.data);
                } else {
                    console.error('Recent activity fetch failed:', results[1].reason);
                }

                if (results[2].status === 'fulfilled') {
                    setUpcomingServices(results[2].value.data);
                } else {
                    console.error('Upcoming services fetch failed:', results[2].reason);
                }

                // Fetch current repairs with fallback
                try {
                    const repairsRes = await getDevicesUnderRepair();
                    setRepairDevices(repairsRes.data);
                } catch (repairError) {
                    console.warn('[Dashboard] Repair specialized endpoint failed, using fallback:', repairError);
                    const [allDevs, allLogs] = await Promise.all([getDevices(), getAllServiceLogs()]);
                    const filtered = allDevs.data
                        .filter(d => d.status === 'Under Repair')
                        .map(d => {
                            const latest = allLogs.data
                                .filter(l => l.device?._id === d._id && l.logType === 'Repair')
                                .sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate))[0];
                            return { ...d, latestRepairLog: latest };
                        });
                    setRepairDevices(filtered);
                }
            } catch (error) {
                console.error('Unexpected error in dashboard data fetching:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        { label: 'Total Devices', value: analytics?.totalDevices ?? 0, icon: <DevicesIcon fontSize="large" />, color: 'bg-blue-500 shadow-blue-200' },
        { label: 'Active Devices', value: analytics?.statusCounts?.['Active'] ?? 0, icon: <ActiveIcon fontSize="large" />, color: 'bg-emerald-500 shadow-emerald-200' },
        { label: 'Under Repair', value: analytics?.statusCounts?.['Under Repair'] ?? 0, icon: <BuildIcon fontSize="large" />, color: 'bg-orange-500 shadow-orange-200' },
        { label: 'Retired Devices', value: analytics?.statusCounts?.['Retired'] ?? 0, icon: <RetiredIcon fontSize="large" />, color: 'bg-rose-500 shadow-rose-200' },
    ];

    const pieData = [
        { name: 'Active', value: analytics?.statusCounts?.['Active'] || 0, color: '#10b981' },
        { name: 'Under Repair', value: analytics?.statusCounts?.['Under Repair'] || 0, color: '#f59e0b' },
        { name: 'Retired', value: analytics?.statusCounts?.['Retired'] || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // recentActivity is now dynamic state

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
                <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className={`${stat.color} p-6 rounded-2xl text-white shadow-lg transform transition-all duration-300 hover:scale-[1.02]`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-50 font-medium opacity-90">{stat.label}</p>
                                <h3 className="text-4xl font-bold mt-2">{stat.value}</h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
                        <button
                            onClick={() => navigate('/service-logs')}
                            className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
                        >
                            View All
                        </button>
                    </div>
                    <div className="p-6 flex-1">
                        <div className="space-y-6">
                            {recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex gap-4 group">
                                    <div className="w-2 h-2 rounded-full bg-slate-200 mt-2.5 group-hover:bg-blue-400 transition-colors"></div>
                                    <div className="flex-1 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                                        <p className="text-sm font-bold text-slate-700">
                                            <span className="text-slate-400 font-medium">{new Date(activity.serviceDate).toLocaleDateString()}</span> - {activity.device?.assetTag || 'Device'} Service
                                        </p>
                                        <p className="text-sm text-slate-500 mt-1">{activity.description}</p>
                                    </div>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <p className="text-center text-slate-400 italic py-4">No recent service activity recorded.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Service Status Map (Pie Chart) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Service Status</h2>
                    <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <ReTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-10px]">
                            <p className="text-3xl font-black text-slate-800">{analytics?.totalDevices || 0}</p>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Repairs Section */}
            {repairDevices.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-orange-50/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                <BuildIcon />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Current Repairs</h2>
                                <p className="text-xs text-orange-600 font-medium">{repairDevices.length} devices currently being worked on</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/repair-tracking')}
                            className="text-orange-600 font-bold text-sm hover:text-orange-700 transition-colors px-4 py-2 bg-orange-100/50 rounded-lg"
                        >
                            Track All
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {repairDevices.map((device) => (
                                <div
                                    key={device._id}
                                    onClick={() => navigate('/repair-tracking')}
                                    className="p-4 rounded-xl border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-600 rounded uppercase tracking-wider">
                                                Repairing
                                            </span>
                                            {device.latestRepairLog?.expectedReadyDate && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                                                    <AccessTimeIcon sx={{ fontSize: 12 }} />
                                                    {new Date(device.latestRepairLog.expectedReadyDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-800">{device.assetTag}</h4>
                                        <p className="text-[11px] text-slate-500 font-medium mb-2">{device.brand} {device.model}</p>

                                        {device.latestRepairLog?.description && (
                                            <p className="text-[11px] text-slate-600 italic line-clamp-1 border-t border-slate-50 pt-2">
                                                {device.latestRepairLog.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Service Alerts Grid */}
            {upcomingServices.length > 0 && (
                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <WarningIcon />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Critical Service Alerts</h2>
                            <p className="text-xs text-orange-600 font-medium">Devices requiring immediate attention within 7 days</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingServices.map((log) => (
                            <div
                                key={log._id}
                                onClick={() => navigate(`/service-logs/${log._id}`)}
                                className="bg-white p-4 rounded-xl shadow-sm border border-orange-50 hover:border-orange-200 transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                        <EngineeringIcon />
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 bg-orange-100 text-orange-600 rounded-md uppercase tracking-wider">
                                        Due {new Date(log.nextServiceDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{log.device?.assetTag} - {log.device?.model}</h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                    Last service: {log.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Expiring Warranties Widget */}
            {analytics?.warrantiesExpiringSoon && (
                <div className={`rounded-2xl p-6 animate-in slide-in-from-bottom-4 duration-500 delay-100 mt-6 transition-all border ${
                    analytics.warrantiesExpiringSoon.length > 0 
                        ? 'bg-rose-50/80 border-rose-200 shadow-xl shadow-rose-100 ring-4 ring-rose-50' 
                        : 'bg-emerald-50/50 border-emerald-100'
                }`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                                analytics.warrantiesExpiringSoon.length > 0
                                    ? 'bg-rose-100 text-rose-600 shadow-sm shadow-rose-200 animate-pulse'
                                    : 'bg-emerald-100 text-emerald-600'
                            }`}>
                                {analytics.warrantiesExpiringSoon.length > 0 ? <WarningIcon /> : <ShieldIcon />}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Warranties Expiring Soon</h2>
                                <p className={`text-xs font-medium ${analytics.warrantiesExpiringSoon.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {analytics.warrantiesExpiringSoon.length > 0 
                                        ? `Action Required: ${analytics.warrantiesExpiringSoon.length} devices losing coverage in 30 days!` 
                                        : 'Devices losing warranty coverage in the next 30 days'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {analytics.warrantiesExpiringSoon.length === 0 ? (
                        <div className="bg-white/50 border border-emerald-50 rounded-xl p-6 text-center">
                            <ShieldIcon sx={{ fontSize: 32, color: '#10b981', mb: 1, opacity: 0.5 }} />
                            <h3 className="text-sm font-bold text-slate-700">All Good!</h3>
                            <p className="text-xs text-slate-500">No devices have warranties expiring in the next 30 days.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {analytics.warrantiesExpiringSoon.map((device) => {
                                const daysLeft = Math.ceil((new Date(device.warrantyExpiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                                const isCritical = daysLeft <= 7;
                                return (
                                    <div
                                        key={device._id}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-emerald-50 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm font-bold text-slate-800">{device.assetTag || 'Device'} - {device.model}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${isCritical ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {daysLeft} days left
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium mt-1">
                                            Expires: {new Date(device.warrantyExpiryDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;

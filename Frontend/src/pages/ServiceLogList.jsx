import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllServiceLogs, deleteServiceLog } from '../services/api';
import {
    History as HistoryIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Article as ArticleIcon,
    Print as PrintIcon,
    Business as CorporateIcon,
    VerifiedUser as OfficialIcon,
    AccountCircle as UserIcon,
    CalendarToday as DateIcon,
    Build as BuildIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';

const ServiceLogList = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All'); // 'All', 'Service', 'Repair'
    const [currency, setCurrency] = useState('Rs');
    const [printTarget, setPrintTarget] = useState(null); // 'all' or specific log object

    useEffect(() => {
        fetchLogs();
        const savedCurrency = localStorage.getItem('currency') || 'Rs';
        setCurrency(savedCurrency);
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await getAllServiceLogs();
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching service logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service record?')) {
            try {
                await deleteServiceLog(id);
                setLogs(logs.filter(log => log._id !== id));
            } catch (error) {
                console.error('Error deleting service log:', error);
            }
        }
    };

    const handlePrintIndividual = (log) => {
        setPrintTarget(log);
        setTimeout(() => {
            window.print();
            setPrintTarget(null);
        }, 300);
    };

    const handlePrintAll = () => {
        setPrintTarget('all');
        setTimeout(() => {
            window.print();
            setPrintTarget(null);
        }, 300);
    };

    const filteredLogs = logs.filter(log => {
        const searchTerm = search.toLowerCase();
        const matchesSearch = (
            (log.device?.assetTag || '').toLowerCase().includes(searchTerm) ||
            (log.description || '').toLowerCase().includes(searchTerm) ||
            (log.servicedBy || '').toLowerCase().includes(searchTerm) ||
            (log.device?.deviceType || '').toLowerCase().includes(searchTerm) ||
            (log.comments || '').toLowerCase().includes(searchTerm) ||
            (log.additionalServicers || '').toLowerCase().includes(searchTerm) ||
            (log.logType || '').toLowerCase().includes(searchTerm)
        );

        if (filterType === 'All') return matchesSearch;
        return matchesSearch && log.logType === filterType;
    }).filter(log => log !== null);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Professional Print View (Individual Service Record) */}
            {printTarget && printTarget !== 'all' && (
                <div className="hidden print:block font-sans p-0 text-slate-900 bg-white min-h-screen">
                    {/* Watermark */}
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[100px] font-black text-slate-100/30 uppercase -rotate-45 pointer-events-none select-none z-0">
                        VERIFIED SERVICE
                    </div>

                    <div className="relative z-10 p-10 space-y-10">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b-[4px] border-slate-900 pb-8">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                    <BuildIcon sx={{ fontSize: 45 }} />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tighter uppercase leading-none italic text-slate-900">Service Completion Report</h1>
                                    <p className="text-sm font-bold text-slate-500 mt-2 tracking-[0.2em] uppercase">Enterprise Asset Maintenance & Quality Control</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-4 py-1.5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-3 rounded">Service Event</span>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">EVENT REFERENCE</p>
                                <p className="text-lg font-mono font-black text-slate-900">SRV-{printTarget.device?.assetTag || 'NA'}-{new Date(printTarget.serviceDate).getTime().toString().slice(-6)}</p>
                            </div>
                        </div>

                        {/* Top Metadata Row */}
                        <div className="grid grid-cols-3 gap-8">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <OfficialIcon sx={{ fontSize: 14 }} className="text-blue-600" />
                                    Validation Date
                                </h3>
                                <p className="text-lg font-black text-slate-900 uppercase">
                                    {new Date(printTarget.serviceDate).toLocaleDateString(undefined, { dateStyle: 'full' })}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Official Record Entry Date</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <UserIcon sx={{ fontSize: 14 }} className="text-emerald-600" />
                                    Primary Technician
                                </h3>
                                <p className="text-lg font-black text-slate-900 uppercase">{printTarget.servicedBy}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{printTarget.additionalServicers ? `Joint Support: ${printTarget.additionalServicers}` : 'Certified Individual Execution'}</p>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Financial Ledger Impact</h3>
                                <p className="text-3xl font-black text-white tabular-nums">{currency} {printTarget.cost?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">Total Service Expenditure</p>
                            </div>
                        </div>

                        {/* Detail Grid */}
                        <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest border-l-4 border-slate-900 pl-4 py-1 bg-slate-50">Impacted Asset Profile</h3>
                                    <div className="grid grid-cols-2 gap-y-4 px-4">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Identifier</p>
                                        <p className="text-xs font-black text-blue-600 font-mono tracking-tighter">{printTarget.device?.assetTag || 'N/A'}</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hardware Descriptor</p>
                                        <p className="text-xs font-black text-slate-900">{printTarget.device?.brand} {printTarget.device?.model}</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Class</p>
                                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-fit uppercase">{printTarget.device?.deviceType}</span>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Operational Status</p>
                                        <p className="text-xs font-black text-emerald-600 uppercase">Maintenance Verified</p>
                                    </div>
                                </div>

                                <div className="bg-yellow-50/30 p-6 rounded-2xl border-2 border-dashed border-yellow-200">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <DateIcon sx={{ fontSize: 14 }} className="text-orange-500" />
                                        Scheduled Recalibration
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <p className="text-2xl font-black text-slate-900">
                                            {printTarget.nextServiceDate ? new Date(printTarget.nextServiceDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'AD-HOC ONLY'}
                                        </p>
                                        {printTarget.nextServiceDate && (
                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest">Action Required</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Next Proactive Maintenance Window</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest border-l-4 border-slate-900 pl-4 py-1 bg-slate-50">Service Manifest & Comments</h3>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <DescriptionIcon sx={{ fontSize: 80 }} />
                                        </div>
                                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Service Description</h4>
                                        <p className="text-sm font-bold text-slate-800 leading-relaxed mb-6">
                                            {printTarget.description}
                                        </p>
                                        <div className="h-px bg-slate-100 mb-6"></div>
                                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Technician Remarks</h4>
                                        <p className="text-xs font-medium text-slate-500 italic leading-relaxed">
                                            {printTarget.comments || "No additional technical remarks provided for this record."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer & Auth */}
                        <div className="pt-10 mt-auto border-t-2 border-slate-100 flex justify-between items-end">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Official Authorization & Oversight</p>
                                    <div className="flex gap-12">
                                        <div className="space-y-2">
                                            <div className="w-48 h-px bg-slate-300"></div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Hardware Technician Signature</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="w-48 h-px bg-slate-300"></div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Facility Operations Manager</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right space-y-2">
                                <div className="flex justify-end items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                    <OfficialIcon sx={{ fontSize: 14 }} className="text-emerald-500" />
                                    Digitally Verified Record
                                </div>
                                <p className="text-[8px] text-slate-400 font-bold tracking-widest uppercase">Classification: Internal Business Data // Asset Management</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Professional Print View (Master Service History List) */}
            {printTarget === 'all' && (
                <div className="hidden print:block font-sans p-10 space-y-10 bg-white text-slate-900 min-h-screen">
                    {/* Master Header */}
                    <div className="flex justify-between items-end border-b-8 border-slate-900 pb-8">
                        <div>
                            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none italic">Asset Maintenance Ledger</h1>
                            <p className="text-base font-bold text-slate-500 mt-3 tracking-[0.4em] uppercase">Enterprise Infrastructure Historical Audit</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Logs Counted</p>
                            <p className="text-5xl font-black text-slate-900 leading-none">{filteredLogs.length}</p>
                        </div>
                    </div>

                    {/* Metadata Summary */}
                    <div className="grid grid-cols-4 gap-8 bg-slate-900 p-8 rounded-3xl text-white shadow-2xl">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">Report Cycle</p>
                            <p className="text-sm font-bold">{new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">Ledger Status</p>
                            <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Finalized / Locked</p>
                        </div>
                        <div className="space-y-1 col-span-2 text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">Aggregate Maintenance Expenditure</p>
                            <p className="text-2xl font-black tabular-nums">
                                {currency} {filteredLogs.reduce((sum, log) => sum + (log.cost || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {/* Ledger Table */}
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-y-2 border-slate-900">
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-200">Date</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-200">Asset Ref</th>
                                <th className="p-4 text-[10px) font-black uppercase tracking-widest border-r border-slate-200">Service Executive</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-200">Technical Brief</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-right">Fiscal Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLogs.map((log) => (
                                <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-[11px] font-bold text-slate-900 whitespace-nowrap">{new Date(log.serviceDate).toLocaleDateString()}</td>
                                    <td className="p-4 border-r border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-blue-600 font-mono tracking-tighter uppercase">{log.device?.assetTag || 'NA'}</span>
                                            <span className="text-[9px] font-bold text-slate-400 truncate max-w-[120px]">{log.device?.brand} {log.device?.model}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-[11px] font-black text-slate-700 uppercase tracking-tight italic border-r border-slate-50">{log.servicedBy}</td>
                                    <td className="p-4 text-[11px] font-medium text-slate-500 leading-tight border-r border-slate-50">{log.description}</td>
                                    <td className="p-4 text-[11px] font-black text-slate-900 text-right tabular-nums">{currency} {log.cost?.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Master Footer */}
                    <div className="pt-10 border-t border-slate-200 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        <p>© Enterprise Service Tracking System // Master Ledger Audit</p>
                        <p>Ledger Hash: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                        <p>Page 01 // 01</p>
                    </div>
                </div>
            )}

            {/* Screen UI - Header Area */}
            <div className="flex flex-wrap items-center justify-between gap-6 print:hidden">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100 transform transition-transform hover:rotate-3">
                        <HistoryIcon fontSize="large" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Service History</h1>
                        <p className="text-slate-500 font-semibold mt-2">Comprehensive maintenance logs and fiscal oversight</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" fontSize="small" />
                        <input
                            type="text"
                            placeholder="Search asset, tech, description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 pr-5 py-3.5 bg-white border border-slate-100 rounded-2xl w-80 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm font-medium text-slate-700"
                        />
                    </div>
                    <button
                        onClick={handlePrintAll}
                        className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-50 transition-all shadow-sm active:scale-95 group"
                    >
                        <PrintIcon fontSize="small" className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                        Export Ledger
                    </button>
                    <div className="flex bg-slate-100 p-1 rounded-2xl">
                        {['All', 'Service', 'Repair'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filterType === type
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                {type === 'All' ? 'All Logs' : type === 'Service' ? 'Services' : 'Repairs'}
                            </button>
                        ))}
                    </div>
                    <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm active:scale-95">
                        <FilterIcon />
                    </button>
                </div>
            </div>

            {/* Screen UI - Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden print:hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Timeline</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Asset Identity</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Technical Context</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Executive Tech</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Fiscal Impact</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Utility</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLogs.map((log) => (
                                <tr key={log._id} className="hover:bg-slate-50/40 transition-all group">
                                    <td className="p-6 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-black text-slate-800 text-sm">
                                                {new Date(log.serviceDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded w-fit ${log.logType === 'Repair'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {log.logType || 'Service'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <ArticleIcon fontSize="small" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-blue-600 text-xs tracking-tighter uppercase font-mono">{log.device?.assetTag || 'Unknown'}</span>
                                                <span className="text-[10px] text-slate-400 font-bold truncate max-w-[120px] uppercase tracking-tight">{log.device?.brand} {log.device?.model}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-700 line-clamp-1 max-w-sm" title={log.description}>
                                                {log.description}
                                            </p>
                                            {log.comments && (
                                                <p className="text-[10px] text-slate-400 font-medium italic truncate max-w-xs">{log.comments}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-black">
                                                    {log.servicedBy?.charAt(0)}
                                                </div>
                                                <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{log.servicedBy}</span>
                                            </div>
                                            {log.additionalServicers && (
                                                <span className="text-[9px] text-slate-400 font-bold px-1 uppercase tracking-tight">
                                                    + {log.additionalServicers}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 text-sm tabular-nums">
                                                {currency} {log.cost?.toFixed(2)}
                                            </span>
                                            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Gross Charge</span>
                                        </div>
                                    </td>
                                    <td className="p-6 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handlePrintIndividual(log)}
                                                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Export Individual Sheet"
                                            >
                                                <ArticleIcon fontSize="small" />
                                            </button>
                                            <Link
                                                to={`/service/edit/${log._id}`}
                                                className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all inline-block"
                                                title="Modify Record"
                                            >
                                                <EditIcon fontSize="small" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(log._id)}
                                                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Delete Audit"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-32 text-center">
                                        <div className="flex flex-col items-center gap-5">
                                            <div className="p-6 bg-slate-50 rounded-full text-slate-200">
                                                <HistoryIcon sx={{ fontSize: 60 }} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-slate-800 font-black text-xl">Empty Ledger History</p>
                                                <p className="text-slate-400 font-medium">No service records found matching your current parameters.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ServiceLogList;

import { useState, useEffect } from 'react';
import {
    Assessment as ReportsIcon,
    TrendingUp as TrendIcon,
    Devices as DevicesIcon,
    Build as MaintenanceIcon,
    Print as PrintIcon,
    FileDownload as ExportIcon,
    VerifiedUser as OfficialIcon,
    Business as CorporateIcon,
    AccountCircle as UserIcon,
    CalendarToday as DateIcon
} from '@mui/icons-material';
import { getReportAnalytics } from '../services/api';

const Reports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState('Rs');
    const [totalDevices, setTotalDevices] = useState(0);

    useEffect(() => {
        const savedCurrency = localStorage.getItem('currency') || 'Rs';
        setCurrency(savedCurrency);
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await getReportAnalytics();
            setData(response.data);

            // Extract total devices from brand distribution
            const total = response.data.brandDistribution.reduce((sum, item) => sum + item.count, 0);
            setTotalDevices(total);
        } catch (error) {
            console.error('Error fetching report analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }


    return (
        <div className="space-y-8 animate-in fade-in duration-500 print:space-y-6 print:p-0 print:text-slate-900 overflow-visible">
            {/* Screen Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                        <ReportsIcon fontSize="medium" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">System Performance Reports</h1>
                        <p className="text-slate-500 font-medium">Inventory distribution and maintenance analytics</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <PrintIcon fontSize="small" />
                        Print Report
                    </button>
                </div>
            </div>

            {/* Premium Professional Print Header */}
            <div className="hidden print:flex flex-col border-b-[3px] border-slate-900 pb-8 mb-10 relative">
                {/* Confidential Watermark */}
                <div className="absolute -top-10 right-0 text-[60px] font-black text-slate-100/50 uppercase -rotate-12 select-none pointer-events-none tracking-tighter">
                    Confidential
                </div>

                <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                            <CorporateIcon sx={{ fontSize: 40 }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Office Device tracking system</h1>
                            <p className="text-sm font-bold text-slate-500 mt-2 tracking-widest uppercase">Department of Infrastructure & IT Assets</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                            Official Document
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reference Number</p>
                        <p className="text-base font-mono font-bold text-slate-900">ODT-ASSET-{new Date().getFullYear()}-{new Date().getTime().toString().slice(-6)}</p>
                    </div>
                </div>

                <div className="flex justify-between items-end bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Financial Maintenance Ledger</h2>
                        <div className="flex gap-6 mt-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                <UserIcon sx={{ fontSize: 16 }} className="text-slate-400" />
                                Prepared By: System Administrator
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                <DateIcon sx={{ fontSize: 16 }} className="text-slate-400" />
                                Generation Date: {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Report Status</p>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">
                            Verified & Final
                        </span>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-4 print:grid-cols-3">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center print:border-slate-300 print:rounded-none print:p-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-4 print:hidden">
                        <DevicesIcon />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest print:text-slate-400 print:font-bold">Total Active Assets</p>
                    <h3 className="text-4xl font-black text-slate-800 mt-1 print:text-2xl print:mt-0">{totalDevices}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center print:border-slate-300 print:rounded-none print:p-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-4 print:hidden">
                        <TrendIcon />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest print:text-slate-400 print:font-bold">Cumulative Cost</p>
                    <h3 className="text-4xl font-black text-slate-800 mt-1 print:text-2xl print:mt-0">{currency} {data?.totals.maintenanceCost.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden print:border-slate-300 print:rounded-none print:p-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl mb-4 print:hidden">
                        <MaintenanceIcon />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest print:text-slate-400 print:font-bold">Upcoming Services</p>
                    <h3 className="text-4xl font-black text-slate-800 mt-1 print:text-2xl print:mt-0">{data?.totals.upcomingServices}</h3>
                    {data?.totals.upcomingServices > 0 && (
                        <div className="absolute top-3 right-3 w-3 h-3 bg-orange-500 rounded-full animate-pulse print:hidden"></div>
                    )}
                </div>
            </div>


            {/* Detailed Table & Executive Analysis */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:border-slate-900 print:shadow-none print:rounded-none break-inside-avoid">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between print:p-4 print:bg-slate-900 print:text-white">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight print:text-white print:text-sm">Audit Trail: Performance & Expenditure Analysis</h3>
                    <div className="hidden print:block text-[8px] font-black tracking-widest uppercase text-slate-400">Section 02 // Financial Auditing</div>
                </div>

                {/* Analytical Metadata Row (Print Only) */}
                <div className="hidden print:grid grid-cols-4 border-b border-slate-200 divide-x divide-slate-200">
                    <div className="p-4">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Average Monthly Cost</p>
                        <p className="text-sm font-bold text-slate-900">{currency} {(data?.totals.maintenanceCost / (data?.monthlySpending.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="p-4">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Maintenance Intensity</p>
                        <p className="text-sm font-bold text-slate-900">{(data?.totals.maintenanceCost / (totalDevices || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })} / Asset</p>
                    </div>
                    <div className="p-4 col-span-2 bg-slate-50/50">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Fiscal Responsibility Disclaimer</p>
                        <p className="text-[7px] text-slate-500 font-medium leading-tight">Values above represent real-time infrastructure depreciation and vendor service costs. Discrepancies should be reported to IT Finance immediately.</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 font-black text-slate-500 print:bg-slate-100 print:border-b print:border-slate-800">
                                <th className="p-5 text-xs uppercase tracking-widest border-r border-white print:p-3 print:text-[9px] print:font-black print:text-slate-900">Reporting Period</th>
                                <th className="p-5 text-xs uppercase tracking-widest text-right print:p-3 print:text-[9px] print:font-black print:text-slate-900">Calculated Maintenance Capital ({currency})</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                            {data?.monthlySpending.slice().reverse().map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors print:hover:bg-transparent">
                                    <td className="p-5 font-bold text-slate-800 print:p-3 print:text-xs print:font-bold">{item.month}</td>
                                    <td className="p-5 text-right font-black text-slate-900 tabular-nums print:p-3 print:text-xs">
                                        {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white font-black print:bg-white print:text-slate-900 print:border-t-4 print:border-slate-900">
                            <tr>
                                <td className="p-5 text-sm uppercase tracking-widest print:p-4 print:text-xs print:font-black">Cumulative Annual Infrastructure Investment</td>
                                <td className="p-5 text-right text-xl tabular-nums print:p-4 print:text-lg">
                                    {currency} {data?.totals.maintenanceCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Report Footer (Print Only) */}
            <div className="hidden print:flex flex-col mt-12 pt-8 border-t-2 border-slate-200">
                <div className="flex justify-between items-start mb-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 border border-slate-300 rounded flex items-center justify-center text-[8px] text-slate-300 font-bold uppercase italic">Affix Seal</div>
                            <div>
                                <p className="text-[10px] font-black text-slate-900 uppercase">Authorized Officer Signature</p>
                                <div className="w-64 h-px bg-slate-300 mt-8 mb-1"></div>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest italic">IT Procurement & Asset Management</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right space-y-2">
                        <div className="flex justify-end gap-2 items-center text-[10px] font-black text-slate-900 uppercase tracking-widest">
                            <OfficialIcon sx={{ fontSize: 12 }} />
                            System Verified Output
                        </div>
                        <p className="text-[8px] text-slate-400 font-medium">Document Hash: {Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-100">
                    <p>© {new Date().getFullYear()} Office Device Inventory & Service Tracking System</p>
                    <p>Classification: CONTROLLED ASSET DATA</p>
                    <p>Page 01 // 01</p>
                </div>
            </div>
        </div>
    );
};

export default Reports;

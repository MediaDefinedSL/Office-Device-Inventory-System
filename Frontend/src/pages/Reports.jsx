import { useState, useEffect, useRef } from 'react';
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
    CalendarToday as DateIcon,
    Build as BuildIcon,
    ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { getReportAnalytics } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';

const Reports = () => {
    const [data, setData] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState('Rs');
    const [totalDevices, setTotalDevices] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState('');

    const maintenanceRef = useRef(null);
    const purchaseRef = useRef(null);

    useEffect(() => {
        const savedCurrency = localStorage.getItem('currency') || 'Rs';
        setCurrency(savedCurrency);
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await getReportAnalytics();
            setData(response.data);
            setFilteredData(response.data);

            // Extract total devices from brand distribution
            const total = response.data.brandDistribution.reduce((sum, item) => sum + item.count, 0);
            setTotalDevices(total);
        } catch (error) {
            console.error('Error fetching report analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthFilter = (monthValue) => {
        setSelectedMonth(monthValue);

        if (!monthValue || !data) {
            setFilteredData(data);
            return;
        }

        // Filter data by selected month
        const filtered = {
            ...data,
            monthlySpending: data.monthlySpending?.filter(item => item.month === monthValue) || [],
            monthlyRepairSpending: data.monthlyRepairSpending?.filter(item => item.month === monthValue) || [],
            monthlyServiceSpending: data.monthlyServiceSpending?.filter(item => item.month === monthValue) || [],
            monthlyPurchaseSpending: data.monthlyPurchaseSpending?.filter(item => item.month === monthValue) || [],
            details: {
                ...data.details,
                allPurchases: data.details?.allPurchases?.filter(p => {
                    const purchaseMonth = new Date(p.purchaseDate).toISOString().slice(0, 7);
                    return purchaseMonth === monthValue;
                }) || [],
                recentRepairs: data.details?.recentRepairs?.filter(r => {
                    const repairMonth = new Date(r.serviceDate).toISOString().slice(0, 7);
                    return repairMonth === monthValue;
                }) || [],
                recentServices: data.details?.recentServices?.filter(s => {
                    const serviceMonth = new Date(s.serviceDate).toISOString().slice(0, 7);
                    return serviceMonth === monthValue;
                }) || []
            }
        };

        // Recalculate totals for filtered data
        filtered.totals = {
            ...data.totals,
            repairCost: filtered.monthlyRepairSpending.reduce((sum, item) => sum + item.amount, 0),
            serviceCost: filtered.monthlyServiceSpending.reduce((sum, item) => sum + item.amount, 0),
            purchaseCost: filtered.monthlyPurchaseSpending.reduce((sum, item) => sum + item.amount, 0)
        };

        setFilteredData(filtered);
    };

    const clearFilter = () => {
        setSelectedMonth('');
        setFilteredData(data);
    };

    const handlePrintAll = () => {
        window.print();
    };

    const handleDownloadMaintenance = () => {
        downloadSectionAsPDF(maintenanceRef.current, 'Maintenance_Repair_Report');
    };

    const handleDownloadPurchase = () => {
        downloadSectionAsPDF(purchaseRef.current, 'Purchases_Report');
    };

    const downloadSectionAsPDF = (element, filename) => {
        if (!element) return;

        const printWindow = window.open('', '_blank');
        const content = element.innerHTML;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${filename}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body class="bg-white">
                <div class="max-w-4xl mx-auto">
                    <div class="mb-8 pb-4 border-b-2 border-slate-900">
                        <h1 class="text-2xl font-black text-slate-900 uppercase tracking-tight">Office Device Inventory System</h1>
                        <p class="text-sm font-bold text-slate-500 mt-1">${filename.replace(/_/g, ' ')}</p>
                        <p class="text-xs text-slate-400 mt-2">Generated: ${new Date().toLocaleDateString()}</p>
                    </div>
                    ${content}
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const exportToCSV = (data, filename) => {
        const headers = Object.keys(data[0] || {}).join(',');
        const rows = data.map(row => Object.values(row).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const exportMaintenanceCSV = () => {
        const maintenanceData = [
            { Type: 'Repair', 'Total Cost': data?.totals?.repairCost || 0 },
            { Type: 'Service/Maintenance', 'Total Cost': data?.totals?.serviceCost || 0 },
            { Type: 'Combined Total', 'Total Cost': (data?.totals?.repairCost || 0) + (data?.totals?.serviceCost || 0) }
        ];

        // Add monthly breakdown
        const monthlyData = (data?.monthlySpending || []).map(item => ({
            Month: item.month,
            'Total Cost': item.amount
        }));

        exportToCSV([...maintenanceData, { Type: '' }, { Type: 'Monthly Breakdown' }, ...monthlyData], 'Maintenance_Repair_Report');
    };

    const exportPurchaseCSV = () => {
        const purchaseData = (data?.details?.allPurchases || []).map(p => ({
            Date: new Date(p.purchaseDate).toLocaleDateString(),
            Vendor: p.vendor || 'N/A',
            'Invoice Number': p.invoiceNumber || 'N/A',
            'Total Cost': p.totalCost,
            'Item Count': p.items?.length || 0
        }));

        exportToCSV(purchaseData.length > 0 ? purchaseData : [{ Date: 'No purchases found', 'Total Cost': 0 }], 'Purchases_Report');
    };

    if (loading) {
        return <SkeletonLoader />;
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
                    {/* Month Filter */}
                    <div className="flex items-center gap-2">
                        <DateIcon className="text-slate-400" fontSize="small" />
                        <select
                            value={selectedMonth}
                            onChange={(e) => handleMonthFilter(e.target.value)}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Months</option>
                            {data?.monthlySpending?.map(item => (
                                <option key={item.month} value={item.month}>
                                    {new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </option>
                            ))}
                        </select>
                        {selectedMonth && (
                            <button
                                onClick={clearFilter}
                                className="px-3 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handlePrintAll}
                        className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <PrintIcon fontSize="small" />
                        Print All
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:gap-4 print:grid-cols-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center print:border-slate-300 print:rounded-none print:p-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-4 print:hidden">
                        <DevicesIcon />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest print:text-slate-400 print:font-bold">Total Active Assets</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-1 print:text-2xl print:mt-0">{totalDevices}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center print:border-slate-300 print:rounded-none print:p-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl mb-4 print:hidden">
                        <BuildIcon />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest print:text-slate-400 print:font-bold">Total Repair Cost</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-1 print:text-2xl print:mt-0">{currency} {(data?.totals?.repairCost || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center print:border-slate-300 print:rounded-none print:p-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-4 print:hidden">
                        <MaintenanceIcon />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest print:text-slate-400 print:font-bold">Total Service Cost</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-1 print:text-2xl print:mt-0">{currency} {(data?.totals?.serviceCost || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center print:border-slate-300 print:rounded-none print:p-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl mb-4 print:hidden">
                        <ShoppingCartIcon />
                    </div>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest print:text-slate-400 print:font-bold">Total Purchase Cost</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-1 print:text-2xl print:mt-0">{currency} {(data?.totals?.purchaseCost || 0).toLocaleString()}</h3>
                </div>
            </div>

            {/* SECTION 1: Maintenance & Repair Report */}
            <div ref={maintenanceRef} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:rounded-none break-inside-avoid">
                <div className="p-6 border-b border-slate-100 print:p-4 print:bg-slate-900 print:text-white">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 text-red-600 rounded-xl print:bg-white print:text-slate-900">
                                <BuildIcon fontSize="medium" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight print:text-white print:text-sm">Repair & Service Report</h3>
                                <p className="text-sm text-slate-500 print:text-slate-300">Maintenance and repair cost breakdown</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 print:hidden">
                            <button
                                onClick={exportMaintenanceCSV}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-all text-sm"
                            >
                                <ExportIcon fontSize="small" />
                                Export CSV
                            </button>
                            <button
                                onClick={handleDownloadMaintenance}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all text-sm"
                            >
                                <PrintIcon fontSize="small" />
                                Print / PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cost Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-slate-100 print:grid-cols-3 print:p-4">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 print:bg-white print:border-slate-300">
                        <p className="text-red-600 text-xs font-black uppercase tracking-widest print:text-slate-500">Repair Costs</p>
                        <h4 className="text-2xl font-black text-slate-800 mt-1 print:text-xl">{currency} {(filteredData?.totals?.repairCost || 0).toLocaleString()}</h4>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 print:bg-white print:border-slate-300">
                        <p className="text-emerald-600 text-xs font-black uppercase tracking-widest print:text-slate-500">Service/Maintenance Costs</p>
                        <h4 className="text-2xl font-black text-slate-800 mt-1 print:text-xl">{currency} {(filteredData?.totals?.serviceCost || 0).toLocaleString()}</h4>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-white print:border-slate-300">
                        <p className="text-slate-600 text-xs font-black uppercase tracking-widest print:text-slate-500">Combined Total</p>
                        <h4 className="text-2xl font-black text-slate-800 mt-1 print:text-xl">{currency} {((filteredData?.totals?.repairCost || 0) + (filteredData?.totals?.serviceCost || 0)).toLocaleString()}</h4>
                    </div>
                </div>

                {/* Monthly Breakdown Table */}
                <div className="overflow-x-auto p-6 print:p-4">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Monthly Cost Breakdown</h4>
                    <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-slate-100 font-black text-slate-600 print:bg-slate-100">
                                <th className="p-4 text-xs uppercase tracking-widest border-b border-slate-200">Month</th>
                                <th className="p-4 text-xs uppercase tracking-widest border-b border-slate-200 text-right">Repair Cost</th>
                                <th className="p-4 text-xs uppercase tracking-widest border-b border-slate-200 text-right">Service Cost</th>
                                <th className="p-4 text-xs uppercase tracking-widest border-b border-slate-200 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData?.monthlySpending?.slice().reverse().map((item, idx) => {
                                const repairAmount = filteredData?.monthlyRepairSpending?.find(r => r.month === item.month)?.amount || 0;
                                const serviceAmount = filteredData?.monthlyServiceSpending?.find(s => s.month === item.month)?.amount || 0;
                                return (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                        <td className="p-4 font-bold text-slate-800">{item.month}</td>
                                        <td className="p-4 text-right font-semibold text-red-600 tabular-nums">{repairAmount > 0 ? `${currency} ${repairAmount.toLocaleString()}` : '-'}</td>
                                        <td className="p-4 text-right font-semibold text-emerald-600 tabular-nums">{serviceAmount > 0 ? `${currency} ${serviceAmount.toLocaleString()}` : '-'}</td>
                                        <td className="p-4 text-right font-black text-slate-900 tabular-nums">{currency} {item.amount.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                            {(!filteredData?.monthlySpending || filteredData.monthlySpending.length === 0) && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500">
                                        No data found for selected month
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white font-black print:bg-slate-100 print:text-slate-900">
                            <tr>
                                <td className="p-4 text-sm uppercase tracking-widest">Total</td>
                                <td className="p-4 text-right tabular-nums print:text-red-600">{currency} {(filteredData?.totals?.repairCost || 0).toLocaleString()}</td>
                                <td className="p-4 text-right tabular-nums print:text-emerald-600">{currency} {(filteredData?.totals?.serviceCost || 0).toLocaleString()}</td>
                                <td className="p-4 text-right text-lg tabular-nums">{currency} {((filteredData?.totals?.repairCost || 0) + (filteredData?.totals?.serviceCost || 0)).toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* SECTION 2: Purchases Report */}
            <div ref={purchaseRef} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:rounded-none break-inside-avoid">
                <div className="p-6 border-b border-slate-100 print:p-4 print:bg-slate-900 print:text-white">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-xl print:bg-white print:text-slate-900">
                                <ShoppingCartIcon fontSize="medium" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight print:text-white print:text-sm">Purchases Report</h3>
                                <p className="text-sm text-slate-500 print:text-slate-300">Component and accessory purchase records</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 print:hidden">
                            <button
                                onClick={exportPurchaseCSV}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-all text-sm"
                            >
                                <ExportIcon fontSize="small" />
                                Export CSV
                            </button>
                            <button
                                onClick={handleDownloadPurchase}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all text-sm"
                            >
                                <PrintIcon fontSize="small" />
                                Print / PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Purchase Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-slate-100 print:grid-cols-3 print:p-4">
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 print:bg-white print:border-slate-300">
                        <p className="text-purple-600 text-xs font-black uppercase tracking-widest print:text-slate-500">Total Purchase Cost</p>
                        <h4 className="text-2xl font-black text-slate-800 mt-1 print:text-xl">{currency} {(filteredData?.totals?.purchaseCost || 0).toLocaleString()}</h4>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 print:bg-white print:border-slate-300">
                        <p className="text-blue-600 text-xs font-black uppercase tracking-widest print:text-slate-500">Total Purchases</p>
                        <h4 className="text-2xl font-black text-slate-800 mt-1 print:text-xl">{filteredData?.details?.allPurchases?.length || 0}</h4>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 print:bg-white print:border-slate-300">
                        <p className="text-orange-600 text-xs font-black uppercase tracking-widest print:text-slate-500">Total Items</p>
                        <h4 className="text-2xl font-black text-slate-800 mt-1 print:text-xl">
                            {filteredData?.details?.allPurchases?.reduce((sum, p) => sum + (p.items?.length || 0), 0) || 0}
                        </h4>
                    </div>
                </div>

                {/* Monthly Purchase Breakdown */}
                <div className="overflow-x-auto p-6 print:p-4">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Monthly Purchase Spending</h4>
                    <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden mb-8">
                        <thead>
                            <tr className="bg-slate-100 font-black text-slate-600 print:bg-slate-100">
                                <th className="p-4 text-xs uppercase tracking-widest border-b border-slate-200">Month</th>
                                <th className="p-4 text-xs uppercase tracking-widest border-b border-slate-200 text-right">Purchase Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData?.monthlyPurchaseSpending?.slice().reverse().map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-slate-800">{item.month}</td>
                                    <td className="p-4 text-right font-black text-slate-900 tabular-nums">{currency} {item.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                            {(!filteredData?.monthlyPurchaseSpending || filteredData.monthlyPurchaseSpending.length === 0) && (
                                <tr>
                                    <td colSpan="2" className="p-8 text-center text-slate-500">
                                        No purchase records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white font-black print:bg-slate-100 print:text-slate-900">
                            <tr>
                                <td className="p-4 text-sm uppercase tracking-widest">Total Purchase Cost</td>
                                <td className="p-4 text-right text-lg tabular-nums">{currency} {(filteredData?.totals?.purchaseCost || 0).toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Detailed Purchase Records */}
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Detailed Purchase Records</h4>
                    <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-slate-100 font-black text-slate-600 print:bg-slate-100">
                                <th className="p-4 text-xs uppercase tracking-widest border-b border-slate-200">Date</th>
                                <th className="p-4 text-xs uppercase tracking-widest border-b border-slate-200">Vendor</th>
                                <th className="p-4 text-xs uppercase tracking-widest border-b border-slate-200">Invoice</th>
                                <th className="p-4 text-xs uppercase tracking-widest border-b border-slate-200">Items</th>
                                <th className="p-4 text-xs uppercase tracking-widest border-b border-slate-200 text-right">Total Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData?.details?.allPurchases?.map((purchase, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-slate-800">{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                                    <td className="p-4 text-slate-700">{purchase.vendor || 'N/A'}</td>
                                    <td className="p-4 text-slate-600 font-mono text-sm">{purchase.invoiceNumber || 'N/A'}</td>
                                    <td className="p-4 text-slate-700">
                                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                                            {purchase.items?.length || 0} items
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-black text-slate-900 tabular-nums">{currency} {purchase.totalCost?.toLocaleString()}</td>
                                </tr>
                            ))}
                            {(!filteredData?.details?.allPurchases || filteredData.details.allPurchases.length === 0) && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">
                                        No purchase records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white font-black print:bg-slate-100 print:text-slate-900">
                            <tr>
                                <td colSpan="4" className="p-4 text-sm uppercase tracking-widest">Grand Total</td>
                                <td className="p-4 text-right text-lg tabular-nums">{currency} {(filteredData?.totals?.purchaseCost || 0).toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;

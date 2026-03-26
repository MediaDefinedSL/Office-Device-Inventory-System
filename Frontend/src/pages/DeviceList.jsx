import { useState, useEffect } from 'react';
import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Chip,
    Box,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Build as BuildIcon,
    PictureAsPdf as PdfIcon,
    Article as ArticleIcon,
    Business as CorporateIcon,
    VerifiedUser as OfficialIcon,
    AccountCircle as UserIcon,
    CalendarToday as DateIcon,
    Print as PrintIcon,
    QrCode as QrCodeIcon,
    QrCodeScanner as QrCodeScannerIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getDevices, deleteDevice, getDeviceServiceLogs } from '../services/api';
import { useAuth } from '../context/AuthContext';
import QRCodeModal from '../components/QRCodeModal';
import QRScannerModal from '../components/QRScannerModal';

function DeviceList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);
    const [search, setSearch] = useState('');
    const [isPrinting, setIsPrinting] = useState(false);
    const [printTarget, setPrintTarget] = useState(null); // 'all' or specific device object
    const [targetLogs, setTargetLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [qrDevice, setQrDevice] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await getDevices();
            setDevices(response.data);
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this device?')) {
            try {
                await deleteDevice(id);
                fetchDevices();
            } catch (error) {
                console.error('Error deleting device:', error);
            }
        }
    };

    const handlePrintIndividual = async (device) => {
        setLoadingLogs(true);
        setPrintTarget(device);
        try {
            const response = await getDeviceServiceLogs(device._id);
            setTargetLogs(response.data);
            setTimeout(() => {
                window.print();
                setPrintTarget(null);
                setTargetLogs([]);
            }, 500);
        } catch (error) {
            console.error('Error fetching logs for individual report:', error);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handlePrintAll = () => {
        setPrintTarget('all');
        setTimeout(() => {
            window.print();
            setPrintTarget(null);
        }, 300);
    };

    const filteredDevices = devices.filter(device =>
        device.model?.toLowerCase().includes(search.toLowerCase()) ||
        device.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
        device.brand?.toLowerCase().includes(search.toLowerCase()) ||
        device.assignedUser?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'success';
            case 'Under Repair': return 'warning';
            case 'Retired': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box>
            {/* Professional Print View (Individual) */}
            {printTarget && printTarget !== 'all' && (
                <div className="hidden print:block font-sans p-0 text-slate-900 bg-white min-h-screen">
                    {/* Watermark */}
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[80px] font-black text-slate-100/30 uppercase -rotate-45 pointer-events-none select-none z-0">
                        OFFICIAL RECORD
                    </div>

                    <div className="relative z-10 p-8 space-y-8">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b-[3px] border-slate-900 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                                    <CorporateIcon sx={{ fontSize: 40 }} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Device Lifecycle Record</h1>
                                    <p className="text-sm font-bold text-slate-500 mt-2 tracking-widest uppercase">Infrastructure Management Division</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-2">Internal Assets</span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Report Ref</p>
                                <p className="text-base font-mono font-bold">ARC-{printTarget.serialNumber?.slice(-6) || 'SYS'}-{new Date().getTime().toString().slice(-4)}</p>
                            </div>
                        </div>

                        {/* Device Metadata Section */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 border-b border-slate-100 pb-1">Essential Information</h3>
                                    <div className="grid grid-cols-2 gap-y-3">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Device Type</p>
                                        <p className="text-xs font-black text-slate-900">{printTarget.deviceType}</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Brand/Manufacturer</p>
                                        <p className="text-xs font-black text-slate-900">{printTarget.brand}</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Model Specification</p>
                                        <p className="text-xs font-black text-slate-900">{printTarget.model}</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Serial Number (S/N)</p>
                                        <p className="text-xs font-mono font-black text-blue-600">{printTarget.serialNumber}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 border-b border-slate-100 pb-1">Operational Status</h3>
                                    <div className="grid grid-cols-2 gap-y-3">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Current Status</p>
                                        <span className={`text-[10px] font-black uppercase w-fit px-2 py-0.5 rounded border ${printTarget.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            printTarget.status === 'Under Repair' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                            {printTarget.status}
                                        </span>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Department</p>
                                        <p className="text-xs font-black text-slate-900">{printTarget.department}</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Assigned Custodian</p>
                                        <p className="text-xs font-black text-slate-900 underline decoration-slate-300 decoration-2">{printTarget.assignedUser || 'NO CUSTODIAN'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                                    <OfficialIcon sx={{ fontSize: 14 }} className="text-slate-900" />
                                    Hardware Configuration
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OS</span>
                                        <span className="text-xs font-bold text-slate-800">{printTarget.hardwareConfig?.operatingSystem || 'Not Specified'}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">RAM</p>
                                            <p className="text-xs font-black text-slate-900">{printTarget.hardwareConfig?.ram || '-'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Storage</p>
                                            <p className="text-xs font-black text-slate-900">{printTarget.hardwareConfig?.storageCapacity || '-'} {printTarget.hardwareConfig?.storageType}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Processor / Other Specs</p>
                                        <p className="text-xs font-bold text-slate-700">{printTarget.hardwareConfig?.processor || 'No additional hardware data provided.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Service Logs Section */}
                        <div className="space-y-4 break-inside-avoid">
                            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                                <h3 className="text-sm font-black uppercase tracking-widest">Maintenance & Service Log History</h3>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Audit Trail v2.0</span>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-100">Date</th>
                                        <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-100">Description</th>
                                        <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-100">Technician</th>
                                        <th className="p-3 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-slate-100 text-right">Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {targetLogs.map((log) => (
                                        <tr key={log._id}>
                                            <td className="p-3 text-[11px] font-bold whitespace-nowrap">{new Date(log.serviceDate).toLocaleDateString()}</td>
                                            <td className="p-3 text-[11px] font-medium text-slate-600 leading-relaxed">{log.description}</td>
                                            <td className="p-3 text-[11px] font-bold text-slate-700 italic">{log.servicedBy}</td>
                                            <td className="p-3 text-[11px] font-black text-slate-900 text-right tabular-nums">Rs {log.cost?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {targetLogs.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-xs font-bold text-slate-300 italic">No historical service records found for this asset.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="pt-8 mt-auto border-t border-slate-100 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Official Verification</p>
                                <div className="flex gap-8">
                                    <div className="space-y-1">
                                        <div className="w-32 h-px bg-slate-300 mb-1"></div>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase">IT Manager</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="w-32 h-px bg-slate-300 mb-1"></div>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase">Authorized Signature</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[9px] font-bold text-slate-400 tracking-tighter uppercase">Generation Timestamp: {new Date().toLocaleString()}</p>
                                <p className="text-[9px] font-black text-slate-900 tracking-widest uppercase italic">CONFIDENTIAL ASSET DATA</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Professional Print View (Inventory List) */}
            {printTarget === 'all' && (
                <div className="hidden print:block font-sans p-8 space-y-8 bg-white text-slate-900 min-h-screen">
                    {/* Header */}
                    <div className="flex justify-between items-end border-b-4 border-slate-900 pb-6">
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Master Device Inventory</h1>
                            <p className="text-sm font-bold text-slate-500 mt-2 tracking-[0.3em] uppercase">Enterprise Asset Management System</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Assets</p>
                            <p className="text-3xl font-black text-slate-900 leading-none">{filteredDevices.length}</p>
                        </div>
                    </div>

                    {/* Metadata Row */}
                    <div className="grid grid-cols-3 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Report Generated</span>
                            <span className="text-xs font-bold text-slate-700">{new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Classification</span>
                            <span className="text-xs font-bold text-slate-700">Internal Audit / Official</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">System Status</span>
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 uppercase w-fit ml-auto">Verified Stable</span>
                        </div>
                    </div>

                    {/* Inventory Table */}
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest">
                                <th className="p-4 border-r border-slate-700">Device Type</th>
                                <th className="p-4 border-r border-slate-700">Brand & Model</th>
                                <th className="p-4 border-r border-slate-700">S/N</th>
                                <th className="p-4 border-r border-slate-700 text-center">Department</th>
                                <th className="p-4 border-r border-slate-700">Custodian</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDevices.map((device) => (
                                <tr key={device._id} className="border-b border-slate-100 font-medium">
                                    <td className="p-4 text-xs font-black text-slate-800 uppercase tracking-tight">{device.deviceType}</td>
                                    <td className="p-4 text-[11px] font-bold text-slate-600">{device.brand} {device.model}</td>
                                    <td className="p-4 text-xs font-mono font-black text-blue-600">{device.serialNumber}</td>
                                    <td className="p-4 text-[10px] font-black text-slate-500 uppercase text-center">{device.department || 'GLOBAL'}</td>
                                    <td className="p-4 text-[11px] font-bold text-slate-700 underline underline-offset-4 decoration-slate-200 font-mono">{device.assignedUser || '-'}</td>
                                    <td className="p-4 text-center">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${device.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            device.status === 'Under Repair' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                            {device.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Print Footer */}
                    <div className="fixed bottom-8 left-8 right-8 pt-6 border-t border-slate-200 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <p>© Master Device Ledger // ODT System</p>
                        <p>Page 01 // 01</p>
                        <p>Ref: INV-{new Date().toISOString().split('T')[0]}</p>
                    </div>
                </div>
            )}

            {/* Screen UI - Header Area */}
            <Box className="print:hidden">
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', lg: 'center' }, gap: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                            <ArticleIcon fontSize="medium" />
                        </div>
                        <div>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'slate.800' }}>Device Inventory</Typography>
                            <p className="text-sm text-slate-500 font-medium">Manage and track all company hardware assets</p>
                        </div>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, width: { xs: '100%', lg: 'auto' } }}>
                        <TextField
                            size="small"
                            placeholder="Search serial, brand..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon className="text-slate-400" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                width: { xs: '100%', sm: 250 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    bgcolor: 'white',
                                    '& fieldset': { borderColor: '#f1f5f9' },
                                    '&:hover fieldset': { borderColor: '#e2e8f0' },
                                }
                            }}
                        />
                        <Button
                            variant="outlined"
                            onClick={handlePrintAll}
                            startIcon={<PrintIcon />}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 3,
                                py: 1,
                                borderColor: '#e2e8f0',
                                color: 'slate.600',
                                '&:hover': { bgcolor: 'white', borderColor: '#cbd5e1' }
                            }}
                        >
                            Export Master List
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setIsScannerOpen(true)}
                            startIcon={<QrCodeScannerIcon />}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 3,
                                py: 1,
                                borderColor: '#e2e8f0',
                                color: 'slate.600',
                                '&:hover': { bgcolor: 'white', borderColor: '#cbd5e1' }
                            }}
                        >
                            Scan QR
                        </Button>
                        {user?.role === 'Admin' && (
                            <Button
                                variant="contained"
                                color="primary"
                                component={RouterLink}
                                to="/add"
                                startIcon={<BuildIcon />}
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    px: 3,
                                    py: 1,
                                    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
                                }}
                            >
                                Add Asset
                            </Button>
                        )}
                    </Box>
                </Box>

                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', border: '1px solid #f1f5f9', overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 1000 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Device Details</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Identifiers</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Deployment</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Config</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Status</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredDevices.map((device) => (
                                <TableRow key={device._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800">{device.brand} {device.model}</span>
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black w-fit mt-1 uppercase tracking-wider">{device.deviceType}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">{device.serialNumber}</span>
                                            {device.warrantyExpiryDate && (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 w-fit rounded flex items-center gap-1 ${new Date(device.warrantyExpiryDate) > new Date() ? 'text-emerald-600' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                    {new Date(device.warrantyExpiryDate) > new Date() ? 'Under Warranty' : 'Out of Warranty'}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{device.assignedUser || 'Unassigned'}</span>
                                            <span className="text-xs text-slate-400 font-medium">{device.department || 'No Dept'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-600">{device.hardwareConfig?.operatingSystem || '-'}</span>
                                            <span className="text-[10px] text-slate-400 font-medium italic">{device.hardwareConfig?.ram} / {device.hardwareConfig?.storageCapacity}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={device.status}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                fontWeight: 800,
                                                fontSize: '10px',
                                                textTransform: 'uppercase',
                                                bgcolor:
                                                    device.status === 'Active' ? 'success.50' :
                                                        device.status === 'Under Repair' ? 'warning.50' :
                                                            'error.50',
                                                color:
                                                    device.status === 'Active' ? 'success.dark' :
                                                        device.status === 'Under Repair' ? 'warning.dark' :
                                                            'error.dark',
                                                borderColor: 'currentColor',
                                                opacity: 0.8
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box className="flex justify-end gap-1">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handlePrintIndividual(device)}
                                                title="Export Individual Report"
                                                disabled={loadingLogs}
                                                sx={{ bgcolor: 'blue.50', '&:hover': { bgcolor: 'blue.100' } }}
                                            >
                                                <ArticleIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => setQrDevice(device)}
                                                title="View QR Code"
                                                sx={{ color: 'slate.400', '&:hover': { color: 'purple.600', bgcolor: 'purple.50' } }}
                                            >
                                                <QrCodeIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton component={RouterLink} to={`/edit/${device._id}`} size="small" sx={{ color: 'slate.400', '&:hover': { color: 'blue.600', bgcolor: 'blue.50' } }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton component={RouterLink} to={`/device/service/${device._id}`} size="small" sx={{ color: 'slate.400', '&:hover': { color: 'orange.600', bgcolor: 'orange.50' } }}>
                                                <BuildIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(device._id)} size="small" sx={{ color: 'slate.400', '&:hover': { color: 'rose.600', bgcolor: 'rose.50' } }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredDevices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <div className="py-20 flex flex-col items-center">
                                            <div className="p-4 bg-slate-50 rounded-full text-slate-200 mb-4">
                                                <SearchIcon sx={{ fontSize: 40 }} />
                                            </div>
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: 'slate.400' }}>No assets found</Typography>
                                            <p className="text-sm text-slate-400">Try adjusting your search filters</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <QRCodeModal
                open={!!qrDevice}
                onClose={() => setQrDevice(null)}
                device={qrDevice}
            />
            <QRScannerModal
                open={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
            />
        </Box>
    );
}
export default DeviceList;

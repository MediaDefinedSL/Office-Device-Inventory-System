import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Button
} from '@mui/material';
import {
    ReportProblem as ReportIcon,
    LaptopMac as DeviceIcon,
    CheckCircle as CheckCircleIcon,
    Assignment as TicketIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { getMyDevices, getMyTickets, createTicket, registerMyDevice } from '../services/api';
import toast from 'react-hot-toast';

function EmployeeDashboard() {
    const [devices, setDevices] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [ticketForm, setTicketForm] = useState({ deviceId: '', issueDescription: '', priority: 'Medium' });
    const [registerForm, setRegisterForm] = useState({ 
        deviceType: 'Laptop', 
        brand: '', 
        model: '', 
        serialNumber: '',
        hardwareConfig: { cpu: '', ram: '', storageCapacity: '' }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [devicesRes, ticketsRes] = await Promise.all([
                getMyDevices(),
                getMyTickets()
            ]);
            setDevices(devicesRes.data);
            setTickets(ticketsRes.data);
        } catch (error) {
            console.error('Error fetching employee data:', error);
            toast.error('Failed to load your dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReportModal = (device = null) => {
        setSelectedDevice(device);
        setTicketForm({ deviceId: device ? device._id : '', issueDescription: '', priority: 'Medium' });
        setIsReportModalOpen(true);
    };

    const handleSubmitRegistration = async () => {
        if (!registerForm.brand || !registerForm.model || !registerForm.serialNumber) {
            toast.error('Please fill in all device details');
            return;
        }

        try {
            await registerMyDevice(registerForm);
            toast.success('Device registered successfully!');
            setIsRegisterModalOpen(false);
            setRegisterForm({ 
                deviceType: 'Laptop', 
                brand: '', 
                model: '', 
                serialNumber: '',
                hardwareConfig: { cpu: '', ram: '', storageCapacity: '' }
            });
            fetchData(); // Refresh devices
        } catch (error) {
            console.error('Error registering device:', error);
            toast.error(error.response?.data?.error || 'Failed to register device');
        }
    };

    const handleSubmitTicket = async () => {
        if (!ticketForm.deviceId) {
            toast.error('Please select a device');
            return;
        }
        if (!ticketForm.issueDescription.trim()) {
            toast.error('Please describe the issue');
            return;
        }

        try {
            await createTicket({
                device: ticketForm.deviceId,
                issueDescription: ticketForm.issueDescription,
                priority: ticketForm.priority
            });
            toast.success('Ticket submitted successfully!');
            setIsReportModalOpen(false);
            fetchData(); // Refresh tickets
        } catch (error) {
            console.error('Error submitting ticket:', error);
            toast.error('Failed to submit ticket');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const openTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;
    const resolvedTicketsCount = tickets.filter(t => t.status === 'Resolved').length;

    const stats = [
        { label: 'Assigned Devices', value: devices.length, icon: <DeviceIcon fontSize="large" />, color: 'bg-blue-500 shadow-blue-200' },
        { label: 'Active Issues', value: openTicketsCount, icon: <ReportIcon fontSize="large" />, color: openTicketsCount > 0 ? 'bg-orange-500 shadow-orange-200' : 'bg-emerald-500 shadow-emerald-200' },
        { label: 'Resolved Tickets', value: resolvedTicketsCount, icon: <CheckCircleIcon fontSize="large" />, color: 'bg-indigo-500 shadow-indigo-200' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Open': return 'bg-rose-100 text-rose-600';
            case 'In Progress': return 'bg-orange-100 text-orange-600';
            case 'Resolved': return 'bg-emerald-100 text-emerald-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'High': return 'border-rose-200 text-rose-600';
            case 'Medium': return 'border-orange-200 text-orange-600';
            case 'Low': return 'border-blue-200 text-blue-600';
            default: return 'border-slate-200 text-slate-600';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">My Workplace</h1>
                    <p className="text-slate-500 font-medium mt-1">View your assigned equipment and report technical issues.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsRegisterModalOpen(true)}
                        className="font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
                    >
                        <DeviceIcon fontSize="small" />
                        Register New Device
                    </button>
                    <button
                        onClick={() => handleOpenReportModal(null)}
                        className={`font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200`}
                    >
                        <ReportIcon fontSize="small" />
                        Raise IT Ticket
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className={`${stat.color} p-6 rounded-2xl text-white shadow-lg transform transition-all duration-300 hover:scale-[1.02]`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-white/80 font-medium text-sm">{stat.label}</p>
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
                {/* My Devices */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">My Assigned Devices</h2>
                    {devices.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-500">
                            You currently have no devices officially assigned to you.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {devices.map((device) => (
                                <div key={device._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                                <DeviceIcon />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{device.brand} {device.model}</h3>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                                                    {device.assetTag || device.serialNumber}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="bg-slate-50 p-2 rounded-lg">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">Status</p>
                                                <p className="text-xs font-semibold text-slate-700">{device.status}</p>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-lg">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">Type</p>
                                                <p className="text-xs font-semibold text-slate-700">{device.deviceType}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleOpenReportModal(device)}
                                        className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ReportIcon fontSize="small" />
                                        Report Issue
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* My Tickets Pipeline */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                            <TicketIcon className="text-blue-500" />
                            My IT Tickets
                        </div>
                    </div>
                    <div className="p-5 flex-1 overflow-y-auto max-h-[600px]">
                        <div className="space-y-4">
                            {tickets.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircleIcon sx={{ fontSize: 48 }} className="text-emerald-400 mb-2 opacity-80" />
                                    <p className="text-slate-500 font-medium text-sm">You haven't reported any issues.</p>
                                </div>
                            ) : (
                                tickets.map((ticket, idx) => (
                                    <div key={idx} className="p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${getStatusStyle(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                <AccessTimeIcon sx={{ fontSize: 12 }} />
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-800 mb-1">
                                            {ticket.device ? `${ticket.device.brand} ${ticket.device.model}` : 'Unknown Device'}
                                        </h4>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                            {ticket.issueDescription}
                                        </p>
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-white ${getPriorityStyle(ticket.priority)}`}>
                                                {ticket.priority} Priority
                                            </span>
                                            {ticket.adminNotes && (
                                                <span className="text-[10px] italic text-blue-500 font-medium">
                                                    Admin Replied
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Register Device Modal */}
            <Dialog
                open={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ style: { borderRadius: 16 } }}
            >
                <div className="p-6 pb-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <DeviceIcon />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Register New Device</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Add a new device and assign it to yourself</p>
                    </div>
                </div>

                <DialogContent sx={{ p: '24px !important' }}>
                    <TextField
                        select
                        fullWidth
                        label="Device Type"
                        value={registerForm.deviceType}
                        onChange={(e) => setRegisterForm({ ...registerForm, deviceType: e.target.value })}
                        margin="normal"
                        sx={{ mb: 3 }}
                    >
                        <MenuItem value="Laptop"><div className="font-medium">Laptop</div></MenuItem>
                        <MenuItem value="Desktop"><div className="font-medium">Desktop</div></MenuItem>
                        <MenuItem value="Mobile"><div className="font-medium">Mobile Device</div></MenuItem>
                        <MenuItem value="Tablet"><div className="font-medium">Tablet</div></MenuItem>
                        <MenuItem value="Other"><div className="font-medium">Other Accessory</div></MenuItem>
                    </TextField>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <TextField
                            fullWidth
                            label="Brand"
                            placeholder="e.g. Dell, Apple"
                            value={registerForm.brand}
                            onChange={(e) => setRegisterForm({ ...registerForm, brand: e.target.value })}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Model"
                            placeholder="e.g. XPS 15"
                            value={registerForm.model}
                            onChange={(e) => setRegisterForm({ ...registerForm, model: e.target.value })}
                            required
                        />
                    </div>

                    <TextField
                        fullWidth
                        label="Serial Number / Asset Tag"
                        placeholder="Must be unique"
                        value={registerForm.serialNumber}
                        onChange={(e) => setRegisterForm({ ...registerForm, serialNumber: e.target.value })}
                        required
                        sx={{ mb: 3 }}
                    />
                    
                    {(registerForm.deviceType === 'Laptop' || registerForm.deviceType === 'Desktop') && (
                        <div className="space-y-4 pt-3 border-t border-slate-100">
                            <p className="text-sm font-bold text-slate-700">Hardware Specifics</p>
                            <div className="grid grid-cols-2 gap-4">
                                <TextField
                                    fullWidth
                                    label="CPU (Processor)"
                                    placeholder="e.g. Intel Core i7"
                                    value={registerForm.hardwareConfig.cpu}
                                    onChange={(e) => setRegisterForm({ 
                                        ...registerForm, 
                                        hardwareConfig: { ...registerForm.hardwareConfig, cpu: e.target.value } 
                                    })}
                                />
                                <TextField
                                    fullWidth
                                    label="RAM"
                                    placeholder="e.g. 16GB"
                                    value={registerForm.hardwareConfig.ram}
                                    onChange={(e) => setRegisterForm({ 
                                        ...registerForm, 
                                        hardwareConfig: { ...registerForm.hardwareConfig, ram: e.target.value } 
                                    })}
                                />
                            </div>
                            <TextField
                                fullWidth
                                label="Storage (Disk Size)"
                                placeholder="e.g. 512GB SSD"
                                value={registerForm.hardwareConfig.storageCapacity}
                                onChange={(e) => setRegisterForm({ 
                                    ...registerForm, 
                                    hardwareConfig: { ...registerForm.hardwareConfig, storageCapacity: e.target.value } 
                                })}
                            />
                        </div>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setIsRegisterModalOpen(false)} sx={{ color: '#64748b', fontWeight: 'bold', mr: 1, borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitRegistration}
                        variant="contained"
                        disableElevation
                        sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, fontWeight: 'bold', borderRadius: 2, px: 4 }}
                    >
                        Register
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Report Issue Modal */}
            <Dialog
                open={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ style: { borderRadius: 16 } }}
            >
                <div className="p-6 pb-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                        <ReportIcon />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Report Device Issue</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Submit a ticket to the IT Helpdesk</p>
                    </div>
                </div>

                <DialogContent sx={{ p: '24px !important' }}>
                    {selectedDevice ? (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 flex items-center gap-4">
                            <DeviceIcon className="text-slate-400" />
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Affected Device</p>
                                <p className="text-sm font-bold text-slate-800">{selectedDevice.brand} {selectedDevice.model}</p>
                                <p className="text-xs text-slate-500">{selectedDevice.assetTag || selectedDevice.serialNumber}</p>
                            </div>
                        </div>
                    ) : (
                        <TextField
                            select
                            fullWidth
                            label="Select Device"
                            value={ticketForm.deviceId}
                            onChange={(e) => setTicketForm({ ...ticketForm, deviceId: e.target.value })}
                            margin="normal"
                            sx={{ mb: 3 }}
                            required
                        >
                            {devices.map(dev => (
                                <MenuItem key={dev._id} value={dev._id}>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">{dev.brand} {dev.model}</span>
                                        <span className="text-[10px] text-slate-500 uppercase">Tag: {dev.assetTag || dev.serialNumber}</span>
                                    </div>
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    <TextField
                        select
                        fullWidth
                        label="Priority Level"
                        value={ticketForm.priority}
                        onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                        margin="normal"
                        sx={{ mb: 3 }}
                    >
                        <MenuItem value="Low"><div className="font-medium text-blue-600">Low - Minor annoyance, but mostly usable</div></MenuItem>
                        <MenuItem value="Medium"><div className="font-medium text-orange-600">Medium - Affects normal work</div></MenuItem>
                        <MenuItem value="High"><div className="font-medium text-rose-600">High - Completely unusable / critical</div></MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        multiline
                        rows={5}
                        label="Describe the issue"
                        placeholder="What exactly is going wrong? When did it start?"
                        value={ticketForm.issueDescription}
                        onChange={(e) => setTicketForm({ ...ticketForm, issueDescription: e.target.value })}
                        required
                        sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: 2 }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setIsReportModalOpen(false)} sx={{ color: '#64748b', fontWeight: 'bold', mr: 1, borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmitTicket}
                        variant="contained"
                        disableElevation
                        sx={{ bgcolor: '#f43f5e', '&:hover': { bgcolor: '#e11d48' }, fontWeight: 'bold', borderRadius: 2, px: 4 }}
                    >
                        Submit Ticket
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default EmployeeDashboard;

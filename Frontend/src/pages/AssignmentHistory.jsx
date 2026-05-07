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
    Chip,
    Box,
    TextField,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import {
    History as HistoryIcon,
    Search as SearchIcon,
    ArrowForward as ArrowIcon,
    Person as PersonIcon,
    Devices as DeviceIcon
} from '@mui/icons-material';
import { getAllAssignmentHistory } from '../services/api';

function AssignmentHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await getAllAssignmentHistory();
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching assignment history:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history.filter(entry =>
        entry.device?.brand?.toLowerCase().includes(search.toLowerCase()) ||
        entry.device?.model?.toLowerCase().includes(search.toLowerCase()) ||
        entry.device?.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
        entry.previousUser?.toLowerCase().includes(search.toLowerCase()) ||
        entry.newUser?.toLowerCase().includes(search.toLowerCase()) ||
        entry.assignedByName?.toLowerCase().includes(search.toLowerCase())
    );

    const getReasonColor = (reason) => {
        switch (reason) {
            case 'New Purchase': return 'success';
            case 'Employee Transfer': return 'info';
            case 'Replacement': return 'warning';
            case 'Repair Return': return 'secondary';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ maxWidth: '1400px', mx: 'auto', p: { xs: 2, sm: 3, md: 4 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', lg: 'center' }, gap: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                        <HistoryIcon fontSize="medium" />
                    </div>
                    <div>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'slate.800' }}>
                            Assignment History
                        </Typography>
                        <p className="text-sm text-slate-500 font-medium">
                            Track all device reassignments across the organization
                        </p>
                    </div>
                </Box>

                <TextField
                    size="small"
                    placeholder="Search by device, user, or assigner..."
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
                        width: { xs: '100%', sm: 350 },
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: 'white',
                            '& fieldset': { borderColor: '#f1f5f9' },
                            '&:hover fieldset': { borderColor: '#e2e8f0' },
                        }
                    }}
                />
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
                <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: 'slate.500', fontWeight: 600, textTransform: 'uppercase' }}>
                        Total Reassignments
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'slate.800', mt: 1 }}>
                        {history.length}
                    </Typography>
                </Paper>
                <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: 'slate.500', fontWeight: 600, textTransform: 'uppercase' }}>
                        New Purchases
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'emerald.600', mt: 1 }}>
                        {history.filter(h => h.reassignmentReason === 'New Purchase').length}
                    </Typography>
                </Paper>
                <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: 'slate.500', fontWeight: 600, textTransform: 'uppercase' }}>
                        Employee Transfers
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'blue.600', mt: 1 }}>
                        {history.filter(h => h.reassignmentReason === 'Employee Transfer').length}
                    </Typography>
                </Paper>
                <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: 'slate.500', fontWeight: 600, textTransform: 'uppercase' }}>
                        Replacements
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'amber.600', mt: 1 }}>
                        {history.filter(h => h.reassignmentReason === 'Replacement').length}
                    </Typography>
                </Paper>
            </Box>

            {/* History Table */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', border: '1px solid #f1f5f9', overflowX: 'auto' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : filteredHistory.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Box sx={{
                            width: 80,
                            height: 80,
                            backgroundColor: 'slate.50',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            color: 'slate.300'
                        }}>
                            <HistoryIcon sx={{ fontSize: 40 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'slate.400' }}>
                            No Assignment History Found
                        </Typography>
                        <p className="text-sm text-slate-400">
                            {search ? 'Try adjusting your search filters' : 'No device reassignments have been recorded yet'}
                        </p>
                    </Box>
                ) : (
                    <Table sx={{ minWidth: 1100 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                                    Date & Time
                                </TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                                    Device
                                </TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                                    Assignment Change
                                </TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                                    Reason
                                </TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                                    Assigned By
                                </TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                                    Notes
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredHistory.map((entry) => (
                                <TableRow key={entry._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'slate.700' }}>
                                            {new Date(entry.assignmentDate).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'slate.400' }}>
                                            {new Date(entry.assignmentDate).toLocaleTimeString(undefined, {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{
                                                p: 1,
                                                backgroundColor: 'blue.50',
                                                borderRadius: '8px',
                                                color: 'blue.600'
                                            }}>
                                                <DeviceIcon sx={{ fontSize: 18 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'slate.800' }}>
                                                    {entry.device?.brand} {entry.device?.model}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'slate.400', fontFamily: 'monospace' }}>
                                                    {entry.device?.serialNumber}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <PersonIcon sx={{ fontSize: 16, color: 'slate.400' }} />
                                                <Typography variant="body2" sx={{ fontWeight: 500, color: entry.previousUser ? 'slate.700' : 'slate.400' }}>
                                                    {entry.previousUser || 'Unassigned'}
                                                </Typography>
                                            </Box>
                                            <ArrowIcon sx={{ fontSize: 16, color: 'slate.400' }} />
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <PersonIcon sx={{ fontSize: 16, color: 'indigo.500' }} />
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: entry.newUser ? 'indigo.600' : 'slate.400' }}>
                                                    {entry.newUser || 'Unassigned'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={entry.reassignmentReason || 'Other'}
                                            size="small"
                                            color={getReasonColor(entry.reassignmentReason)}
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '10px',
                                                textTransform: 'uppercase'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'slate.700' }}>
                                            {entry.assignedByName}
                                        </Typography>
                                        {entry.assignedBy?.email && (
                                            <Typography variant="caption" sx={{ color: 'slate.400', display: 'block' }}>
                                                {entry.assignedBy.email}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: entry.notes ? 'slate.600' : 'slate.400',
                                                fontStyle: entry.notes ? 'normal' : 'italic',
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {entry.notes || 'No notes'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>
        </Box>
    );
}

export default AssignmentHistory;

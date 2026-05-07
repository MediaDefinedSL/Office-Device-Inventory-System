import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Divider
} from '@mui/material';
import {
    Close as CloseIcon,
    ArrowForward as ArrowIcon,
    Person as PersonIcon,
    CalendarToday as DateIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';

function AssignmentHistoryModal({ open, onClose, device, history, loading }) {
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
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        p: 1.5,
                        backgroundColor: 'indigo.50',
                        borderRadius: '12px',
                        color: 'indigo.600'
                    }}>
                        <AssignmentIcon />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Assignment History
                        </Typography>
                        {device && (
                            <Typography variant="body2" sx={{ color: 'slate.500' }}>
                                {device.brand} {device.model} • {device.serialNumber}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : history.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Box sx={{
                            width: 64,
                            height: 64,
                            backgroundColor: 'slate.50',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            color: 'slate.300'
                        }}>
                            <AssignmentIcon sx={{ fontSize: 32 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'slate.400', mb: 1 }}>
                            No Assignment History
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'slate.400' }}>
                            This device has not been reassigned yet.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                                        Date
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                                        Assignment Change
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                                        Reason
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                                        Assigned By
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                                        Notes
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {history.map((entry, index) => (
                                    <TableRow key={entry._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <DateIcon sx={{ fontSize: 16, color: 'slate.400' }} />
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {new Date(entry.assignmentDate).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" sx={{ color: 'slate.400', ml: 3 }}>
                                                {new Date(entry.assignmentDate).toLocaleTimeString(undefined, {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                                                    fontWeight: 600,
                                                    fontSize: '10px',
                                                    textTransform: 'uppercase'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {entry.assignedByName}
                                            </Typography>
                                            {entry.assignedBy?.email && (
                                                <Typography variant="caption" sx={{ color: 'slate.400', display: 'block' }}>
                                                    {entry.assignedBy.email}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: entry.notes ? 'slate.600' : 'slate.400', fontStyle: entry.notes ? 'normal' : 'italic' }}>
                                                {entry.notes || 'No notes'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, backgroundColor: '#f8fafc' }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    startIcon={<CloseIcon />}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        backgroundColor: 'slate.800',
                        '&:hover': { backgroundColor: 'slate.700' }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AssignmentHistoryModal;

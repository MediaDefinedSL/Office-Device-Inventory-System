import { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Avatar
} from '@mui/material';
import { getAllTickets, updateTicket, deleteTicket } from '../services/api';
import toast from 'react-hot-toast';

function TicketManagement() {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [manageForm, setManageForm] = useState({ status: '', adminNotes: '' });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const { data } = await getAllTickets();
            setTickets(data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            toast.error('Failed to load tickets');
        }
    };

    const handleOpenManage = (ticket) => {
        setSelectedTicket(ticket);
        setManageForm({
            status: ticket.status,
            adminNotes: ticket.adminNotes || ''
        });
        setIsManageModalOpen(true);
    };

    const handleSaveChanges = async () => {
        try {
            await updateTicket(selectedTicket._id, manageForm);
            toast.success('Ticket updated successfully');
            setIsManageModalOpen(false);
            fetchTickets();
        } catch (error) {
            console.error('Error updating ticket:', error);
            toast.error('Failed to update ticket');
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        const confirmed = window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.');
        if (!confirmed) return;

        try {
            await deleteTicket(ticketId);
            toast.success('Ticket deleted successfully');
            fetchTickets();
        } catch (error) {
            console.error('Error deleting ticket:', error);
            toast.error('Failed to delete ticket');
        }
    };

    const getStatusChipColor = (status) => {
        switch (status) {
            case 'Open': return 'error';
            case 'In Progress': return 'warning';
            case 'Resolved': return 'success';
            default: return 'default';
        }
    };

    const getPriorityChipColor = (priority) => {
        switch (priority) {
            case 'High': return 'error';
            case 'Medium': return 'warning';
            case 'Low': return 'info';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <div>
                    <Typography variant="h4" fontWeight="bold">IT Helpdesk Tickets</Typography>
                    <Typography color="text.secondary">Manage and resolve reported device issues</Typography>
                </div>
                <Chip 
                    label={`${tickets.filter(t => t.status !== 'Resolved').length} Active Issues`} 
                    color="primary" 
                    variant="outlined" 
                    sx={{ fontWeight: 'bold' }} 
                />
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 4 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Device</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    No tickets have been reported.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tickets.map((ticket) => (
                                <TableRow key={ticket._id} hover>
                                    <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.light' }}>
                                                {ticket.reportedBy?.name?.charAt(0) || '?'}
                                            </Avatar>
                                            <Typography variant="body2">{ticket.reportedBy?.name || 'Unknown User'}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{ticket.device?.brand} {ticket.device?.model}</Typography>
                                            <Typography variant="caption" color="text.secondary">{ticket.device?.assetTag || ticket.device?.serialNumber}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={ticket.priority} size="small" variant="outlined" color={getPriorityChipColor(ticket.priority)} />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={ticket.status} size="small" color={getStatusChipColor(ticket.status)} />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button size="small" variant="contained" disableElevation onClick={() => handleOpenManage(ticket)} sx={{ mr: 1 }}>
                                            Manage
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleDeleteTicket(ticket._id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Manage Ticket Modal */}
            <Dialog open={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Manage IT Ticket</DialogTitle>
                <DialogContent dividers>
                    {selectedTicket && (
                        <Box mb={3} p={2} bgcolor="grey.50" borderRadius={2} border="1px solid #e2e8f0">
                            <Typography variant="caption" color="text.secondary" textTransform="uppercase">Issue Reported</Typography>
                            <Typography variant="body1" fontWeight="medium" mb={1}>{selectedTicket.issueDescription}</Typography>
                            
                            <Box display="flex" gap={2} mt={2}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">By</Typography>
                                    <Typography variant="body2">{selectedTicket.reportedBy?.name}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Priority</Typography>
                                    <Typography variant="body2">{selectedTicket.priority}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    <TextField
                        select
                        fullWidth
                        label="Status"
                        value={manageForm.status}
                        onChange={(e) => setManageForm({ ...manageForm, status: e.target.value })}
                        margin="normal"
                    >
                        <MenuItem value="Open">Open</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Resolved">Resolved</MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Admin Notes (Internal)"
                        placeholder="What actions were taken? E.g. Sent for repair, Ordered part..."
                        value={manageForm.adminNotes}
                        onChange={(e) => setManageForm({ ...manageForm, adminNotes: e.target.value })}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsManageModalOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSaveChanges} variant="contained" color="primary">Save Changes</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default TicketManagement;

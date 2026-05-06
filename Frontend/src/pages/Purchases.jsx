import { useState, useEffect } from 'react';
import {
    Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Grid, Chip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { getAllPurchases, createPurchase, deletePurchase, getAllUsers, getDevices } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import toast from 'react-hot-toast';

function Purchases() {
    const [purchases, setPurchases] = useState([]);
    const [users, setUsers] = useState([]);
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [vendor, setVendor] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [items, setItems] = useState([{
        itemName: '', category: 'Other', price: '', warrantyExpiryDate: '', assignedDevice: '', assignedUser: '', notes: ''
    }]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [purchasesRes, usersRes, devicesRes] = await Promise.all([
                getAllPurchases(),
                getAllUsers(),
                getDevices()
            ]);
            setPurchases(purchasesRes.data);
            setUsers(usersRes.data);
            setDevices(devicesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load purchases data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { itemName: '', category: 'Other', price: '', warrantyExpiryDate: '', assignedDevice: '', assignedUser: '', notes: '' }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async () => {
        // Validation
        if (!purchaseDate) return toast.error('Purchase date is required');
        if (items.length === 0) return toast.error('At least one item is required');
        for (const item of items) {
            if (!item.itemName) return toast.error('Item name is required for all items');
            if (!item.price) return toast.error('Price is required for all items');
        }

        try {
            const payload = {
                purchaseDate,
                vendor,
                invoiceNumber,
                items: items.map(item => ({
                    ...item,
                    assignedDevice: item.assignedDevice || undefined,
                    assignedUser: item.assignedUser || undefined,
                    warrantyExpiryDate: item.warrantyExpiryDate || undefined
                }))
            };
            
            await createPurchase(payload);
            toast.success('Purchase recorded successfully');
            setIsModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error creating purchase:', error);
            toast.error('Failed to record purchase');
        }
    };

    const resetForm = () => {
        setPurchaseDate(new Date().toISOString().split('T')[0]);
        setVendor('');
        setInvoiceNumber('');
        setItems([{ itemName: '', category: 'Other', price: '', warrantyExpiryDate: '', assignedDevice: '', assignedUser: '', notes: '' }]);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this purchase record?')) return;
        try {
            await deletePurchase(id);
            toast.success('Purchase deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Error deleting purchase:', error);
            toast.error('Failed to delete purchase');
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <div>
                    <Typography variant="h4" fontWeight="bold">Component Purchases</Typography>
                    <Typography color="text.secondary">Track newly bought hardware components and accessories</Typography>
                </div>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                >
                    Record Purchase
                </Button>
            </Box>

            {loading ? (
                <SkeletonLoader />
            ) : purchases.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
                    <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No purchases recorded yet</Typography>
                </Paper>
            ) : (
                <Box display="flex" flexDirection="column" gap={3}>
                    {purchases.map(purchase => (
                        <Paper key={purchase._id} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        Purchase Date: {new Date(purchase.purchaseDate).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {purchase.vendor && `Vendor: ${purchase.vendor} | `}
                                        {purchase.invoiceNumber && `Invoice: ${purchase.invoiceNumber} | `}
                                        Total: Rs. {purchase.totalCost}
                                    </Typography>
                                </Box>
                                <Button size="small" color="error" onClick={() => handleDelete(purchase._id)}>Delete</Button>
                            </Box>
                            
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Item Name</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Warranty Expiry</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Assigned To</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {purchase.items.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{item.itemName}</TableCell>
                                                <TableCell><Chip size="small" label={item.category} /></TableCell>
                                                <TableCell>Rs. {item.price}</TableCell>
                                                <TableCell>
                                                    {item.warrantyExpiryDate ? new Date(item.warrantyExpiryDate).toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {item.assignedUser && (
                                                        <Typography variant="body2">User: {item.assignedUser.name}</Typography>
                                                    )}
                                                    {item.assignedDevice && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Device: {item.assignedDevice.assetTag || item.assignedDevice.brand}
                                                        </Typography>
                                                    )}
                                                    {!item.assignedUser && !item.assignedDevice && (
                                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">In Stock</Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    ))}
                </Box>
            )}

            {/* Add Purchase Modal */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Record New Purchase</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} mb={4}>
                        <Grid item xs={12} sm={4}>
                            <TextField 
                                fullWidth label="Purchase Date" type="date" 
                                InputLabelProps={{ shrink: true }}
                                value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField 
                                fullWidth label="Vendor / Shop Name" 
                                value={vendor} onChange={e => setVendor(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField 
                                fullWidth label="Invoice Number" 
                                value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <Typography variant="h6" fontWeight="bold" mb={2}>Purchased Items</Typography>
                    
                    {items.map((item, index) => (
                        <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', border: '1px solid #e2e8f0' }} elevation={0}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="subtitle2" fontWeight="bold">Item #{index + 1}</Typography>
                                {items.length > 1 && (
                                    <IconButton size="small" color="error" onClick={() => handleRemoveItem(index)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField 
                                        fullWidth size="small" label="Item Name (e.g., 8GB DDR4 RAM)" required
                                        value={item.itemName} onChange={e => handleItemChange(index, 'itemName', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField 
                                        fullWidth size="small" select label="Category"
                                        value={item.category} onChange={e => handleItemChange(index, 'category', e.target.value)}
                                    >
                                        {["Battery", "RAM", "Storage", "Display", "Accessory", "Other"].map(cat => (
                                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField 
                                        fullWidth size="small" label="Price (Rs)" type="number" required
                                        value={item.price} onChange={e => handleItemChange(index, 'price', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField 
                                        fullWidth size="small" label="Warranty Expiry" type="date" InputLabelProps={{ shrink: true }}
                                        value={item.warrantyExpiryDate} onChange={e => handleItemChange(index, 'warrantyExpiryDate', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField 
                                        fullWidth size="small" select label="Assign to User (Optional)"
                                        value={item.assignedUser} onChange={e => handleItemChange(index, 'assignedUser', e.target.value)}
                                    >
                                        <MenuItem value=""><em>None / In Stock</em></MenuItem>
                                        {users.map(u => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField 
                                        fullWidth size="small" select label="Assign to Device (Optional)"
                                        value={item.assignedDevice} onChange={e => handleItemChange(index, 'assignedDevice', e.target.value)}
                                    >
                                        <MenuItem value=""><em>None / In Stock</em></MenuItem>
                                        {devices.map(d => <MenuItem key={d._id} value={d._id}>{d.assetTag || d.brand + ' ' + d.model}</MenuItem>)}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                    
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddItem} sx={{ mt: 1 }}>
                        Add Another Item
                    </Button>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsModalOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">Save Purchase</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Purchases;

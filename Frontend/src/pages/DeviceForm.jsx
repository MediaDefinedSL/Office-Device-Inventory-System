import { useState, useEffect } from 'react';
import {
    Typography,
    Paper,
    TextField,
    Button,
    Box,
    Grid,
    MenuItem,
    Divider
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { createDevice, getDeviceById, updateDevice, getAllUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusOptions = ['Active', 'Under Repair', 'Retired'];
const operatingSystemOptions = ['Windows 10', 'Windows 11', 'macOS', 'Linux', 'Other'];
const storageTypeOptions = ['HDD', 'SSD', 'NVMe'];

function DeviceForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEdit = Boolean(id);

    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        deviceType: '',
        brand: '',
        model: '',
        serialNumber: '',
        assetTag: '',
        department: '',
        assignedUser: '',
        purchaseDate: '',
        purchasePrice: '',
        warrantyExpiryDate: '',
        status: 'Active',
        hardwareConfig: {
            cpu: '',
            ram: '',
            storageType: '',
            storageCapacity: '',
            operatingSystem: ''
        }
    });

    useEffect(() => {
        const loadInitData = async () => {
            if (user && user.role !== 'Admin' && user.role !== 'IT Admin') {
                navigate('/');
                return;
            }
            try {
                const usersRes = await getAllUsers();
                setUsers(usersRes.data);
            } catch (err) {
                console.error("Could not fetch users for assignment", err);
            }
            if (isEdit) {
                fetchDevice();
            }
        };
        loadInitData();
    }, [id]);

    const fetchDevice = async () => {
        try {
            const response = await getDeviceById(id);
            const data = response.data;
            // Format dates for input type="date"
            if (data.purchaseDate) {
                data.purchaseDate = new Date(data.purchaseDate).toISOString().split('T')[0];
            }
            if (data.warrantyExpiryDate) {
                data.warrantyExpiryDate = new Date(data.warrantyExpiryDate).toISOString().split('T')[0];
            }
            setFormData({
                ...data,
                assignedUser: data.assignedUser || ''
            });
        } catch (error) {
            console.error('Error fetching device:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clean empty fields to prevent Mongoose CastErrors
        const payload = { ...formData };
        if (payload.purchaseDate === '') payload.purchaseDate = null;
        if (payload.warrantyExpiryDate === '') payload.warrantyExpiryDate = null;
        if (payload.purchasePrice === '') payload.purchasePrice = null;

        try {
            if (isEdit) {
                await updateDevice(id, payload);
            } else {
                await createDevice(payload);
            }
            navigate('/devices');
        } catch (error) {
            console.error('Error saving device:', error);
            alert('Error saving device. Make sure serial number is unique.');
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                    {isEdit ? 'Edit Device' : 'Add New Device'}
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Basic Information</Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Device Type"
                                name="deviceType"
                                value={formData.deviceType}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Status"
                                name="status"
                                select
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                {statusOptions.map(option => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Brand"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Model"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Serial Number"
                                name="serialNumber"
                                value={formData.serialNumber}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Asset Tag"
                                name="assetTag"
                                value={formData.assetTag}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Assigned User"
                                name="assignedUser"
                                select
                                value={formData.assignedUser}
                                onChange={handleChange}
                            >
                                <MenuItem value=""><em>None / Unassigned</em></MenuItem>
                                {users.map(u => (
                                    <MenuItem key={u._id} value={u.name}>
                                        {u.name} ({u.email})
                                    </MenuItem>
                                ))}
                                {/* Display existing assigned user if they don't match the current user list */}
                                {formData.assignedUser && !users.find(u => u.name === formData.assignedUser) && (
                                    <MenuItem value={formData.assignedUser}>
                                        {formData.assignedUser} (Legacy)
                                    </MenuItem>
                                )}
                            </TextField>
                        </Grid>

                        {/* Financial & Warranty Details */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Financial & Lifecycle Tracking</Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Purchase Date"
                                name="purchaseDate"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Purchase Price (LKR)"
                                name="purchasePrice"
                                value={formData.purchasePrice}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Warranty Expiry Date"
                                name="warrantyExpiryDate"
                                value={formData.warrantyExpiryDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Hardware Configuration */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Hardware Configuration</Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="CPU"
                                name="hardwareConfig.cpu"
                                value={formData.hardwareConfig?.cpu}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="RAM"
                                name="hardwareConfig.ram"
                                value={formData.hardwareConfig?.ram}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="OS"
                                name="hardwareConfig.operatingSystem"
                                select
                                value={formData.hardwareConfig?.operatingSystem || ''}
                                onChange={handleChange}
                            >
                                {operatingSystemOptions.map(option => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Storage Type"
                                name="hardwareConfig.storageType"
                                select
                                value={formData.hardwareConfig?.storageType || ''}
                                onChange={handleChange}
                            >
                                {storageTypeOptions.map(option => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Storage Capacity"
                                name="hardwareConfig.storageCapacity"
                                value={formData.hardwareConfig?.storageCapacity}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button onClick={() => navigate('/')} variant="outlined">
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained">
                                {isEdit ? 'Update Device' : 'Create Device'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}

export default DeviceForm;

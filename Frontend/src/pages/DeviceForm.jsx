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
const departmentOptions = ['DB', 'QA', 'UI', 'Engineering', 'Admin'];

function DeviceForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEdit = Boolean(id);

    const [users, setUsers] = useState([]);
    const [originalAssignedUser, setOriginalAssignedUser] = useState('');
    const [showReassignmentFields, setShowReassignmentFields] = useState(false);
    const [formData, setFormData] = useState({
        reassignmentReason: 'Other',
        assignmentNotes: '',
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
                assignedUser: data.assignedUser || '',
                reassignmentReason: 'Other',
                assignmentNotes: ''
            });
            setOriginalAssignedUser(data.assignedUser || '');
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

        // Show reassignment fields if assignedUser changes from original
        if (name === 'assignedUser') {
            const isChanged = value !== originalAssignedUser;
            setShowReassignmentFields(isChanged);
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
        <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 2, sm: 3, md: 4 } }}>
            <Paper sx={{ p: { xs: 3, sm: 4, md: 6 }, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, color: '#0f172a', textTransform: 'capitalize' }}>
                        {isEdit ? '✏️ Edit Device' : '➕ Add New Device'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                        {isEdit ? 'Update device information and specifications' : 'Register a new device in the inventory system'}
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontSize: '1.25rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📋 Device Information</Typography>
                            <Divider sx={{ mb: 3 }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Device Type"
                                name="deviceType"
                                select
                                value={formData.deviceType}
                                onChange={handleChange}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
                            >
                                {['Laptop', 'Desktop', 'Monitor', 'Printer', 'Keyboard', 'Mouse', 'Other'].map(option => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Status"
                                name="status"
                                select
                                value={formData.status}
                                onChange={handleChange}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
                            >
                                {statusOptions.map(option => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Brand"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Model"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Serial Number"
                                name="serialNumber"
                                value={formData.serialNumber}
                                onChange={handleChange}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Asset Tag"
                                name="assetTag"
                                value={formData.assetTag}
                                onChange={handleChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Department"
                                name="department"
                                select
                                value={formData.department}
                                onChange={handleChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
                            >
                                {departmentOptions.map(option => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Assigned User"
                                name="assignedUser"
                                select
                                value={formData.assignedUser}
                                onChange={handleChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
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
                            {showReassignmentFields && (
                                <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#92400e', display: 'block', mb: 1 }}>
                                        ⚠️ User assignment change detected
                                    </Typography>
                                </Box>
                            )}
                        </Grid>

                        {/* Reassignment Fields (shown when assignedUser changes) */}
                        {showReassignmentFields && (
                            <>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Reassignment Reason"
                                        name="reassignmentReason"
                                        select
                                        value={formData.reassignmentReason}
                                        onChange={handleChange}
                                        required
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                backgroundColor: '#fffbeb'
                                            }
                                        }}
                                    >
                                        {['New Purchase', 'Employee Transfer', 'Replacement', 'Repair Return', 'Other'].map(option => (
                                            <MenuItem key={option} value={option}>{option}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Assignment Notes"
                                        name="assignmentNotes"
                                        value={formData.assignmentNotes}
                                        onChange={handleChange}
                                        placeholder="e.g., Laptop transferred due to department change"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                backgroundColor: '#fffbeb'
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                        Previous User: <strong>{originalAssignedUser || 'Unassigned'}</strong> → New User: <strong>{formData.assignedUser || 'Unassigned'}</strong>
                                    </Typography>
                                </Grid>
                            </>
                        )}

                        {/* Financial & Warranty Details */}
                        <Grid item xs={12} sx={{ mt: 4, mb: 2 }}>
                            <Paper sx={{ p: 4, backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '24px' }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontSize: '1.25rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    💰 Financial & Lifecycle Tracking
                                </Typography>
                                <Divider sx={{ mb: 3 }} />
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            label="Purchase Date"
                                            name="purchaseDate"
                                            value={formData.purchaseDate}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: true }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    backgroundColor: '#ffffff'
                                                }
                                            }}
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
                                            placeholder="0"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    backgroundColor: '#ffffff'
                                                }
                                            }}
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
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    backgroundColor: '#ffffff'
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Hardware Configuration */}
                        <Grid item xs={12} sx={{ mt: 4, mb: 2 }}>
                            <Paper sx={{ p: 4, backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '24px' }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontSize: '1.25rem', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    💻 Hardware Configuration
                                </Typography>
                                <Divider sx={{ mb: 3 }} />
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            fullWidth
                                            label="CPU"
                                            name="hardwareConfig.cpu"
                                            value={formData.hardwareConfig?.cpu}
                                            onChange={handleChange}
                                            placeholder="e.g., Intel i7, AMD Ryzen 5"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    backgroundColor: '#ffffff'
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            fullWidth
                                            label="RAM"
                                            name="hardwareConfig.ram"
                                            value={formData.hardwareConfig?.ram}
                                            onChange={handleChange}
                                            placeholder="e.g., 16GB, 32GB"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    backgroundColor: '#ffffff'
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Operating System"
                                            name="hardwareConfig.operatingSystem"
                                            select
                                            value={formData.hardwareConfig?.operatingSystem || ''}
                                            onChange={handleChange}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    backgroundColor: '#ffffff'
                                                }
                                            }}
                                        >
                                            {operatingSystemOptions.map(option => (
                                                <MenuItem key={option} value={option}>{option}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Storage Type"
                                            name="hardwareConfig.storageType"
                                            select
                                            value={formData.hardwareConfig?.storageType || ''}
                                            onChange={handleChange}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    backgroundColor: '#ffffff'
                                                }
                                            }}
                                        >
                                            {storageTypeOptions.map(option => (
                                                <MenuItem key={option} value={option}>{option}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Storage Capacity"
                                            name="hardwareConfig.storageCapacity"
                                            value={formData.hardwareConfig?.storageCapacity}
                                            onChange={handleChange}
                                            placeholder="e.g., 512GB, 1TB"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    backgroundColor: '#ffffff'
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sx={{ mt: 6, pt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', borderTop: '2px solid #e2e8f0' }}>
                            <Button 
                                onClick={() => navigate('/devices')} 
                                variant="outlined"
                                sx={{
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    textTransform: 'capitalize',
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1rem',
                                    borderColor: '#cbd5e1',
                                    color: '#64748b',
                                    '&:hover': {
                                        borderColor: '#94a3b8',
                                        backgroundColor: '#f8fafc'
                                    }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained"
                                sx={{
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    textTransform: 'capitalize',
                                    px: 6,
                                    py: 1.5,
                                    fontSize: '1rem',
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                                        boxShadow: '0 12px 28px rgba(37, 99, 235, 0.4)'
                                    }
                                }}
                            >
                                {isEdit ? '✓ Update Device' : '➕ Create Device'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}

export default DeviceForm;

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
    Divider,
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment,
    MenuItem
} from '@mui/material';
import {
    Person as PersonIcon,
    Lock as LockIcon,
    Settings as SettingsIcon,
    Visibility,
    VisibilityOff,
    CurrencyExchange as CurrencyIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { getUserProfile, updateUserProfile, updateUserPassword } from '../services/api';

const Settings = () => {
    const [profile, setProfile] = useState({ name: '', email: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    useEffect(() => {
        fetchProfile();
        // Ensure currency is set to Rs
        localStorage.setItem('currency', 'Rs');
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await getUserProfile();
            setProfile({ name: response.data.name, email: response.data.email });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile data' });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await updateUserProfile(profile);
            // Update local storage user object if needed
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                user.name = response.data.name;
                user.email = response.data.email;
                localStorage.setItem('user', JSON.stringify(user));
            }
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        setSavingPassword(true);
        setMessage({ type: '', text: '' });
        try {
            await updateUserPassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setMessage({ type: 'success', text: 'Password updated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password' });
        } finally {
            setSavingPassword(false);
        }
    };


    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
            <header className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                    <SettingsIcon className="text-white" fontSize="large" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Settings</h1>
                    <p className="text-slate-500 font-medium">Manage your account and app preferences</p>
                </div>
            </header>

            {message.text && (
                <Alert
                    severity={message.type}
                    onClose={() => setMessage({ type: '', text: '' })}
                    className="rounded-xl shadow-sm border-none"
                    sx={{ mb: 4 }}
                >
                    {message.text}
                </Alert>
            )}

            <div className="grid grid-cols-1 gap-8">
                {/* Profile Settings */}
                <Paper className="p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <PersonIcon />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Profile Information</h2>
                    </div>
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <TextField
                            fullWidth
                            label="Full Name"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            variant="outlined"
                            className="bg-slate-50 rounded-lg"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            variant="outlined"
                            className="bg-slate-50 rounded-lg"
                        />
                        <div className="pt-2">
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={savingProfile}
                                startIcon={savingProfile ? <CircularProgress size={20} /> : <SaveIcon />}
                                className="bg-blue-600 hover:bg-blue-700 py-3 px-8 rounded-xl normal-case font-bold shadow-lg shadow-blue-100"
                            >
                                Update Profile
                            </Button>
                        </div>
                    </form>
                </Paper>

                {/* Password Settings */}
                <Paper className="p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                            <LockIcon />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Security & Password</h2>
                    </div>
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Current Password"
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    variant="outlined"
                                    className="bg-slate-50 rounded-lg"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => togglePasswordVisibility('current')}>
                                                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="New Password"
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    variant="outlined"
                                    className="bg-slate-50 rounded-lg"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => togglePasswordVisibility('new')}>
                                                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Confirm New Password"
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    variant="outlined"
                                    className="bg-slate-50 rounded-lg"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => togglePasswordVisibility('confirm')}>
                                                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <div className="flex justify-end mt-4">
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={savingPassword}
                                startIcon={savingPassword ? <CircularProgress size={20} /> : <LockIcon />}
                                className="bg-rose-600 hover:bg-rose-700 py-3 px-8 rounded-xl normal-case font-bold shadow-lg shadow-rose-100"
                            >
                                Change Password
                            </Button>
                        </div>
                    </form>
                </Paper>
            </div>
        </div>
    );
};

export default Settings;

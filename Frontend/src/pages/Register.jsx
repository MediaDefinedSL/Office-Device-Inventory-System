import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Typography, Paper, TextField, Button, Box, Link, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('User');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Pass role to register function
            const res = await import('axios').then(m => m.default.post('/api/auth/register', { name, email, password, role }));
            const data = res.data;
            localStorage.setItem('user', JSON.stringify(data));
            navigate('/');
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <Box sx={{ maxWidth: 420, mx: 'auto', mt: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
                    Create Account
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        margin="normal"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        margin="normal"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        margin="normal"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign Up
                    </Button>
                </form>

                <Box textAlign="center">
                    <Link component={RouterLink} to="/login" variant="body2">
                        {"Already have an account? Sign In"}
                    </Link>
                </Box>
            </Paper>
        </Box>
    );
}

export default Register;

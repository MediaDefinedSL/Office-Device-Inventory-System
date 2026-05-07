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
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f8fafc',
            p: 3
        }}>
            <Paper sx={{
                p: { xs: 4, md: 5 },
                width: '100%',
                maxWidth: 450,
                borderRadius: 3,
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
            }}>
                <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 700, color: 'slate.800' }}>
                    Create Account
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        margin="normal"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': { borderRadius: 2 }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        margin="normal"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
                        error={email.includes(' ')}
                        helperText={email.includes(' ') ? 'Email cannot contain spaces' : ''}
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': { borderRadius: 2 }
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        margin="normal"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': { borderRadius: 2 }
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{
                            mt: 2,
                            mb: 3,
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '1rem'
                        }}
                    >
                        Sign Up
                    </Button>
                </form>

                <Box textAlign="center" sx={{ mt: 2 }}>
                    <Link component={RouterLink} to="/login" variant="body2" sx={{ color: 'slate.600', textDecoration: 'none', '&:hover': { color: 'blue.600' } }}>
                        {"Already have an account? "}
                        <Box component="span" sx={{ fontWeight: 600, color: 'blue.600' }}>
                            Sign In
                        </Box>
                    </Link>
                </Box>
            </Paper>
        </Box>
    );
}

export default Register;

import { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { Typography, Paper, TextField, Button, Box, Link, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userData = await login(email, password);
            const currentPath = location.pathname;
            
            if (currentPath.startsWith('/edit/') || currentPath.startsWith('/device/service/')) {
                if (userData.role === 'Admin' || userData.role === 'IT Admin') {
                    navigate(currentPath);
                } else {
                    navigate('/');
                }
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err);
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
                    Sign In
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        margin="normal"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
                        error={email.includes(' ')}
                        helperText={email.includes(' ') ? 'Email cannot contain spaces' : ''}
                        sx={{
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
                        Sign In
                    </Button>
                </form>

                <Box textAlign="center" sx={{ mt: 2 }}>
                    <Link component={RouterLink} to="/register" variant="body2" sx={{ color: 'slate.600', textDecoration: 'none', '&:hover': { color: 'blue.600' } }}>
                        {"Don't have an account? "}
                        <Box component="span" sx={{ fontWeight: 600, color: 'blue.600' }}>
                            Sign Up
                        </Box>
                    </Link>
                </Box>
            </Paper>
        </Box>
    );
}

export default Login;

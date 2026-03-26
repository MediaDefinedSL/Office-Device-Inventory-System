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
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
                    Sign In
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email Address"
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
                        Sign In
                    </Button>
                </form>

                <Box textAlign="center">
                    <Link component={RouterLink} to="/register" variant="body2">
                        {"Don't have an account? Sign Up"}
                    </Link>
                </Box>
            </Paper>
        </Box>
    );
}

export default Login;

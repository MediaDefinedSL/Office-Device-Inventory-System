import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import DevicesIcon from '@mui/icons-material/Devices';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', bgcolor: 'white', color: 'text.primary' }}>
            <Toolbar>
                <DevicesIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
                    Office Device Inventory
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 3, fontWeight: 500 }}>
                        Welcome, {user?.name}
                    </Typography>
                    <Button component={RouterLink} to="/" color="inherit">
                        Dashboard
                    </Button>
                    <Button component={RouterLink} to="/devices" color="inherit">
                        Inventory
                    </Button>
                    {user?.role === 'Admin' && (
                        <Button component={RouterLink} to="/add" variant="contained" sx={{ ml: 2, mr: 2 }}>
                            Add Device
                        </Button>
                    )}
                    <Button onClick={handleLogout} color="error" variant="outlined" sx={{ ml: user?.role === 'Admin' ? 0 : 2 }}>
                        Logout
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;

import React from 'react';
import { NavLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DevicesIcon from '@mui/icons-material/Devices';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import LogoutIcon from '@mui/icons-material/Logout';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const { user, logout } = useAuth();
    
    // Base items for all users
    let menuItems = [
        { name: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    ];

    // Admin-only items
    if (user?.role === 'Admin') {
        menuItems = [
            ...menuItems,
            { name: 'Tickets', icon: <AssignmentIcon />, path: '/tickets' },
            { name: 'Devices', icon: <DevicesIcon />, path: '/devices' },
            { name: 'Users', icon: <PeopleIcon />, path: '/users' },
            { name: 'Service Logs', icon: <HistoryIcon />, path: '/service-logs' },
            { name: 'Repair Tracking', icon: <BuildIcon />, path: '/repair-tracking' },
            { name: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
        ];
    }

    menuItems.push({ name: 'Settings', icon: <SettingsIcon />, path: '/settings' });

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            
            <div className={`w-64 bg-[#1e293b] text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-50 print:hidden transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex items-center justify-between border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <DesktopWindowsIcon className="text-blue-400" fontSize="large" />
                        <span className="text-xl font-bold tracking-tight">Office Device Tracker</span>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white transition-colors"
                    >
                        <CloseIcon />
                    </button>
                </div>

            <nav className="flex-1 mt-6 px-3">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${isActive
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <span className={({ isActive }) => isActive ? 'text-white' : 'text-slate-500'}>
                            {item.icon}
                        </span>
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 border-t border-slate-700 space-y-2">
                <NavLink
                    to="/settings"
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`
                    }
                >

                </NavLink>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-rose-600/20 rounded-lg transition-all duration-200 group"
                >
                    <LogoutIcon className="group-hover:text-rose-400 transition-colors" />
                    <span className="font-medium group-hover:text-rose-400 transition-colors">Logout</span>
                </button>
            </div>
        </div>
        </>
    );
};

export default Sidebar;

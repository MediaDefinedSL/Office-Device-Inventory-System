import React from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationDropdown from './NotificationDropdown';
import MenuIcon from '@mui/icons-material/Menu';

const Topbar = ({ setIsSidebarOpen }) => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    return (
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 print:hidden shadow-sm">
            <div className="flex items-center">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden mr-4 p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <MenuIcon />
                </button>
            </div>

            <div className="flex items-center gap-4 md:gap-6 ml-auto">
                <NotificationDropdown />

                <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`flex items-center gap-3 p-1.5 pr-3 rounded-xl transition-all group ${isMenuOpen ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    >
                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold border-2 border-blue-50 group-hover:border-blue-200 transition-all">
                            {user?.name?.charAt(0) || <PersonIcon />}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name || 'Admin'}</p>
                            <p className="text-[11px] text-gray-500 font-medium mt-1 uppercase tracking-wider">{user?.role || 'Administrator'}</p>
                        </div>
                        <KeyboardArrowDownIcon className={`text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                            >
                                <LogoutIcon fontSize="small" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;

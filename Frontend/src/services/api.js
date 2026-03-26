import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getDevices = () => api.get('/devices');
export const getMyDevices = () => api.get('/devices/my-devices');
export const registerMyDevice = (data) => api.post('/devices/my-device', data);
export const getDevicesUnderRepair = () => api.get('/devices/status/under-repair');
export const getDeviceById = (id) => api.get(`/devices/${id}`);
export const createDevice = (data) => api.post('/devices', data);
export const updateDevice = (id, data) => api.put(`/devices/${id}`, data);
export const deleteDevice = (id) => api.delete(`/devices/${id}`);

export const getDashboardAnalytics = () => api.get('/analytics/dashboard');
export const getReportAnalytics = () => api.get('/analytics/reports');

export const getAllServiceLogs = () => api.get('/service-logs');
export const getRecentServiceLogs = () => api.get('/service-logs/recent');
export const getRepairLogs = () => api.get('/service-logs/type/repair');
export const getUpcomingServiceLogs = () => api.get('/service-logs/upcoming');
export const getDeviceServiceLogs = (deviceId) => api.get(`/service-logs/device/${deviceId}`);
export const getServiceLogById = (id) => api.get(`/service-logs/${id}`);
export const updateServiceLog = (id, data) => api.put(`/service-logs/${id}`, data);
export const deleteServiceLog = (id) => api.delete(`/service-logs/${id}`);
export const createServiceLog = (data) => api.post('/service-logs', data);

// Tickets (Employee IT Ticketing)
export const createTicket = (data) => api.post('/tickets', data);
export const getMyTickets = () => api.get('/tickets/my-tickets');
export const getAllTickets = () => api.get('/tickets');
export const updateTicket = (id, data) => api.put(`/tickets/${id}`, data);
export const deleteTicket = (id) => api.delete(`/tickets/${id}`);

// User Profile & Settings
export const getUserProfile = () => api.get('/users/profile');
export const updateUserProfile = (data) => api.put('/users/profile', data);
export const updateUserPassword = (data) => api.put('/users/password', data);
export const getAllUsers = () => api.get('/users');
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const adminUpdateUserPassword = (id, data) => api.put(`/users/${id}/password`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

export default api;

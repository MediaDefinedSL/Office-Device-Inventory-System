import { Routes, Route } from 'react-router-dom'
import { Container } from '@mui/material'
import Navbar from './components/Navbar'
import DeviceList from './pages/DeviceList'
import DeviceForm from './pages/DeviceForm'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import ServiceLogForm from './pages/ServiceLogForm'
import ServiceLogList from './pages/ServiceLogList'
import Settings from './pages/Settings'
import Reports from './pages/Reports'
import RepairTracking from './pages/RepairTracking'
import TicketManagement from './pages/TicketManagement'
import UserManagement from './pages/UserManagement'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'

function App() {
    const { user } = useAuth();

    return (
        <>
            <Toaster position="top-right" />
            {user ? (
                <Layout>
                    <Routes>
                        <Route path="/" element={
                            <ProtectedRoute>
                                {user.role === 'Admin' ? <Dashboard /> : <EmployeeDashboard />}
                            </ProtectedRoute>
                        } />
                        <Route path="/tickets" element={
                            <ProtectedRoute>
                                <TicketManagement />
                            </ProtectedRoute>
                        } />
                        <Route path="/devices" element={
                            <ProtectedRoute>
                                <DeviceList />
                            </ProtectedRoute>
                        } />
                        <Route path="/add" element={
                            <ProtectedRoute>
                                <DeviceForm />
                            </ProtectedRoute>
                        } />
                        <Route path="/edit/:id" element={
                            <ProtectedRoute>
                                <DeviceForm />
                            </ProtectedRoute>
                        } />
                        <Route path="/device/service/:deviceId" element={
                            <ProtectedRoute>
                                <ServiceLogForm />
                            </ProtectedRoute>
                        } />
                        <Route path="/service/edit/:id" element={
                            <ProtectedRoute>
                                <ServiceLogForm />
                            </ProtectedRoute>
                        } />
                        <Route path="/service-logs" element={
                            <ProtectedRoute>
                                <ServiceLogList />
                            </ProtectedRoute>
                        } />
                        <Route path="/repair-tracking" element={
                            <ProtectedRoute>
                                <RepairTracking />
                            </ProtectedRoute>
                        } />
                        <Route path="/reports" element={
                            <ProtectedRoute>
                                <Reports />
                            </ProtectedRoute>
                        } />
                        <Route path="/settings" element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        } />
                        <Route path="/users" element={
                            <ProtectedRoute>
                                <UserManagement />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </Layout>
            ) : (
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Login />} />
                </Routes>
            )}
        </>
    )
}

export default App

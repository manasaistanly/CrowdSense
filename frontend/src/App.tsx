import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DestinationsPage from './pages/DestinationsPage';
import DashboardPage from './pages/DashboardPage';
import DestinationDetailsPage from './pages/DestinationDetailsPage';
import BookingPage from './pages/BookingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminDestinationsPage from './pages/AdminDestinationsPage';
import CheckpostPage from './pages/CheckpostPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import CapacityRulesPage from './pages/CapacityRulesPage';
import PricingRulesPage from './pages/PricingRulesPage';
import EnvironmentalDashboard from './pages/EnvironmentalDashboard';
import CommunityPortal from './pages/CommunityPortal';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/destinations" element={<DestinationsPage />} />
                        <Route path="/destinations/:slug" element={<DestinationDetailsPage />} />
                        <Route path="/book/:id" element={<BookingPage />} />
                        <Route path="/booking/:id" element={<BookingDetailsPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                        <Route path="/admin/destinations" element={<AdminDestinationsPage />} />
                        <Route path="/admin/rules" element={<CapacityRulesPage />} />
                        <Route path="/admin/pricing" element={<PricingRulesPage />} />
                        <Route path="/admin/environmental" element={<EnvironmentalDashboard />} />
                        <Route path="/community" element={<CommunityPortal />} />
                        <Route path="/checkpost" element={<CheckpostPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;

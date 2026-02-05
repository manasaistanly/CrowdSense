import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../stores/authStore';
import ThemeToggle from '../ThemeToggle';

export default function AdminNavbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 text-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Seal" className="h-8 w-8 text-primary-500" />
                        <Link to="/admin/dashboard">
                            <span className="text-xl font-bold tracking-tight">SustainaTour <span className="text-gray-400 font-normal text-sm">| Admin</span></span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <ThemeToggle />
                        <span className="text-sm text-gray-400">
                            {user?.firstName} {user?.lastName} ({user?.role})
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-300 hover:text-white focus:outline-none"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-gray-800 border-t border-gray-700 px-4 pt-4 pb-6 space-y-4">
                    <div className="flex items-center gap-3 text-gray-300 mb-4 border-b border-gray-700 pb-4">
                        <div className="h-10 w-10 bg-primary-900/50 rounded-full flex items-center justify-center text-primary-400 font-bold">
                            {user?.firstName?.charAt(0)}
                        </div>
                        <div>
                            <div className="font-medium text-white">{user?.firstName} {user?.lastName}</div>
                            <div className="text-xs text-gray-500">{user?.role}</div>
                        </div>
                    </div>
                    <Link to="/admin/dashboard" className="block text-gray-300 hover:text-white py-2">Dashboard</Link>
                    <Link to="/checkpost" className="block text-gray-300 hover:text-white py-2">Checkpost Interface</Link>
                    <Link to="/admin/destinations" className="block text-gray-300 hover:text-white py-2">Configure Limits</Link>
                    <Link to="/admin/rules" className="block text-gray-300 hover:text-white py-2">Capacity Rules</Link>
                    <Link to="/admin/pricing" className="block text-gray-300 hover:text-white py-2">Dynamic Pricing</Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 py-2 mt-4 border-t border-gray-700 pt-4"
                    >
                        <LogOut className="h-5 w-5" /> Logout
                    </button>
                </div>
            )}
        </nav>
    );
}

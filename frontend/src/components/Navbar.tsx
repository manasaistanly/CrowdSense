import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X, LogOut, LayoutDashboard, Map, Home, Users, Ticket } from 'lucide-react';
import { useAuth } from '../stores/authStore';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const NavLink = ({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon?: React.ElementType }) => (
        <Link
            to={to}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(to)
                ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {children}
        </Link>
    );

    const MobileNavLink = ({ to, children, onClick, icon: Icon }: { to: string; children: React.ReactNode; onClick?: () => void; icon?: React.ElementType }) => (
        <Link
            to={to}
            onClick={() => {
                setIsMenuOpen(false);
                onClick?.();
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive(to)
                ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
        >
            {Icon && <Icon className="h-5 w-5" />}
            {children}
        </Link>
    );

    return (
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group z-50">
                        <Leaf className="h-8 w-8 text-primary-600 group-hover:rotate-12 transition-transform duration-300" />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-900 to-primary-600 dark:from-primary-400 dark:to-primary-200 bg-clip-text text-transparent leading-none">
                                SustainaTour
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                                Nilgiris
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink to="/" icon={Home}>{t.home || 'Home'}</NavLink>
                        <NavLink to="/destinations" icon={Map}>{t.explore || 'Explore'}</NavLink>
                        <NavLink to="/itinerary" icon={Ticket}>Itinerary</NavLink>
                        <NavLink to="/community" icon={Users}>{t.community || 'Community'}</NavLink>

                        <div className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-700 flex items-center gap-2">
                            <LanguageToggle />
                            <ThemeToggle />
                        </div>

                        {user ? (
                            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                                <Link
                                    to={user.role === 'TOURIST' ? '/dashboard' : '/admin/dashboard'}
                                    className="text-right hidden lg:block"
                                >
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none">
                                        {user.firstName}
                                    </p>
                                    <p className="text-[10px] text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider mt-0.5">
                                        {user.role}
                                    </p>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                                <Link
                                    to={user.role === 'TOURIST' ? '/dashboard' : '/admin/dashboard'}
                                    className="lg:hidden p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 ml-4">
                                <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 transition-colors">
                                    {t.login}
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium transition shadow-sm shadow-primary-600/20"
                                >
                                    {t.register}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <LanguageToggle />
                        <ThemeToggle />
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 absolute w-full left-0 z-40 shadow-xl animate-in slide-in-from-top-4 duration-200">
                    <div className="px-4 py-6 space-y-2 flex flex-col">
                        <MobileNavLink to="/" icon={Home}>{t.home || 'Home'}</MobileNavLink>
                        <MobileNavLink to="/destinations" icon={Map}>{t.explore || 'Explore'}</MobileNavLink>
                        <MobileNavLink to="/community" icon={Users}>{t.community || 'Community'}</MobileNavLink>

                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

                        {user ? (
                            <>
                                <MobileNavLink
                                    to={user.role === 'TOURIST' ? '/dashboard' : '/admin/dashboard'}
                                    icon={LayoutDashboard}
                                >
                                    {t.dashboard || 'Dashboard'}
                                </MobileNavLink>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors w-full text-left"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 mt-2 px-2">
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                    {t.login}
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center py-3 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm"
                                >
                                    {t.register}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

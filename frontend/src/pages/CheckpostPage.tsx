import React, { useState, useEffect } from 'react';
import { useAuth } from '../stores/authStore';
import api from '../lib/api';
import { Shield, CheckCircle, XCircle, LogOut, Camera, History, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function CheckpostPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showScanner, setShowScanner] = useState(false);

    // Session Stats
    const [stats, setStats] = useState({ verified: 0, rejected: 0 });
    const [recentScans, setRecentScans] = useState<any[]>([]);

    useEffect(() => {
        let scanner: any;
        if (showScanner) {
            scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            scanner.render(onScanSuccess, onScanFailure);
        }

        return () => {
            if (scanner) {
                scanner.clear().catch((error: any) => console.error(error));
            }
        };
    }, [showScanner]);

    const onScanSuccess = (decodedText: string) => {
        let id = decodedText;
        try {
            const data = JSON.parse(decodedText);
            if (data.bookingId) id = data.bookingId;
        } catch (e) {
            // Not JSON
        }

        setBookingId(id);
        setShowScanner(false);
        verifyBooking(id);
    };

    const onScanFailure = (_error: any) => {
        // handle scan failure
    };

    const verifyBooking = async (id: string) => {
        setVerifying(true);
        setResult(null);

        try {
            const response = await api.post(`/bookings/${id}/verify-entry`);
            const bookingData = response.data.data.booking;

            setResult({
                success: true,
                message: 'Access Granted: Ticket Validated',
                data: bookingData
            });

            // Update Stats
            setStats(prev => ({ ...prev, verified: prev.verified + 1 }));

            // Add to History
            setRecentScans(prev => [{
                id: bookingData.id,
                name: bookingData.user.firstName,
                time: new Date().toLocaleTimeString(),
                status: 'valid'
            }, ...prev].slice(0, 5)); // Keep last 5

            toast.success('Entry Allowed');
            setBookingId('');
        } catch (error: any) {
            setResult({
                success: false,
                message: error.response?.data?.error?.message || 'Validation Failed',
            });

            setStats(prev => ({ ...prev, rejected: prev.rejected + 1 }));

            setRecentScans(prev => [{
                id: id,
                name: 'Unknown',
                time: new Date().toLocaleTimeString(),
                status: 'invalid'
            }, ...prev].slice(0, 5));

            toast.error('Entry Denied');
        } finally {
            setVerifying(false);
        }
    };

    const handleManualVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingId.trim()) return;
        verifyBooking(bookingId);
    };

    if (!user || user.role !== 'STAFF') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Restricted Access</h1>
                    <p className="text-gray-600 mb-6">This checkpoint interface is for authorized staff only.</p>
                    <button onClick={() => navigate('/')} className="text-primary-600 hover:underline">
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white font-mono pb-20">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-10 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-primary-400" />
                    <div>
                        <h1 className="font-bold text-lg tracking-wider">CHECKPOST</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">SustainaTour Gov</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-primary-400">ID: {user.id.slice(0, 8)}</p>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="p-2 hover:bg-slate-700 rounded-lg transition"
                    >
                        <LogOut className="h-5 w-5 text-slate-400 hover:text-white" />
                    </button>
                </div>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-2 gap-4 p-4 max-w-md mx-auto">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-900/40 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Verified</p>
                        <p className="text-xl font-bold text-white">{stats.verified}</p>
                    </div>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center">
                        <XCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Rejected</p>
                        <p className="text-xl font-bold text-white">{stats.rejected}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto p-4">
                <div className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
                    <div className="p-6">
                        {!showScanner ? (
                            <>
                                <div className="text-center mb-8">
                                    <button
                                        onClick={() => setShowScanner(true)}
                                        className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-400 hover:to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(5,150,105,0.4)] transition transform hover:scale-105 active:scale-95"
                                    >
                                        <Camera className="h-10 w-10 text-white" />
                                    </button>
                                    <h2 className="text-2xl font-bold mb-2">Scan Digital Pass</h2>
                                    <p className="text-slate-400 text-sm">Tap camera to scan QR Code</p>
                                </div>

                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-700"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-slate-800 text-slate-500">OR ENTER MANUALLY</span>
                                    </div>
                                </div>

                                <form onSubmit={handleManualVerify} className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            value={bookingId}
                                            onChange={(e) => setBookingId(e.target.value)}
                                            placeholder="BOOK-..."
                                            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-mono text-center tracking-wider text-xl"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={verifying || !bookingId}
                                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Shield className="h-5 w-5" />
                                        {verifying ? 'Validating...' : 'VERIFY TOKEN'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="text-center">
                                <h3 className="font-bold mb-4 animate-pulse">Scanning...</h3>
                                <div id="reader" className="w-full bg-black rounded-lg overflow-hidden border-2 border-primary-500"></div>
                                <button
                                    onClick={() => setShowScanner(false)}
                                    className="mt-6 px-4 py-2 bg-slate-700 rounded-full text-slate-300 hover:text-white text-sm"
                                >
                                    Cancel Camera
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Result Display */}
                    {result && (
                        <div className={`p-6 border-t animate-slideUp ${result.success ? 'bg-green-900/30 border-green-800' : 'bg-red-900/30 border-red-800'}`}>
                            <div className="flex items-start gap-4">
                                {result.success ? (
                                    <CheckCircle className="h-12 w-12 text-green-500 flex-shrink-0" />
                                ) : (
                                    <XCircle className="h-12 w-12 text-red-500 flex-shrink-0" />
                                )}
                                <div>
                                    <h3 className={`text-xl font-bold mb-1 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                                        {result.success ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                                    </h3>
                                    <p className="text-slate-300 text-sm mb-2">{result.message}</p>

                                    {result.success && result.data && (
                                        <div className="text-sm text-slate-300 space-y-1 mt-3 bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                                            <p><span className="text-slate-500">Visitor:</span> <span className="text-white font-bold">{result.data.user.firstName}</span></p>
                                            <p><span className="text-slate-500">Group:</span> <span className="text-white">{result.data.numberOfVisitors} Pax</span></p>
                                            <p><span className="text-slate-500">Zone:</span> <span className="text-amber-400">{result.data.destination.name}</span></p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent History */}
            {recentScans.length > 0 && (
                <div className="max-w-md mx-auto p-4 mt-2">
                    <div className="flex items-center gap-2 mb-3 px-2">
                        <History className="h-4 w-4 text-slate-500" />
                        <h3 className="text-xs font-bold text-slate-500 uppercase">Recent Activity</h3>
                    </div>
                    <div className="space-y-2">
                        {recentScans.map((scan, i) => (
                            <div key={i} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-bold text-slate-300">{scan.name}</p>
                                    <p className="text-xs text-slate-500">{scan.id.slice(-8)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">{scan.time}</p>
                                    <p className={`text-xs font-bold ${scan.status === 'valid' ? 'text-green-500' : 'text-red-500'}`}>
                                        {scan.status.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

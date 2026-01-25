import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import {
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    MapPin,
    CheckCircle,
    User,
    Send
} from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';

interface DestinationSimple {
    id: string;
    name: string;
}

interface Feedback {
    id: string;
    title: string;
    description: string;
    feedbackType: string;
    status: string;
    upvotes: number;
    downvotes: number;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
    };
    adminResponse?: string;
}

export default function CommunityPortal() {
    // const navigate = useNavigate();

    const [destinations, setDestinations] = useState<DestinationSimple[]>([]);
    const [selectedDestinationId, setSelectedDestinationId] = useState<string>('');
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'feedback' | 'report' | 'transparency'>('feedback');

    // Form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDestinations();
    }, []);

    useEffect(() => {
        if (selectedDestinationId) {
            fetchFeedback(selectedDestinationId);
        }
    }, [selectedDestinationId]);

    const fetchDestinations = async () => {
        try {
            const res = await api.get('/destinations');
            const dests = res.data.data.destinations;
            setDestinations(dests);
            if (dests.length > 0) setSelectedDestinationId(dests[0].id);
        } catch (error) {
            toast.error('Failed to load destinations');
        }
    };

    const fetchFeedback = async (id: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/community/feedback/${id}`);
            setFeedbackList(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/community/feedback', {
                destinationId: selectedDestinationId,
                title,
                description,
                feedbackType: activeTab === 'report' ? 'INCIDENT_REPORT' : 'SUGGESTION',
                isAnonymous
            });
            toast.success('Submitted successfully');
            setTitle('');
            setDescription('');
            fetchFeedback(selectedDestinationId);
        } catch (error) {
            toast.error('Failed to submit. Please login first.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async (id: string, type: 'up' | 'down') => {
        try {
            await api.post(`/community/feedback/${id}/vote`, { type });
            // Optimistic update
            setFeedbackList(prev => prev.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        upvotes: type === 'up' ? item.upvotes + 1 : item.upvotes,
                        downvotes: type === 'down' ? item.downvotes + 1 : item.downvotes
                    };
                }
                return item;
            }));
        } catch (error) {
            toast.error('Login required to vote');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 relative dark:bg-[#111] transition-colors duration-300">
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            {/* Hero Section */}
            <div className="bg-primary-700 text-white py-12">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-3xl font-bold mb-4">Community Voice Portal</h1>
                    <p className="text-primary-100 text-lg">Help us shape sustainable tourism in your region.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 -mt-8">
                {/* Destination Selector */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <MapPin className="h-6 w-6 text-primary-600" />
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 block">Select Region</span>
                            <select
                                value={selectedDestinationId}
                                onChange={(e) => setSelectedDestinationId(e.target.value)}
                                className="font-bold text-gray-900 dark:text-white bg-transparent focus:outline-none text-lg cursor-pointer"
                            >
                                {destinations.map(d => (
                                    <option key={d.id} value={d.id} className="dark:bg-gray-800">{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('feedback')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'feedback' ? 'bg-white dark:bg-gray-800 shadow text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Feedback
                        </button>
                        <button
                            onClick={() => setActiveTab('report')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'report' ? 'bg-white dark:bg-gray-800 shadow text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Report Issue
                        </button>
                        <button
                            onClick={() => setActiveTab('transparency')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'transparency' ? 'bg-white dark:bg-gray-800 shadow text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Transparency
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Submission Form */}
                    <div className="md:col-span-1">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 sticky top-8">
                            <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary-600" />
                                {activeTab === 'report' ? 'Report Incident' : 'Submit Suggestion'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                                        placeholder={activeTab === 'report' ? "e.g., Trail blocked" : "e.g., More trash cans"}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Details</label>
                                    <textarea
                                        required
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                                        rows={4}
                                        placeholder="Describe clearly..."
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="anon"
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                        className="rounded text-primary-600 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <label htmlFor="anon" className="text-sm text-gray-600 dark:text-gray-300">Submit Anonymously</label>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition flex justify-center items-center gap-2"
                                >
                                    {submitting ? 'Sending...' : <><Send className="h-4 w-4" /> Submit</>}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Feed */}
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-2">Community Feed</h2>
                        {loading ? (
                            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
                        ) : feedbackList.length === 0 ? (
                            <div className="text-center p-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl">No active discussions yet. Be the first!</div>
                        ) : (
                            feedbackList.map((item) => (
                                <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            {item.user.firstName === 'Anonymous' ? (
                                                <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full"><User className="h-4 w-4 text-gray-500 dark:text-gray-400" /></div>
                                            ) : (
                                                <div className="bg-primary-100 dark:bg-primary-900/40 p-2 rounded-full text-primary-700 dark:text-primary-400 font-bold text-xs">
                                                    {item.user.firstName[0]}{item.user.lastName[0]}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white block text-sm">
                                                    {item.user.firstName} {item.user.lastName}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.feedbackType === 'INCIDENT_REPORT' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            }`}>
                                            {item.feedbackType.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{item.description}</p>

                                    {item.adminResponse && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 mb-4 text-sm">
                                            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold mb-1">
                                                <CheckCircle className="h-4 w-4" /> Official Response
                                            </div>
                                            <p className="text-blue-900 dark:text-blue-200">{item.adminResponse}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <button
                                            onClick={() => handleVote(item.id, 'up')}
                                            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition"
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                            <span className="font-medium text-sm">{item.upvotes}</span>
                                        </button>
                                        <button
                                            onClick={() => handleVote(item.id, 'down')}
                                            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                                        >
                                            <ThumbsDown className="h-4 w-4" />
                                            <span className="font-medium text-sm">{item.downvotes}</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

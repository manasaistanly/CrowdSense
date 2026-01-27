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
import Navbar from '../components/Navbar';

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
    const [activeTab, setActiveTab] = useState<'feedback' | 'report' | 'transparency' | 'polls'>('feedback');

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
            if (activeTab === 'polls') {
                fetchPolls(selectedDestinationId);
            } else {
                fetchFeedback(selectedDestinationId);
            }
        }
    }, [selectedDestinationId, activeTab]);

    const fetchDestinations = async () => {
        try {
            const res = await api.get('/destinations');
            const dests = res.data.data.destinations;
            setDestinations(dests);
            if (dests.length > 0 && !selectedDestinationId) setSelectedDestinationId(dests[0].id);
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
        } catch (error: any) {
            console.error('Submit error:', error);
            const msg = error.response?.data?.error?.message || error.response?.data?.message || 'Failed to submit';
            if (error.response?.status === 401) {
                toast.error('Please login to submit feedback');
            } else {
                toast.error(msg);
            }
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

    // Polls State
    const [polls, setPolls] = useState<any[]>([]);
    const [votingPollId, setVotingPollId] = useState<string | null>(null);



    const fetchPolls = async (id: string) => {
        setLoading(true);
        try {
            // Check if user is logged in to fetch personalized vote
            const endpoint = `/community/polls/${id}/user`;
            // Fallback to public if 401? logic handled usually by checking auth state
            // For now, let's try the user endpoint if we have a token, else public?
            // Simplified: Just fetch user endpoint, if 401 gracefully handle or just fetch public.

            // Actually, let's just fetch public for now to avoid complexity if auth logic is strict
            // But we want to show "Voted", so let's try.
            const res = await api.get(endpoint); // relies on interceptor for token
            setPolls(res.data.data);
        } catch (error) {
            // Fallback to public
            try {
                const res = await api.get(`/community/polls/${id}`);
                setPolls(res.data.data);
            } catch (e) {
                console.error(e);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePollVote = async (pollId: string, optionId: string) => {
        setVotingPollId(pollId);
        try {
            const res = await api.post(`/community/polls/${pollId}/vote`, { optionId });
            // Update local state
            setPolls(prev => prev.map(p => {
                if (p.id === pollId) {
                    return res.data.data; // Server returns updated poll with new stats
                }
                return p;
            }));
            toast.success('Vote recorded!');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to vote');
        } finally {
            setVotingPollId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 relative dark:bg-[#111] transition-colors duration-300">
            <Navbar />
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
                            onClick={() => setActiveTab('polls')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'polls' ? 'bg-white dark:bg-gray-800 shadow text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Polls
                        </button>
                        <button
                            onClick={() => setActiveTab('report')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'report' ? 'bg-white dark:bg-gray-800 shadow text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Report Issue
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Form (Hidden for Polls) */}
                    {activeTab !== 'polls' && (
                        <div className="md:col-span-1">
                            {/* ... Existing Feedback Form ... */}
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
                    )}

                    {/* Right Column: Feed or Polls */}
                    <div className={activeTab === 'polls' ? "md:col-span-3" : "md:col-span-2"}>
                        {activeTab === 'polls' ? (
                            <div className="space-y-6">
                                <h2 className="font-bold text-gray-900 dark:text-white mb-2 text-xl">Active Polls</h2>
                                {loading ? (
                                    <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
                                ) : polls.length === 0 ? (
                                    <div className="text-center p-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <p>No active polls at the moment.</p>
                                    </div>
                                ) : (
                                    polls.map((poll) => (
                                        <div key={poll.id} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-start mb-6">
                                                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{poll.question}</h3>
                                                <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                                    {poll.totalVotes} votes
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                {poll.options.map((option: any) => (
                                                    <div key={option.id} className="relative">
                                                        {/* Progress Bar Background */}
                                                        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden h-full">
                                                            <div
                                                                className={`h-full transition-all duration-1000 ${poll.userVotedOptionId === option.id ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-200 dark:bg-gray-600/50'}`}
                                                                style={{ width: `${option.percentage}%` }}
                                                            ></div>
                                                        </div>

                                                        {/* Content */}
                                                        <button
                                                            onClick={() => !poll.userVotedOptionId && handlePollVote(poll.id, option.id)}
                                                            disabled={!!poll.userVotedOptionId || votingPollId === poll.id}
                                                            className={`relative w-full text-left p-4 rounded-lg border transition-all flex justify-between items-center z-10 
                                                                ${poll.userVotedOptionId === option.id
                                                                    ? 'border-primary-500 ring-1 ring-primary-500'
                                                                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'}`}
                                                        >
                                                            <span className="font-medium text-gray-900 dark:text-white">{option.text}</span>
                                                            <div className="flex items-center gap-3">
                                                                {poll.userVotedOptionId === option.id && <CheckCircle className="h-5 w-5 text-primary-600" />}
                                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{option.percentage}%</span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            {poll.expiresAt && (
                                                <p className="text-xs text-gray-400 mt-4 text-right">
                                                    Ends {new Date(poll.expiresAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

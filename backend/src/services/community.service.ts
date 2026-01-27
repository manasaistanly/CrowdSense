import { prisma } from '../config/database';
import { FeedbackType, FeedbackCategory, FeedbackStatus, SeverityLevel } from '@prisma/client';

interface CreateFeedbackData {
    userId: string;
    destinationId: string;
    description: string;
    title: string;
    feedbackType: FeedbackType;
    category?: FeedbackCategory;
    isAnonymous?: boolean;
    severity?: SeverityLevel;
}

export class CommunityService {
    /**
     * Submit new feedback
     */
    async submitFeedback(data: CreateFeedbackData) {
        return await prisma.communityFeedback.create({
            data: {
                userId: data.userId,
                destinationId: data.destinationId,
                title: data.title,
                description: data.description,
                feedbackType: data.feedbackType,
                category: data.category,
                isAnonymous: data.isAnonymous || false,
                severity: data.severity || SeverityLevel.MEDIUM,
                status: FeedbackStatus.SUBMITTED,
            },
        });
    }

    /**
     * Get feedback for a destination (Public/Community view)
     */
    async getPublicFeedback(destinationId: string, limit = 50) {
        const feedback = await prisma.communityFeedback.findMany({
            where: {
                destinationId,
                status: { not: FeedbackStatus.DISMISSED } // Show all except dismissed? Or only Resolved?
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatarUrl: true
                    }
                }
            }
        });

        // Strip user details if anonymous
        return feedback.map((item: any) => {
            if (item.isAnonymous) {
                return {
                    ...item,
                    user: { firstName: 'Anonymous', lastName: 'User', avatarUrl: null },
                    userId: undefined
                };
            }
            return item;
        });
    }

    /**
     * Upvote/Downvote feedback (Simple increment for MVP)
     */
    async voteFeedback(feedbackId: string, type: 'up' | 'down') {
        const updateData = type === 'up'
            ? { upvotes: { increment: 1 } }
            : { downvotes: { increment: 1 } };

        return await prisma.communityFeedback.update({
            where: { id: feedbackId },
            data: updateData
        });
    }

    /**
     * Admin: Update status or respond
     */
    async respondToFeedback(feedbackId: string, responderId: string, response: string, newStatus?: FeedbackStatus) {
        return await prisma.communityFeedback.update({
            where: { id: feedbackId },
            data: {
                adminResponse: response,
                respondedById: responderId,
                respondedAt: new Date(),
                status: newStatus || FeedbackStatus.IN_PROGRESS
            }
        });
    }

    /**
     * Create a new poll (Admin)
     */
    async createPoll(data: {
        destinationId: string;
        question: string;
        options: string[];
        expiresAt?: Date;
        createdBy?: string;
    }) {
        return await prisma.poll.create({
            data: {
                destinationId: data.destinationId,
                question: data.question,
                expiresAt: data.expiresAt,
                createdBy: data.createdBy,
                options: {
                    create: data.options.map(text => ({ text }))
                }
            },
            include: {
                options: true
            }
        });
    }

    /**
     * Get active polls for a destination with results
     */
    async getPolls(destinationId: string, userId?: string) {
        const polls = await prisma.poll.findMany({
            where: {
                destinationId,
                status: 'ACTIVE',
                // OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }]
            },
            include: {
                options: {
                    include: {
                        _count: {
                            select: { votes: true }
                        }
                    }
                },
                votes: userId ? {
                    where: { userId },
                    select: { pollOptionId: true }
                } : false
            },
            orderBy: { createdAt: 'desc' }
        });

        // Format for frontend
        return polls.map((poll: any) => {
            const totalVotes = poll.options.reduce((acc: number, opt: any) => acc + opt._count.votes, 0);

            return {
                id: poll.id,
                question: poll.question,
                expiresAt: poll.expiresAt,
                totalVotes,
                userVotedOptionId: poll.votes?.[0]?.pollOptionId || null,
                options: poll.options.map((opt: any) => ({
                    id: opt.id,
                    text: opt.text,
                    votes: opt._count.votes,
                    percentage: totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0
                }))
            };
        });
    }

    /**
     * Vote on a poll
     */
    async votePoll(pollId: string, optionId: string, userId: string) {
        // Check if already voted
        const existingVote = await prisma.pollVote.findUnique({
            where: {
                pollId_userId: { pollId, userId }
            }
        });

        if (existingVote) {
            throw new Error('You have already voted on this poll');
        }

        // Create vote
        await prisma.pollVote.create({
            data: {
                pollId,
                pollOptionId: optionId,
                userId
            }
        });

        // Return updated poll stats
        const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: {
                options: {
                    include: {
                        _count: { select: { votes: true } }
                    }
                }
            }
        });

        if (!poll) throw new Error('Poll not found');

        const totalVotes = poll.options.reduce((acc: number, opt: any) => acc + opt._count.votes, 0);

        return {
            id: poll.id,
            totalVotes,
            userVotedOptionId: optionId,
            options: poll.options.map((opt: any) => ({
                id: opt.id,
                text: opt.text,
                votes: opt._count.votes,
                percentage: totalVotes > 0 ? Math.round((opt._count.votes / totalVotes) * 100) : 0
            }))
        };
    }
}

export const communityService = new CommunityService();

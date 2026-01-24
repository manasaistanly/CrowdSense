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
        return feedback.map(item => {
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
}

export const communityService = new CommunityService();

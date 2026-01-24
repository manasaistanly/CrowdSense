import { logger } from '../utils/logger';

export class EmailService {
    /**
     * Send booking confirmation email (Mock)
     */
    async sendBookingConfirmation(
        to: string,
        booking: any,
        _qrCode?: string
    ) {
        // In a real app, we would use Nodemailer or SendGrid here
        // For MVP, we log the email content to console/logger

        const subject = `Booking Confirmed: ${booking.destination.name}`;
        const emailContent = `
=================================================================
📧 EMAIL SENT TO: ${to}
SUBJECT: ${subject}
=================================================================
Dear ${booking.user.firstName},

Your booking has been confirmed!

Booking Reference: ${booking.bookingReference}
Destination:       ${booking.destination.name}
Date:              ${new Date(booking.visitDate).toDateString()}
Visitors:          ${booking.numberOfVisitors}
Total Amount:      ₹${booking.totalPrice}

Your Digital Entry Pass (QR Code) is attached.
[QR CODE DATA MOCK]
=================================================================
`;

        logger.info(emailContent);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return true;
    }
}

export const emailService = new EmailService();

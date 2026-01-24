import { PrismaClient, BookingStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('💉 Injecting past analytics data...');

    const tourist = await prisma.user.findUnique({ where: { email: 'tourist@example.com' } });
    const destination = await prisma.destination.findFirst({ where: { slug: 'ooty-lake' } });

    if (!tourist || !destination) {
        console.error('❌ User or Destination not found. Seed the DB first.');
        return;
    }

    const pastBookings = [];
    const today = new Date();

    // Generate bookings for the last 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Random number of bookings per day (1-5)
        const dailyCount = Math.floor(Math.random() * 5) + 1;

        for (let j = 0; j < dailyCount; j++) {
            const visitors = Math.floor(Math.random() * 4) + 1; // 1-4 visitors
            const price = visitors * 50;

            pastBookings.push({
                bookingReference: `ATTR-${date.getTime()}-${j}`,
                userId: tourist.id,
                destinationId: destination.id,
                visitDate: date,
                numberOfVisitors: visitors,
                basePrice: 50,
                totalPrice: price,
                status: BookingStatus.COMPLETED,
                paymentStatus: PaymentStatus.COMPLETED,
                qrCode: 'MOCK-QR',
                entryTime: new Date(date.setHours(10, 0, 0, 0)), // Entered at 10 AM
                exitTime: new Date(date.setHours(12, 0, 0, 0)),
                createdAt: date,
            });
        }
    }

    await prisma.booking.createMany({
        data: pastBookings,
    });

    console.log(`✅ Injected ${pastBookings.length} bookings for the last 7 days.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

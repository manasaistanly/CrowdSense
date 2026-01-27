import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simulateCrowd() {
    try {
        console.log('🔍 Finding Ooty Lake/Boat House...');
        // Find a destination to overcrowd
        const target = await prisma.destination.findFirst({
            where: {
                OR: [
                    { name: { contains: 'Lake', mode: 'insensitive' } },
                    { name: { contains: 'Boat', mode: 'insensitive' } }
                ]
            }
        });

        if (!target) {
            console.error('❌ Could not find Ooty Lake or similar destination.');
            return;
        }

        console.log(`✅ Found: ${target.name} (Max: ${target.maxDailyCapacity})`);

        // Set to 95% Capacity
        const newCurrent = Math.floor(target.maxDailyCapacity * 0.95);

        await prisma.destination.update({
            where: { id: target.id },
            data: {
                currentCapacity: newCurrent,
                status: 'ACTIVE' // Ensure it's active
            }
        });

        console.log(`🔥 UPDATED: ${target.name} is now at ${newCurrent}/${target.maxDailyCapacity} visitors (95%).`);
        console.log(`👉 Go to the frontend URL for this destination to see the "High Demand" diversion logic.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

simulateCrowd();

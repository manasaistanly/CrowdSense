
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking destinations...');

    const destinations = await prisma.destination.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            status: true
        }
    });

    console.log('Found ' + destinations.length + ' destinations:');
    destinations.forEach(d => {
        console.log(`- ${d.name} (Slug: ${d.slug}, ID: ${d.id}, Status: ${d.status})`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

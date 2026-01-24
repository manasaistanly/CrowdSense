
import { destinationService } from './services/destination.service';
import { prisma } from './config/database';

async function main() {
    console.log('Testing fetch...');
    try {
        // Fetch all first to get a valid slug
        const list = await destinationService.getDestinations({ limit: 1 });
        console.log('Destinations found:', list.destinations.length);

        if (list.destinations.length > 0) {
            const dest = list.destinations[0];
            console.log('Trying to fetch by ID:', dest.id);
            const byId = await destinationService.getDestinationById(dest.id);
            console.log('Success by ID');

            console.log('Trying to fetch by Slug:', dest.slug);
            const bySlug = await destinationService.getDestinationById(dest.slug);
            console.log('Success by Slug');
        } else {
            console.log('No destinations to test with.');
        }

        console.log('Trying non-existent...');
        try {
            await destinationService.getDestinationById('non-existent');
        } catch (e: any) {
            console.log('Caught expected error:', e.message);
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

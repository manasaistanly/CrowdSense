
import { Router } from 'express';
import { PrismaClient, UserRole, DestinationType, DestinationStatus, ZoneType } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database'; // Import existing prisma instance

const router = Router();

const SALT_ROUNDS = 12;

router.post('/seed', async (req, res) => {
    try {
        console.log('🌱 Starting database seed via API...');

        // --- COPY SEED LOGIC HERE ---
        // Create users
        const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
        const staffPassword = await bcrypt.hash('staff123', SALT_ROUNDS);

        // Define users first
        const superAdminData = {
            email: 'admin@sustainatour.com',
            passwordHash: adminPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: UserRole.SUPER_ADMIN,
            emailVerified: true,
            phone: '+91 9876543210',
        };

        const ootyAdminData = {
            email: 'admin.ooty@sustainatour.com',
            passwordHash: adminPassword,
            firstName: 'Ooty',
            lastName: 'Administrator',
            role: UserRole.DESTINATION_ADMIN,
            emailVerified: true,
            phone: '+91 9876543211',
        };

        const nilgirisAdminData = {
            email: 'admin.nilgiris@sustainatour.com',
            passwordHash: adminPassword,
            firstName: 'Nilgiris',
            lastName: 'Park Manager',
            role: UserRole.DESTINATION_ADMIN,
            emailVerified: true,
            phone: '+91 9876543212',
        };

        // Upsert users
        const superAdmin = await prisma.user.upsert({ where: { email: superAdminData.email }, update: {}, create: superAdminData });
        const ootyAdmin = await prisma.user.upsert({ where: { email: ootyAdminData.email }, update: {}, create: ootyAdminData });
        const nilgirisAdmin = await prisma.user.upsert({ where: { email: nilgirisAdminData.email }, update: {}, create: nilgirisAdminData });

        // Destinations
        const ootyLake = await prisma.destination.upsert({
            where: { slug: 'ooty-lake' },
            update: {},
            create: {
                name: 'Ooty Lake',
                slug: 'ooty-lake',
                description: 'A beautiful artificial lake built in 1824, surrounded by lush greenery and Eucalyptus trees. Perfect for boating and nature walks.',
                locationAddress: 'Ooty Lake Road, Ooty, Tamil Nadu 643001',
                latitude: 11.4102,
                longitude: 76.6950,
                destinationType: DestinationType.HILL_STATION,
                maxDailyCapacity: 2000,
                currentCapacity: 0,
                status: DestinationStatus.ACTIVE,
                openingTime: '09:00',
                closingTime: '18:00',
                operatingDays: [0, 1, 2, 3, 4, 5, 6],
                adminUserId: ootyAdmin.id,
                images: [
                    'https://images.unsplash.com/photo-1578509395623-a5509ae3d288?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1626081120050-71649987f17d?w=1920&h=1080&fit=crop',
                ],
                amenities: ['Boating', 'Parking', 'Restrooms', 'Food Stalls'],
                guidelines: 'Please maintain cleanliness. No plastic allowed. Follow boating safety rules.',
            },
        });

        const nilgirisNationalPark = await prisma.destination.upsert({
            where: { slug: 'nilgiris-national-park' },
            update: {},
            create: {
                name: 'Nilgiris Biosphere Reserve',
                slug: 'nilgiris-national-park',
                description: 'A UNESCO World Heritage Site, home to diverse flora and fauna including elephants, tigers, and the endangered Nilgiri Tahr.',
                locationAddress: 'Masinagudi, Nilgiris District, Tamil Nadu',
                latitude: 11.4916,
                longitude: 76.5699,
                destinationType: DestinationType.NATIONAL_PARK,
                maxDailyCapacity: 500,
                currentCapacity: 0,
                status: DestinationStatus.ACTIVE,
                openingTime: '06:00',
                closingTime: '17:00',
                operatingDays: [0, 1, 2, 3, 4, 5, 6],
                adminUserId: nilgirisAdmin.id,
                images: [
                    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&h=1080&fit=crop',
                    'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1920&h=1080&fit=crop',
                ],
                amenities: ['Guided Tours', 'Wildlife Safari', 'Parking', 'Visitor Center'],
                guidelines: 'Stay in designated areas. No littering. Maintain silence. Do not disturb wildlife.',
            },
        });

        // Add more destinations (truncated for brevity, adding key ones)

        const botanicalGarden = await prisma.destination.upsert({
            where: { slug: 'government-botanical-garden' },
            update: {},
            create: {
                name: 'Government Botanical Garden',
                slug: 'government-botanical-garden',
                description: 'Established in 1848, this 55-acre garden features rare tree species, fossilized tree trunks, and a beautiful terraced layout.',
                locationAddress: 'Botanical Garden Road, Ooty, Tamil Nadu 643004',
                latitude: 11.4165,
                longitude: 76.7145,
                destinationType: DestinationType.ECO_TOURISM,
                maxDailyCapacity: 1500,
                currentCapacity: 0,
                status: DestinationStatus.ACTIVE,
                openingTime: '08:30',
                closingTime: '18:30',
                operatingDays: [0, 1, 2, 3, 4, 5, 6],
                adminUserId: ootyAdmin.id,
                images: [
                    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1920&h=1080&fit=crop',
                    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1920&h=1080&fit=crop',
                ],
                amenities: ['Garden Tours', 'Photography', 'Parking', 'Cafe'],
                guidelines: 'Do not pluck flowers or plants. Stay on designated paths. Photography allowed.',
            },
        });

        res.json({ success: true, message: 'Database seeded successfully with Users and Destinations!' });

    } catch (error: any) {
        console.error('Seed Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;

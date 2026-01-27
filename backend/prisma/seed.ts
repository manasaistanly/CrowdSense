import { PrismaClient, UserRole, DestinationType, DestinationStatus, ZoneType, BookingStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function main() {
    console.log('🌱 Starting database seed...');

    // Create users
    console.log('👥 Creating users...');

    const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
    const staffPassword = await bcrypt.hash('staff123', SALT_ROUNDS);
    const touristPassword = await bcrypt.hash('tourist123', SALT_ROUNDS);

    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@sustainatour.com' },
        update: {},
        create: {
            email: 'admin@sustainatour.com',
            passwordHash: adminPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: UserRole.SUPER_ADMIN,
            emailVerified: true,
            phone: '+91 9876543210',
        },
    });

    const ootyAdmin = await prisma.user.upsert({
        where: { email: 'admin.ooty@sustainatour.com' },
        update: {},
        create: {
            email: 'admin.ooty@sustainatour.com',
            passwordHash: adminPassword,
            firstName: 'Ooty',
            lastName: 'Administrator',
            role: UserRole.DESTINATION_ADMIN,
            emailVerified: true,
            phone: '+91 9876543211',
        },
    });

    const nilgirisAdmin = await prisma.user.upsert({
        where: { email: 'admin.nilgiris@sustainatour.com' },
        update: {},
        create: {
            email: 'admin.nilgiris@sustainatour.com',
            passwordHash: adminPassword,
            firstName: 'Nilgiris',
            lastName: 'Park Manager',
            role: UserRole.DESTINATION_ADMIN,
            emailVerified: true,
            phone: '+91 9876543212',
        },
    });

    const staff = await prisma.user.upsert({
        where: { email: 'staff@sustainatour.com' },
        update: {},
        create: {
            email: 'staff@sustainatour.com',
            passwordHash: staffPassword,
            firstName: 'Entry',
            lastName: 'Staff',
            role: UserRole.STAFF,
            emailVerified: true,
            phone: '+91 9876543213',
        },
    });

    const zoneAdmin = await prisma.user.upsert({
        where: { email: 'rdo.ooty@sustainatour.com' },
        update: {},
        create: {
            email: 'rdo.ooty@sustainatour.com',
            passwordHash: adminPassword,
            firstName: 'RDO',
            lastName: 'Ooty',
            role: UserRole.ZONE_ADMIN,
            emailVerified: true,
            phone: '+91 9876543214',
        },
    });

    const nodalOfficer = await prisma.user.upsert({
        where: { email: 'traffic.nodal@sustainatour.com' },
        update: {},
        create: {
            email: 'traffic.nodal@sustainatour.com',
            passwordHash: adminPassword,
            firstName: 'Traffic',
            lastName: 'Chief',
            role: UserRole.NODAL_OFFICER,
            emailVerified: true,
            phone: '+91 9876543215',
        },
    });

    console.log('✅ Users created');

    // Create destinations
    console.log('🏞️  Creating destinations...');

    const ootyLake = await prisma.destination.upsert({
        where: { slug: 'ooty-lake' },
        update: {
            name: 'Ooty Lake',
            description: 'A beautiful artificial lake built in 1824, surrounded by lush greenery and Eucalyptus trees. Perfect for boating and nature walks.',
            locationAddress: 'Ooty Lake Road, Ooty, Tamil Nadu 643001',
            destinationType: DestinationType.HILL_STATION,
            maxDailyCapacity: 2000,
            images: [
                'https://images.unsplash.com/photo-1626081120050-71649987f17d?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Boating', 'Parking', 'Restrooms', 'Food Stalls'],
        },
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
            operatingDays: [0, 1, 2, 3, 4, 5, 6], // All days
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
        update: {
            name: 'Nilgiris Biosphere Reserve',
            description: 'A UNESCO World Heritage Site, home to diverse flora and fauna including elephants, tigers, and the endangered Nilgiri Tahr.',
            locationAddress: 'Masinagudi, Nilgiris District, Tamil Nadu',
            destinationType: DestinationType.NATIONAL_PARK,
            maxDailyCapacity: 500,
            images: [
                'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Guided Tours', 'Wildlife Safari', 'Parking', 'Visitor Center'],
        },
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

    const botanicalGarden = await prisma.destination.upsert({
        where: { slug: 'government-botanical-garden' },
        update: {
            name: 'Government Botanical Garden',
            description: 'Established in 1848, this 55-acre garden features rare tree species, fossilized tree trunks, and a beautiful terraced layout.',
            locationAddress: 'Botanical Garden Road, Ooty, Tamil Nadu 643004',
            destinationType: DestinationType.ECO_TOURISM,
            maxDailyCapacity: 1500,
            images: [
                'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Garden Tours', 'Photography', 'Parking', 'Cafe'],
        },
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

    const doddabettaPeak = await prisma.destination.upsert({
        where: { slug: 'doddabetta-peak' },
        update: {
            name: 'Doddabetta Peak',
            description: 'At 2,623 meters above sea level, Doddabetta is the highest peak in Tamil Nadu. The summit offers breathtaking panoramic views of the Nilgiri hills and valleys. On clear days, you can see as far as Mysore and Coimbatore plains.',
            locationAddress: 'Doddabetta Road, Ooty, Tamil Nadu 643001',
            destinationType: DestinationType.HILL_STATION,
            maxDailyCapacity: 800,
            images: [
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Telescope House', 'Viewpoint', 'Parking', 'Photography'],
        },
        create: {
            name: 'Doddabetta Peak',
            slug: 'doddabetta-peak',
            description: 'At 2,623 meters above sea level, Doddabetta is the highest peak in Tamil Nadu. The summit offers breathtaking panoramic views of the Nilgiri hills and valleys. On clear days, you can see as far as Mysore and Coimbatore plains.',
            locationAddress: 'Doddabetta Road, Ooty, Tamil Nadu 643001',
            latitude: 11.4002,
            longitude: 76.7382,
            destinationType: DestinationType.HILL_STATION,
            maxDailyCapacity: 800,
            currentCapacity: 0,
            status: DestinationStatus.ACTIVE,
            openingTime: '08:00',
            closingTime: '17:30',
            operatingDays: [0, 1, 2, 3, 4, 5, 6],
            adminUserId: ootyAdmin.id,
            images: [
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Telescope House', 'Viewpoint', 'Parking', 'Photography'],
            guidelines: 'Carry warm clothes as it gets very cold. Best visibility in morning hours. No littering allowed.',
        },
    });

    const coonoor = await prisma.destination.upsert({
        where: { slug: 'coonoor-sims-park' },
        update: {
            name: 'Coonoor - Sim\'s Park',
            description: 'Located at 1,850 meters altitude, Coonoor is the second largest hill station in Nilgiris. Sim\'s Park is a beautifully maintained botanical garden spread over 12 hectares with rare plant species, annual fruit and flower shows.',
            locationAddress: 'Sim\'s Park Road, Coonoor, Tamil Nadu 643101',
            destinationType: DestinationType.HILL_STATION,
            maxDailyCapacity: 1200,
            images: [
                'https://images.unsplash.com/photo-1598195844889-bc84931dd205?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Botanical Garden', 'Children\'s Play Area', 'Parking', 'Restrooms', 'Snack Stalls'],
        },
        create: {
            name: 'Coonoor - Sim\'s Park',
            slug: 'coonoor-sims-park',
            description: 'Located at 1,850 meters altitude, Coonoor is the second largest hill station in Nilgiris. Sim\'s Park is a beautifully maintained botanical garden spread over 12 hectares with rare plant species, annual fruit and flower shows.',
            locationAddress: 'Sim\'s Park Road, Coonoor, Tamil Nadu 643101',
            latitude: 11.3520,
            longitude: 76.7958,
            destinationType: DestinationType.HILL_STATION,
            maxDailyCapacity: 1200,
            currentCapacity: 0,
            status: DestinationStatus.ACTIVE,
            openingTime: '09:00',
            closingTime: '18:00',
            operatingDays: [0, 1, 2, 3, 4, 5, 6],
            adminUserId: nilgirisAdmin.id,
            images: [
                'https://images.unsplash.com/photo-1598195844889-bc84931dd205?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Botanical Garden', 'Children\'s Play Area', 'Parking', 'Restrooms', 'Snack Stalls'],
            guidelines: 'Do not pluck flowers. Stay on designated paths. Maintain cleanliness.',
        },
    });

    const pykaraFalls = await prisma.destination.upsert({
        where: { slug: 'pykara-falls' },
        update: {
            name: 'Pykara Falls & Lake',
            description: 'Located 20 km from Ooty, the Pykara river reveals its true beauty during monsoon and winter months. The waterfall cascades down in multiple stages surrounded by lush Shola forests. The nearby lake offers boating facilities.',
            locationAddress: 'Pykara, Ooty, Tamil Nadu 643004',
            destinationType: DestinationType.ECO_TOURISM,
            maxDailyCapacity: 1000,
            images: [
                'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1508668870421-0491c8933dce?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Boating', 'Viewpoint', 'Parking', 'Photography', 'Trekking Trails'],
        },
        create: {
            name: 'Pykara Falls & Lake',
            slug: 'pykara-falls',
            description: 'Located 20 km from Ooty, the Pykara river reveals its true beauty during monsoon and winter months. The waterfall cascades down in multiple stages surrounded by lush Shola forests. The nearby lake offers boating facilities.',
            locationAddress: 'Pykara, Ooty, Tamil Nadu 643004',
            latitude: 11.4000,
            longitude: 76.5580,
            destinationType: DestinationType.ECO_TOURISM,
            maxDailyCapacity: 1000,
            currentCapacity: 0,
            status: DestinationStatus.ACTIVE,
            openingTime: '09:00',
            closingTime: '17:00',
            operatingDays: [0, 1, 2, 3, 4, 5, 6],
            adminUserId: nilgirisAdmin.id,
            images: [
                'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1508668870421-0491c8933dce?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Boating', 'Viewpoint', 'Parking', 'Photography', 'Trekking Trails'],
            guidelines: 'Swimming not allowed. Stay away from waterfall edge. Carry rain gear during monsoon.',
        },
    });

    const mudumalaiNationalPark = await prisma.destination.upsert({
        where: { slug: 'mudumalai-national-park' },
        update: {
            name: 'Mudumalai National Park',
            description: 'The very best of the wilder side of Tamil Nadu, where nature thrives and majestic beasts roam freely. Home to elephants, tigers, leopards, and over 266 bird species. Spreads across 321 square kilometers of pristine forest.',
            locationAddress: 'Masinagudi, Nilgiris District, Tamil Nadu 643223',
            destinationType: DestinationType.NATIONAL_PARK,
            maxDailyCapacity: 400,
            images: [
                'https://images.unsplash.com/photo-1590691566700-11b3ad936867?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Safari Tours', 'Wildlife Viewing', 'Nature Trails', 'Visitor Center', 'Parking'],
        },
        create: {
            name: 'Mudumalai National Park',
            slug: 'mudumalai-national-park',
            description: 'The very best of the wilder side of Tamil Nadu, where nature thrives and majestic beasts roam freely. Home to elephants, tigers, leopards, and over 266 bird species. Spreads across 321 square kilometers of pristine forest.',
            locationAddress: 'Masinagudi, Nilgiris District, Tamil Nadu 643223',
            latitude: 11.5533,
            longitude: 76.5342,
            destinationType: DestinationType.NATIONAL_PARK,
            maxDailyCapacity: 400,
            currentCapacity: 0,
            status: DestinationStatus.ACTIVE,
            openingTime: '06:00',
            closingTime: '18:00',
            operatingDays: [0, 1, 2, 3, 4, 5, 6],
            adminUserId: nilgirisAdmin.id,
            images: [
                'https://images.unsplash.com/photo-1590691566700-11b3ad936867?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Safari Tours', 'Wildlife Viewing', 'Nature Trails', 'Visitor Center', 'Parking'],
            guidelines: 'No outside vehicles in core areas. Silence mandatory. Do not feed animals. Follow guide instructions.',
        },
    });

    const roseGarden = await prisma.destination.upsert({
        where: { slug: 'rose-garden-ooty' },
        update: {
            name: 'Rose Garden',
            description: 'The largest rose garden in India, housing around 20,000 varieties of roses of 2,800 diverse cultivars spread across 10 acres. A visual treat with roses in every color imaginable, perfectly manicured lawns, and annual rose shows.',
            locationAddress: 'Elk Hill, Vijayanagaram, Ooty, Tamil Nadu 643001',
            destinationType: DestinationType.ECO_TOURISM,
            maxDailyCapacity: 2500,
            images: [
                'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Garden Tours', 'Photography', 'Flower Shows', 'Parking', 'Cafe'],
        },
        create: {
            name: 'Rose Garden',
            slug: 'rose-garden-ooty',
            description: 'The largest rose garden in India, housing around 20,000 varieties of roses of 2,800 diverse cultivars spread across 10 acres. A visual treat with roses in every color imaginable, perfectly manicured lawns, and annual rose shows.',
            locationAddress: 'Elk Hill, Vijayanagaram, Ooty, Tamil Nadu 643001',
            latitude: 11.4205,
            longitude: 76.7064,
            destinationType: DestinationType.ECO_TOURISM,
            maxDailyCapacity: 2500,
            currentCapacity: 0,
            status: DestinationStatus.ACTIVE,
            openingTime: '08:30',
            closingTime: '18:30',
            operatingDays: [0, 1, 2, 3, 4, 5, 6],
            adminUserId: ootyAdmin.id,
            images: [
                'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Garden Tours', 'Photography', 'Flower Shows', 'Parking', 'Cafe'],
            guidelines: 'Do not pluck flowers. Stay on designated paths. Photography allowed without flash.',
        },
    });

    const pineForest = await prisma.destination.upsert({
        where: { slug: 'pine-forest-ooty' },
        update: {
            name: 'Pine Forest',
            description: 'Located between Thalakunda and Ooty, this pine forest is a famous film shooting location. The pine trees are grown in orderly fashion creating a mesmerizing sight. The forest floor is carpeted with pine needles creating a unique ambiance.',
            locationAddress: 'Ooty-Thalakunda Road, Ooty, Tamil Nadu 643001',
            destinationType: DestinationType.ECO_TOURISM,
            maxDailyCapacity: 600,
            images: [
                'https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Photography', 'Nature Walks', 'Picnic Areas', 'Parking'],
        },
        create: {
            name: 'Pine Forest',
            slug: 'pine-forest-ooty',
            description: 'Located between Thalakunda and Ooty, this pine forest is a famous film shooting location. The pine trees are grown in orderly fashion creating a mesmerizing sight. The forest floor is carpeted with pine needles creating a unique ambiance.',
            locationAddress: 'Ooty-Thalakunda Road, Ooty, Tamil Nadu 643001',
            latitude: 11.3850,
            longitude: 76.6800,
            destinationType: DestinationType.ECO_TOURISM,
            maxDailyCapacity: 600,
            currentCapacity: 0,
            status: DestinationStatus.ACTIVE,
            openingTime: '07:00',
            closingTime: '18:00',
            operatingDays: [0, 1, 2, 3, 4, 5, 6],
            adminUserId: ootyAdmin.id,
            images: [
                'https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Photography', 'Nature Walks', 'Picnic Areas', 'Parking'],
            guidelines: 'No campfires. Do not litter. Stay on marked trails. Beware of wild animals.',
        },
    });

    const teaMuseum = await prisma.destination.upsert({
        where: { slug: 'tea-museum-ooty' },
        update: {
            name: 'Tea Museum & Factory',
            description: 'Experience the rich heritage of Nilgiris tea plantations. The museum showcases the evolution of tea processing with vintage machinery, photographs, and tea tasting sessions. Walk through sprawling tea estates and learn about tea cultivation.',
            locationAddress: 'Dodabetta Road, Ooty, Tamil Nadu 643004',
            destinationType: DestinationType.ECO_TOURISM,
            maxDailyCapacity: 800,
            images: [
                'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1587049016823-69d723b6a93e?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Museum', 'Factory Tour', 'Tea Tasting', 'Gift Shop', 'Parking', 'Cafe'],
        },
        create: {
            name: 'Tea Museum & Factory',
            slug: 'tea-museum-ooty',
            description: 'Experience the rich heritage of Nilgiris tea plantations. The museum showcases the evolution of tea processing with vintage machinery, photographs, and tea tasting sessions. Walk through sprawling tea estates and learn about tea cultivation.',
            locationAddress: 'Dodabetta Road, Ooty, Tamil Nadu 643004',
            latitude: 11.3960,
            longitude: 76.7225,
            destinationType: DestinationType.ECO_TOURISM,
            maxDailyCapacity: 800,
            currentCapacity: 0,
            status: DestinationStatus.ACTIVE,
            openingTime: '09:00',
            closingTime: '17:00',
            operatingDays: [1, 2, 3, 4, 5, 6], // Closed on Sunday (0)
            adminUserId: ootyAdmin.id,
            images: [
                'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=1920&h=1080&fit=crop',
                'https://images.unsplash.com/photo-1587049016823-69d723b6a93e?w=1920&h=1080&fit=crop',
            ],
            amenities: ['Museum', 'Factory Tour', 'Tea Tasting', 'Gift Shop', 'Parking', 'Cafe'],
            guidelines: 'Photography restricted in factory areas. Follow guide instructions. No touching machinery.',
        },
    });

    console.log('✅ Destinations created');

    // Create zones
    console.log('🗺️  Creating zones...');

    await prisma.zone.createMany({
        data: [
            {
                destinationId: ootyLake.id,
                name: 'Boating Area',
                description: 'Main boating zone with paddle boats and row boats',
                maxCapacity: 800,
                zoneType: ZoneType.GENERAL_USE,
            },
            {
                destinationId: ootyLake.id,
                name: 'Walking Path',
                description: 'Scenic walking path around the lake',
                maxCapacity: 1200,
                zoneType: ZoneType.TRAIL,
            },
            {
                destinationId: nilgirisNationalPark.id,
                name: 'Core Forest Area',
                description: 'Protected core conservation zone',
                maxCapacity: 100,
                zoneType: ZoneType.CORE_CONSERVATION,
                isRestricted: true,
                requiresGuide: true,
            },
            {
                destinationId: nilgirisNationalPark.id,
                name: 'Safari Zone',
                description: 'Wildlife safari route',
                maxCapacity: 200,
                zoneType: ZoneType.GENERAL_USE,
            },
            {
                destinationId: nilgirisNationalPark.id,
                name: 'Viewpoint',
                description: 'Scenic viewpoint for photography',
                maxCapacity: 200,
                zoneType: ZoneType.VIEWPOINT,
            },
            {
                destinationId: botanicalGarden.id,
                name: 'Terrace Garden',
                description: 'Main terraced garden area',
                maxCapacity: 800,
                zoneType: ZoneType.GENERAL_USE,
            },
            {
                destinationId: botanicalGarden.id,
                name: 'Fossil Section',
                description: 'Area with fossilized tree trunks',
                maxCapacity: 400,
                zoneType: ZoneType.RESTRICTED_ACCESS,
            },
            {
                destinationId: botanicalGarden.id,
                name: 'Rare Plants Area',
                description: 'Collection of rare and exotic plants',
                maxCapacity: 300,
                zoneType: ZoneType.GENERAL_USE,
            },
            // Doddabetta Peak zones
            {
                destinationId: doddabettaPeak.id,
                name: 'Summit Viewpoint',
                description: 'Main viewpoint at the peak',
                maxCapacity: 400,
                zoneType: ZoneType.VIEWPOINT,
            },
            {
                destinationId: doddabettaPeak.id,
                name: 'Telescope Observatory',
                description: 'Indoor telescope viewing area',
                maxCapacity: 100,
                zoneType: ZoneType.RESTRICTED_ACCESS,
            },
            {
                destinationId: doddabettaPeak.id,
                name: 'Trekking Trail',
                description: 'Trail leading to summit',
                maxCapacity: 300,
                zoneType: ZoneType.TRAIL,
            },
            // Coonoor zones
            {
                destinationId: coonoor.id,
                name: 'Main Garden',
                description: 'Central botanical garden area',
                maxCapacity: 800,
                zoneType: ZoneType.GENERAL_USE,
            },
            {
                destinationId: coonoor.id,
                name: 'Flower Show Area',
                description: 'Exhibition and flower show zone',
                maxCapacity: 400,
                zoneType: ZoneType.GENERAL_USE,
            },
            // Pykara Falls zones
            {
                destinationId: pykaraFalls.id,
                name: 'Waterfall Viewing Area',
                description: 'Safe viewing platforms for waterfall',
                maxCapacity: 500,
                zoneType: ZoneType.VIEWPOINT,
            },
            {
                destinationId: pykaraFalls.id,
                name: 'Lake Boating Zone',
                description: 'Boating area on Pykara Lake',
                maxCapacity: 300,
                zoneType: ZoneType.GENERAL_USE,
            },
            {
                destinationId: pykaraFalls.id,
                name: 'Trekking Trails',
                description: 'Nature trails around the area',
                maxCapacity: 200,
                zoneType: ZoneType.TRAIL,
            },
            // Mudumalai National Park zones
            {
                destinationId: mudumalaiNationalPark.id,
                name: 'Safari Route 1',
                description: 'Main wildlife safari route',
                maxCapacity: 150,
                zoneType: ZoneType.GENERAL_USE,
                requiresGuide: true,
            },
            {
                destinationId: mudumalaiNationalPark.id,
                name: 'Safari Route 2',
                description: 'Secondary safari route',
                maxCapacity: 100,
                zoneType: ZoneType.GENERAL_USE,
                requiresGuide: true,
            },
            {
                destinationId: mudumalaiNationalPark.id,
                name: 'Core Conservation Zone',
                description: 'Protected core area',
                maxCapacity: 50,
                zoneType: ZoneType.CORE_CONSERVATION,
                isRestricted: true,
                requiresGuide: true,
            },
            {
                destinationId: mudumalaiNationalPark.id,
                name: 'Watchtower Area',
                description: 'Wildlife observation towers',
                maxCapacity: 100,
                zoneType: ZoneType.VIEWPOINT,
            },
            // Rose Garden zones
            {
                destinationId: roseGarden.id,
                name: 'Rose Garden',
                description: 'Main rose display area',
                maxCapacity: 2000,
                zoneType: ZoneType.GENERAL_USE,
            },
            {
                destinationId: roseGarden.id,
                name: 'Exhibition Hall',
                description: 'Seasonal flower exhibitions',
                maxCapacity: 500,
                zoneType: ZoneType.GENERAL_USE,
            },
            // Pine Forest zones
            {
                destinationId: pineForest.id,
                name: 'Pine Grove',
                description: 'Main pine forest walking area',
                maxCapacity: 400,
                zoneType: ZoneType.GENERAL_USE,
            },
            {
                destinationId: pineForest.id,
                name: 'Photography Zone',
                description: 'Designated photography spots',
                maxCapacity: 200,
                zoneType: ZoneType.VIEWPOINT,
            },
            // Tea Museum zones
            {
                destinationId: teaMuseum.id,
                name: 'Museum',
                description: 'Tea heritage museum',
                maxCapacity: 300,
                zoneType: ZoneType.GENERAL_USE,
            },
            {
                destinationId: teaMuseum.id,
                name: 'Factory Tour',
                description: 'Tea processing factory',
                maxCapacity: 200,
                zoneType: ZoneType.RESTRICTED_ACCESS,
                requiresGuide: true,
            },
            {
                destinationId: teaMuseum.id,
                name: 'Tea Estate Walk',
                description: 'Walking trail through tea plantations',
                maxCapacity: 300,
                zoneType: ZoneType.TRAIL,
            },
        ],
    });

    console.log('✅ Zones created');

    // Create pricing rules
    console.log('💰 Creating pricing rules...');

    await prisma.pricingRule.createMany({
        data: [
            {
                destinationId: ootyLake.id,
                ruleName: 'Standard Pricing',
                basePrice: 50,
                adultPrice: 50,
                childPrice: 25,
                localPrice: 30,
                foreignPrice: 200,
                isActive: true,
                priority: 0,
                applicableDays: [0, 1, 2, 3, 4, 5, 6],
            },
            {
                destinationId: nilgirisNationalPark.id,
                ruleName: 'Standard Pricing',
                basePrice: 200,
                adultPrice: 200,
                childPrice: 100,
                localPrice: 150,
                foreignPrice: 1000,
                isActive: true,
                priority: 0,
                applicableDays: [0, 1, 2, 3, 4, 5, 6],
            },
            {
                destinationId: botanicalGarden.id,
                ruleName: 'Standard Pricing',
                basePrice: 30,
                adultPrice: 30,
                childPrice: 15,
                localPrice: 20,
                foreignPrice: 150,
                isActive: true,
                priority: 0,
                applicableDays: [0, 1, 2, 3, 4, 5, 6],
            },
            // Doddabetta Peak pricing
            {
                destinationId: doddabettaPeak.id,
                ruleName: 'Standard Pricing',
                basePrice: 20,
                adultPrice: 20,
                childPrice: 10,
                localPrice: 15,
                foreignPrice: 100,
                isActive: true,
                priority: 0,
                applicableDays: [0, 1, 2, 3, 4, 5, 6],
            },
            // Coonoor pricing
            {
                destinationId: coonoor.id,
                ruleName: 'Standard Pricing',
                basePrice: 40,
                adultPrice: 40,
                childPrice: 20,
                localPrice: 30,
                foreignPrice: 200,
                isActive: true,
                priority: 0,
                applicableDays: [0, 1, 2, 3, 4, 5, 6],
            },
            // Pykara Falls pricing
            {
                destinationId: pykaraFalls.id,
                ruleName: 'Standard Pricing',
                basePrice: 30,
                adultPrice: 30,
                childPrice: 15,
                localPrice: 20,
                foreignPrice: 150,
                isActive: true,
                priority: 0,
                applicableDays: [0, 1, 2, 3, 4, 5, 6],
            },
            // Mudumalai pricing
            {
                destinationId: mudumalaiNationalPark.id,
                ruleName: 'Safari Standard',
                basePrice: 100,
                adultPrice: 100,
                childPrice: 50,
                localPrice: 75,
                foreignPrice: 500,
                isActive: true,
                priority: 0,
                applicableDays: [0, 1, 2, 3, 4, 5, 6],
            },
            // Rose Garden pricing
            {
                destinationId: roseGarden.id,
                ruleName: 'Standard Pricing',
                basePrice: 30,
                adultPrice: 30,
                childPrice: 15,
                localPrice: 20,
                foreignPrice: 150,
                isActive: true,
                priority: 0,
                applicableDays: [0, 1, 2, 3, 4, 5, 6],
            },
            // Pine Forest pricing
            {
                destinationId: pineForest.id,
                ruleName: 'Standard Pricing',
                basePrice: 20,
                adultPrice: 20,
                childPrice: 10,
                localPrice: 15,
                foreignPrice: 100,
                isActive: true,
                priority: 0,
                applicableDays: [0, 1, 2, 3, 4, 5, 6],
            },
            // Tea Museum pricing
            {
                destinationId: teaMuseum.id,
                ruleName: 'Standard Pricing',
                basePrice: 50,
                adultPrice: 50,
                childPrice: 25,
                localPrice: 40,
                foreignPrice: 250,
                isActive: true,
                priority: 0,
                applicableDays: [1, 2, 3, 4, 5, 6],
            },
        ],
    });

    console.log('✅ Pricing rules created');

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${await prisma.user.count()}`);
    console.log(`   - Destinations: ${await prisma.destination.count()}`);
    console.log(`   - Zones: ${await prisma.zone.count()}`);
    console.log(`   - Pricing Rules: ${await prisma.pricingRule.count()}`);
    console.log('\n🔑 Administrative Accounts:');
    console.log('   Super Admin: admin@sustainatour.com / admin123');
    console.log('   Ooty Admin: admin.ooty@sustainatour.com / admin123');
    console.log('   Staff: staff@sustainatour.com / staff123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

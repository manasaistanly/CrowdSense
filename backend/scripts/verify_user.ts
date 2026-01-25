
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking users...');

    const email = 'admin@sustainatour.com';
    const password = 'admin123';

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.log(`User ${email} not found.`);
        return;
    }

    console.log(`User ${email} found.`);
    console.log(`Role: ${user.role}`);
    console.log(`Hash in DB: ${user.passwordHash}`);

    const match = await bcrypt.compare(password, user.passwordHash);
    console.log(`Password match for '${password}': ${match}`);

    const staffEmail = 'staff@sustainatour.com';
    const staffPassword = 'staff123';
    const staffUser = await prisma.user.findUnique({
        where: { email: staffEmail },
    });

    if (!staffUser) {
        console.log(`User ${staffEmail} not found.`);
    } else {
        console.log(`User ${staffEmail} found.`);
        const staffMatch = await bcrypt.compare(staffPassword, staffUser.passwordHash);
        console.log(`Password match for '${staffPassword}': ${staffMatch}`);
    }


}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

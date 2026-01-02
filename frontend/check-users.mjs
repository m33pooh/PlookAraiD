import 'dotenv/config';
import { PrismaClient } from './prisma/generated/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            username: true,
            role: true,
            passwordHash: true,
        }
    });
    console.log('Users in database:');
    users.forEach(user => {
        console.log(`- ${user.email} | ${user.username} | ${user.role} | hash: ${user.passwordHash ? 'exists' : 'MISSING'}`);
    });
    console.log(`\nTotal: ${users.length} users`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

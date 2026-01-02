import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getServerSession } from 'next-auth';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
    // Note: When using Credentials provider with JWT, the adapter is not strictly needed
    // The adapter is primarily for OAuth providers that need to persist accounts
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials);
                if (!parsed.success) {
                    console.log('[Auth] Invalid credentials format:', parsed.error);
                    return null;
                }

                const { email, password } = parsed.data;
                console.log('[Auth] Attempting login for email:', email);

                const user = await db.user.findUnique({
                    where: { email },
                    include: {
                        profile: true,
                    },
                });

                if (!user || !user.passwordHash) {
                    console.log('[Auth] User not found or no password hash for:', email);
                    return null;
                }

                console.log('[Auth] User found, comparing password...');
                const isValid = await bcrypt.compare(password, user.passwordHash);
                if (!isValid) {
                    console.log('[Auth] Invalid password for user:', email);
                    return null;
                }
                console.log('[Auth] Login successful for:', email);

                return {
                    id: user.id,
                    email: user.email,
                    name: user.profile?.fullName || user.username,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role || 'FARMER';
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
};

// Helper function to get the session (replaces auth() from v5)
export const auth = () => getServerSession(authOptions);

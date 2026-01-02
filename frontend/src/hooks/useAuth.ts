'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Helper function to get landing page by role
function getRoleLandingPage(role: string): string {
    switch (role) {
        case 'FARMER':
            return '/farmer';
        case 'BUYER':
            return '/buyer';
        case 'ADMIN':
            return '/admin';
        default:
            return '/';
    }
}

export function useCurrentUser() {
    const { data: session, status } = useSession();

    return {
        user: session?.user,
        isLoading: status === 'loading',
        isAuthenticated: status === 'authenticated',
    };
}

export function useRequireAuth(allowedRoles?: string[]) {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useCurrentUser();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }

        if (!isLoading && isAuthenticated && allowedRoles && user) {
            if (!allowedRoles.includes(user.role)) {
                // Redirect to appropriate dashboard based on role
                router.push(getRoleLandingPage(user.role));
            }
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, router]);

    return { user, isLoading, isAuthenticated };
}


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

export async function proxy(req: NextRequest) {
    const { nextUrl } = req;

    // Get JWT token from the request
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const isLoggedIn = !!token;
    const isOnDashboard =
        nextUrl.pathname.startsWith('/farmer') ||
        nextUrl.pathname.startsWith('/buyer') ||
        nextUrl.pathname.startsWith('/admin');
    const isOnAuth = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');

    // Redirect logged-in users away from auth pages to their role-specific landing page
    if (isOnAuth && isLoggedIn) {
        const role = token?.role as string;
        return NextResponse.redirect(new URL(getRoleLandingPage(role), nextUrl));
    }

    // Protect dashboard routes
    if (isOnDashboard && !isLoggedIn) {
        const callbackUrl = encodeURIComponent(nextUrl.pathname);
        return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
    }

    // Role-based access control
    if (isLoggedIn && isOnDashboard) {
        const role = token?.role as string;
        const landingPage = getRoleLandingPage(role);

        // Admin can access all pages
        if (role === 'ADMIN') {
            return NextResponse.next();
        }

        // Farmers can only access farmer pages
        if (nextUrl.pathname.startsWith('/buyer') && role === 'FARMER') {
            return NextResponse.redirect(new URL(landingPage, nextUrl));
        }

        if (nextUrl.pathname.startsWith('/admin') && role === 'FARMER') {
            return NextResponse.redirect(new URL(landingPage, nextUrl));
        }

        // Buyers can only access buyer pages
        if (nextUrl.pathname.startsWith('/farmer') && role === 'BUYER') {
            return NextResponse.redirect(new URL(landingPage, nextUrl));
        }

        if (nextUrl.pathname.startsWith('/admin') && role === 'BUYER') {
            return NextResponse.redirect(new URL(landingPage, nextUrl));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/farmer/:path*',
        '/buyer/:path*',
        '/admin/:path*',
        '/login',
        '/register',
    ],
};

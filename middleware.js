import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { resolveAdminClerkConfiguration } from '@/lib/admin/clerk-config';

export default function middleware(request, event) {
  if (!resolveAdminClerkConfiguration().ready) return NextResponse.next();
  return clerkMiddleware()(request, event);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

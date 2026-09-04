import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { resolveAdminClerkConfiguration } from '@/lib/admin/clerk-config';

export default function middleware(request: Request, event: unknown) {
  if (!resolveAdminClerkConfiguration().ready) return NextResponse.next();
  return clerkMiddleware()(request as never, event as never);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

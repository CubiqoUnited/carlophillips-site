import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { resolveAdminClerkConfiguration } from '@/lib/admin/clerk-config';

export default function middleware(request: Request, event: unknown) {
  if (!resolveAdminClerkConfiguration().ready) return NextResponse.next();
  return clerkMiddleware()(request as never, event as never);
}

export const config = {
  // KAN-23 AC-ADM-7. `/admin` and `/api/admin` are named explicitly rather than
  // left to `:path*`, which matches children only. `/admin.rsc` reaching the
  // matcher depends on Next normalising the RSC suffix onto `/admin`; naming
  // `/admin` removes the dependence on that unverified assumption.
  matcher: ['/admin', '/admin/:path*', '/api/admin', '/api/admin/:path*'],
};

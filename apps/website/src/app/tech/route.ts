/**
 * African Tech Ecosystem Redirect
 * Short branded link: amdsolutions007.vercel.app/tech
 * Target: Leke Leke African Tech Group
 * 
 * Professional long-term solution for social media campaigns
 * CEO Approved: 7 February 2026
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // Redirect to African Tech Ecosystem group on Leke Leke
  return NextResponse.redirect(
    'https://www.lekeelekee.com/groups/4d183887-2d5a-47b0-8226-dd6939d29694',
    {
      status: 302, // Temporary redirect (can change target later)
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}

// Optional: Support POST requests (future analytics tracking)
export async function POST() {
  return NextResponse.redirect(
    'https://www.lekeelekee.com/groups/4d183887-2d5a-47b0-8226-dd6939d29694',
    302
  );
}

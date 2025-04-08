// /app/api/gmail/pdf/route.ts

import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

export async function GET(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const messageId = searchParams.get('messageId');
  const attachmentId = searchParams.get('attachmentId');
  const filename = searchParams.get('filename') || 'file.pdf';

  if (!messageId || !attachmentId) {
    return new NextResponse('Missing parameters', { status: 400 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const attachmentRes = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentId,
    });

    const data = attachmentRes.data.data;
    const buffer = Buffer.from(data!, 'base64');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error fetching attachment:', error);
    return new NextResponse('Failed to fetch attachment', { status: 500 });
  }
}
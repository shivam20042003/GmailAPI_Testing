import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authOptions";
import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

type PdfMeta = {
  subject: string;
  from: string;
  filename: string;
  downloadUrl: string;
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session:Session | null = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accessToken: string = session.accessToken;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth });
  const { searchParams } = new URL(req.url);

  const maxResults: number = parseInt(searchParams.get("maxResults") || "10");
  const pageToken: string | undefined = searchParams.get("pageToken") || undefined;
  const searchTerm: string = searchParams.get("searchTerm") || ''; // dynamic search term

  // Gmail advanced search query
  const query = `${searchTerm} has:attachment filename:pdf`;

  try {
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults,
      pageToken,
    });

    const messages = listResponse.data.messages || [];
    const pdfs: PdfMeta[] = [];

    for (const msg of messages) {
      const msgRes = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
      });

      const payload = msgRes.data.payload;
      const headers = payload?.headers || [];
      const subject =
        headers.find((h) => h.name === 'Subject')?.value || '(No Subject)';
      const from =
        headers.find((h) => h.name === 'From')?.value || '(Unknown Sender)';
      const parts = payload?.parts || [];

      for (const part of parts) {
        if (part.filename && part.mimeType === 'application/pdf') {
          const attId = part.body?.attachmentId;
          if (!attId) continue;

          const downloadUrl = `/api/gmail/pdf?messageId=${msg.id}&attachmentId=${attId}&filename=${encodeURIComponent(part.filename)}`;

          pdfs.push({
            subject,
            from,
            filename: part.filename,
            downloadUrl,
          });
        }
      }
    }

    return NextResponse.json({
      nextPageToken: listResponse.data.nextPageToken || null,
      pdfs,
    });
  } catch (err: unknown) {
    console.error('Error fetching PDFs:', err);
    return NextResponse.json({ error: 'Failed to fetch PDFs' }, { status: 500 });
  }
}
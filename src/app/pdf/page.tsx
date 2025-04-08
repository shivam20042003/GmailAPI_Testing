'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Home() {
  const { data: session } = useSession();

  type PdfMeta = {
    subject: string;
    from: string;
    filename: string;
    downloadUrl: string;
  };

  const [pdfLinks, setPdfLinks] = useState<PdfMeta[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(''); // user-typed input
  const [searchTerm, setSearchTerm] = useState<string | null>(null); // committed term for fetch

  const fetchEmails = async (pageToken?: string) => {
    if (!session) return;

    if (!pageToken) {
      setInitialLoading(true);
      setPdfLinks([]); // reset for new search
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/gmail/pdfs?maxResults=10${pageToken ? `&pageToken=${pageToken}` : ''}${searchTerm ? `&searchTerm=${encodeURIComponent(searchTerm)}` : ''}`
      );
      const data = await res.json();
      setPdfLinks(prev => [...prev, ...data.pdfs]);
      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
      console.error('Error fetching PDFs:', err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const [hasSearched, setHasSearched] = useState(false);

useEffect(() => {
  if (searchTerm && !hasSearched) {
    setHasSearched(true);
    fetchEmails();
  }
}, [searchTerm]); // 👈 removed session from deps// only trigger on explicit search

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Sign in with Google
      </button>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">PDF Attachments:</h2>

      {!searchTerm ? (
        <div className="space-y-4">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Type a search term (e.g. resume, invoice)"
          />
          <button
            onClick={() => {
                setHasSearched(false);
                setSearchTerm(searchInput);
              }}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
      ) : (
        <div>
          {initialLoading ? (
            <p className="text-gray-600 italic">Fetching your PDF emails...</p>
          ) : pdfLinks.length > 0 ? (
            <ul className="list-disc pl-6 space-y-4">
              {pdfLinks.map((pdf, index) => (
                <li key={index} className="border p-4 rounded shadow">
                  <p><strong>Subject:</strong> {pdf.subject}</p>
                  <p><strong>From:</strong> {pdf.from}</p>
                  <p><strong>File:</strong> {pdf.filename}</p>
                  <a
                    href={pdf.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Preview / Download
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No PDFs found for this term.</p>
          )}

          {nextPageToken && !initialLoading && (
            <button
              onClick={() => fetchEmails(nextPageToken)}
              disabled={loading}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? 'Loading more...' : 'Load More'}
            </button>
          )}

          <button
            onClick={() => {
              setSearchInput('');
              setSearchTerm(null);
              setPdfLinks([]);
            }}
            className="mt-6 px-4 py-2 bg-gray-500 text-white rounded"
          >
            New Search
          </button>
        </div>
      )}
    </div>
  );
}
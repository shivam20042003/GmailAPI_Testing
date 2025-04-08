'use client';
import { redirect } from 'next/navigation';
import { useState } from 'react';

export default function SendEmailComponent() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    const res = await fetch('/api/gmail/send', {
      method: 'POST',
      body: JSON.stringify({ to, subject, message }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if (data.success) {
      alert('Email sent successfully!');
    } else {
      alert('Failed to send email.');
    }
  };

  const back = () => {
    redirect('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <button
          onClick={back}
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          ← Back to Home
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Send an Email</h2>

        <input
          type="email"
          placeholder="Recipient Email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full border border-gray-300 p-3 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border border-gray-300 p-3 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-gray-300 p-3 mb-6 rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-md transition"
        >
          Send Email
        </button>
      </div>
    </div>
  );
}
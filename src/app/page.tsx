'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();

  const goToPdfPage = () => {
    redirect('/pdf');
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 gap-16 sm:p-20 font-sans">
      {!session ? (
        <button
          onClick={() => signIn("google")}
          className="bg-blue-600 text-white px-6 py-3 rounded-md shadow hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      ) : (
        <div className="text-center space-y-6">
          <p className="text-lg text-gray-700">Signed in as <span className="font-medium">{session.user?.email}</span></p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={goToPdfPage}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
            >
              Go to PDFs
            </button>
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
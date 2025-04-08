'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  const goToPdfPage = () => {
    redirect('/pdf');
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {!session ? (
        <button
          onClick={() => signIn("google")}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
        >
          Sign in with Google
        </button>
      ) : (
        <div className="text-center">
          <p className="mb-4">Signed in as {session.user?.email}</p>
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
          >
            Sign out
          </button>
          <button onClick={goToPdfPage}>Get Pdfs</button>
        </div>
      )}
    </div>
  );
}
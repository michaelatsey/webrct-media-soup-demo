import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">
          Bienvenue sur l&apos;application WebRTC
        </h1>
        <Link
          href="/video"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Rejoindre le Chat Vidéo
        </Link>
      </main>
    </div>
  );
}

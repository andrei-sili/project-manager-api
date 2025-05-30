"use client";
export default function TimeTrackingCard({ timeToday }: { timeToday: string }) {
  return (
    <div className="bg-[#282c36] rounded-xl shadow p-5 flex flex-col items-center min-h-[120px] justify-center hover:ring-2 ring-pink-400 transition">
      <h2 className="text-xl font-bold mb-3 text-center">Time Tracking</h2>
      <div className="text-5xl font-mono">{timeToday}</div>
      <div className="text-gray-400">today</div>
    </div>
  );
}

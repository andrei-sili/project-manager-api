// "use client";
// import Link from "next/link";
// import { Project } from "@/lib/api";
//
// export default function ProjectOverviewCard({ projects }: { projects: Project[] }) {
//   return (
//     <div className="bg-[#282c36] rounded-xl shadow p-5 min-h-[120px] hover:ring-2 ring-blue-400 transition">
//       <Link href="/dashboard/projects" className="block">
//         <h2 className="text-xl font-bold mb-3">My Projects</h2>
//         {projects.length === 0 ? (
//           <p className="text-gray-400">No projects yet.</p>
//         ) : (
//           <ul className="space-y-1">
//             {projects.slice(0, 3).map((p) => (
//               <li key={p.id}>
//                 <Link href={`/dashboard/projects/${p.id}`} className="hover:underline">
//                   {p.name}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         )}
//         <div className="mt-2 text-xs text-gray-400">{projects.length} total</div>
//       </Link>
//     </div>
//   );
// }


"use client";
import Link from "next/link";
import { Project } from "@/lib/api";

export default function ProjectOverviewCard({ projects }: { projects: Project[] }) {
  return (
    <div className="bg-[#282c36] rounded-xl shadow p-5 min-h-[120px] hover:ring-2 ring-blue-400 transition">
      <h2 className="text-xl font-bold mb-3">
        <Link href="/dashboard/projects" className="hover:underline text-white">
          My Projects
        </Link>
      </h2>

      {projects.length === 0 ? (
        <p className="text-gray-400">No projects yet.</p>
      ) : (
        <ul className="space-y-1">
          {projects.slice(0, 3).map((p) => (
            <li key={p.id}>
              <Link href={`/dashboard/projects/${p.id}`} className="hover:underline text-blue-400">
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 text-xs text-gray-400">{projects.length} total</div>
    </div>
  );
}

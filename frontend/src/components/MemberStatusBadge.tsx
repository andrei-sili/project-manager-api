// Membership status badge, shared wherever team members are listed (Teams page,
// Project detail) so a member's real status shows identically everywhere.
export default function MemberStatusBadge({
  status,
  joinedAt,
}: {
  status?: string;
  joinedAt?: string | null;
}) {
  if (status === "pending") {
    return (
      <span className="bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded text-xs">
        Pending invitation
      </span>
    );
  }
  if (status === "declined") {
    return (
      <span className="bg-red-500/15 text-red-300 px-2 py-0.5 rounded text-xs">
        Declined
      </span>
    );
  }
  return (
    <span className="text-zinc-400 text-xs">
      {joinedAt ? `Joined: ${new Date(joinedAt).toLocaleDateString()}` : "Joined"}
    </span>
  );
}

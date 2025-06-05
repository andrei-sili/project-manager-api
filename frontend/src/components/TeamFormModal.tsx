// src/components/TeamFormModal.tsx
"use client";

import { useState } from "react";
import { createTeam, Team } from "@/lib/api";
import { Dialog } from "@headlessui/react";

interface TeamFormModalProps {
  onClose: () => void;
  onTeamCreated: (team: Team) => void;
}

export default function TeamFormModal({ onClose, onTeamCreated }: TeamFormModalProps) {
  const [teamName, setTeamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
  if (!teamName.trim()) {
    alert("Please enter a team name.");
    return;
  }

  setIsCreating(true);
  try {
    const team = await createTeam({ name: teamName.trim() });
    onTeamCreated(team);
    onClose();
  } catch (err) {
    alert("Failed to create team.");
  } finally {
    setIsCreating(false);
  }
};

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <Dialog.Panel className="bg-gray-900 p-6 rounded-lg max-w-md w-full space-y-4 border border-gray-700">
        <Dialog.Title className="text-lg font-bold text-white">Create Team</Dialog.Title>

        <input
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 placeholder-gray-400"
          placeholder="Team name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}

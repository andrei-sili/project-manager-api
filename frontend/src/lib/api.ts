// frontend/src/lib/api.ts

import axiosClient from "./axiosClient";
import type {Project, Team, Task, TimeEntry, PaginatedResponse, TeamMember} from "./types";
import type { AxiosResponse } from "axios";
import apiClient from "./axiosClient";

/** Paginated Response */
interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/* ----- PROJECTS ----- */
export async function getProjects(): Promise<Project[]> {
  const res = await axiosClient.get<Paginated<Project>>("/projects/");
  return res.data.results;
}

export async function getProjectById(id: number): Promise<Project> {
  const res = await axiosClient.get<Project>(`/projects/${id}/`);
  return res.data;
}

export async function createProject(payload: { name: string; description: string; team: number }): Promise<Project> {
  const res = await axiosClient.post<Project>("/projects/", payload);
  return res.data;
}


/* ----- TEAMS ----- */
export async function getTeams(): Promise<Team[]> {
  const res = await axiosClient.get<Paginated<Team>>("/teams/");
  return res.data.results;
}
// --- Remove member from team ---
export function removeMember(teamId: number, userId: number): Promise<void> {
  return apiClient.post(`/teams/${teamId}/remove-member/`, { user_id: userId }).then(() => {});
}

// --- Change member role ---
export function changeRole(teamId: number, userId: number, role: string): Promise<void> {
  return apiClient.post(`/teams/${teamId}/change-role/`, { user_id: userId, role }).then(() => {});
}

// --- Invite member to team ---
export function inviteTeamMember(teamId: number, payload: {
  role: string | undefined;
  email: string | undefined
}): Promise<void> {
  return apiClient.post(`/teams/${teamId}/invite-member/`, payload).then(() => {});
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const res = await axiosClient.get<Paginated<TeamMember>>("/teams/members/");
  return res.data.results;
}


// --- Delete a team ---
export function deleteTeam(teamId: number): Promise<void> {
  return apiClient.delete(`/teams/${teamId}/`).then(() => {});
}
// --- Create a new team ---
export function createTeam(payload: { name: string }): Promise<Team> {
  return apiClient.post("/teams/", payload).then(res => res.data);
}


/* ----- TASKS ----- */
export function createTask(projectId: number, payload: Omit<Task, "id">): Promise<Task> {
  return apiClient.post<Task>(`/projects/${projectId}/tasks/`, payload).then(res => res.data);
}

export async function editTask(projectId: number, taskId: number, payload: Partial<Task>): Promise<Task> {
  const res = await axiosClient.patch<Task>(`/projects/${projectId}/tasks/${taskId}/`, payload);
  return res.data;
}


export async function getMyTasks(): Promise<Task[]> {
  const res = await axiosClient.get<Paginated<Task>>("/my-tasks/");
  return res.data.results;
}


/* ----- TIME ENTRIES ----- */
export async function getTimeEntriesForTask(taskId: number): Promise<TimeEntry[]> {
  const res = await axiosClient.get<{ results?: TimeEntry[] }>(`/time-entries/?task=${taskId}`);
  return res.data.results ?? [];
}
export async function createTimeEntry(entry: { task_id: number; minutes: number; date: string; note?: string; }): Promise<TimeEntry> {
  const res = await axiosClient.post<TimeEntry>("/time-entries/", entry);
  return res.data;
}
export async function editTimeEntry(
  entryId: number,
  data: Partial<Pick<TimeEntry, "minutes" | "note" | "date">>
): Promise<TimeEntry> {
  const res = await axiosClient.patch<TimeEntry>(`/time-entries/${entryId}/`, data);
  return res.data;
}
export async function deleteTimeEntry(entryId: number): Promise<void> {
  await axiosClient.delete(`/time-entries/${entryId}/`);
}

/* ---- TIME SUMMARY ---- */
export async function getTimeSummary(): Promise<any> {
  const res = await axiosClient.get("/time-entries/summary/");
  return res.data;
}
export async function getAllTimeEntries(): Promise<TimeEntry[]> {
  const res = await axiosClient.get<{ results?: TimeEntry[] }>("/time-entries/");
  return res.data.results ?? [];
}

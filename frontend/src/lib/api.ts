// frontend/src/lib/api.ts

import apiClient from "./axiosClient";
import {Project, Team, Task, PaginatedResponse} from "./types";
import {AxiosResponse} from "axios";
import axiosClient from "./axiosClient";
import type { TimeEntry } from "@/lib/types.ts";

/** Generic paginated response shape. */
interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** ----- PROJECTS ----- */
export async function fetchProjects(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch projects");
  }

  return res.json();
}


export async function fetchTasks(token: string): Promise<Task[]> {
  const projects = await fetchProjects(token);
  const allTasks: Task[] = [];

  for (const proj of projects) {
    const res: AxiosResponse<PaginatedResponse<Task>> = await apiClient.get(
      `/projects/${proj.id}/tasks/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    allTasks.push(...res.data.results);
  }

  return allTasks;
}


export function createProject(payload: {
  name: string;
  description: string;
  team: number;
}): Promise<Project> {
  return apiClient.post<Project>("/projects/", payload).then(res => res.data);
}

export function updateProject(
  id: number,
  payload: Partial<Pick<Project, "name" | "description" | "team">>
): Promise<Project> {
  return apiClient.patch<Project>(`/projects/${id}/`, payload).then(res => res.data);
}

export function deleteProject(id: number): Promise<void> {
  return apiClient.delete(`/projects/${id}/`).then(() => {});
}

/** ----- TEAMS ----- */
export function fetchTeams(): Promise<Team[]> {
  return apiClient.get<Paginated<Team>>("/teams/").then(res => res.data.results);
}

export function createTeam(payload: { name: string }): Promise<Team> {
  return apiClient.post<Team>("/teams/", payload).then(res => res.data);
}

export function removeMember(teamId: number, userId: number): Promise<void> {
  return apiClient.post(`/teams/${teamId}/remove-member/`, { user_id: userId }).then(() => {});
}

export function changeRole(teamId: number, userId: number, role: string): Promise<void> {
  return apiClient.post(`/teams/${teamId}/change-role/`, { user_id: userId, role }).then(() => {});
}

export function deleteTeam(teamId: number): Promise<void> {
  return apiClient.delete(`/teams/${teamId}/`).then(() => {});
}

/** ----- TASKS ----- */
export function fetchMyTasks(): Promise<Task[]> {
  return apiClient.get<Paginated<Task>>("/my-tasks/").then(res => res.data.results);
}

export function fetchProjectTasks(projectId: number): Promise<Task[]> {
  return apiClient.get<Paginated<Task>>(`/projects/${projectId}/tasks/`).then(res => res.data.results);
}

export function createTask(projectId: number, payload: Omit<Task, "id">): Promise<Task> {
  return apiClient.post<Task>(`/projects/${projectId}/tasks/`, payload).then(res => res.data);
}

export function updateTask(
  projectId: number,
  taskId: number,
  payload: Partial<Omit<Task, "id">>
): Promise<Task> {
  return apiClient.patch<Task>(`/projects/${projectId}/tasks/${taskId}/`, payload).then(res => res.data);
}

export function deleteTask(projectId: number, taskId: number): Promise<void> {
  return apiClient.delete(`/projects/${projectId}/tasks/${taskId}/`).then(() => {});
}


export async function fetchTimeEntries(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/time-entries/summary/`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch time summary");
  }

  const data = await res.json();

  return data.per_day.map((entry: { date: string; minutes: number }) => ({
    date: entry.date,
    duration: Math.round(entry.minutes / 60),
  }));
}

// --- Get all time entries for a specific task ---
export async function getTimeEntriesForTask(taskId: number): Promise<TimeEntry[]> {
  const res = await axiosClient.get<{ results?: TimeEntry[] }>(`/time-entries/?task=${taskId}`);
  return res.data.results ?? (res.data as any[]);
}

// --- Create a new time entry ---
export async function createTimeEntry(entry: { task_id: number; minutes: number; date: string; note?: string; }): Promise<TimeEntry> {
  const res: AxiosResponse<TimeEntry, any> = await axiosClient.post<TimeEntry>('/time-entries/', entry);
  return res.data;
}


// --- Edit an existing time entry ---
export async function editTimeEntry(
  entryId: number,
  data: Partial<Pick<TimeEntry, "minutes" | "note" | "date">>
): Promise<TimeEntry> {
  const res = await axiosClient.patch<TimeEntry>(`/time-entries/${entryId}/`, data);
  return res.data;
}

// --- Delete a time entry by ID ---
export async function deleteTimeEntry(entryId: number): Promise<void> {
  await axiosClient.delete(`/time-entries/${entryId}/`);
}

// --- Get summary for time tracked (this week, today, total, etc) ---
export async function getTimeSummary(): Promise<any> {
  const res = await axiosClient.get("/time-entries/summary/");
  return res.data;
}

// --- Get all time entries for current user (for stats) ---
export async function getAllTimeEntries(): Promise<TimeEntry[]> {
  const res = await axiosClient.get<{ results?: TimeEntry[] }>("/time-entries/");
  return res.data.results ?? (res.data as any[]);
}

// Default export for legacy imports
export default apiClient;



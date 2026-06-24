
import axiosClient from "./axiosClient";
import type { Project, Team, Task, TimeEntry, TimeSummary, ActivityLog, NotificationItem } from "./types";

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
  return axiosClient.post(`/teams/${teamId}/remove-member/`, { user_id: userId }).then(() => {});
}

// --- Change member role ---
export function changeRole(teamId: number, userId: number, role: string): Promise<void> {
  return axiosClient.post(`/teams/${teamId}/change-role/`, { user_id: userId, role }).then(() => {});
}

// --- Invite member to team ---
export function inviteTeamMember(teamId: number, payload: {
  role: string | undefined;
  email: string | undefined
}): Promise<void> {
  return axiosClient.post(`/teams/${teamId}/invite-member/`, payload).then(() => {});
}

// --- Delete a team ---
export function deleteTeam(teamId: number): Promise<void> {
  return axiosClient.delete(`/teams/${teamId}/`).then(() => {});
}
// --- Create a new team ---
export function createTeam(payload: { name: string }): Promise<Team> {
  return axiosClient.post("/teams/", payload).then(res => res.data);
}


/* ----- TASKS ----- */
export function createTask(projectId: number, payload: Omit<Task, "id">): Promise<Task> {
  return axiosClient.post<Task>(`/projects/${projectId}/tasks/`, payload).then(res => res.data);
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
export async function getTimeSummary(): Promise<TimeSummary> {
  const res = await axiosClient.get("/time-entries/summary/");
  return res.data;
}
export async function getAllTimeEntries(): Promise<TimeEntry[]> {
  // Follow pagination so the table and CSV export see the full history, not just
  // the first page.
  const all: TimeEntry[] = [];
  let page = 1;
  for (;;) {
    const res = await axiosClient.get<Paginated<TimeEntry> | TimeEntry[]>(
      `/time-entries/?page=${page}`
    );
    if (Array.isArray(res.data)) {
      all.push(...res.data);
      break;
    }
    all.push(...(res.data.results ?? []));
    if (!res.data.next) break;
    page += 1;
  }
  return all;
}

/* ----- ACTIVITY ----- */
export async function getActivity(limit = 8): Promise<ActivityLog[]> {
  const res = await axiosClient.get<Paginated<ActivityLog>>("/logs/");
  return res.data.results.slice(0, limit);
}

/* ----- NOTIFICATIONS ----- */
export async function getNotifications(): Promise<NotificationItem[]> {
  const res = await axiosClient.get<Paginated<NotificationItem> | NotificationItem[]>("/notifications/");
  return Array.isArray(res.data) ? res.data : res.data.results;
}

export async function markNotificationRead(id: number): Promise<void> {
  await axiosClient.post(`/notifications/${id}/mark_as_read/`);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const res = await axiosClient.get<{ unread: number }>("/notifications/unread_count/");
  return res.data.unread;
}

export async function markAllNotificationsRead(): Promise<void> {
  await axiosClient.post("/notifications/mark_all_read/");
}

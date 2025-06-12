// Path: frontend/src/lib/api.ts

import apiClient from "./axiosClient";
import { Project, Team, Task } from "./types";

/**
 * Generic paginated response.
 */
interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** ----- PROJECTS ----- */

/**
 * Fetch all projects.
 */
export function fetchProjects(): Promise<Project[]> {
  return apiClient
    .get<Paginated<Project>>("/projects/")
    .then((res) => res.data.results);
}

/**
 * Fetch tasks for all projects (flattened).
 */
export async function fetchTasks(): Promise<Task[]> {
  const projects = await fetchProjects();
  const allTasks: Task[] = [];

  for (const proj of projects) {
    const res = await apiClient.get<Paginated<Task>>(
      `/projects/${proj.id}/tasks/`
    );
    allTasks.push(...res.data.results);
  }

  return allTasks;
}

/**
 * Create a new project.
 */
export function createProject(payload: {
  name: string;
  description: string;
  team: number;
}): Promise<Project> {
  return apiClient.post<Project>("/projects/", payload).then((res) => res.data);
}

/**
 * Update an existing project.
 */
export function updateProject(
  id: number,
  payload: Partial<Pick<Project, "name" | "description" | "team">>
): Promise<Project> {
  return apiClient
    .patch<Project>(`/projects/${id}/`, payload)
    .then((res) => res.data);
}

/**
 * Delete a project.
 */
export function deleteProject(id: number): Promise<void> {
  return apiClient.delete(`/projects/${id}/`).then(() => {});
}

/** ----- TEAMS ----- */

/**
 * Fetch all teams.
 */
export function fetchTeams(): Promise<Team[]> {
  return apiClient
    .get<Paginated<Team>>("/teams/")
    .then((res) => res.data.results);
}

/**
 * Create a new team.
 */
export function createTeam(payload: { name: string }): Promise<Team> {
  return apiClient.post<Team>("/teams/", payload).then((res) => res.data);
}

/**
 * Remove a member from a team.
 */
export function removeMember(teamId: number, userId: number): Promise<void> {
  return apiClient
    .post(`/teams/${teamId}/remove-member/`, { user_id: userId })
    .then(() => {});
}

/**
 * Change a member’s role within a team.
 */
export function changeRole(
  teamId: number,
  userId: number,
  role: string
): Promise<void> {
  return apiClient
    .post(`/teams/${teamId}/change-role/`, { user_id: userId, role })
    .then(() => {});
}

/**
 * Delete an entire team.
 */
export function deleteTeam(teamId: number): Promise<void> {
  return apiClient.delete(`/teams/${teamId}/`).then(() => {});
}

/** ----- TASKS ----- */

/**
 * Fetch tasks across all projects assigned to the user.
 */
export function fetchMyTasks(): Promise<Task[]> {
  return apiClient
    .get<Paginated<Task>>("/my-tasks/")
    .then((res) => res.data.results);
}

/**
 * Fetch tasks for a specific project.
 */
export function fetchProjectTasks(projectId: number): Promise<Task[]> {
  return apiClient
    .get<Paginated<Task>>(`/projects/${projectId}/tasks/`)
    .then((res) => res.data.results);
}

/**
 * Create a new task in a specific project.
 */
export function createTask(
  projectId: number,
  payload: Omit<Task, "id">
): Promise<Task> {
  return apiClient
    .post<Task>(`/projects/${projectId}/tasks/`, payload)
    .then((res) => res.data);
}

/**
 * Update an existing task.
 */
export function updateTask(
  projectId: number,
  taskId: number,
  payload: Partial<Omit<Task, "id">>
): Promise<Task> {
  return apiClient
    .patch<Task>(`/projects/${projectId}/tasks/${taskId}/`, payload)
    .then((res) => res.data);
}

/**
 * Delete a task.
 */
export function deleteTask(
  projectId: number,
  taskId: number
): Promise<void> {
  return apiClient.delete(`/projects/${projectId}/tasks/${taskId}/`).then(() => {});
}

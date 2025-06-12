// Path: frontend/src/lib/api.ts

import apiClient from "./axiosClient";
import { Project, Team, Task } from "./types";

/**
 * Generic paginated response shape.
 */
interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Fetch all projects.
 */
export const fetchProjects = (): Promise<Project[]> =>
  apiClient
    .get<Paginated<Project>>("/projects/")
    .then((res) => res.data.results);

/**
 * Create a new project.
 */
export const createProject = (payload: {
  name: string;
  description: string;
  team: number;
}): Promise<Project> =>
  apiClient.post<Project>("/projects/", payload).then((res) => res.data);

/**
 * Update an existing project.
 */
export const updateProject = (
  id: number,
  payload: Partial<Pick<Project, "name" | "description" | "team">>
): Promise<Project> =>
  apiClient.patch<Project>(`/projects/${id}/`, payload).then((res) => res.data);

/**
 * Fetch all teams.
 */
export const fetchTeams = (): Promise<Team[]> =>
  apiClient.get<Paginated<Team>>("/teams/").then((res) => res.data.results);

/**
 * Fetch tasks for a specific project.
 */
export const fetchProjectTasks = (projectId: number): Promise<Task[]> =>
  apiClient
    .get<Paginated<Task>>(`/projects/${projectId}/tasks/`)
    .then((res) => res.data.results);

/**
 * Create a new task in a project.
 */
export const createTask = (
  projectId: number,
  payload: Omit<Task, "id">
): Promise<Task> =>
  apiClient
    .post<Task>(`/projects/${projectId}/tasks/`, payload)
    .then((res) => res.data);

/**
 * Update an existing task.
 */
export const updateTask = (
  projectId: number,
  taskId: number,
  payload: Partial<Omit<Task, "id">>
): Promise<Task> =>
  apiClient
    .patch<Task>(`/projects/${projectId}/tasks/${taskId}/`, payload)
    .then((res) => res.data);

/**
 * Delete a task.
 */
export const deleteTask = (
  projectId: number,
  taskId: number
): Promise<void> =>
  apiClient.delete(`/projects/${projectId}/tasks/${taskId}/`).then(() => {});

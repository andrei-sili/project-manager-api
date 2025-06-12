// src/lib/api.ts
// Path: frontend/src/lib/api.ts
import api from "./api";  // păstrăm instanța axios deja creată
import { Project, Team, Task } from "./types";

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Proiecte **/
export const fetchProjects = (): Promise<Project[]> =>
  api.get<Paginated<Project>>("/projects/").then(res => res.data.results);

export const createProject = (payload: {
  name: string;
  description: string;
  team: number;
}): Promise<Project> =>
  api.post<Project>("/projects/", payload).then(res => res.data);

export const updateProject = (
  id: number,
  payload: Partial<Pick<Project, "name" | "description" | "team">>
): Promise<Project> =>
  api.patch<Project>(`/projects/${id}/`, payload).then(res => res.data);

/** Echipe **/
export const fetchTeams = (): Promise<Team[]> =>
  api.get<Paginated<Team>>("/teams/").then(res => res.data.results);

/** Sarcini **/
export const fetchProjectTasks = (projectId: number): Promise<Task[]> =>
  api.get<Paginated<Task>>(`/projects/${projectId}/tasks/`)
     .then(res => res.data.results);

export const createTask = (
  projectId: number,
  payload: Omit<Task, "id">
): Promise<Task> =>
  api.post<Task>(`/projects/${projectId}/tasks/`, payload).then(res => res.data);

export const updateTask = (
  projectId: number,
  taskId: number,
  payload: Partial<Omit<Task, "id" | "project">>
): Promise<Task> =>
  api.patch<Task>(`/projects/${projectId}/tasks/${taskId}/`, payload)
     .then(res => res.data);

export const deleteTask = (projectId: number, taskId: number): Promise<void> =>
  api.delete(`/projects/${projectId}/tasks/${taskId}/`).then(() => {});

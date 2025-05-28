// frontend/src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export default api;

// ——— Types ———
export interface Project {
  id: number;
  name: string;
}
export interface Team {
  id: number;
  name: string;
}
export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// ——— Fetch helpers ———
export function fetchProjects(): Promise<Project[]> {
  return api.get<Project[]>("projects/").then(res => res.data);
}

export function fetchTeams(): Promise<Team[]> {
  return api.get<Team[]>("teams/").then(res => res.data);
}

export function fetchTasks(): Promise<Task[]> {
  return api.get<Task[]>("tasks/").then(res => res.data);
}

// Create a new project
export function createProject(payload: { name: string }): Promise<Project> {
  return api
    .post<Project>("projects/", payload)
    .then((res) => res.data);
}

// Update an existing project
export function updateProject(
  id: number,
  payload: { name: string }
): Promise<Project> {
  return api
    .put<Project>(`projects/${id}/`, payload)
    .then((res) => res.data);
}
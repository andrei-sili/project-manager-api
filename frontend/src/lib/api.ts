// frontend/src/lib/api.ts
import axios from "axios";

// 1) Instanța Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 2) Interceptor pentru JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3) Tipuri
export interface Project { id: number; name: string; }
export interface Team    { id: number; name: string; }
export interface Task    { id: number; title: string; completed: boolean; }

// 4) Răspuns paginat
interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// 5) Fetch helpers – notează că extragem `.results`
export function fetchProjects(): Promise<Project[]> {
  return api.get<Paginated<Project>>("/projects/")
    .then((res) => res.data.results);
}

export function fetchTeams(): Promise<Team[]> {
  return api.get<Paginated<Team>>("/teams/")
    .then((res) => res.data.results);
}

export function fetchTasks(): Promise<Task[]> {
  return api.get<Paginated<Task>>("/tasks/")
    .then((res) => res.data.results);
}

// 6) CRUD Projects
export function createProject(payload: { name: string }): Promise<Project> {
  return api.post<Project>("/projects/", payload).then((res) => res.data);
}
export function updateProject(
  id: number,
  payload: { name: string }
): Promise<Project> {
  return api.put<Project>(`/projects/${id}/`, payload).then((res) => res.data);
}

export function fetchMyTasks(): Promise<Task[]> {
  return api
    .get<Paginated<Task>>("/my-tasks/")
    .then((res) => res.data.results);
}
// 7) Export default api
export default api;

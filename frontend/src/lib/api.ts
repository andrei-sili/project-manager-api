// src/lib/api.ts
import axios from "axios";

// Redirect helper (pentru client)
function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

// Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// JWT Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

// Types
export interface TeamMember {
  id?: number;
  user: string;
  email: string;
  role: string;
  joined_at: string;
}

export interface Team {
  id: number;
  name: string;
  created_by: string;
  members: TeamMember[];
}

export interface Project {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  project: number | Project;
  status: string;
  priority: string;
  assigned_to: string;
  assigned_to_name?: string;
  due_date?: string;
}

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Fetch helpers
export function fetchProjects(): Promise<Project[]> {
  return api.get<Paginated<Project>>("/projects/")
    .then(res => res.data.results);
}

export function fetchTeams(): Promise<Team[]> {
  return api.get<Paginated<Team>>("/teams/")
    .then(res => res.data.results);
}

export function fetchMyTasks(): Promise<Task[]> {
  return api.get<Paginated<Task>>("/my-tasks/")
    .then(res => res.data.results);
}

export async function fetchTasks(): Promise<Task[]> {
  const projects = await fetchProjects();
  const allTasks: Task[] = [];

  for (const project of projects) {
    const res = await api.get<Paginated<Task>>(`/projects/${project.id}/tasks/`);
    console.log(`Tasks for project ${project.name}:`, res.data.results);
    allTasks.push(...res.data.results);
  }

  return allTasks;
}

export function fetchProjectTasks(projectId: number): Promise<Task[]> {
  return api.get<Paginated<Task>>(`/projects/${projectId}/tasks/`)
    .then(res => res.data.results);
}

// CRUD Projects
export function createProject(payload: { name: string }): Promise<Project> {
  return api.post<Project>("/projects/", payload)
    .then(res => res.data);
}

export function updateProject(id: number, payload: { name: string }): Promise<Project> {
  return api.put<Project>(`/projects/${id}/`, payload)
    .then(res => res.data);
}

// CRUD Tasks
export function createTask(payload: Partial<Task>): Promise<Task> {
  const projectId = typeof payload.project === "object"
    ? payload.project.id
    : payload.project;

  return api.post<Task>(`/projects/${projectId}/tasks/`, payload)
    .then(res => res.data);
}

export function updateTask(projectId: number, taskId: number, payload: Partial<Task>): Promise<Task> {
  return api.put<Task>(`/projects/${projectId}/tasks/${taskId}/`, payload)
    .then(res => res.data);
}

export function deleteTask(projectId: number, taskId: number): Promise<void> {
  return api.delete(`/projects/${projectId}/tasks/${taskId}/`).then(() => {});
}

// ----------- TEAM API CALLS -----------

export function createTeam(payload: { name: string }): Promise<Team> {
  return api.post("/teams/", payload).then((res) => res.data);
}




export async function inviteMember(teamId: string, email: string, role: string): Promise<Response> {
  return await fetch(`/api/teams/${teamId}/invite-member/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, role }),
  });
}




export function acceptInvite(teamId: string) {
  return api.post(`/teams/${teamId}/accept-invite/`);
}

export function declineInvite(teamId: string) {
  return api.post(`/teams/${teamId}/decline-invite/`);
}

export function removeMember(teamId: string, userId: string) {
  return api.post(`/teams/${teamId}/remove-member/`, { user_id: userId });
}

export function changeRole(teamId: string, userId: string, role: string) {
  return api.post(`/teams/${teamId}/change-role/`, { user_id: userId, role });
}

export function deleteTeam(teamId: string) {
  return api.delete(`/teams/${teamId}/`);
}



export default api;

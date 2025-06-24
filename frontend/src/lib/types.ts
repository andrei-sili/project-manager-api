// User model
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  date_joined: string;
  avatar_url?: string;
}

// Team member (association)
export interface TeamMember {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  role: string;
  joined_at: string;
}

// Team
export interface Team {
  id: number;
  name: string;
  created_by: string;
  members: TeamMember[];
  is_admin: boolean;
}


// Task status and priority
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

// Task
export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assigned_to: User | null;
  created_by: User;
  project: { id: number; name: string };
  created_at: string;
}

// Project
export interface Project {
  id: number;
  name: string;
  description: string;
  team: Team;
  created_by: User;
  created_at: string;
  tasks: Task[];
  status?: string;
  due_date?: string;
  time_tracked?: number;
}

// Time Entry
export interface TimeEntry {
  id: number;
  user: User;
  task: Task;
  minutes: number;
  date: string;
  note?: string;
  created_at?: string;
}

// Comments (threaded)
export interface TaskComment {
  id: number;
  user: User;
  text: string;
  created_at: string;
  replies: TaskComment[];
}

// File attached to task
export interface TaskFile {
  id: number;
  file: string;
  file_url: string;
  uploaded_by: User;
  uploaded_at: string;
}

// Generic paginated response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

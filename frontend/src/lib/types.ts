// frontend/src/lib/types.ts

// ---------- COMMENT ----------
export interface TaskComment {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  } | string;
  text: string;
  created_at: string;
  replies: TaskComment[];
}

// ---------- FILE ----------
export interface TaskFile {
  id: number;
  file: string;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

// Paginated API response
export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TaskShort {
  id: number;
  title: string;
}
export interface TaskView {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  assigned_to: string;
  created_by: string;
  project: { id: number; name: string };
  created_at: string;
  assigned_to_email?: string;
}

// User
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  date_joined: string;
}

// ---------- TEAM ----------
export interface TeamMember {
  id: number;
  user: string;
  email: string;
  role: string;
  joined_at: string;
}
// teams
export interface Team {
  id: number;
  name: string;
  created_by: string;
  members: TeamMember[];
}
// ---------- TASK ----------
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  assigned_to: string;
  created_by: string;
  project: { id: number; name: string };
  created_at: string;
  assigned_to_email?: string;
}

// ---------- PROJECT ----------
export interface Project {
  id: number;
  name: string;
  description: string;
  team?: Team;
  created_by: User;
  created_at: string;
  tasks: Task[];
}
// time entries
export interface TimeEntry {
  id: number;
  user: number | { id: number; email: string; first_name?: string; last_name?: string };
  task: number | { id: number; title: string };
  minutes: number;
  date: string;
  note?: string;
  created_at?: string;
}

// summary
export type TimeEntriesSummaryDay = {
  date: string;
  minutes: number;
};

export type TimeEntriesSummary = {
  total_minutes: number;
  per_day: TimeEntriesSummaryDay[];
};

// --------- AUTO-GENERATED TYPES BASED ON BACKEND ---------
export interface Comment {
  user_name: string;
}

export interface CommentCreate {
}

export interface ActivityLog {
  user_email: string;
  project: string;
  user: string;
}

export interface Notification {
}

export interface ProjectCreate {
}

export interface TaskCreate {
  project: string;
  assigned_to: string;
}

export interface TeamMembership {
  user: string;
  email: string;
  id: string;
}

export interface TeamCreate {
}

export interface InviteMember {
  email: string;
  role: string;
}

export interface TimeEntryCreate {
  user: string;
  task_id: string;
}

export interface UserRegister {
  password: string;
  token: string;
}

export interface UserChangePassword {
  old_password: string;
  new_password: string;
}

export interface RequestPasswordReset {
  email: string;
}

export interface ConfirmPasswordReset {
  token: string;
  new_password: string;
}
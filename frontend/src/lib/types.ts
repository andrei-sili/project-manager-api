// frontend/src/lib/types.ts

// User (used for created_by, assigned_to, etc.)
export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  date_joined?: string;
};

// Team Member
export type TeamMember = {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
};

// Team
export type Team = {
  id: number;
  name: string;
  created_by: string | User;
  members: TeamMember[];
};

// Task File
export type TaskFile = {
  id: number;
  file: string;
  file_url: string;
  uploaded_by: string | User;
  uploaded_at: string;
};

// Comment (with replies tree)
export type Comment = {
  id: number;
  user_name: string;
  text: string;
  created_at: string;
  replies: Comment[];
};

// Task
export type Task = {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string;
  assigned_to: string | User | null;
  created_by: string | User;
  project: {
    id: number;
    name: string;
  };
  created_at: string;
};

// Project
export type Project = {
  id: number;
  name: string;
  description: string;
  team: Team | null;
  created_by: string | {
    id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    name?: string;
  };
  created_at: string;
  tasks?: Task[];
  task_count?: number;
};
// Paginated API response
export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export interface TaskShort {
  id: number;
  title: string;
}
export interface TimeEntry {
  id: number;
  user: any;
  task: TaskShort | number;
  minutes: number;
  date: string;
  note?: string;
  created_at?: string;
}


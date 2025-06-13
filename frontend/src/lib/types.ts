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
  user: string;   // sometimes only user name/email is returned!
  email?: string;
  role: string;
  joined_at: string;
};

// Team
export type Team = {
  id: number;
  name: string;
  created_by: string | User; // sometimes string (name), sometimes full User
  members: TeamMember[];
};

// Task File
export type TaskFile = {
  id: number;
  file: string;       // file url
  file_url: string;   // same as file, redundant
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
  created_by: string | User;
  created_at: string;
  tasks?: Task[];
  // task_count is optional, can be added on frontend as tasks?.length
};

// TimeEntry
export type TimeEntry = {
  id: number;
  user: string | User;
  task: number;
  date: string;
  minutes: number;
  note: string;
  created_at: string;
};

// Paginated API response
export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};


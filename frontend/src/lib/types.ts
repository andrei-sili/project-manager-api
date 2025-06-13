// frontend/src/lib/types.ts

export type Task = {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  due_date: string;
  priority: "low" | "medium" | "high";
  project: Project;
};

export type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type Team = {
  id: number;
  name: string;
  members: Member[];
};

export type Project = {
  id: number;
  name: string;
  description: string;
  team: Team | null;
  task_count: number;
  created_by: {
    id: number;
    name: string;
    email: string;
  };
  tasks?: Task[];
};

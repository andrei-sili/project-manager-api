// Path: frontend/src/lib/types.ts

/**
 * Reflects apps.teams.serializers.TeamSerializer
 */
export interface TeamMember {
  id: number;
  user: string;
  email: string;
  role: string;
  joined_at: string;
}

/**
 * Reflects apps.teams.serializers.TeamSerializer
 */
export interface Team {
  id: number;
  name: string;
  members: TeamMember[];
}

/**
 * Reflects apps.tasks.serializers.TaskSerializer
 */
export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
}

/**
 * Reflects apps.projects.serializers.ProjectSerializer
 * - team: nested TeamSerializer
 * - created_by: string from SerializerMethodField
 * - tasks: array of TaskSerializer
 * :contentReference[oaicite:0]{index=0}
 */
export interface Project {
  id: number;
  name: string;
  description: string;
  team: Team;
  created_by: string;
  created_at: string;
  tasks: Task[];
}

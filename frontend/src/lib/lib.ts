export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface Request {
  success: boolean;
  message: string;
  token: string;
}

export interface Workspace {
  id: number;
  name: string;
  _count: {
    projects: number;
    member: number;
  };
}

export interface Project {
  id: number;
  name: string;
  workspaceId: number;
}

export interface Member {
  id: number;
  userId: number;
  workspaceId: number;
  user: {
    name: string;
    email: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assigned_to: number;
}

export interface SelectedTask {
  id: string;
  title: string
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assigned_to: (id: string) => string;
}

export interface Comment {
  id: number;
  content: string;
  taskId: string;
  created_at: string;
  userId: string;
  user: {
    name: string;
  }
}
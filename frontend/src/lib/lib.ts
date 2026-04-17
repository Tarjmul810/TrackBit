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
  id: string | number;
  title: string;
  description?: string;
  order: number;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assigned_to: number;
}

export interface SelectedTask {
  id: string;
  title: string;
  description?: string;
  order: number;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assigned_to: (id: string) => string;
}

export interface Comment {
  id: number | string;
  content: string;
  taskId: string;
  created_at: string;
  userId: string;
  user: {
    name: string;
  };
}

export interface CommentStore {
  commentsByCard: Record<string, Comment[]>;
  socketId: string | null;
  setCommentSocketId: (id: string) => void;
  setComments: (cardId: string, comments: Comment[]) => void;
  addComment: (cardId: string, text: string, userName: string) => Promise<void>;
  addRemoteComment: (cardId: string, comment: Comment) => void;
}
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type TasksByStatus = Record<string, Task[]>;

export interface TaskStore {
  tasksByStatus: TasksByStatus;
  pendingMoves: Set<string>;
  isMoving: boolean;
  socketId: string | null;
  setSocketId: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (
    projectId: string,
    title: string,
    status: string,
    priority: Priority,
    assigned_to: number,
    description?: string,
  ) => Promise<void>;
  moveTask: (
    taskId: string,
    newStatus: string,
    newIndex: number,
  ) => Promise<void>;
  updateSingleTask: (task: Task) => void;
  applyRemoteMove: (task: Task) => void;
}

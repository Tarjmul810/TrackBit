export const BACKEND_URL = "http://localhost:3001";

export interface Request {
    success: boolean;
    message: string;
    token: string;
}

export interface Workspace {
    id: number
    name: string
    _count: {
        projects: number
        member: number
    }
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
    }
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH";
    assigned_to: number
}
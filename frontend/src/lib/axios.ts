import axios from "axios";
import { BACKEND_URL } from "./lib";
import { config } from "process";

const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const login = async (email: string, password: string) => {
    const response = await api.post("/signin", { email, password })
    return response.data
}   
export const signup = async (email: string, password: string, name: string) => {
    const response = await api.post("/signup", { email, password, name })
    return response.data
}

export const getWorkspaces = async () => {
    const response = await api.get("/workspace")
    return response.data
}

export const addWorkspace = async (name: string) => {
    const response = await api.post("/workspace", { name })
    return response.data
}

export const getProjects = async (id: string) => {
    const response = await api.get(`/project/${id}`)
    return response.data
}

export const addProject = async (name: string, id: string) => {
    await api.post(`/project/${id}`, { name })
}

export const getMembers = async (id: string) => {
    const response = await api.get(`/workspace/${id}/members`)
    return response.data
}

export const addMember = async (email: string, id: string) => {
    await api.post(`/workspace/${id}/members`, { email })
}   

export const getTasks = async (id: string) => {
    const response = await api.get(`/task/${id}`)
    return response.data
}

export const addTask = async (id: string, title: string, status: string, priority: string, order: number, assigned_to: number, description?: string) => {
    const response = await api.post(`/task/${id}`, { title, description, order, status, priority, assigned_to })
    console.log(response)
    return response
}

export const updateTask = async (id: string, status: string, order: number, socketId: string, title?: string, description?: string, priority?: string, assigned_to?: number) => {
    const response = await api.put(`/task/${id}`, { title, description, order, status, priority, assigned_to })
    return response
}

export const sendComment = async (id: string, comment: string, socketId: string) => {
    const response = await api.post(`/comment/${id}`, { content: comment, socketId })
    return response
}

export const getComments = async (id: string) => {
    const response = await api.get(`/comment/${id}`)
    console.log(response)
    return response.data
}
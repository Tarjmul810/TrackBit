"use client"

import Input from "@/src/components/Input";
import Sidebar from "@/src/components/Sidebar";
import { TaskCard } from "@/src/components/TaskCard";
import { addTask, getMembers, getTasks, getWorkspaces, updateTask } from "@/src/lib/axios";
import { Member, Task, Workspace } from "@/src/lib/lib";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";


export default function Projects() {

    const params = useParams()
    const searchParams = useSearchParams()
    const workspaceId = searchParams.get("workspace")
    const id = params.id as string
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [status, setStatus] = useState("TODO")
    const [assigned_to, setAssigned_to] = useState(0)
    const [priority, setPriority] = useState("LOW")
    const [isOpen, setIsOpen] = useState(false)
    const [workspace, setWorkspace] = useState<Workspace[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [members, setMembers] = useState<Member[]>([])

    const getWorkspace = async () => {
        const response = await getWorkspaces()
        setWorkspace(response.workspaces)
    }

    const handleGetMembers = async () => {
        const response = await getMembers(workspaceId as string)
        setMembers(response.members)
    }

    const handleOpenWorkspace = (workspace: Workspace) => {
        router.push(`/workspace/${workspace.id}`)
    }

    const handleDashboard = () => {
        router.push("/dashboard")
    }

    const handleGetTasks = async (id: string) => {
        const response = await getTasks(id)
        setTasks(response.tasks)
    }

    const handleAddTask = async () => {
        await addTask(id, title, status, priority, assigned_to, description)
        setTitle("")
        setDescription("")
        setPriority("LOW")
        setAssigned_to(0)
        setIsOpen(false)
        await handleGetTasks(id)
    }

    const handleIsOpen = () => {
        setIsOpen(!isOpen)
    }

    const handleUpdateTask = async (taskId: string, status: string) => {
        await updateTask(taskId, status)
    }

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return  

        const taskId = result.draggableId
        const newStatus = result.destination.droppableId

        console.log(newStatus)

        setStatus(newStatus)

        // console.log(taskId, status)

        await handleUpdateTask(taskId, newStatus)
        await handleGetTasks(id)  
    }


    useEffect(() => {
        getWorkspace()
        handleGetTasks(id)
        handleGetMembers()
    }, [])

    return (
        <div className="flex min-h-screen bg-[#0f0f0f]">

            <Sidebar workspaces={workspace} handleWorkspace={handleOpenWorkspace} handleHome={handleDashboard} />

            <div className="ml-64 min-h-screen p-8 flex flex-col w-full">

                <div className="flex items-center justify-between  border-r-gray-800">
                    <h1 className="text-white text-2xl">Tasks</h1>
                    <div className="flex gap-4">
                        <button className="w-24 h-9 text-white bg-[#9865f0] hover:bg-[#a281f5] px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={handleIsOpen} >New</button>
                        <button className="w-24 h-9 text-white bg-[#585067] hover:bg-[#72688c] px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm">Logout</button>
                    </div>
                </div>

                <div className="flex p-8 gap-8">
                    <div className="flex-1">
                        <div className="grid grid-cols-4 gap-4">
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <div className="flex-1 bg-[#1a1a1a] rounded-xl p-4 flex flex-col gap-3 min-h-[70vh]">
                                    <TaskCard name="Todo" type="TODO" tasks={tasks} />
                                </div>
                                <div className="flex-1 bg-[#1a1a1a] rounded-xl p-4 flex flex-col gap-3 min-h-[70vh]">
                                    <TaskCard name="In Progress" type="IN_PROGRESS" tasks={tasks} />
                                </div>
                                <div className="flex-1 bg-[#1a1a1a] rounded-xl p-4 flex flex-col gap-3 min-h-[70vh]">
                                    <TaskCard name="In Review" type="IN_REVIEW" tasks={tasks} />
                                </div>
                                <div className="flex-1 bg-[#1a1a1a] rounded-xl p-4 flex flex-col gap-3 min-h-[70vh]">
                                    <TaskCard name="Done" type="DONE" tasks={tasks} />
                                </div>
                            </DragDropContext>
                        </div>
                    </div>
                </div>

            </div>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a1a] border border-[#ffffff10] rounded-xl p-6 w-full max-w-sm flex flex-col gap-4">
                        <h1 className="text-center text-2xl font-semibold italic">New Task</h1>

                        <Input type="text" placeholder="Title" name={title} setName={setTitle} />
                        <Input type="text" placeholder="Description" name={description} setName={setDescription} />

                        <div className="flex gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#888888] text-xs">Priority</label>
                                <div className="flex gap-2">
                                    {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPriority(p)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${priority === p
                                                ? p === 'LOW' ? 'bg-[#242325] text-gray-300 outline outline-[#545654]'
                                                    : p === 'MEDIUM' ? 'bg-[#242325] text-gray-300 outline outline-[#545654]'
                                                        : 'bg-[#242325] text-gray-300 outline outline-[#545654]'
                                                : 'bg-[#0f0f0f] text-[#888888] border border-[#ffffff10]'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[#888888] text-xs">Assign to</label>
                                <select value={assigned_to} onChange={(e) => setAssigned_to(Number(e.target.value))} className="bg-[#0f0f0f] text-white border border-[#ffffff10] rounded-lg px-3 py-1.5 text-sm" >
                                    <option value="">Unassigned</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.user.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-between gap-4">
                            <button className="w-48 text-white bg-gray-800 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={handleIsOpen}>
                                Cancel
                            </button>
                            <button className="w-48 text-white bg-[#9865f0] hover:bg-[#a281f5] px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={handleAddTask}>
                                Create
                            </button>

                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
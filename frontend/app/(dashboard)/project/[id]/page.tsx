"use client"

import Input from "@/src/components/Input";
import Sidebar from "@/src/components/Sidebar";
import { TaskColumnCard } from "@/src/components/TaskColumnCard";
import { addTask, getComments, getMembers, getTasks, getWorkspaces, sendComment, updateTask } from "@/src/lib/axios";
import { Member, Task, Workspace } from "@/src/lib/lib";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { socket } from "@/src/lib/socket";
import {useCommentStore, useTaskStore} from "@/src/lib/store";

export default function Projects() {

    const params = useParams()
    const searchParams = useSearchParams()
    const workspaceId = searchParams.get("workspace")
    const projectId = params.id as string
    const router = useRouter()
    const userName = localStorage.getItem("name") as string
    const { addComment, commentsByCard, setComments } = useCommentStore()
    const { tasksByStatus, setTasks, moveTask } = useTaskStore()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [status, setStatus] = useState("TODO")
    const [assigned_to, setAssigned_to] = useState(0)
    const [priority, setPriority] = useState("LOW")
    const [isOpen, setIsOpen] = useState(false)
    const [isTaskOpen, setIsTaskOpen] = useState(false)
    const [workspace, setWorkspace] = useState<Workspace[]>([])
    // const [tasks, setTasks] = useState<Task[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [comment, setComment] = useState<string>("")
    const comments = commentsByCard[selectedTask?.id as string] || []
    const tasks = Object.values(tasksByStatus).flat()



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

    const Logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("email")
        router.push("/signin")
    }

    const handleGetTasks = async (id: string) => {
        const response = await getTasks(id)
        console.log(response)
        setTasks(response.tasks)
    }

    const handleAddTask = async () => {
        await addTask(projectId, title, status, priority, assigned_to, description)
        setTitle("")
        setDescription("")
        setPriority("LOW")
        setAssigned_to(0)
        setIsOpen(false)
        await handleGetTasks(projectId)
    }

    const handleIsOpen = () => {
    
        setIsOpen(!isOpen)
    }
    
    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return
        
        const taskId = result.draggableId
        const newStatus = result.destination.droppableId

        console.log(taskId, newStatus)
        
        moveTask(taskId, newStatus)
    }
    
    const handleCommentOpen = async () => {
        if (!isTaskOpen) {
            handleGetComments()
        }
        setIsTaskOpen(!isTaskOpen)
    }

    const handleSendComment = async () => {
        const sendComment = comment
        setComment("")
        await addComment(selectedTask?.id as string, sendComment, userName)
    }

    const handleGetComments = async () => {
        const response = await getComments(selectedTask?.id as string)
        setComments(selectedTask?.id as string, response.comments)
    }

    const member = (id: number): string => {
        const member = members.find((member) => member.id === Number(id)) as unknown as Member
        return member?.user.name
    }


    useEffect(() => {
        getWorkspace()
        handleGetTasks(projectId)
        handleGetMembers()
    }, [])
    
    useEffect(() => {
        socket.emit('join:project', projectId)

        socket.on('update', () => {
            console.log('task updated')
            handleGetTasks(projectId)
        })

        return () => {
            socket.off('update')
        }
    }, [tasks])

    useEffect(() => {
    handleGetTasks(projectId)
  }, [projectId])

    return (
        <div className="flex min-h-screen bg-[#0f0f0f]">

            <Sidebar workspaces={workspace} handleWorkspace={handleOpenWorkspace} handleHome={handleDashboard} />

            <div className="ml-64 min-h-screen p-8 flex flex-col w-full">

                <div className="flex items-center justify-between  border-r-gray-800">
                    <h1 className="text-white text-2xl">Tasks</h1>
                    <div className="flex gap-4">
                        <button className="w-24 h-9 text-white bg-[#9865f0] hover:bg-[#a281f5] px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={handleIsOpen} >New</button>
                        <button className="w-24 h-9 text-white bg-[#585067] hover:bg-[#72688c] px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={Logout}>Logout</button>
                    </div>
                </div>

                <div className="flex p-8 gap-8">
                    <div className="flex-1">
                        <div className="grid grid-cols-4 gap-4">
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <div className="flex-1 bg-[#1a1a1a] rounded-xl p-4 flex flex-col gap-3 min-h-[70vh]">
                                    <TaskColumnCard name="Todo" type="TODO" tasks={tasks} members={members} selectTask={setSelectedTask} isOpen={handleCommentOpen} />
                                </div>
                                <div className="flex-1 bg-[#1a1a1a] rounded-xl p-4 flex flex-col gap-3 min-h-[70vh]">
                                    <TaskColumnCard name="In Progress" type="IN_PROGRESS" tasks={tasks} members={members} selectTask={setSelectedTask} isOpen={handleCommentOpen} />
                                </div>
                                <div className="flex-1 bg-[#1a1a1a] rounded-xl p-4 flex flex-col gap-3 min-h-[70vh]">
                                    <TaskColumnCard name="In Review" type="IN_REVIEW" tasks={tasks} members={members} selectTask={setSelectedTask} isOpen={handleCommentOpen} />
                                </div>
                                <div className="flex-1 bg-[#1a1a1a] rounded-xl p-4 flex flex-col gap-3 min-h-[70vh]">
                                    <TaskColumnCard name="Done" type="DONE" tasks={tasks} members={members} selectTask={setSelectedTask} isOpen={handleCommentOpen} />
                                </div>
                            </DragDropContext>
                        </div>
                    </div>
                </div>

            </div>


            <div className={`fixed right-0 top-0 h-screen w-105 flex flex-col bg-[#111111] border-l border-[#ffffff10] shadow-[-20px_0_60px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-in-out z-50 ${isTaskOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                <div className="shrink-0 px-6 pt-5 pb-4 border-b border-[#ffffff08]">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <span className="shrink-0 w-2 h-2 rounded-full bg-[#7c3aed] mt-0.5" style={{ boxShadow: '0 0 6px #7c3aed80' }} />
                            <h2 className="text-white font-semibold text-[15px] leading-snug">
                                {selectedTask?.title}
                            </h2>
                        </div>

                        <button
                            onClick={() => setIsTaskOpen(false)}
                            className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[#555] hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    {selectedTask?.description && (
                        <p className="mt-2.5 pl-4.5 text-[#666] text-sm leading-relaxed">
                            {selectedTask.description}
                        </p>
                    )}
                </div>

                <div className="shrink-0 px-6 py-3 flex items-center gap-4 flex-wrap bg-[#0d0d0d] border-b border-[#ffffff08]">

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#444] uppercase tracking-widest font-medium">Priority</span>
                        <span className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border ${selectedTask?.priority === 'HIGH'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : selectedTask?.priority === 'MEDIUM'
                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                : 'bg-green-500/10 text-green-400 border-green-500/20'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedTask?.priority === 'HIGH' ? 'bg-red-400'
                                : selectedTask?.priority === 'MEDIUM' ? 'bg-orange-400'
                                    : 'bg-green-400'
                                }`} />
                            {selectedTask?.priority}
                        </span>
                    </div>

                    <span className="w-px h-4 bg-[#ffffff10]" />

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#444] uppercase tracking-widest font-medium">Assignee</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/30 flex items-center justify-center text-[9px] text-[#a78bfa] font-semibold">
                                {member(selectedTask?.assigned_to!)?.charAt(0)?.toUpperCase() ?? '?'}
                            </div>
                            <span className="text-sm text-[#bbb]">
                                {member(selectedTask?.assigned_to!) ?? 'Unassigned'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 px-6 py-3 flex items-center gap-2 border-b border-[#ffffff08]">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-[#555]">
                        <path d="M14 1H2a1 1 0 00-1 1v9a1 1 0 001 1h4l2 3 2-3h4a1 1 0 001-1V2a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[10px] text-[#555] uppercase tracking-widest font-medium">Comments</span>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-3 space-y-0.5"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffffff08 transparent' }}>

                    {comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-28 gap-2">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-[#2a2a2a]">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                            <p className="text-[#333] text-sm">No comments yet</p>
                        </div>
                    ) : (
                        comments.map((c, idx) => (
                            <div key={c.id}>
                                {idx > 0 && <div className="h-px bg-[#ffffff05] my-1" />}
                                <div className="group flex gap-3 px-3 py-2.5 rounded-xl hover:bg-white/2 transition-colors">

                                    <div className="shrink-0 w-7 h-7 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/25 flex items-center justify-center text-[10px] text-[#a78bfa] font-semibold">
                                        {c.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2 mb-0.5">
                                            <span className="text-[13px] font-medium text-[#e0e0e0]">{c.user.name}</span>
                                            <span className="text-[11px] text-[#3a3a3a]">{c.created_at}</span>
                                        </div>
                                        <p className="text-sm text-[#888] leading-relaxed wrap-break-word">{c.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="shrink-0 p-4 bg-[#0d0d0d] border-t border-[#ffffff08]">
                    <div
                        className="flex items-center gap-2 rounded-xl px-3 py-2 focus-within:border-[#7c3aed]/40 transition-colors"
                        style={{ background: '#1a1a1a', border: '1px solid #ffffff10' }}
                    >
                        <input
                            type="text"
                            placeholder="Add a comment…"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                            className="flex-1 bg-transparent text-sm text-white placeholder-[#3a3a3a] outline-none"
                        />
                        <button
                            onClick={handleSendComment}
                            disabled={!comment.trim()}
                            className="shrink-0 h-7 px-3 rounded-lg text-xs font-medium transition-all disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                            style={{
                                background: comment.trim() ? '#7c3aed' : '#1f1f1f',
                                color: comment.trim() ? '#fff' : '#444',
                            }}
                        >
                            Send
                        </button>
                    </div>
                    <p className="text-[10px] text-[#2a2a2a] mt-1.5 pl-1">Enter to send</p>
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
"use client"

import Card from "@/src/components/Card";
import Input from "@/src/components/Input";
import Sidebar from "@/src/components/Sidebar";
import { addMember, addProject, getMembers, getProjects, getWorkspaces } from "@/src/lib/axios";
import { Project, Workspace } from "@/src/lib/lib";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function Workspaces() {

    const params = useParams()
    const id = params.id as string
    const router = useRouter()
    const [name, setName] = useState("")
    const [isProjectOpen, setIsProjectOpen] = useState(false)
    const [isMemberOpen, setIsMemberOpen] = useState(false)
    const [workspace, setWorkspace] = useState<Workspace[]>([])
    const [project, setProject] = useState<Project[]>([])
    const [members, setMembers] = useState<any>([])

    const handleDashboard = () => {
        router.push("/dashboard")
    }

    const Logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("email")
        router.push("/signin")
    }

    const getWorkspace = async () => {
        const response = await getWorkspaces()
        setWorkspace(response.workspaces)
    }

    const handleOpenWorkspace = (workspace: Workspace) => {
        router.push(`/workspace/${workspace.id}`)
    }

    const handleGetProjects = async (id: string) => {
        const response = await getProjects(id)
        setProject(response.projects)
    }
    
    const handleAddProject = async () => {
        await addProject(name, id)
        setName("")
        setIsProjectOpen(false)
        handleGetProjects(id)
    }
    
    const handleProjectOpen = () => {
        setIsProjectOpen(!isProjectOpen)
    }

    const handleGetMembers = async () => {
        const response = await getMembers(id)
        setMembers(response.members)
    }

    const handleAddMember = async () => {
        await addMember(name, id)
        setName("")
        setIsMemberOpen(false)
        handleGetMembers()
    }


    const handleMemberOpen = () => {
        setIsMemberOpen(!isMemberOpen)
    }

    const handleOpenProject = (project: Project) => {
        router.push(`/project/${project.id}?workspace=${project.workspaceId}`)
    }

    useEffect(() => {
        getWorkspace();
        handleGetProjects(id);
        handleGetMembers()
    }, [])


    return (
        <div className="flex min-h-screen bg-[#0f0f0f]">

            <Sidebar workspaces={workspace} handleWorkspace={handleOpenWorkspace} handleHome={handleDashboard} />

            <div className="ml-64 min-h-screen p-8 flex flex-col w-full">

                <div className="flex items-center justify-between  border-r-gray-800">
                    <h1 className="text-white text-2xl">Projects</h1>
                    <div className="flex gap-4">
                        <button className="w-24 h-9 text-white bg-[#9865f0] hover:bg-[#a281f5] px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={handleProjectOpen}>New</button>
                        <button className="w-24 h-9 text-white bg-[#9865f0] hover:bg-[#a281f5] px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={handleMemberOpen}>Invite</button>
                        <button className="w-24 h-9 text-white bg-[#585067] hover:bg-[#72688c] px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={Logout}>Logout</button>
                    </div>
                </div>

                <div className="flex p-8 gap-8">
                    <div className="flex-1">
                        <div className="grid grid-cols-3 gap-4 py-4">
                            {project.map((project: Project) => (
                                <Card key={project.id} name={project.name} handleWorkspace={() => { handleOpenProject(project) }} />
                            ))}

                        </div>
                    </div>


                    <div className="w-64 border-l border-[#ffffff10] p-6 flex flex-col gap-4">
                        <h2 className="text-white font-medium text-sm mb-2">Members</h2>
                        {members.map((member: any) => (
                            <div key={member.id} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xs font-medium">
                                    {member.user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-white text-sm">{member.user.name}</div>
                                <span className="text-xs text-[#888888]">
                                    {member === members[0] ? 'Owner' : 'Member'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {isProjectOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a1a] border border-[#ffffff10] rounded-xl p-6 w-full max-w-sm flex flex-col gap-4">
                        <h1 className="text-center text-2xl font-semibold italic">New Workspace</h1>
                        <Input type="text" placeholder="Name" name={name} setName={setName} />

                        <div className="flex justify-between gap-4">
                            <button className="w-48 text-white bg-gray-800 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={handleProjectOpen}>
                                Cancel
                            </button>
                            <button className="w-48 text-white bg-[#9865f0] hover:bg-[#a281f5] px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={handleAddProject}>
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isMemberOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a1a] border border-[#ffffff10] rounded-xl p-6 w-full max-w-sm flex flex-col gap-4">
                        <h1 className="text-center text-2xl font-semibold italic">Invite Member</h1>
                        <Input type="text" placeholder="Email" name={name} setName={setName} />

                        <div className="flex justify-between gap-4">
                            <button className="w-48 text-white bg-gray-800 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={handleMemberOpen}>
                                Cancel
                            </button>
                            <button className="w-48 text-white bg-[#9865f0] hover:bg-[#a281f5] px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={handleAddMember}>
                                Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
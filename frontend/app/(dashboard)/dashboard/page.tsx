"use client"

import Card from "@/src/components/Card"
import Input from "@/src/components/Input"
import Sidebar from "@/src/components/Sidebar"
import { getWorkspaces, addWorkspace, addMember } from "@/src/lib/axios"
import { Workspace } from "@/src/lib/lib"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"




export default function Dashboard() {

    const router = useRouter()
    const [workspace, setWorkspace] = useState<Workspace[]>([])
    const [name, setName] = useState("")
    const [isOpen, setIsOpen] = useState(false)

    const getWorkspace = async () => {
        const response = await getWorkspaces()
        setWorkspace(response.workspaces)
    }

    const Logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("email")
        router.push("/signin")
    }

    const handleOpen = () => {
        setIsOpen(!isOpen)
    }

    const handleAddWorkspace = async () => {
        const response = await addWorkspace(name) as any
        console.log("Response", response)
        const email = localStorage.getItem("email") as string
        const id = response.workspace.id 
        console.log(email, id)
        await addMember(email, id)
        setName("")
        getWorkspace()
        setIsOpen(false)
    }

    const handleOpenWorkspace = (workspace: Workspace) => {
        router.push(`/workspace/${workspace.id}`)
    }

    useEffect(() => {
        getWorkspace()
    }, [])

    return (
        <div className="min-w-screen min-h-screen">
            <Sidebar workspaces={workspace} handleWorkspace={handleOpenWorkspace}/>

            <div className="ml-64 p-8 min-h-screen">
                <div className="flex justify-between">
                    <h1 className="text-white text-2xl">Workspaces</h1>

                    <div className="flex gap-4">
                        <button className="w-24 text-white bg-[#9865f0] hover:bg-[#a281f5] px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={handleOpen}>
                            New
                        </button>
                        <button className="w-24 text-white bg-[#585067] hover:bg-[#72688c] px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={Logout}>
                            Logout
                        </button>
                    </div>

                </div>

                <div className="grid grid-cols-3 gap-4 py-4">

                    {workspace.map((workspace: Workspace) => (
                        <Card key={workspace.id} name={workspace.name} projects={workspace._count.projects} members={workspace._count.member} handleWorkspace={() => handleOpenWorkspace(workspace)} />
                    ))}

                </div>
            </div>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a1a] border border-[#ffffff10] rounded-xl p-6 w-full max-w-sm flex flex-col gap-4">
                        <h1 className="text-center text-2xl font-semibold italic">New Workspace</h1>
                        <Input type="text" placeholder="Name" name={name} setName={setName} />

                        <div className="flex justify-between gap-4">
                            <button className="w-48 text-white bg-gray-800 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={handleOpen}>
                                Cancel
                            </button>
                            <button className="w-48 text-white bg-[#9865f0] hover:bg-[#a281f5] px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={handleAddWorkspace}>
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}
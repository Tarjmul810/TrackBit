import { Workspace } from "../lib/lib";


export default function Sidebar({ workspaces, handleWorkspace, handleHome }: { workspaces: Workspace[], handleWorkspace: (workspace: Workspace) => void, handleHome?: () => void }) {
    return (
        <button className="w-56 flex flex-col px-0 fixed left-0 border-r-0.5 h-screen lg:bg-linear-to-t from-bg-200/5 to-bg-200/30 shadow-lg border-r border-r-gray-600 " >

                <div className="flex py-2 px-4 my-4 gap-2 cursor-pointer" onClick={handleHome}>
                    <div className="flex items-center justify-center w-8 h-8  rounded-xl bg-[#7c3aed]">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="6" height="6" rx="1" fill="white" />
                            <rect x="11" y="3" width="6" height="6" rx="1" fill="white" opacity="0.5" />
                            <rect x="3" y="11" width="6" height="6" rx="1" fill="white" opacity="0.5" />
                            <rect x="11" y="11" width="6" height="6" rx="1" fill="white" />
                        </svg>
                    </div>
                    <div className="flex justify-center items-center">
                        <h1 className="text-2xl font-semibold text-white text-center">DevBoard</h1>
                    </div>
                </div>

                <div className="flex flex-col gap-2 p-2">
                    {workspaces.map((w: Workspace) => (
                        <div key={w.id} className="text-[#888888] hover:text-white hover:bg-[#ffffff10] px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm" onClick={() => handleWorkspace(w)}>
                            {w.name}
                        </div>
                    ))}

                </div>
            
        </button>
    )
}
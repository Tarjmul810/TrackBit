import { Workspace } from "../lib/lib";

export default function Card({ name, projects, members, handleWorkspace }: { name: string, projects?: number, members?: number, handleWorkspace: () => void }) {

    return (
        <div className="bg-[#1a1a1a] border border-[#ffffff10] rounded-xl p-5 flex flex-col cursor-pointer hover:border-[#7c3aed] transition-colors" onClick={handleWorkspace}>
            <span className="text-white font-medium text-base mb-3">{name}</span>

            {projects !== undefined && <span className="text-[#888888] text-sm">{projects} Projects</span>}
            {members !== undefined && <span className="text-[#888888] text-sm">{members} members</span>}
        </div>
    )
}
export const Priority = ({ priority }: { priority: "LOW" | "MEDIUM" | "HIGH"}) => {
    return (
        (priority == "LOW" && <p className="px-2 py-1 rounded-full text-xs bg-[#1a3a1a] text-[#4ade80]">{priority}</p>) ||
        (priority == "MEDIUM" && <p className="px-2 py-1 rounded-full text-xs bg-[#3a2a1a] text-[#fb923c]">{priority}</p> ) ||
        (priority == "HIGH" && <p className="px-2 py-1 rounded-full text-xs bg-[#3a1a1a] text-[#f87171]">{priority}</p>)
    )
}
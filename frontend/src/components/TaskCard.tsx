import { Dispatch, SetStateAction } from "react";
import { Task } from "../lib/lib"
import { Priority } from "./Prority"


export const TaskCard = ({ task, index, assignee, selectTask, IsOpen }: {task: Task, index: string, assignee: () => string, selectTask: Dispatch<SetStateAction<string | null>>, IsOpen: ()=> void }) => {

    return (
        <>
            <div onClick={()=> { IsOpen(), selectTask(String(task.id))}} key={index} className="grid grid-cols-3 bg-[#0f0f0f] border border-[#ffffff10] rounded-lg p-3 gap-2 cursor-pointer hover:border-[#626065] transition-colors">
                <div className="col-span-2 flex flex-col gap-2">
                    <div className="flex items-center gap-2 ">
                        <div className="w-2 h-2 bg-[#dccff3] rounded-full"></div>
                        <p className="text-white text-sm">{task.title}</p>
                    </div>
                    <p className="text-[#888888] text-sm">{task.description}</p>
                </div>

                <div className="col-span-1 flex flex-col items-center gap-2">
                    <Priority priority={task.priority} />
                    <p className="w-6 h-6 bg-[#dccff3] text-black  font-bold text-center rounded-full">{assignee()}</p>
                </div>

            </div>
        </>
    )
}
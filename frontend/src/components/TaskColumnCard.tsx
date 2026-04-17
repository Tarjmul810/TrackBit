import { Draggable, Droppable } from "@hello-pangea/dnd"
import { Member, Task } from "../lib/lib"
import { Priority } from "./Prority"
import { TaskCard } from "./TaskCard"
import { Dispatch, SetStateAction } from "react"


export const TaskColumnCard = ({ name, type, tasks, members, selectTask, isOpen }: { name: string, type: string, tasks: Task[], members: Member[], selectTask: Dispatch<SetStateAction<Task | null>>, isOpen: () => void }) => {

    const typeGroup = {
        TODO: [] as Task[],
        IN_PROGRESS: [] as Task[],
        IN_REVIEW: [] as Task[],
        DONE: [] as Task[],
    }

    const grouped = tasks.reduce((acc, task) => {
        acc[task.status].push(task)
        return acc
    }, typeGroup)

    const member = (id: number): string => {
        const member = members.find((member) => member.id === Number(id)) as unknown as Member 
        return member?.user.name?.charAt(0).toUpperCase()
    }

    const Type = () => {
        switch (type) {
            case "TODO":
                return <span className="text-[#888888] text-sm font-medium mb-2">{grouped.TODO.length}</span>
            case "IN_PROGRESS":
                return <span className="text-[#888888] text-sm font-medium mb-2">{grouped.IN_PROGRESS.length}</span>
            case "IN_REVIEW":
                return <span className="text-[#888888] text-sm font-medium mb-2">{grouped.IN_REVIEW.length}</span>
            case "DONE":
                return <span className="text-[#888888] text-sm font-medium mb-2">{grouped.DONE.length}</span>
            default:
                return <span className="text-[#888888] text-sm font-medium mb-2">{grouped.TODO.length}</span>
        }
    }

    const TypeGroup = () => {
        switch (type) {
            case "TODO":
                return grouped.TODO
            case "IN_PROGRESS":
                return grouped.IN_PROGRESS
            case "IN_REVIEW":
                return grouped.IN_REVIEW
            case "DONE":
                return grouped.DONE
            default:
                return grouped.TODO
        }
    }

    const group = TypeGroup() as Task[]

    return (
        <>
            <div className="flex justify-between mx-4">
                <h2 className="text-[#888888] text-sm font-medium mb-2">{name}</h2>
                <Type />
            </div>

            <Droppable droppableId={type}>
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}>

                        {group.map((task: Task, index) => (
                            <Draggable draggableId={String(task.id)} index={index} key={index}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="p-1"
                                    >

                                        <TaskCard task={task}  index={String(task.id)} assignee={() => member(task.assigned_to)} selectTask={selectTask} IsOpen={isOpen}/>
                                    </div>
                                )}
                            </Draggable>

                        ))}
                        {provided.placeholder}
                    </div>
                )}

            </Droppable >
        </>
    )
}

import { Draggable, Droppable } from "@hello-pangea/dnd"
import { Task } from "../lib/lib"
import { Priority } from "./Prority"


export const TaskCard = ({ name, type, tasks }: { name: string, type: string, tasks: Task[] }) => {

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
                                    >

                                        <div key={task.id} className="flex items-center justify-between bg-[#0f0f0f] border border-[#ffffff10] rounded-lg p-3 cursor-pointer hover:border-[#626065] transition-colors">
                                            <div className="flex items-center gap-2 ">
                                                <div className="w-2 h-2 bg-[#dccff3] rounded-full"></div>
                                                <p className="text-white text-sm">{task.title}</p>
                                            </div>
                                            <p className="text-[#888888] text-sm">{task.description}</p>

                                            <Priority priority={task.priority} />
                                        </div>
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

import { create } from 'zustand'
import { sendComment, updateTask } from './axios'
import { Comment, CommentStore, Task, TasksByStatus, TaskStore } from './lib'

export const useCommentStore = create<CommentStore>((set, get) => ({

  commentsByCard: {},

  setComments: (cardId: string, comments: Comment[]) => {
    set((state: any) => ({
      commentsByCard: {
        ...state.commentsByCard,
        [cardId]: comments
      }
    }))
  },


  addComment: async (cardId: string, text: string, userName: string) => {

   
    const tempId = 'temp-' + Date.now()
    const newComment = {
      id: tempId,
      content: text,
      taskId: cardId,
      created_at: new Date().toISOString(),
      userId: 1,
      user: {
        name: userName
      } 
    }

    set((state: any) => ({
      commentsByCard: {
        ...state.commentsByCard,
        [cardId]: [...(state.commentsByCard[cardId] || []), newComment]
      }
    }))

    try {
      
      const response = await sendComment(cardId, text)
      const savedComment = response.data.comment
      
      set((state: any) => ({
        commentsByCard: {
          ...state.commentsByCard,
          [cardId]: state.commentsByCard[cardId].map((c: Comment) =>
            c.id === tempId ? { ...savedComment, user: { name: userName }} : c
          )
        }
      }))

    } catch (err) {
      
      set((state: any) => ({
        commentsByCard: {
          ...state.commentsByCard,
          [cardId]: state.commentsByCard[cardId].filter((c: Comment) => c.id !== tempId)
        }
      }))
    //   toast.error('Failed to post comment, try again')
    }
  }

}))


export const useTaskStore = create<TaskStore>((set, get) => ({
  tasksByStatus: {},

  setTasks: (tasks: Task[]) => {
    const grouped = tasks.reduce((acc, task) => {
      const status = task.status
      if (!acc[status]) acc[status] = []
      acc[status].push(task)
      return acc
    }, {} as TasksByStatus)

    set({ tasksByStatus: grouped })
  },

  moveTask: async (taskId: string, newStatus: string) => {
    const { tasksByStatus } = get()

    const snapshot = structuredClone(tasksByStatus)

    let movedTask: Task | null = null
    for (const status in tasksByStatus) {
      const found = tasksByStatus[status].find((t) => t.id === Number(taskId))
      if (found) {
        movedTask = { ...found }
        break
      }
    }

    if (!movedTask) return

    const oldStatus = movedTask.status

    set((state) => {
      const updated = structuredClone(state.tasksByStatus)

      updated[oldStatus] = updated[oldStatus].filter((t) => t.id !== Number(taskId))

      const taskWithNewStatus = { ...movedTask!, status: newStatus } as Task
      if (!updated[newStatus]) updated[newStatus] = []
      updated[newStatus].push(taskWithNewStatus)

      return { tasksByStatus: updated }
    })

    try {
      await updateTask(taskId, newStatus)

    } catch (err) {
      set({ tasksByStatus: snapshot })
      // toast.error('Failed to move task, try again')
    }
  }
}))
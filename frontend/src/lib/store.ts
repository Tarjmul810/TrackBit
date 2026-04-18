import { create } from "zustand";
import { addTask, sendComment, updateTask } from "./axios";
import { Comment, CommentStore, Task, TasksByStatus, TaskStore } from "./lib";

export const useCommentStore = create<CommentStore>((set, get) => ({
  commentsByCard: {},
  socketId: null,
  setCommentSocketId: (id: string) => {
    set({ socketId: id });
  },


  setComments: (cardId: string, comments: Comment[]) => {
    set((state: any) => ({
      commentsByCard: {
        ...state.commentsByCard,
        [cardId]: comments,
      },
    }));
  },

  addComment: async (cardId: string, text: string, userName: string) => {
    const tempId = "temp-" + Date.now();
    const { socketId } = get();
    const newComment = {
      id: tempId,
      content: text,
      taskId: cardId,
      created_at: new Date().toISOString(),
      userId: 1,
      user: {
        name: userName,
      },
    };

    set((state: any) => ({
      commentsByCard: {
        ...state.commentsByCard,
        [cardId]: [...(state.commentsByCard[cardId] || []), newComment],
      },
    }));

    try {
     
      const response = await sendComment(cardId, text, socketId as string);
      const savedComment = response.data.comment;

      set((state: any) => ({
        commentsByCard: {
          ...state.commentsByCard,
          [cardId]: state.commentsByCard[cardId].map((c: Comment) =>
            c.id === tempId ? { ...savedComment, user: { name: userName } } : c,
          ),
        },
      }));
    } catch (err) {
      set((state: any) => ({
        commentsByCard: {
          ...state.commentsByCard,
          [cardId]: state.commentsByCard[cardId].filter(
            (c: Comment) => c.id !== tempId,
          ),
        },
      }));
      //   toast.error('Failed to post comment, try again')
    }
  },

addRemoteComment: (cardId: string, comment: Comment) => {
  set((state) => ({
    commentsByCard: {
      ...state.commentsByCard,
      [cardId]: [
        ...(state.commentsByCard[cardId] ?? []),
        comment
      ]
    }
  }))
}
}));

const sortByOrder = (tasks: Task[]) =>
  [...tasks].sort((a, b) => a.order - b.order);

function getOrderBetween(prev: number | null, next: number | null): number {
  if (prev === null && next === null) return 1; // first task ever
  if (prev === null) return next! / 2; // inserting at start
  if (next === null) return prev + 1; // inserting at end
  return (prev + next) / 2; // inserting between two
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasksByStatus: {},
  pendingMoves: new Set(),

  socketId: null,

  setSocketId: (id: string) => set({ socketId: id }),

  isMoving: false,

  setTasks: (tasks: Task[]) => {
    const { pendingMoves } = get();

    const grouped = tasks.reduce((acc, task) => {
      if (!acc[task.status]) acc[task.status] = [];
      // skip tasks we just moved — keep our optimistic version
      if (!pendingMoves.has(String(task.id))) {
        acc[task.status].push(task);
      }
      return acc;
    }, {} as TasksByStatus);

    // keep optimistic versions of pending tasks
    for (const taskId of pendingMoves) {
      for (const status in get().tasksByStatus) {
        const task = get().tasksByStatus[status].find((t) => t.id === taskId);
        if (task) {
          if (!grouped[task.status]) grouped[task.status] = [];
          grouped[task.status].push(task);
        }
      }
    }

    // sort every column by order
    const sorted = Object.fromEntries(
      Object.entries(grouped).map(([status, tasks]) => [
        status,
        sortByOrder(tasks),
      ]),
    );

    set({ tasksByStatus: sorted });
  },

  addTask: async (
    projectId: string,
    title: string,
    status: string,
    priority: "LOW" | "MEDIUM" | "HIGH",
    assigned_to: number,
    description?: string,
  ) => {
    const { tasksByStatus } = get();

    // find the order for the new task
    // it always goes to todo, at the END of todo column
    const todoTasks = tasksByStatus["TODO"] ?? [];
    const lastTask = todoTasks[todoTasks.length - 1];
    const newOrder = lastTask ? lastTask.order + 1 : 1;

    // temp task for optimistic update
    const tempId = "temp-" + Date.now();
    const newTask: Task = {
      id: tempId,
      title,
      description,
      order: newOrder,
      status: "TODO",
      priority,
      assigned_to,
    };

    // 1. add to store instantly
    set((state) => ({
      tasksByStatus: {
        ...state.tasksByStatus,
        TODO: sortByOrder([...(state.tasksByStatus["TODO"] ?? []), newTask]),
      },
    }));

    try {
      const savedTask = await addTask(
        projectId,
        title,
        status,
        priority,
        newOrder,
        assigned_to,
        description,
      );

      console.log("response", savedTask);

      // 3. replace temp with real task
      set((state: TaskStore) => ({
        tasksByStatus: {
          ...state.tasksByStatus,
          TODO: state.tasksByStatus["TODO"].map((t) =>
            t.id === tempId ? savedTask.data.task : t,
          ),
        },
      }));
    } catch (err) {
      // rollback — remove temp task
      set((state) => ({
        tasksByStatus: {
          ...state.tasksByStatus,
          TODO: state.tasksByStatus["TODO"].filter((t) => t.id !== tempId),
        },
      }));
      // toast.error("Failed to create task");
    }
  },

  moveTask: async (taskId: string, newStatus: string, newIndex: number) => {
    const { tasksByStatus } = get();
    const snapshot = structuredClone(tasksByStatus);
    const { socketId } = get() 

    set({ isMoving: true });

    // find the task
    let movedTask: Task | null = null;
    let oldStatus = "";
    for (const status in tasksByStatus) {
      const found = tasksByStatus[status].find(
        (t) => String(t.id) === String(taskId),
      );
      if (found) {
        movedTask = { ...found };
        oldStatus = status;
        break;
      }
    }
    if (!movedTask) return;

    // get neighbours at destination to calculate new order
    const destColumn = tasksByStatus[newStatus] ?? [];
    const filtered = destColumn.filter((t) => t.id !== taskId); // remove self if same column
    const prevTask = filtered[newIndex - 1] ?? null;
    const nextTask = filtered[newIndex] ?? null;

    const newOrder = getOrderBetween(
      prevTask?.order ?? null,
      nextTask?.order ?? null,
    );

    // mark as pending
    set((state) => ({
      pendingMoves: new Set([...state.pendingMoves, taskId]),
    }));

    console.log(
      "moving task",
      taskId,
      "from",
      oldStatus,
      "to",
      newStatus,
      "at",
      newOrder,
    );

    // optimistic update with correct order
    set((state) => {
      const updated = structuredClone(state.tasksByStatus);
      updated[oldStatus] = updated[oldStatus].filter(
        (t) => t.id !== Number(taskId),
      );
      const taskWithNew = {
        ...movedTask!,
        status: newStatus,
        order: newOrder,
      } as Task;
      if (!updated[newStatus]) updated[newStatus] = [];
      updated[newStatus].splice(newIndex, 0, taskWithNew);
      return { tasksByStatus: updated };
    });

    try {
      // save to DB — send both new status AND new order
      await updateTask(taskId, newStatus, newOrder, socketId!);

      // unlock
      set((state) => {
        const next = new Set(state.pendingMoves);
        next.delete(taskId);
        return { pendingMoves: next };
      });
    } catch (err) {
      set((state) => {
        const next = new Set(state.pendingMoves);
        next.delete(taskId);
        return { tasksByStatus: snapshot, pendingMoves: next };
      });
      // toast.error("Failed to move task");
    } finally {
      set({ isMoving: false });
    }
  },

  updateSingleTask: (task: Task) => {
    set((state) => {
      const updated = structuredClone(state.tasksByStatus);
      for (const status in updated) {
        updated[status] = updated[status].filter((t) => t.id !== task.id);
      }
      if (!updated[task.status]) updated[task.status] = [];
      updated[task.status].push(task);
      // re-sort after inserting
      updated[task.status] = sortByOrder(updated[task.status]);
      return { tasksByStatus: updated };
    });
  },

  // store — simpler now, no index needed
applyRemoteMove: (task: Task) => {
  set((state) => {
    const updated = structuredClone(state.tasksByStatus)

    // remove from wherever it currently is
    for (const status in updated) {
      updated[status] = updated[status].filter(t => t.id !== task.id)
    }

    // add to new column
    if (!updated[task.status]) updated[task.status] = []
    updated[task.status].push(task)

    // sort by order — this puts it in the exact right position
    updated[task.status] = sortByOrder(updated[task.status])

    return { tasksByStatus: updated }
  })
}
}));


// export const use
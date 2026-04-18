import fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "../db";
import zod from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { SECRET } from "../config";
import {
  authMiddlware,
  projectAccess,
  taskAccess,
  workspaceAccess,
} from "./middleware";
import { Server } from "socket.io";

const bodySchema = zod.object({
  name: zod.string().optional(),
  email: zod.email(),
  password: zod.string(),
});

const workspaceSchema = zod.object({
  name: zod.string(),
});

const projectSchema = zod.object({
  name: zod.string(),
});

const updateSchema = zod.object({
  title: zod.string().optional(),
  description: zod.string().optional(),
  order: zod.number().optional(),
  status: zod.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: zod.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assigned_to: zod.number().optional(),
  socketId: zod.string().optional(),
});

interface User {
  name: string;
  email: string;
  password: string;
}

interface Task {
  title: string;
  description?: string;
  order: number;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assigned_to: number;
  socketId: string;
}

const server = fastify();
await server.register(cors, {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
});

const io = new Server(server.server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

server.ready().then(() => {
  io.on("connection", (socket: any) => {
    socket.on("join:project", (projectId: number) => {
      socket.join(`project:${projectId}`);
      io.emit("join:project", projectId);
    });
  });
});

server.post("/signup", async (request, reply) => {
  try {
    const { success } = bodySchema.safeParse(request.body);

    if (!success)
      return reply.status(400).send({
        success: false,
        message: "Invalid request body",
      });

    const { name, email, password } = request.body as User;

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser)
      return reply.status(400).send({
        success: false,
        message: "User already exists",
      });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: user.id }, SECRET, {
      expiresIn: "1d",
    });

    return reply.status(201).send({
      success: true,
      message: "User created successfully",
      token,
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

server.post("/signin", async (request, reply) => {
  try {
    const { success } = bodySchema.safeParse(request.body);

    if (!success)
      return reply.status(400).send({
        success: false,
        message: "Invalid request body",
      });

    const { email, password } = request.body as User;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user)
      return reply.status(400).send({
        success: false,
        message: "User not found",
      });

    if (!(await bcrypt.compare(password, user.password)))
      return reply.status(400).send({
        success: false,
        message: "Invalid password",
      });

    const token = jwt.sign({ id: user.id }, SECRET, {
      expiresIn: "1d",
    });

    return reply.status(200).send({
      success: true,
      message: "User logged in successfully",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Internal server error",
    });
  }
});

//WORKSPACE ROUTES
server.post(
  "/workspace",
  { preHandler: authMiddlware },
  async (request, reply) => {
    const { success } = workspaceSchema.safeParse(request.body);
    if (!success)
      return reply.status(400).send({
        success: false,
        message: "Invalid request body",
      });

    const userId = request.user.userId;
    const { name } = request.body as { name: string };

    try {
      const workspace = await prisma.workspace.create({
        data: {
          userId,
          name,
        },
      });
      return reply.status(200).send({
        success: true,
        message: "Workspace created successfully",
        workspace,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

server.get(
  "/workspace",
  { preHandler: authMiddlware },
  async (request, reply) => {
    const userId = request.user.userId;

    try {
      const workspaces = await prisma.workspace.findMany({
        where: {
          OR: [{ userId }, { member: { some: { userId } } }],
        },
        include: {
          _count: {
            select: {
              member: true,
              projects: true,
            },
          },
        },
      });

      return reply.status(200).send({
        success: true,
        message: "Workspace found successfully",
        workspaces,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

//MEMBER ROUTES
server.post(
  "/workspace/:id/members",
  { preHandler: authMiddlware },
  async (request, reply) => {
    const userId = request.user.userId;
    const workspaceId = parseInt((request.params as { id: string }).id);
    const { email } = request.body as { email: string };

    try {
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
        },
      });

      if (!workspace)
        return reply.status(400).send({
          success: false,
          message: "Workspace not found",
        });

      if (workspace.userId !== userId)
        return reply.status(401).send({
          success: false,
          message: "Unauthorized",
        });

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user)
        return reply.status(400).send({
          success: false,
          message: "User not found",
        });

      const existingMember = await prisma.member.findFirst({
        where: {
          workspaceId,
          userId: user.id,
        },
      });

      if (existingMember)
        return reply.status(400).send({
          success: false,
          message: "Member already exists",
        });

      const member = await prisma.member.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
        },
      });

      return reply.status(200).send({
        success: true,
        message: "Member added successfully",
        member,
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: "Unable to add member",
      });
    }
  },
);

server.get(
  "/workspace/:id/members",
  { preHandler: [authMiddlware, workspaceAccess] },
  async (request, reply) => {
    const workspaceId = request.user.workspaceId;

    try {
      const members = await prisma.member.findMany({
        where: {
          workspaceId,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return reply.status(200).send({
        success: true,
        message: "Member found successfully",
        members,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Unable to find members",
      });
    }
  },
);

//PROJECT ROUTES
server.post(
  "/project/:id",
  { preHandler: [authMiddlware, workspaceAccess] },
  async (request, reply) => {
    const { success } = projectSchema.safeParse(request.body);
    if (!success)
      return reply.status(400).send({
        success: false,
        message: "Invalid request body",
      });

    const workspaceId = request.user.workspaceId as number;
    const { name } = request.body as { name: string };

    try {
      const project = await prisma.project.create({
        data: {
          workspaceId,
          name,
        },
      });

      return reply.status(200).send({
        success: true,
        message: "Project created successfully",
        project,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Unable to create project",
      });
    }
  },
);

server.get(
  "/project/:id",
  { preHandler: [authMiddlware, workspaceAccess] },
  async (request, reply) => {
    const workspaceId = request.user.workspaceId as number;

    try {
      const projects = await prisma.project.findMany({
        where: {
          workspaceId,
        },
      });

      return reply.status(200).send({
        success: true,
        message: "Project found successfully",
        projects,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Unable to find projects",
      });
    }
  },
);

server.delete(
  "/project/:id",
  { preHandler: [authMiddlware, workspaceAccess] },
  async (request, reply) => {
    const { success } = projectSchema.safeParse(request.body);
    if (!success)
      return reply.status(400).send({
        success: false,
        message: "Invalid request body",
      });

    const workspaceId = request.user.workspaceId as number;
    const userId = request.user.userId;
    const { name } = request.body as { name: string };

    try {
      const owner = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          userId,
        },
      });

      if (!owner)
        return reply.status(401).send({
          success: false,
          message: "Unauthorized",
        });

      const projects = await prisma.project.deleteMany({
        where: {
          workspaceId,
          name,
        },
      });

      return reply.status(200).send({
        success: true,
        message: "Project found successfully",
        projects,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Unable to find projects",
      });
    }
  },
);

//TASK ROUTES
server.post(
  "/task/:id",
  { preHandler: [authMiddlware, projectAccess] },
  async (request, reply) => {
    const { success } = updateSchema.safeParse(request.body);
    if (!success)
      return reply.status(400).send({
        success: false,
        message: "Invalid request body",
      });

    const projectId = request.user.projectId as number;
    const userId = request.user.userId;
    const { title, description, order, status, priority, assigned_to } =
      request.body as Task;

    try {
      const task = await prisma.task.create({
        data: {
          projectId,
          userId,
          title,
          description,
          order,
          status,
          priority,
          assigned_to,
        },
      });

      return reply.status(200).send({
        success: true,
        message: "Task created successfully",
        task,
      });
    } catch (error) {
      console.log(error);
      return reply.status(500).send({
        success: false,
        message: "Unable to create task",
        error,
      });
    }
  },
);

server.get(
  "/task/:id",
  { preHandler: [authMiddlware, projectAccess] },
  async (request, reply) => {
    const projectId = request.user.projectId as number;

    try {
      const tasks = await prisma.task.findMany({
        where: {
          projectId,
        },
        orderBy: {
          order: "asc",
        },
      });

      return reply.status(200).send({
        success: true,
        message: "Tasks found successfully",
        tasks,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Unable to find tasks",
      });
    }
  },
);

server.put(
  "/task/:id",
  { preHandler: [authMiddlware, taskAccess] },
  async (request, reply) => {
    const taskId = request.user.taskId as number;
    const projectId = request.user.projectId as number;

    const { success } = updateSchema.safeParse(request.body);
    if (!success)
      return reply.status(400).send({
        success: false,
        message: "Invalid request body",
      });

    const { title, description, order, status, priority, assigned_to, socketId } =
      request.body as Task;

    const data = Object.fromEntries(
      Object.entries({
        title,
        description,
        order,
        status,
        priority,
        assigned_to,
        socketId,
      }).filter(([key, value]) => value !== undefined),
    );

    try {
      const updatedTask = await prisma.task.update({
        where: {
          id: taskId,
          projectId,
        },
        data,
      });

      io.to(`project:${projectId}`).emit("update", {
        task: updatedTask,
        movedBy: data.socketId,
      });

      return reply.status(200).send({
        success: true,
        message: "Task updated successfully",
        updatedTask,
      });
    } catch (error) {
      console.log(error);
      return reply.status(500).send({
        success: false,
        message: "Unable to update task",
      });
    }
  },
);

server.delete(
  "/task/:id",
  { preHandler: [authMiddlware, taskAccess] },
  async (request, reply) => {
    const taskId = request.user.taskId as number;
    const projectId = request.user.projectId as number;

    try {
      const task = await prisma.task.deleteMany({
        where: {
          id: taskId,
          projectId,
        },
      });

      return reply.status(200).send({
        success: true,
        message: "Task deleted successfully",
        task,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Unable to delete task",
      });
    }
  },
);

//COMMENT ROUTES
server.post(
  "/comment/:id",
  { preHandler: [authMiddlware, taskAccess] },
  async (request, reply) => {
    const taskId = request.user.taskId as number;
    const projectId = request.user.projectId as number;
    const userId = request.user.userId;
    const { content, socketId } = request.body as { content: string, socketId: string };

    try {
      const comment = await prisma.comment.create({
        data: {
          taskId,
          content,
          userId,
        },
      });

      console.log("socketId", socketId)

      io.to(`project:${projectId}`).emit("comment", {
        comment: comment,
        movedBy: socketId,
      });

      return reply.status(200).send({
        success: true,
        message: "Comment created successfully",
        comment,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Unable to create comment",
      });
    }
  },
);

server.get(
  "/comment/:id",
  { preHandler: [authMiddlware, taskAccess] },
  async (request, reply) => {
    const taskId = request.user.taskId as number;

    try {
      const comments = await prisma.comment.findMany({
        where: {
          taskId,
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      return reply.status(200).send({
        success: true,
        message: "Comments found successfully",
        comments,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Unable to find comments",
      });
    }
  },
);

server.delete(
  "/comment/:commentId",
  { preHandler: [authMiddlware] },
  async (request, reply) => {
    const commentId = parseInt(
      (request.params as { commentId: string }).commentId,
    );
    const userId = request.user.userId as number;

    try {
      const comment = await prisma.comment.delete({
        where: {
          id: commentId,
          userId,
        },
      });

      return reply.status(200).send({
        success: true,
        message: "Comment deleted successfully",
        comment,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Unable to delete comment",
      });
    }
  },
);

server.listen({ port: 3001 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

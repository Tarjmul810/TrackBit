import { FastifyRequest, FastifyReply } from "fastify";
import jwt, { JwtPayload } from "jsonwebtoken";
import { SECRET } from "../config";
import { prisma } from "../db";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      userId: number;
      workspaceId?: number;
      projectId?: number;
      taskId?: number;
    };
  }
}

export const authMiddlware = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const token = request.headers.authorization?.split(" ")[1];
    if (!token)
      return reply
        .status(401)
        .send({ success: false, message: "Unauthorized" });

    const decoded = jwt.verify(token, SECRET) as JwtPayload;

    if (!decoded)
      return reply.status(404).send({
        success: false,
        message: "Internal Server Error",
      });

    request.user = { userId: decoded.id };
  } catch (error) {
    return reply.status(404).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const workspaceAccess = async (request: FastifyRequest, reply: FastifyReply) => {

    const userId = request.user.userId
    const workspaceId = parseInt((request.params as { id: string }).id)
    try {
        const access = await prisma.member.findFirst({
      where: {
        workspaceId,
        OR: [
          { userId},
          { workspace: { userId } }
        ]
      }
    })

    if (!access) return reply.status(401).send({
      success: false,
      message: 'Unauthorized'
    })

    request.user.workspaceId = workspaceId

    } catch (error) {
        return reply.status(500).send({
            success: false,
            message: 'Internal server error',
            error
        })
    }
}


export const projectAccess = async (request: FastifyRequest, reply: FastifyReply) => {

    const userId = request.user.userId
    const projectId = parseInt((request.params as { id: string }).id)
    try {
      const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspace: {
          OR: [
            {userId},
            {member: {some: {userId}} }
          ]
        }
      }
    })

    if (!project) return reply.status(401).send({
      success: false,
      message: 'Unauthorized'
    })

    request.user.workspaceId = project.workspaceId
    request.user.projectId = projectId

    } catch (error) {
        return reply.status(500).send({
            success: false,
            message: 'Internal server error'
        })
    }
}

export const taskAccess = async (request: FastifyRequest, reply: FastifyReply) => {

    const userId = request.user.userId
    const taskId = parseInt((request.params as { id: string }).id)
    
    try {
        const project = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          workspace: {
            OR: [
              {userId},
              {member: {some: {userId}} }
            ]
          }
        }
      }
    })

    if (!project) return reply.status(401).send({
      success: false,
      message: 'Unauthorized'
    })

    request.user.projectId = project.projectId
    request.user.taskId = project.id

    } catch (error) {
        return reply.status(500).send({
            success: false,
            message: 'Internal server error'
        })
    }
}
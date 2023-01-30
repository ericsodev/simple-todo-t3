import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const todoRouter = createTRPCRouter({
  getTodos: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.todo.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        id: true,
        name: true,
        completed: true,
        order: true,
        desc: true,
        dueDate: true,
        completedOn: true,
      },
      orderBy: {
        order: "asc",
      },
    });
  }),
  createTodo: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        dueDate: z.date().optional(),
        desc: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.todo.create({
        data: {
          name: input.name,
          desc: input.desc,
          dueDate: input.dueDate,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),
  updateTodo: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().optional(),
        desc: z.string().optional(),
        dueDate: z.date().min(new Date()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.todo.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          desc: input.desc,
          dueDate: input.dueDate,
        },
      });
    }),
  reorderTodos: protectedProcedure
    .input(z.object({ todoId: z.string().cuid(), newOrder: z.number().min(0) }))
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.prisma.todo.findFirst({
        where: {
          id: input.todoId,
          userId: ctx.session.user.id,
        },
      });

      if (!todo) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.prisma.$transaction([
        ctx.prisma.todo.updateMany({
          where: {
            userId: ctx.session.user.id,
            order: {
              gt: todo.order,
              lt: input.newOrder,
            },
          },
          data: {
            order: {
              decrement: 1,
            },
          },
        }),
        ctx.prisma.todo.updateMany({
          where: {
            userId: ctx.session.user.id,
            order: {
              gte: input.newOrder,
            },
          },
          data: {
            order: {
              increment: 1,
            },
          },
        }),
        ctx.prisma.todo.update({
          where: {
            id: todo.id,
          },
          data: {
            order: input.newOrder,
          },
        }),
      ]);
    }),
});

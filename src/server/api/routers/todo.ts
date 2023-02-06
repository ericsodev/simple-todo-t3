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
      const count = await ctx.prisma.todo.count({
        where: {
          userId: ctx.session.user.id,
        },
      });
      await ctx.prisma.todo.create({
        data: {
          name: input.name,
          desc: input.desc,
          dueDate: input.dueDate,
          order: count + 1,
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
      if (todo.userId !== ctx.session.user.id)
        throw new TRPCError({ code: "UNAUTHORIZED" });
      console.log("hey yo");
      if (todo.order > input.newOrder) {
        // shift down
        await ctx.prisma.$transaction([
          ctx.prisma.todo.updateMany({
            where: {
              userId: ctx.session.user.id,
              order: {
                gte: input.newOrder,
                lt: todo.order,
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
      } else if (todo.order < input.newOrder) {
        //shift up
        await ctx.prisma.$transaction([
          ctx.prisma.todo.updateMany({
            where: {
              userId: ctx.session.user.id,
              order: {
                gt: todo.order,
                lte: input.newOrder,
              },
            },
            data: {
              order: {
                decrement: 1,
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
      }
    }),
  deleteTodo: protectedProcedure
    .input(z.object({ todoId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      // Shift todos with order greater than deleted todo down by one
      const toDelete = await ctx.prisma.todo.findUnique({
        where: {
          id: input.todoId,
        },
      });
      if (toDelete === null) throw new TRPCError({ code: "NOT_FOUND" });
      if (toDelete.userId !== ctx.session.user.id)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      await ctx.prisma.$transaction([
        ctx.prisma.todo.delete({
          where: {
            id: toDelete.id,
          },
        }),
        ctx.prisma.todo.updateMany({
          where: {
            userId: ctx.session.user.id,
            order: {
              gt: toDelete.order,
            },
          },
          data: {
            order: {
              decrement: 1,
            },
          },
        }),
      ]);
    }),
});

import { db } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  fetchUserData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user;
  }),
});

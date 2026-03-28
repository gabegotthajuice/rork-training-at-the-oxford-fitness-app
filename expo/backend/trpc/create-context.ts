import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { cloudStorage } from "@/backend/lib/cloud-storage";

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    req: opts.req,
    db: cloudStorage,
    // You can add more context items here like database connections, auth, etc.
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// For now, we'll use publicProcedure as protectedProcedure
// In a real app, you'd add authentication middleware here
export const protectedProcedure = t.procedure;
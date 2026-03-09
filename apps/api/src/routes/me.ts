import { Router, Request, Response } from "express";
import type { User } from "@supabase/supabase-js";

type ReqWithUser = Request & { user: User };

export const meRouter = Router();

meRouter.get("/", (req: ReqWithUser, res: Response) => {
  const { id, email } = req.user;
  res.json({ id, email });
});

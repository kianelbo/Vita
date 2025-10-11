import { Router, Request, Response } from "express";
import { prisma } from "../prisma/client";

const router = Router();

/**
 * POST /api/users
 * Body: { email, username, name }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { email, username, isPrivate } = req.body;

    const user = await prisma.user.upsert({
      where: { email },
      update: { username, isPrivate },
      create: { email, username, isPrivate },
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create / update user." });
  }
});

export default router;

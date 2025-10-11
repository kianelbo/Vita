import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { prisma } from "../prisma/client";

const router = Router();

router.get("/:username", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const journals = await prisma.journal.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    });

    res.json(journals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch journals" });
  }
});

router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { date, color, content, isPrivate } = req.body;

    const journal = await prisma.journal.upsert({
      where: {
        userId_date: {
          userId: userId,
          date: new Date(date),
        },
      },
      update: { color, content, isPrivate },
      create: { userId: userId, date: new Date(date), color, content, isPrivate },
    });

    res.json(journal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create or update journal" });
  }
});

export default router;

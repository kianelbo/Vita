import { Router, Request, Response } from "express";
import { prisma } from "../prisma/client";

const router = Router();

/**
 * GET /api/journals/:username
 * Fetch all journals of a user by username
 */
router.get("/:username", async (req: Request, res: Response) => {
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

/**
 * POST /api/journals
 * Create or update a journal entry
 * Body: { username, date, color, content }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { username, date, color, content, isPrivate } = req.body;

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const journal = await prisma.journal.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: new Date(date),
        },
      },
      update: { color, content, isPrivate },
      create: { userId: user.id, date: new Date(date), color, content, isPrivate },
    });

    res.json(journal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create or update journal" });
  }
});

export default router;

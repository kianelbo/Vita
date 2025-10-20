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

    const year = parseInt(req.query.year as string, 10) || new Date().getFullYear()
    const entries = await prisma.journal.findMany({
      where: {
        user: { username },
        date: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`)
        }
      },
      select: { date: true, color: true, content: true, isPrivate: true }
    })

    const formatted = entries.map(e => ({
      ...e,
      date: e.date.toISOString().slice(0, 10)
    }))
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

router.get('/:username/years', async (req: AuthRequest, res: Response) => {
  const { username } = req.params;

  const years = [2025, 2024, 2023];
  res.json(years);
});

router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { date, color, content, isPrivate } = req.body;

    const journalDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    if (journalDate > today) {
      return res.status(400).json({ error: "Cannot set journal for a future date" });
    }
    if (journalDate < threeDaysAgo) {
      return res.status(400).json({ error: "Cannot set journal for a date older than 3 days" });
    }

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

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Router, Request, Response } from "express";
import { prisma } from "../prisma/client";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = "7d";

const router = Router();

function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, hashedPassword },
    });

    const token = signToken(user.id);
    res.status(201).json({
      user: { id: user.id, email: user.email, username: user.username },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.hashedPassword);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user.id);
    res.json({
      user: { id: user.id, email: user.email, username: user.username },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;

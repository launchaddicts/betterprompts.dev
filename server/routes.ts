import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { sharedPrompts, votes, users } from "@db/schema";
import { desc, eq, and, sql } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Set up authentication routes
  setupAuth(app);

  app.post('/api/enhance', async (req, res) => {
    const { prompt, model } = req.body;
    
    if (!prompt || !model) {
      return res.status(400).json({ error: 'Missing prompt or model' });
    }

    try {
      // For now, enhancement is done client-side
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Enhancement failed' });
    }
  });

  // Get all shared prompts with vote counts
  app.get('/api/shared-prompts', async (req, res) => {
    try {
      const result = await db.query.sharedPrompts.findMany({
        orderBy: [desc(sharedPrompts.createdAt)],
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              password: false,
            },
          },
          votes: true,
        },
      });

      // Transform the result to include vote counts
      const promptsWithVotes = result.map(prompt => {
        const upvotes = prompt.votes.filter(vote => vote.value === 1).length;
        const downvotes = prompt.votes.filter(vote => vote.value === -1).length;
        const score = upvotes - downvotes;

        return {
          ...prompt,
          votes: undefined, // Remove the individual votes
          upvotes,
          downvotes,
          score,
        };
      });

      res.json(promptsWithVotes);
    } catch (error) {
      console.error("Error fetching shared prompts:", error);
      res.status(500).json({ error: 'Failed to fetch shared prompts' });
    }
  });

  // Get a single shared prompt by ID
  app.get('/api/shared-prompts/:id', async (req, res) => {
    const promptId = parseInt(req.params.id);
    if (isNaN(promptId)) {
      return res.status(400).json({ error: 'Invalid prompt ID' });
    }

    try {
      const [prompt] = await db.query.sharedPrompts.findMany({
        where: eq(sharedPrompts.id, promptId),
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              password: false,
            },
          },
          votes: true,
        },
        limit: 1,
      });

      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      const upvotes = prompt.votes.filter(vote => vote.value === 1).length;
      const downvotes = prompt.votes.filter(vote => vote.value === -1).length;
      const score = upvotes - downvotes;

      // Check if current user has voted
      let userVote = null;
      if (req.isAuthenticated()) {
        const userId = (req.user as any).id;
        const userVoteObj = prompt.votes.find(vote => vote.userId === userId);
        if (userVoteObj) {
          userVote = userVoteObj.value;
        }
      }

      res.json({
        ...prompt,
        votes: undefined,
        upvotes,
        downvotes,
        score,
        userVote,
      });
    } catch (error) {
      console.error("Error fetching shared prompt:", error);
      res.status(500).json({ error: 'Failed to fetch shared prompt' });
    }
  });

  // Create a new shared prompt
  app.post('/api/shared-prompts', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'You must be logged in to share prompts' });
    }

    const { title, content, model, systemPrompt } = req.body;
    
    if (!title || !content || !model || !systemPrompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const userId = (req.user as any).id;
      const [newPrompt] = await db.insert(sharedPrompts)
        .values({
          title,
          content,
          model,
          systemPrompt,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      res.status(201).json(newPrompt);
    } catch (error) {
      console.error("Error creating shared prompt:", error);
      res.status(500).json({ error: 'Failed to create shared prompt' });
    }
  });

  // Vote on a prompt
  app.post('/api/shared-prompts/:id/vote', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'You must be logged in to vote' });
    }

    const promptId = parseInt(req.params.id);
    const { value } = req.body;
    
    if (isNaN(promptId)) {
      return res.status(400).json({ error: 'Invalid prompt ID' });
    }
    
    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: 'Vote value must be 1 (upvote) or -1 (downvote)' });
    }

    try {
      const userId = (req.user as any).id;
      
      // Check if the user has already voted on this prompt
      const existingVotes = await db.select()
        .from(votes)
        .where(and(
          eq(votes.userId, userId),
          eq(votes.promptId, promptId)
        ));

      if (existingVotes.length > 0) {
        // Update existing vote
        await db.update(votes)
          .set({ value })
          .where(and(
            eq(votes.userId, userId),
            eq(votes.promptId, promptId)
          ));
      } else {
        // Create new vote
        await db.insert(votes)
          .values({
            value,
            userId,
            promptId,
            createdAt: new Date(),
          });
      }

      // Get updated vote counts
      const [prompt] = await db.query.sharedPrompts.findMany({
        where: eq(sharedPrompts.id, promptId),
        with: { votes: true },
        limit: 1,
      });

      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      const upvotes = prompt.votes.filter(vote => vote.value === 1).length;
      const downvotes = prompt.votes.filter(vote => vote.value === -1).length;
      const score = upvotes - downvotes;

      res.json({ upvotes, downvotes, score });
    } catch (error) {
      console.error("Error voting on prompt:", error);
      res.status(500).json({ error: 'Failed to vote on prompt' });
    }
  });

  // Get user's shared prompts
  app.get('/api/my-prompts', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'You must be logged in to view your prompts' });
    }

    try {
      const userId = (req.user as any).id;
      const result = await db.query.sharedPrompts.findMany({
        where: eq(sharedPrompts.userId, userId),
        orderBy: [desc(sharedPrompts.createdAt)],
        with: { votes: true },
      });

      // Transform the result to include vote counts
      const promptsWithVotes = result.map(prompt => {
        const upvotes = prompt.votes.filter(vote => vote.value === 1).length;
        const downvotes = prompt.votes.filter(vote => vote.value === -1).length;
        const score = upvotes - downvotes;

        return {
          ...prompt,
          votes: undefined,
          upvotes,
          downvotes,
          score,
        };
      });

      res.json(promptsWithVotes);
    } catch (error) {
      console.error("Error fetching user prompts:", error);
      res.status(500).json({ error: 'Failed to fetch your prompts' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { Hono } from "hono";
import { z } from "zod";
import { cloudStorage } from "../lib/cloud-storage";

const postSchema = z.object({
  text: z.string().min(1).max(1000),
  author_id: z.string().optional(),
  author_name: z.string().optional(),
  image_url: z.string().url().optional()
});

export const communityRouter = new Hono();

// Post to GroupMe
communityRouter.post("/post", async (c) => {
  try {
    const body = await c.req.json();
    const data = postSchema.parse(body);
    
    const botId = process.env.GROUPME_BOT_ID;
    
    if (!botId) {
      // Fallback to local storage if GroupMe not configured
      const post = {
        id: `post_${Date.now()}`,
        ...data,
        timestamp: new Date().toISOString(),
        source: "local"
      };
      
      const posts = await cloudStorage.get("community:posts") || [];
      posts.unshift(post);
      posts.splice(100); // Keep last 100 posts
      await cloudStorage.set("community:posts", posts);
      
      return c.json({ success: true, post });
    }
    
    // Post to GroupMe
    const response = await fetch("https://api.groupme.com/v3/bots/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bot_id: botId,
        text: data.text,
        attachments: data.image_url ? [{
          type: "image",
          url: data.image_url
        }] : []
      })
    });
    
    if (!response.ok) {
      throw new Error(`GroupMe API error: ${response.status}`);
    }
    
    // Store in cloud for history
    const post = {
      id: `post_${Date.now()}`,
      ...data,
      timestamp: new Date().toISOString(),
      source: "groupme"
    };
    
    const posts = await cloudStorage.get("community:posts") || [];
    posts.unshift(post);
    posts.splice(100);
    await cloudStorage.set("community:posts", posts);
    
    return c.json({ success: true, post });
  } catch (error) {
    console.error("Community post error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to post" 
    }, 400);
  }
});

// Get latest posts
communityRouter.get("/latest", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "20");
    const groupId = process.env.GROUPME_GROUP_ID;
    const token = process.env.GROUPME_TOKEN;
    
    if (!groupId || !token) {
      // Return local posts if GroupMe not configured
      const posts = await cloudStorage.get("community:posts") || [];
      return c.json({ 
        posts: posts.slice(0, limit),
        source: "local"
      });
    }
    
    // Fetch from GroupMe
    const response = await fetch(
      `https://api.groupme.com/v3/groups/${groupId}/messages?token=${token}&limit=${limit}`,
      {
        headers: { "Content-Type": "application/json" }
      }
    );
    
    if (!response.ok) {
      // Fallback to local posts
      const posts = await cloudStorage.get("community:posts") || [];
      return c.json({ 
        posts: posts.slice(0, limit),
        source: "local"
      });
    }
    
    const data = await response.json();
    
    // Transform GroupMe messages
    const posts = data.response.messages.map((msg: any) => ({
      id: msg.id,
      text: msg.text,
      author_id: msg.user_id,
      author_name: msg.name,
      timestamp: new Date(msg.created_at * 1000).toISOString(),
      likes: msg.favorited_by?.length || 0,
      attachments: msg.attachments,
      source: "groupme"
    }));
    
    // Cache in cloud storage
    await cloudStorage.set("community:posts", posts);
    
    return c.json({ posts, source: "groupme" });
  } catch (error) {
    console.error("Community latest error:", error);
    
    // Fallback to cached posts
    const posts = await cloudStorage.get("community:posts") || [];
    return c.json({ 
      posts: posts.slice(0, 20),
      source: "cached",
      error: "Using cached data"
    });
  }
});

// Get community stats
communityRouter.get("/stats", async (c) => {
  try {
    const posts = await cloudStorage.get("community:posts") || [];
    const activeUsers = new Set(posts.map((p: any) => p.author_id).filter(Boolean));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPosts = posts.filter((p: any) => 
      new Date(p.timestamp) >= today
    );
    
    return c.json({
      total_posts: posts.length,
      active_users: activeUsers.size,
      posts_today: todayPosts.length,
      last_activity: posts[0]?.timestamp || null
    });
  } catch (error) {
    console.error("Community stats error:", error);
    return c.json({ 
      error: "Failed to get stats" 
    }, 500);
  }
});
import express from "express";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import path from "path";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";
import { createTestChannel } from "./lib/stream.js"; // ⭐ ADDED
import { clerkMiddleware } from '@clerk/express'
import { protectRoute } from "./middleware/protectRoute.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
app.use(express.json());
app.use(clerkMiddleware());

const __dirname = path.resolve();
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/chat", chatRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

const startServer = async () => {
    try {
        await connectDB();

        await createTestChannel(); // ⭐ ADDED

        app.listen(ENV.PORT, () => {
            console.log("Server is running on port ", ENV.PORT);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

startServer();

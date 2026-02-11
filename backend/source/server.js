import express from "express";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import path from "path";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";

const app = express();
app.use(express.json());

const __dirname = path.resolve();
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/health", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});


const startServer = async () => {
    try {
        await connectDB();
        app.listen(ENV.PORT, () => {
            console.log("Server is running on port ", ENV.PORT);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};
startServer();
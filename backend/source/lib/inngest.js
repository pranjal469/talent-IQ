import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { upsertStreamUser, deleteStreamUser } from "./stream.js";

export const inngest = new Inngest({ id: "talent-iq" });


// ================= USER CREATE SYNC =================

const syncUser = inngest.createFunction(
    { id: "sync-user" },
    { event: "clerk/user.created" },
    async ({ event }) => {
        await connectDB();

        const {
            id,
            email_addresses,
            first_name,
            last_name,
            image_url,
        } = event.data;

        // ✅ Prevent duplicate users (important for webhook retries)
        const existingUser = await User.findOne({ clerkId: id });
        if (existingUser) return;

        // 1️⃣ Save user in MongoDB
        const newUser = await User.create({
            clerkId: id,
            email: email_addresses?.[0]?.email_address || "",
            name: `${first_name || ""} ${last_name || ""}`.trim(),
            profilePicture: image_url,
        });

        // 2️⃣ Sync user to Stream (using Clerk ID as Stream ID)
        await upsertStreamUser({
            id: id, // ✅ Clerk ID used as Stream user ID
            name: newUser.name,
            image: newUser.profilePicture,
        });

        console.log("✅ User synced to MongoDB and Stream");
    }
);


// ================= USER DELETE SYNC =================

const deleteUserFromDB = inngest.createFunction(
    { id: "delete-user" },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        await connectDB();

        const { id } = event.data;

        // 1️⃣ Delete user from Stream (Clerk ID)
        await deleteStreamUser(id);

        // 2️⃣ Delete user from MongoDB
        await User.deleteOne({ clerkId: id });

        console.log("✅ User deleted from MongoDB and Stream");
    }
);


export const functions = [syncUser, deleteUserFromDB];

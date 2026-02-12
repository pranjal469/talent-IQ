import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
    throw new Error("Missing Stream API key or secret");
}

// Initialize Stream server client
const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export { chatClient };


// ================= USER FUNCTIONS =================

export const upsertStreamUser = async (userData) => {
    try {
        await chatClient.upsertUser(userData);
        console.log(`✅ User ${userData.id} upserted to Stream`);
    } catch (error) {
        console.error("❌ Error upserting user:", error);
    }
};

export const deleteStreamUser = async (userId) => {
    try {
        await chatClient.deleteUser(userId);
        console.log(`✅ User ${userId} deleted from Stream`);
    } catch (error) {
        console.error("❌ Error deleting user:", error);
    }
};


// ================= TEST CHANNEL CREATION =================

export const createTestChannel = async () => {
    try {
        // 1️⃣ Ensure user exists
        await chatClient.upsertUser({
            id: "test-user",
            name: "Test User",
        });

        // 2️⃣ Create channel (FIXED HERE 👇)
        const channel = chatClient.channel("messaging", "test-channel", {
            members: ["test-user"],
            created_by_id: "test-user",   // ⭐ REQUIRED FOR SERVER SIDE
        });

        await channel.create();

        // 3️⃣ Send test message
        await channel.sendMessage({
            text: "Hello from backend!",
            user_id: "test-user",
        });

        console.log("✅ Channel and message created successfully");
    } catch (error) {
        console.error("❌ Error creating test channel:", error);
    }
};

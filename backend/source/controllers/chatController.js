export const getStreamToken = async (req, res) => {
    try {
        const userId = req.user.clerkId;
        const token = chatClient.createToken(userId);
        res.status(200).json({
            token,
            userId: req.user.clerkId,
            userName: req.user.name,
            userImage: req.user.profilePicture,



        });

    } catch (error) {
        console.error("Error getting token:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
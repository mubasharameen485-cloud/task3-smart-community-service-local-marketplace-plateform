import Message from './chat.model.js';

export const sendMessage = async (req, res) => {
    try {
        const { receiverId, text } = req.body;
        const senderId = req.user.id;

        let imageUrl = '';
        
        
        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        }

        if (!text && !imageUrl) {
            return res.status(400).json({ success: false, message: 'Message cannot be empty' });
        }

        const newMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            text: text || '',
            image: imageUrl
        });

        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        console.error("Chat Send Error:", error);
        res.status(500).json({ success: false, message: 'Error sending message' });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        }).sort({ createdAt: 1 });

        
        await Message.updateMany(
            { sender: receiverId, receiver: senderId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching chat history' });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const senderId = req.user.id;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

        if (String(message.sender) !== String(senderId)) {
            return res.status(403).json({ success: false, message: 'You can only delete your own messages' });
        }

        await Message.findByIdAndDelete(messageId);
        res.status(200).json({ success: true, message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting message' });
    }
};
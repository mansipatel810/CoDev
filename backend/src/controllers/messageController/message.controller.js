const Message = require('../../models/messageModel/message.model.js');



const getProjectMessages = async (req, res, next) => {
    
  try {
    const { projectId } = req.params;
    const messages = await Message.find({ project: projectId }).populate('sender', 'userName email _id').sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: messages }); 
  } catch  (err) {
    return next(new customError(err.message, 500));
  }
};

const deleteMessage = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { messageId } = req.params;
        const message = await Message.findById(messageId);
        if (!message) {
            return next(new customError('Message not found', 404));
        }
        if (message.project.toString() !== projectId) {
            return next(new customError('Unauthorized', 403));
        }
        await Message.findByIdAndDelete(messageId);
        res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } catch (err) {
        return next(new customError(err.message, 500));
    }
}

module.exports = {
    getProjectMessages,
    deleteMessage
}
const ai=require("../../services/ai.service")
const customError = require("../../utils/customError");

const aiController = async (req, res, next) => {
    try {
        const { prompt } = req.query;
        if (!prompt) {
            return res.status(400).json({ error: 'Please provide a prompt' });
        }
        const result = await ai.genrateResult(prompt);
        if (!result) {
            return res.status(400).json({ error: 'AI response not generated' });
        }
        res.send(result)
    } catch (error) {
        return next(new customError(error.message, 500));
    }
}

module.exports = {
    aiController
}
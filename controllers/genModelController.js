import { GoogleGenerativeAI } from "@google/generative-ai";

const api_key = process.env.GEM_API_KEY;
const genAI = new GoogleGenerativeAI(api_key);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const genModel = async (prompt) => {
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
}

const generateContent = async (req, res) => {
    const prompt  = req.body.prompt;
    try {
        const generatedContent = await genModel(prompt);
        res.json({ generatedContent });
    } catch (error) {
        res.status(500).json({ message: "Error generating content" });
    }
}

export default generateContent;




const gemini = require("./gemini");
const openai = require("./openai");
const claude = require("./claude");

exports.generateContent = async (provider, prompt) => {

    switch (provider) {

        case "gpt":
            return openai.generateContent(prompt);

        case "claude":
            return claude.generateContent(prompt);

        case "gemini":
        default:
            return gemini.generateContent(prompt);

    }

};
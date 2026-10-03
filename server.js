import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.use(express.static("."));


const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


app.post("/api/chat", async (req, res) => {

    try {

        const { message, climateData } = req.body;

        if (!message) {

            return res.status(400).json({
                error: "Message is required"
            });

        }


        const climateContext = `

Current INDRA Vision data:

Location: ${climateData?.location ?? "Unknown"}

Latitude: ${climateData?.latitude ?? "Unknown"}

Longitude: ${climateData?.longitude ?? "Unknown"}

Current temperature:
${climateData?.temperature ?? "Unknown"} °C

Humidity:
${climateData?.humidity ?? "Unknown"} %

Current precipitation:
${climateData?.rainfall ?? "Unknown"} mm

`;


        const response = await client.responses.create({

            model: "gpt-6-luna",

            instructions: `

You are INDRA AI, the AI assistant
inside the INDRA Vision climate monitoring website.

You are a general-purpose AI assistant.

You can answer questions about:

• Climate
• Environment
• Weather
• Science
• Physics
• Chemistry
• Mathematics
• Programming
• Technology
• History
• Geography
• Education
• General knowledge
• Writing
• Coding
• Everyday questions

You should NOT only answer climate questions.

If the user asks a general question,
answer it normally.

If the user asks about the current
weather, climate or location, use the
INDRA Vision data provided below.

Explain complicated concepts simply.

For educational questions, provide
clear explanations and examples.

Never invent data.

If you don't know something,
say that you don't know.

Current INDRA Vision information:

${climateContext}

`,

            input: message

        });


        res.json({

            answer: response.output_text

        });


    }

    catch (error) {

        console.error("INDRA AI ERROR:", error);

        res.status(500).json({

            error: "INDRA AI could not process your question."

        });

    }

});


const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `INDRA Vision running at http://localhost:${PORT}`
    );

});
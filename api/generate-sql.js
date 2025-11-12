// This file should be at a path like '/api/generate-sql.js'
// This code runs on a SERVER, not in the browser.

// Defines the JSON schema we expect from the AI.
// This now lives on the backend.
const AI_RESPONSE_SCHEMA = {
    type: "OBJECT",
    properties: {
        metricId: { 
            type: "STRING",
            description: "The 'id' of the single best matching metric from the registry. Use 'none' if no match."
        },
        startDate: { 
            type: "STRING", 
            description: "The start date in YYYY-MM-DD format. Infer from user's query. Use 'NOT_SPECIFIED' if not found." 
        },
        endDate: { 
            type: "STRING",
            description: "The end date in YYYY-MM-DD format. Infer from user's query. Use 'NOT_SPECIFIED' if not found."
        },
        product: { 
            type: "STRING",
            description: "The product (e.g., 'GoRide', 'GoCar'). Use 'All' if not specified."
        },
        region: {
            type: "STRING",
            description: "The region or city (e.g., 'Jakarta'). Use 'All' if not specified."
        }
    },
    required: ["metricId", "startDate", "endDate", "product", "region"]
};

// Use 'export default' for Vercel/Netlify compatibility.
// If using a different framework, adapt the export.
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { userQuery, systemPrompt } = req.body;

        if (!userQuery || !systemPrompt) {
            return res.status(400).json({ error: 'Missing userQuery or systemPrompt' });
        }
        
        // 1. Get the API key securely from environment variables
        //    NEVER hard-code your key!
        const apiKey = process.env.GEMINI_API_KEY; 

        if (!apiKey) {
            // This error will be shown on the server logs
            console.error("API key is not configured on the server.");
            // This error will be sent to the user
            throw new Error("API service is not configured.");
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        // 2. Prepare the payload for the Google API
        const payload = {
            contents: [
                { parts: [{ text: userQuery }] }
            ],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: AI_RESPONSE_SCHEMA // Use the schema defined above
            }
        };

        // 3. Make the secure call to Google from the server
        const googleResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)    
        });

        // 4. Handle errors from the Google API
        if (!googleResponse.ok) {
            const errorResult = await googleResponse.json();
            console.error('Google API Error:', errorResult.error?.message);
            throw new Error(errorResult.error?.message || 'Google API Error');
        }

        const result = await googleResponse.json();
        const candidate = result.candidates?.[0];

        // 5. Send the successful response back to the frontend
        if (candidate && candidate.content?.parts?.[0]?.text) {
            // The API returns the JSON as a string, so we parse it
            const aiJson = JSON.parse(candidate.content.parts[0].text);
            // Send the parsed JSON object back to the frontend
            res.status(200).json(aiJson);
        } else {
            console.error('AI response was empty or malformed');
            throw new Error('AI response was empty or malformed.');
        }

    } catch (error) {
        // 6. Handle any other errors
        console.error('Backend Error:', error.message);
        // Send a generic error message back to the frontend
        res.status(500).json({ error: error.message || 'An unknown error occurred' });
    }
}

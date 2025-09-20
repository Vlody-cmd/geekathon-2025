const express = require('express');
const cors = require('cors');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize AWS Bedrock client with default credential provider chain
const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
});

// Helper function to interact with Bedrock
async function getAIResponse(prompt) {
    try {
        const body = {
            inputText: prompt,
            textGenerationConfig: {
                maxTokenCount: 300,
                temperature: 0.5,
                topP: 1,
                stopSequences: []
            }
        };

        const command = new InvokeModelCommand({
            modelId: "amazon.titan-text-premier-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(body)
        });

        console.log('Sending request to Bedrock with body:', JSON.stringify(body, null, 2));
        
        const response = await bedrockClient.send(command);
        console.log('Raw response from Bedrock:', response);
        
        const responseData = JSON.parse(new TextDecoder().decode(response.body));
        console.log('Parsed response data:', responseData);
        
        return responseData.results[0].outputText;
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            code: error.code,
            name: error.name,
            stack: error.stack,
            metadata: error.$metadata,
        });
        throw error;
    }
}

// Test AWS credentials endpoint
app.get('/api/test-aws', async (req, res) => {
    try {
        console.log('Testing AWS credentials with environment:', {
            region: process.env.AWS_REGION,
            hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
            hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
        });

        const testPrompt = "Hello, this is a test message.";
        const response = await getAIResponse(testPrompt);
        res.json({ 
            status: 'success', 
            message: 'AWS credentials are valid',
            response 
        });
    } catch (error) {
        console.error('AWS Test Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'AWS credentials validation failed',
            error: {
                code: error.code,
                message: error.message,
                name: error.name,
                metadata: error.$metadata
            }
        });
    }
});

// Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        aws: {
            region: process.env.AWS_REGION,
            hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
            hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
        }
    });
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = await getAIResponse(message);
        res.json({ response });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: {
                code: error.code,
                message: error.message,
                name: error.name
            }
        });
    }
});

// Load suggestions endpoint
app.get('/api/loads/suggestions', async (req, res) => {
    try {
        const prompt = "Given the current load in Kyiv, suggest optimal routes for delivery";
        const aiSuggestions = await getAIResponse(prompt);
        
        const suggestions = {
            ai_recommendation: aiSuggestions,
            available_loads: [
                {
                    id: '1',
                    type: 'Electronics',
                    weight: 15,
                    from: 'Kyiv, Ukraine',
                    to: 'Lviv, Ukraine',
                    distance: 540,
                    urgent: true
                },
                {
                    id: '2',
                    type: 'Construction Materials',
                    weight: 25,
                    from: 'Odesa, Ukraine',
                    to: 'Kharkiv, Ukraine',
                    distance: 830,
                    urgent: false
                }
            ]
        };

        res.json(suggestions);
    } catch (error) {
        console.error('Error getting load suggestions:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: {
                code: error.code,
                message: error.message,
                name: error.name
            }
        });
    }
});

// Start server
const PORT = process.env.PORT || 7072;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
    console.log('AWS Configuration:', {
        region: process.env.AWS_REGION,
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });
});
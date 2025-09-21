const express = require('express');
const cors = require('cors');
const path = require('path');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config();

// Load the generated loads data
let loadsData;
try {
    loadsData = require('./data/generated_loads.json');
    console.log(`Loaded ${loadsData.active_loads.length} loads from database`);
} catch (error) {
    console.error('Error loading loads data:', error);
    // Fallback to template data
    loadsData = require('./data/loads.json');
    console.log('Using template data as fallback');
}

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
                maxTokenCount: 4096,
                temperature: 0.7,
                topP: 0.9,
                stopSequences: []
            }
        };

        const command = new InvokeModelCommand({
            modelId: "amazon.titan-text-express-v1",
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
// Helper function to normalize city names
const normalizeCity = (city) => city.toLowerCase().replace(/ /g, '_');

app.get('/api/stops/info', async (req, res) => {
    try {
        const { currentCity } = req.query;
        
        if (!currentCity) {
            return res.status(400).send('Current city is required');
        }

        const prompt = `Suggest exactly 5 truck stops in or near ${currentCity}, Portugal. Return your response in EXACTLY this format for each stop:

    The response should be in this format JSON and dont add any other text or explanation please return only the JSON object:

{
Name: [stop name],
Location Coordinates: [latitude, longitude],
Operating Hours: [hours],
Conditions: [conditions],
Bathrooms: [bathrooms],
Shower: [shower],
Rating: [rating],
}


You should replace the variables with the actual name of the stop, the coordinates of the stop and the operating hours of the stop.
[stop name] -> Should be the name of the stop, THE REAL NAME OF THE STOP.
[latitude, longitude] -> Should be the coordinates of the stop .
[hours] -> Should be the operating hours of the stop.
[conditions] -> Should be the conditions of the stop.
[bathrooms] -> Should be the bathrooms of the stop.
[shower] -> Should be the shower of the stop.
[rating] -> Should be the rating of the stop.


Return ONLY 5 stops.

Use realistic coordinates near ${currentCity} and focus on 24/7 facilities when possible.`;

        // Helper function to extract JSON from response
        const extractJsonFromResponse = (response) => {
            try {
                // Find the JSON part between triple backticks if present
                const match = response.match(/```(?:json)?\s*(\[|\{[\s\S]*\}|\])\s*```/);
                if (match) {
                    return match[1];
                }

                // If no backticks, try to find first { and last }
                const start = response.indexOf('{');
                const end = response.lastIndexOf('}') + 1;
                if (start >= 0 && end > start) {
                    return response.substring(start, end);
                }

                // If no JSON found, return null
                return null;
            } catch (error) {
                console.error('Error extracting JSON:', error);
                return null;
            }
        };

        // Get AI suggestions
        const suggestions = await getAIResponse(prompt);
        console.log('Raw AI Suggestions:', suggestions);
        
        // Extract JSON part and parse it
        const jsonPart = extractJsonFromResponse(suggestions);
        if (!jsonPart) {
            return res.status(500).json({
                success: false,
                error: 'Could not extract valid JSON from response'
            });
        }

        try {
            // Parse the JSON to ensure it's valid
            const parsedJson = JSON.parse(jsonPart);
            
            // Send the parsed JSON with success status
            res.json({
                success: true,
                data: parsedJson
            });
        } catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(500).json({
                success: false,
                error: 'Invalid JSON format in response'
            });
        }
    } catch (error) {
        console.error('Error getting truck stops:', error);
        res.status(500).send('Error getting truck stop suggestions');
    }
});

app.get('/api/loads/suggestions', async (req, res) => {
    try {
        const { currentCity, destinationCity } = req.query;
        if (!currentCity) {
            return res.status(400).json({ error: 'Current city is required' });
        }

        // Helper function to normalize city names
        const normalizeCity = (city) => city.toLowerCase().replace(/ /g, '_');
        
        // Find direct routes from current city to destination
        const directRoutes = loadsData.active_loads.filter(load => {
            const fromMatches = normalizeCity(load.from) === normalizeCity(currentCity);
            const toMatches = !destinationCity || normalizeCity(load.to) === normalizeCity(destinationCity);
            return fromMatches && toMatches;
        });

        // If we don't have 5 direct routes and destination is specified, find connecting routes
        let connectingRoutes = [];
        if (destinationCity && directRoutes.length < 5) {
            const visited = new Set(directRoutes.map(route => normalizeCity(route.from)));
            const routesByCity = new Map();

            // Create a map of routes by city
            loadsData.active_loads.forEach(load => {
                const fromCity = normalizeCity(load.from);
                if (!routesByCity.has(fromCity)) {
                    routesByCity.set(fromCity, []);
                }
                routesByCity.get(fromCity).push(load);
            });

            // Find connecting routes (maximum one stop)
            loadsData.active_loads
                .filter(firstLeg => normalizeCity(firstLeg.from) === normalizeCity(currentCity))
                .forEach(firstLeg => {
                    const intermediateCity = normalizeCity(firstLeg.to);
                    if (!visited.has(intermediateCity)) {
                        const secondLegs = loadsData.active_loads.filter(load => 
                            normalizeCity(load.from) === intermediateCity && 
                            normalizeCity(load.to) === normalizeCity(destinationCity)
                        );

                        secondLegs.forEach(secondLeg => {
                            connectingRoutes.push({
                                type: "Connecting",
                                first_leg: firstLeg,
                                second_leg: secondLeg,
                                total_distance: firstLeg.distance + secondLeg.distance,
                                total_time: firstLeg.estimated_time + secondLeg.estimated_time,
                                connection_city: firstLeg.to,
                                from: firstLeg.from,
                                to: secondLeg.to,
                                urgent: firstLeg.urgent || secondLeg.urgent
                            });
                        });
                    }
                });

            // Sort connecting routes by total distance
            connectingRoutes.sort((a, b) => a.total_distance - b.total_distance);
        }

        // Combine direct and connecting routes
        const allRoutes = [
            ...directRoutes.map(route => ({ type: "Direct", ...route })),
            ...connectingRoutes
        ].slice(0, 5);

        // Create the final filtered dataset
        const filteredData = {
            routes: allRoutes,
            total_routes_found: allRoutes.length,
            direct_routes_found: directRoutes.length,
            connecting_routes_found: connectingRoutes.length,
            route_types: {
                direct: allRoutes.filter(r => r.type === "Direct").length,
                connecting: allRoutes.filter(r => r.type === "Connecting").length
            }
        };

        // Create a prompt with filtered data
        const prompt = `INSTRUCTIONS: You are a logistics optimization system. Return ONLY a JSON response matching the exact structure below. DO NOT include any other text or explanation.

CONTEXT:
- Current Location: ${currentCity}, Portugal
${destinationCity ? `- Destination: ${destinationCity}, Portugal` : ''}
- Available Loads: ${allRoutes.length} loads filtered from ${loadsData.active_loads.length} total

DATA:
${JSON.stringify(allRoutes, null, 2)}

REQUIRED RESPONSE FORMAT - Return this exact JSON structure with appropriate values:
{
  "recommended_loads": [
    {
      "id": "string (use the load ID from data)",
      "type": "string (use the load type from data)",
      "weight": "number (use the load weight from data)",
      "from": "string (use the load from city from data)",
      "to": "string (use the load to city from data)",
      "distance": "number (use the load distance from data)",
      "urgent": "boolean (use the load urgent status from data)",
      "estimated_time": "string (calculate based on distance, e.g., '2h 30m')",
      "reason": "string (explain why this load is recommended)",
      "route_conditions": "string (describe road conditions)",
      "weather_impact": "string (describe weather impact)"
    }
  ],
  "route_analysis": {
    "total_distance": "number (sum of recommended load distances)",
    "estimated_total_time": "string (sum of estimated times)",
    "fuel_efficiency_rating": "number (1-10 scale)",
    "route_complexity": "string (Low/Medium/High)",
    "weather_considerations": "string (overall weather impact)",
    "traffic_considerations": "string (overall traffic conditions)"
  }
}

IMPORTANT:
1. Return ONLY the JSON object above with no additional text
2. Include ALL fields exactly as shown
3. Use actual data from the provided loads
4. Ensure the response is valid JSON
{
  "recommended_loads": [
    {
      "id": "string",
      "type": "string",
      "weight": number,
      "from": "string",
      "to": "string",
      "distance": number,
      "urgent": boolean,
      "estimated_time": "string",
      "reason": "string",
      "route_conditions": "string",
      "weather_impact": "string"
    }
  ],
  "route_analysis": {
    "total_distance": number,
    "estimated_total_time": "string",
    "fuel_efficiency_rating": number,
    "route_complexity": "string",
    "weather_considerations": "string",
    "traffic_considerations": "string"
  }
}

RESPONSE FORMAT: Return ONLY a JSON object in this exact format:
{
  "recommended_loads": [
    {
      "id": "string",
      "type": "string",
      "weight": number,
      "from": "string",
      "to": "string",
      "distance": number,
      "urgent": boolean,
      "estimated_time": "string",
      "reason": "string",
      "route_conditions": "string",
      "weather_impact": "string",
      "fromLocation": { "lat": number, "lng": number },
      "toLocation": { "lat": number, "lng": number }
    }
  ],
  "route_analysis": {
    "total_distance": number,
    "estimated_total_time": "string",
    "fuel_efficiency_rating": number,
    "route_complexity": "string",
    "weather_considerations": "string",
    "traffic_considerations": "string"
  }
}

Sort loads by: proximity to ${currentCity}, urgency, value-to-distance ratio, and conditions.
Include only logistically efficient loads based on current location.
REMEMBER: Return ONLY the JSON object, no other text.`;

        // let aiSuggestions = await getAIResponse(prompt);
        
        // console.log('AI Suggestions:', aiSuggestions);
        // Try to parse the AI response as JSON
   
        // Portuguese city coordinates for reference
        const cityCoordinates = {
            braga: { lat: 41.5517, lng: -8.4265 },
            porto: { lat: 41.1579, lng: -8.6291 },
            viseu: { lat: 40.6566, lng: -7.9125 },
            coimbra: { lat: 40.2033, lng: -8.4103 },
            lisboa: { lat: 38.7223, lng: -9.1393 },
            setubal: { lat: 38.5244, lng: -8.8882 },
            beja: { lat: 38.0333, lng: -7.8833 },
            faro: { lat: 37.0193, lng: -7.9304 }
        };

        // Combine AI response with coordinates and additional data
        // console.log('Parsed AI Response:', JSON.stringify(parsedResponse, null, 2));
    

         res.json({
            success: true,
            data: filteredData,
            summary: {
                message: `Found ${filteredData.direct_routes_found} direct routes and ${filteredData.connecting_routes_found} connecting routes`,
                total_options: filteredData.total_routes_found,
                has_direct_routes: filteredData.direct_routes_found > 0,
                has_connecting_routes: filteredData.connecting_routes_found > 0
            }
        });
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
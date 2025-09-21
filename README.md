# Transportation Optimization Logistic AI

## The Problem

- **Idle Time:** Drivers lose up to 30% of their time traveling without cargo (empty trips).
- **Financial Losses:** Each empty trip can mean **thousands of dollars/euros lost per truck per year**, adding significant financial strain.
- **Complex Planning:** Different regulations across countries make planning challenging.
- **High Costs & Environmental Pressure:** Companies face rising costs and growing environmental demands.

## Our Solution

- **Real-Time Freight Marketplace:** Automatically suggests the next available load.
- **Automatic Route Planning:** AI that complies with local laws and optimizes costs.
- **Digital Driver Assistant:** Sends notifications about rest periods, fuel stops, and new cargo.
- **Predictive Analytics:** Enables companies to forecast demand and optimize fleet usage.

## Platform

- **Interactive Map:** Shows truck location, suggested routes, and mandatory stops.
- **Loads area:** Displays available loads with destination, price, and urgency.
- **AI Assistant:** Chat interface alerts drivers when to rest, where to refuel, and suggests the next load.

## Artificial Intelligence Stack (AWS Bedrock)

- **Claude 3.5:** Route planning and interpretation of legal regulations.
- **Titan Embeddings:** Matches loads with available trucks.
- **Llama 3:** Conversational digital assistant.
- **SageMaker + Bedrock:** Demand forecasting and fleet optimization.

## Impact

- **Companies:** Up to **25% reduction in operational costs**.
- **Drivers:** Around **20% increase in work-time efficiency**.
- **Environment:** Approximately **30% fewer emissions** by reducing empty trips.

## Check the demo

`demo.mov` file

## How to Run the Application

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Backend Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Create a `.env` file in the server directory
   - Check the `./server/.env.local`

4. Start the backend server:

   ```bash
   # Development mode
   npm run dev


   The server will run on `http://localhost:7072`
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd front
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables (if needed):

   - Create a `.env` file in the front directory
   - Check the `./front/.env.local`

4. Start the frontend development server:

   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:7070`

---

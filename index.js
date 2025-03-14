require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { CohereClient } = require("cohere-ai"); // Use CohereClient

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Cohere client
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// Chat API using Cohere
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("req. msg ... ", message);
    if (!message) return res.status(400).json({ error: "Message cannot be empty" });

    const response = await cohere.chat({
      model: "command",
      message: message, // Correct key based on docs
    });

    console.log("cohere AI response ... ", response);

    res.json({ response: response.text }); // Extracts the response text
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Error processing request" });
  }
});

// Weather API (unchanged)
app.get("/weather", async (req, res) => {
  try {
    const city = req.query.city;
    console.log("weather API req. - ", city);
    if (!city) return res.status(400).json({ error: "City name is required" });

    const weather_api_key = process.env.WEATHER_API_KEY;
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weather_api_key}&units=metric`;

    const response = await axios.get(url);
    if (response.status !== 200) throw new Error("Failed to fetch weather data");

    console.log("weather API res. - ", response.data)

    const weatherData = response.data;
    res.json({
      temperature: weatherData.main.temp,
      weather: weatherData.weather[0].description,
    });
  } catch (error) {
    console.error("Weather API Error:", error);
    res.status(500).json({ error: "Error fetching weather data" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

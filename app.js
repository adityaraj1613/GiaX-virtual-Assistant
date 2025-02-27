const btn = document.querySelector('.talk');
const content = document.querySelector('.content');


// API Keys
const OPENWEATHERMAP_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"; // Replace with your OpenWeatherMap API key
const NEWSAPI_API_KEY = "9846886bbf214a6d801097c4daff23d0"; // Your NewsAPI key

// Speech Synthesis
let currentSpeech = null; // Track the current speech

function speak(text) {
    if (currentSpeech) {
        window.speechSynthesis.cancel(); // Stop any ongoing speech
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.volume = 1;
    utterance.pitch = 0.8; // Lower pitch for a robotic voice

    // Set a specific voice (if available)
    const voices = window.speechSynthesis.getVoices();
    const roboticVoice = voices.find(voice => voice.name.includes("Google UK English Male") || voice.name.includes("Microsoft David"));
    if (roboticVoice) utterance.voice = roboticVoice;

    currentSpeech = utterance;
    window.speechSynthesis.speak(utterance);
}

// Stop Speech
function stopSpeech() {
    if (currentSpeech) {
        window.speechSynthesis.cancel();
        currentSpeech = null;
        speak("Speech stopped.");
    }
}

// Greet the user based on time
function wishMe() {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) speak("Good Morning Boss...");
    else if (hour >= 12 && hour < 17) speak("Good Afternoon Master...");
    else speak("Good Evening Sir...");
}

// Initialize GaiaX
window.addEventListener('load', () => {
    speak("Initializing GaiaX...");
    wishMe();
});

// Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    content.textContent = "Your browser does not support speech recognition. Please use Chrome or Edge.";
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        content.textContent = transcript;
        takeCommand(transcript.toLowerCase());
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        content.textContent = "Sorry, I couldn't understand you. Please try again.";
    };

    btn.addEventListener('click', () => {
        content.textContent = "Listening...";
        recognition.start();
    });
}

// Fetch Weather Data using OpenWeatherMap API
async function getWeather(city) {
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OPENWEATHERMAP_API_KEY}`;
    try {
        // Step 1: Get latitude and longitude for the city
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.length === 0) {
            speak("Sorry, I couldn't find the city. Please try again.");
            return;
        }
        const { lat, lon } = geocodeData[0];

        // Step 2: Fetch weather data using lat and lon
        const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (weatherData.current) {
            const temp = weatherData.current.temp;
            const weather = weatherData.current.weather[0].description;
            speak(`The weather in ${city} is ${weather} with a temperature of ${temp} degrees Celsius.`);
        } else {
            speak("Sorry, I couldn't fetch the weather data. Please try again.");
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
        speak("Sorry, I couldn't fetch the weather data. Please check your internet connection.");
    }
}

// Fetch News Data using NewsAPI
async function getNews() {
    const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWSAPI_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "ok") {
            const headlines = data.articles.slice(0, 3).map(article => article.title).join(". ");
            speak("Here are the top news headlines: " + headlines);
        } else {
            speak("Sorry, I couldn't fetch the news. Please try again.");
        }
    } catch (error) {
        console.error("Error fetching news data:", error);
        speak("Sorry, I couldn't fetch the news. Please check your internet connection.");
    }
}

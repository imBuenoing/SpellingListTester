const API_URL = "https://api.openai.com/v1/completions";
const API_KEY_STORAGE_KEY = 'openaiApiKey';

// Function to fetch words and sentences using OpenAI's API
async function fetchWordsAndSentences(difficulty, numberOfWords, apiKey) {
    const prompt = `Generate ${numberOfWords} child-friendly words and example sentences with a focus on simple, easy-to-learn words for young children (ages 5-7). Ensure the sentences are engaging and easy to understand.`;
    
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
    };

    const body = JSON.stringify({
        model: "gpt-4o-mini",  // Use appropriate model
        prompt: prompt,
        max_tokens: 150,
        n: 1,
        temperature: 0.7,
    });

    try {
        const response = await fetch(API_URL, { method: "POST", headers, body });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        const words = data.choices[0].text.trim().split("\n").map((entry, index) => {
            const [word, sentence] = entry.split(" - ");
            return { id: index + 1, word: word.trim(), sentence: sentence.trim() };
        });

        localStorage.setItem('spellingList', JSON.stringify(words));
        return words;

    } catch (error) {
        console.error("Error fetching words from OpenAI:", error);
        alert("Failed to fetch words. Please check your API key or try again.");
    }
}

// Generate and Display Word List
async function generateAndDisplayWordList(difficulty, numberOfWords, apiKey) {
    const wordList = await fetchWordsAndSentences(difficulty, numberOfWords, apiKey);

    const listContainer = document.getElementById('wordListContainer');
    listContainer.innerHTML = "";

    wordList.forEach(item => {
        const listItem = document.createElement('p');
        listItem.innerHTML = `${item.id}. ${item.word} - ${item.sentence}`;
        listContainer.appendChild(listItem);
    });
}

// Event Listener for "Generate Word List" button
document.getElementById("generateButton").addEventListener("click", () => {
    const difficulty = document.getElementById("difficultySelect").value;
    const numberOfWords = parseInt(document.getElementById("wordCountSelect").value);
    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);

    if (!apiKey) {
        alert("Please enter your OpenAI API key.");
        return;
    }

    generateAndDisplayWordList(difficulty, numberOfWords, apiKey);
});

// Save API Key
document.getElementById("saveApiKeyButton").addEventListener("click", () => {
    const apiKey = document.getElementById("apiKeyInput").value;
    if (apiKey) {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        document.getElementById("apiKeySection").style.display = "none";
        alert("API key saved successfully.");
    } else {
        alert("Please enter a valid API key.");
    }
});

// Check if API Key is already saved and hide input section if it is
if (localStorage.getItem(API_KEY_STORAGE_KEY)) {
    document.getElementById("apiKeySection").style.display = "none";
}


// Check if API key is saved in localStorage
const apiKey = localStorage.getItem('openaiApiKey');

// If API key is saved, hide the API input section
if (apiKey) {
    document.getElementById('apiKeySection').classList.add('hidden');
}

// Function to save the API Key to localStorage
document.getElementById("saveApiKeyButton").addEventListener("click", () => {
    const apiKeyInput = document.getElementById("apiKeyInput").value;
    if (apiKeyInput) {
        localStorage.setItem('openaiApiKey', apiKeyInput);
        document.getElementById('apiKeySection').classList.add('hidden');
    } else {
        alert("Please enter a valid API Key.");
    }
});

// Function to fetch words and sentences from OpenAI API
async function fetchWordsFromOpenAI(numberOfWords) {
    const apiKey = localStorage.getItem('openaiApiKey');
    
    if (!apiKey) {
        alert("API Key is required.");
        return;
    }

    const prompt = `Generate a list of ${numberOfWords} simple and child-friendly words with a sentence that includes each word. The words should be easy enough for a 5-year-old to learn.`;

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
    };

    const body = JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
        ]
    });

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: headers,
            body: body
        });
        
        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();
        const message = data.choices[0].message.content;

        // Parse the message to extract words and sentences
        const wordList = message.split("\n").map((line, index) => {
            const [word, sentence] = line.split(" - ");
            return {
                id: index + 1,
                word: word.trim(),
                sentence: sentence.trim()
            };
        });

        localStorage.setItem('spellingList', JSON.stringify(wordList));
        return wordList;

    } catch (error) {
        console.error("Error fetching words from OpenAI:", error);
        alert("Failed to fetch words from OpenAI.");
    }
}

// Generate and Display Word List
async function generateAndDisplayWordList(numberOfWords) {
    const wordList = await fetchWordsFromOpenAI(numberOfWords);

    if (wordList) {
        const listContainer = document.getElementById('wordListContainer');
        listContainer.innerHTML = "";

        wordList.forEach(item => {
            const listItem = document.createElement('p');
            listItem.innerHTML = `${item.id}. ${item.word} - ${item.sentence}`;
            listContainer.appendChild(listItem);
        });
    }
}

// Event Listener for "Generate Word List" button
document.getElementById("generateButton").addEventListener("click", () => {
    const numberOfWords = parseInt(document.getElementById("wordCountSelect").value);
    generateAndDisplayWordList(numberOfWords);
});

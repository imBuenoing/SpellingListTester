// Register the Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(() => console.log("Service Worker Registered"))
    .catch(error => console.error("Service Worker Registration Failed:", error));
}

// Prompt for generating simple, child-friendly words and sentences
async function fetchWordsFromOpenAI(numberOfWords) {
    const apiKey = localStorage.getItem('openaiApiKey');
    if (!apiKey) {
        alert("OpenAI API key is missing. Please enter it to proceed.");
        return;
    }

    const prompt = `
        Generate a list of ${numberOfWords} simple, age-appropriate words for a 5-year-old child to learn. 
        For each word, also provide a simple sentence using that word. 
        Return the response in this JSON format: [{ "word": "example", "sentence": "This is an example sentence." }]
    `;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt }
                ]
            })
        });

        // Ensure the request was successful
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Verify response format and parse word list
        const wordListContent = data.choices?.[0]?.message?.content;
        if (!wordListContent) {
            throw new Error("Unexpected response format from OpenAI API.");
        }

        const wordList = JSON.parse(wordListContent);
        localStorage.setItem('spellingList', JSON.stringify(wordList));

        console.log("Generated word list saved:", wordList);
        return wordList;

    } catch (error) {
        console.error("Error fetching words from OpenAI:", error);
        alert("Error generating the word list. Please check your API key and try again.");
    }
}

// Display generated word list
async function generateAndDisplayWordList(numberOfWords) {
    const wordList = await fetchWordsFromOpenAI(numberOfWords);

    const listContainer = document.getElementById('wordListContainer');
    listContainer.innerHTML = "";

    wordList?.forEach((item, index) => {
        const listItem = document.createElement('p');
        listItem.innerHTML = `${index + 1}. ${item.word} - ${item.sentence}`;
        listContainer.appendChild(listItem);
    });
}

// Save OpenAI API key to localStorage
document.getElementById("saveApiKeyButton").addEventListener("click", () => {
    const apiKey = document.getElementById("apiKeyInput").value;
    if (apiKey) {
        localStorage.setItem('openaiApiKey', apiKey);
        document.getElementById("apiKeySection").style.display = "none";
    }
});

// Hide API key input section if already saved
window.addEventListener("load", () => {
    if (localStorage.getItem('openaiApiKey')) {
        document.getElementById("apiKeySection").style.display = "none";
    }
});

// Event Listener for "Generate Word List" button
document.getElementById("generateButton").addEventListener("click", () => {
    const numberOfWords = parseInt(document.getElementById("wordCountSelect").value);
    generateAndDisplayWordList(numberOfWords);
});

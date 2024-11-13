const API_URL = 'https://api.openai.com/v1/completions';
const OPENAI_MODEL = 'text-davinci-003';  // You can choose a different model

// Function to save the API key to localStorage
function saveApiKey(apiKey) {
    localStorage.setItem('openaiApiKey', apiKey);
}

// Function to get the API key from localStorage
function getApiKey() {
    return localStorage.getItem('openaiApiKey');
}

// Prompt for generating child-friendly words and sentences
const openAiPrompt = (numWords) => {
    return `Generate a list of ${numWords} child-friendly words that a 5-year-old child can learn. For each word, provide a simple sentence that uses the word. The sentences should be clear, short, and easy to understand. Please ensure the words are common, familiar, and suitable for young learners.`;
};

// Function to call the OpenAI API and get the word list
async function fetchWordsFromOpenAI(numberOfWords) {
    const apiKey = getApiKey();
    if (!apiKey) {
        alert('Please enter your OpenAI API key.');
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
    };

    const body = JSON.stringify({
        model: OPENAI_MODEL,
        prompt: openAiPrompt(numberOfWords),
        max_tokens: 100,
        n: 1,
        stop: null,
        temperature: 0.7,
    });

    try {
        const response = await fetch(API_URL, { method: 'POST', headers, body });
        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            const wordList = data.choices[0].text.trim().split('\n').map((line, index) => {
                const [word, ...sentenceParts] = line.split(' - ');
                const sentence = sentenceParts.join(' - ').trim();
                return {
                    id: index + 1,
                    word: word.trim(),
                    sentence: sentence,
                };
            });
            localStorage.setItem('spellingList', JSON.stringify(wordList));
            return wordList;
        } else {
            console.error('No choices returned from OpenAI API');
            return [];
        }
    } catch (error) {
        console.error('Error fetching words from OpenAI API:', error);
        alert('Error generating the word list. Please check your API key and try again.');
    }
}

// Generate and Display Word List
async function generateAndDisplayWordList(numberOfWords) {
    const wordList = await fetchWordsFromOpenAI(numberOfWords);

    const listContainer = document.getElementById('wordListContainer');
    listContainer.innerHTML = "";

    wordList.forEach(item => {
        const listItem = document.createElement('p');
        listItem.innerHTML = `${item.id}. ${item.word} - ${item.sentence}`;
        listContainer.appendChild(listItem);
    });
}

// Event Listener for "Save API Key" button
document.getElementById('saveApiKeyButton').addEventListener('click', () => {
    const apiKeyInput = document.getElementById('apiKeyInput').value;
    if (apiKeyInput) {
        saveApiKey(apiKeyInput);
        alert('API Key saved successfully!');
    } else {
        alert('Please enter a valid API key.');
    }
});

// Event Listener for "Generate Word List" button
document.getElementById("generateButton").addEventListener("click", () => {
    const numberOfWords = parseInt(document.getElementById("wordCountSelect").value);
    generateAndDisplayWordList(numberOfWords);
});

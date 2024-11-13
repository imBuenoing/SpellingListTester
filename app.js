// Register the Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(() => console.log("Service Worker Registered"))
    .catch(error => console.error("Service Worker Registration Failed:", error));
}

// Base URL for Random Words API
const API_URL = "https://random-word-api.herokuapp.com/word";

// Function to fetch words from the API
async function fetchWords(difficulty, numberOfWords) {
    const url = `${API_URL}?number=${numberOfWords}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch words: ${response.statusText}`);
        }
        
        const words = await response.json();
        const wordList = words.map((word, index) => {
            const sentence = `This is a sentence with the word **${word}**.`;
            return {
                id: index + 1,
                word: word,
                sentence: sentence
            };
        });

        localStorage.setItem('spellingList', JSON.stringify(wordList));
        
        console.log("Generated word list saved:", wordList);
        return wordList;

    } catch (error) {
        console.error("Error fetching words:", error);
        alert("Error generating the word list. Please try again.");
    }
}

// Generate and Display Word List
async function generateAndDisplayWordList(difficulty, numberOfWords) {
    const wordList = await fetchWords(difficulty, numberOfWords);

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
    generateAndDisplayWordList(difficulty, numberOfWords);
});

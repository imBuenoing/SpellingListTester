// Initialize OpenAI configuration (assuming an input for API key is handled elsewhere)
async function fetchWordList(difficulty, wordCount) {
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey) {
        alert('Please enter your OpenAI API key.');
        return [];
    }

    const openaiUrl = "https://api.openai.com/v1/chat/completions";
    const response = await fetch(openaiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: `Generate a list of ${wordCount} ${difficulty} spelling words suitable for a young child to learn, each with a simple sentence.`,
                },
            ],
            max_tokens: 100,
            temperature: 0.5,
        })
    });

    if (!response.ok) {
        throw new Error('Failed to fetch words from OpenAI');
    }

    const data = await response.json();
    if (data.choices && data.choices[0]) {
        const text = data.choices[0].message.content;
        return text.split('\n').map(line => {
            const [word, sentence] = line.split(' - ');
            return { word: word.trim(), sentence: sentence.trim() };
        });
    } else {
        throw new Error('No valid response from OpenAI');
    }
}

document.getElementById("saveApiKeyButton").addEventListener("click", () => {
    const apiKey = document.getElementById("apiKeyInput").value;
    if (apiKey) {
        localStorage.setItem("openai_api_key", apiKey);
        alert("API Key saved successfully!");
    } else {
        alert("Please enter a valid API key.");
    }
});

// Save generated word list to localStorage with timestamp
function saveWordSet(spellingList) {
    const timestamp = new Date().toLocaleString();
    const savedSets = JSON.parse(localStorage.getItem('savedSets')) || [];
    const newSet = { name: `Set ${savedSets.length + 1} - ${timestamp}`, list: spellingList };
    savedSets.push(newSet);
    localStorage.setItem('savedSets', JSON.stringify(savedSets));
    updateSavedSetsDropdown();
}

// Update dropdown menu with saved sets
function updateSavedSetsDropdown() {
    const dropdown = document.getElementById('savedSetsDropdown');
    const savedSets = JSON.parse(localStorage.getItem('savedSets')) || [];
    dropdown.innerHTML = '<option value="">Select a set</option>';
    savedSets.forEach((set, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = set.name;
        dropdown.appendChild(option);
    });
}

// Load selected word set into test mode
function loadSelectedSet() {
    const dropdown = document.getElementById('savedSetsDropdown');
    const selectedIndex = dropdown.value;
    if (selectedIndex === "") {
        alert("Please select a set to load.");
        return;
    }
    const savedSets = JSON.parse(localStorage.getItem('savedSets'));
    const selectedSet = savedSets[selectedIndex];
    localStorage.setItem('currentSet', JSON.stringify(selectedSet));
    document.getElementById('currentSetName').textContent = selectedSet.name;
    showTestMode();
}

// Display Test Mode UI
function showTestMode() {
    document.getElementById('testModeSection').style.display = 'block';
}

// Test Mode Variables
let testInterval;
let currentIndex = 0;
let paused = false;
let currentSet = [];

// Initialize Test Mode from the current set in localStorage
function startTest() {
    const setData = JSON.parse(localStorage.getItem('currentSet'));
    if (!setData || !setData.list) {
        alert("No set loaded for testing. Please load a set.");
        return;
    }

    currentSet = setData.list;
    currentIndex = 0;
    const countdownTime = parseInt(document.getElementById("countdownSelect").value);

    // Start test sequence
    startTestSequence(countdownTime);
    document.getElementById('pauseResumeButton').style.display = 'inline';
    document.getElementById('repeatButton').style.display = 'inline';
}

// Start or resume the test sequence
function startTestSequence(countdownTime) {
    paused = false;
    testInterval = setInterval(() => {
        if (currentIndex < currentSet.length && !paused) {
            showWordAndCountdown(currentSet[currentIndex], countdownTime);
            currentIndex++;
        } else {
            clearInterval(testInterval);
            if (currentIndex >= currentSet.length) {
                alert("Test complete!");
            }
        }
    }, countdownTime * 1000);
}

// Show word and countdown
function showWordAndCountdown(wordData, countdownTime) {
    const testDisplay = document.getElementById("testDisplay");
    testDisplay.innerHTML = `<p>Word: <strong>${wordData.word}</strong></p><p>Sentence: ${wordData.sentence}</p>`;
    speakText(`The word is ${wordData.word}. Here is a sentence: ${wordData.sentence}.`);
}

// Pause or resume test sequence
function togglePauseResume() {
    if (paused) {
        paused = false;
        startTestSequence(parseInt(document.getElementById("countdownSelect").value));
        document.getElementById('pauseResumeButton').textContent = 'Pause';
    } else {
        paused = true;
        clearInterval(testInterval);
        document.getElementById('pauseResumeButton').textContent = 'Resume';
    }
}

// Repeat the last word and sentence
function repeatWord() {
    if (currentIndex > 0) {
        const lastWord = currentSet[currentIndex - 1];
        showWordAndCountdown(lastWord, 0);
    } else {
        alert("No word to repeat.");
    }
}

// Use Web Speech API to speak text
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
}

// Event Listeners
document.getElementById("generateWordListButton").addEventListener("click", async () => {
    const difficulty = document.getElementById('difficultyLevel').value;
    const wordCount = parseInt(document.getElementById('wordCount').value);

    try {
        const wordList = await fetchWordList(difficulty, wordCount);
        saveWordSet(wordList);

        const wordListElem = document.getElementById("wordList");
        wordListElem.innerHTML = "";
        wordList.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.word} - ${item.sentence}`;
            wordListElem.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching words:", error);
        alert("Failed to generate words. Check the console for details.");
    }
});
document.getElementById("loadSetButton").addEventListener("click", loadSelectedSet);
document.getElementById("startTestButton").addEventListener("click", startTest);
document.getElementById("pauseResumeButton").addEventListener("click", togglePauseResume);
document.getElementById("repeatButton").addEventListener("click", repeatWord);

// Initialize saved sets on load
updateSavedSetsDropdown();

// API Key Management
let apiKey = localStorage.getItem('openai_api_key');

const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyButton = document.getElementById('saveApiKeyButton');
const apiKeySection = document.getElementById('api-key-section');

// Show/hide API key section based on whether key exists
if (apiKey) {
    apiKeySection.classList.add('hidden');
}

saveApiKeyButton.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('openai_api_key', key);
        apiKey = key;
        apiKeySection.classList.add('hidden');
        showAlert('API key saved successfully!');
    } else {
        showAlert('Please enter a valid API key', 'error');
    }
});

// Update the generateWords function to use OpenAI API
const generateWords = async () => {
    if (!apiKey) {
        showAlert('Please set your OpenAI API key first', 'error');
        apiKeySection.classList.remove('hidden');
        return [];
    }

    const level = wordLevel.value;
    const type = generationType.value;
    const count = parseInt(wordCount.value);
    const isChildFriendly = childFriendly.checked;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: `You are a helpful assistant that generates spelling word lists. Generate ${count} ${level} words that are ${type === 'related' ? 'thematically related' : 'random'}. ${isChildFriendly ? 'Ensure all words are child-friendly.' : ''}`
                }, {
                    role: "user",
                    content: `Generate ${count} words with example sentences. Format each word as a JSON object with 'word' and 'sentence' properties. The sentence should use the word naturally and mark the word with ** around it. Return only the JSON array.`
                }],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        const wordList = JSON.parse(data.choices[0].message.content);
        
        return wordList;
    } catch (error) {
        console.error('Error generating words:', error);
        showAlert('Failed to generate words. Please try again.', 'error');
        return [];
    }
};

// Update the generateList click handler
generateList.addEventListener('click', async () => {
    generateList.disabled = true;
    generateList.textContent = 'Generating...';
    
    const words = await generateWords();
    
    generateList.disabled = false;
    generateList.textContent = 'Generate Word List';
    
    if (words.length > 0) {
        state.currentList = words;
        displayWordList(words);
        saveToLocalStorage();
    }
});

// Speech Synthesis setup
const speech = window.speechSynthesis;
let voices = [];

speech.onvoiceschanged = () => {
    voices = speech.getVoices();
};

// App State
const state = {
    currentMode: 'setup',
    currentList: [],
    savedLists: [],
    testInProgress: false,
    currentWordIndex: 0,
    timerDelay: 20,
    isPaused: false,
    countdown: null
};

// DOM Elements
const setupMode = document.getElementById('setup-mode');
const testMode = document.getElementById('test-mode');
const navBtns = document.querySelectorAll('.nav-btn');
const wordLevel = document.getElementById('word-level');
const generationType = document.getElementById('generation-type');
const childFriendly = document.getElementById('child-friendly');
const wordCount = document.getElementById('word-count');
const wordCountDisplay = document.getElementById('word-count-display');
const timerDelay = document.getElementById('timer-delay');
const generateList = document.getElementById('generate-list');
const showManualInput = document.getElementById('show-manual-input');
const wordListContainer = document.getElementById('word-list-container');
const wordList = document.getElementById('word-list');
const saveList = document.getElementById('save-list');
const manualInputContainer = document.getElementById('manual-input-container');
const manualWords = document.getElementById('manual-words');
const processManual = document.getElementById('process-manual');
const savedLists = document.getElementById('saved-lists');
const startTest = document.getElementById('start-test');
const testProgress = document.getElementById('test-progress');
const pauseTest = document.getElementById('pause-test');
const repeatWord = document.getElementById('repeat-word');
const randomizeOrder = document.getElementById('randomize-order');

// Utility Functions
const showAlert = (message, type = 'success') => {
    const alert = document.getElementById('alert');
    const alertMessage = alert.querySelector('.alert-message');
    
    alert.className = `alert ${type}`;
    alertMessage.textContent = message;
    alert.classList.remove('hidden');
    
    setTimeout(() => alert.classList.add('hidden'), 3000);
};

const speak = (text, callback) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices.find(voice => voice.lang === 'en-US');
    utterance.rate = 0.9;
    
    if (callback) {
        utterance.onend = callback;
    }
    
    speech.speak(utterance);
};

const shuffle = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Local Storage Functions
const saveToLocalStorage = () => {
    localStorage.setItem('spellingLists', JSON.stringify(state.savedLists));
    localStorage.setItem('currentList', JSON.stringify(state.currentList));
};

const loadFromLocalStorage = () => {
    const savedLists = localStorage.getItem('spellingLists');
    const currentList = localStorage.getItem('currentList');
    
    if (savedLists) {
        state.savedLists = JSON.parse(savedLists);
        updateSavedListsDropdown();
    }
    
    if (currentList) {
        state.currentList = JSON.parse(currentList);
        displayWordList(state.currentList);
    }
};

// Word Generation Functions
const generateWords = async () => {
    // In a real implementation, this would call an API
    // For demo purposes, we'll use a small set of predefined words
    const wordSets = {
        simple: [
            { word: 'cat', sentence: 'The **cat** played with yarn.' },
            { word: 'dog', sentence: 'My **dog** likes to fetch balls.' },
            { word: 'hat', sentence: 'I wear a **hat** when it's sunny.' },
            { word: 'run', sentence: 'I like to **run** in the park.' },
            { word: 'jump', sentence: 'Can you **jump** over the rope?' }
        ],
        useful: [
            { word: 'because', sentence: '**Because** it was raining, we stayed inside.' },
            { word: 'through', sentence: 'We walked **through** the forest.' },
            { word: 'friend', sentence: 'My best **friend** lives next door.' },
            { word: 'people', sentence: 'Many **people** came to the party.' },
            { word: 'should', sentence: 'We **should** do our homework.' }
        ]
        // Add more word sets for other levels
    };

    const count = parseInt(wordCount.value);
    const level = wordLevel.value;
    const words = wordSets[level] || wordSets.simple;
    
    return shuffle(words).slice(0, count);
};

const displayWordList = (words) => {
    wordList.innerHTML = words.map((item, index) => `
        <div class="word-item">
            <div class="word">${index + 1}. ${item.word}</div>
            <div class="sentence">${item.sentence}</div>
        </div>
    `).join('');
    
    wordListContainer.classList.remove('hidden');
};

// Test Mode Functions
const startSpellingTest = () => {
    state.testInProgress = true;
    state.currentWordIndex = 0;
    state.isPaused = false;
    
    const testWords = randomizeOrder.checked ? 
        shuffle([...state.currentList]) : 
        [...state.currentList];
    
    state.currentList = testWords;
    testProgress.classList.remove('hidden');
    
    speak("Let's begin the spelling test.", () => {
        speakCurrentWord();
    });
};

const speakCurrentWord = () => {
    if (state.currentWordIndex >= state.currentList.length) {
        endTest();
        return;
    }
    
    const currentWord = state.currentList[state.currentWordIndex];
    speak(`Word number ${state.currentWordIndex + 1}: ${currentWord.word}. 
           ${currentWord.sentence}. 
           Again, the word is: ${currentWord.word}`, () => {
        startWordTimer();
    });
};

const startWordTimer = () => {
    let timeLeft = state.timerDelay;
    const progressBar = document.querySelector('.progress');
    
    state.countdown = setInterval(() => {
        if (state.isPaused) return;
        
        timeLeft--;
        progressBar.style.width = `${(timeLeft / state.timerDelay) * 100}%`;
        
        if (timeLeft <= 10) {
            speak(timeLeft.toString());
        }
        
        if (timeLeft === 0) {
            clearInterval(state.countdown);
            state.currentWordIndex++;
            speakCurrentWord();
        }
    }, 1000);
};

const endTest = () => {
    clearInterval(state.countdown);
    state.testInProgress = false;
    speak("The test is complete. Please put down your pencil.");
    testProgress.classList.add('hidden');
};

// Event Listeners
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        state.currentMode = mode;
        
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        setupMode.classList.toggle('hidden', mode !== 'setup');
        testMode.classList.toggle('hidden', mode !== 'test');
    });
});

wordCount.addEventListener('input', () => {
    wordCountDisplay.textContent = `${wordCount.value} words`;
});

generateList.addEventListener('click', async () => {
    const words = await generateWords();
    state.currentList = words;
    displayWordList(words);
    saveToLocalStorage();
});

showManualInput.addEventListener('click', () => {
    manualInputContainer.classList.remove('hidden');
    wordListContainer.classList.add('hidden');
});

processManual.addEventListener('click', () => {
    const text = manualWords.value.trim();
    const words = text.split('\n')
        .filter(word => word.trim())
        .map(word => ({
            word: word.trim(),
            sentence: `The word is **${word.trim()}**.`
        }));
    
    if (words.length < 4 || words.length > 10) {
        showAlert('Please enter between 4 and 10 words.', 'error');
        return;
    }
    
    state.currentList = words;
    displayWordList(words);
    manualInputContainer.classList.add('hidden');
    wordListContainer.classList.remove('hidden');
    saveToLocalStorage();
});

saveList.addEventListener('click', () => {
    const listName = prompt('Enter a name for this list:');
    if (!listName) return;
    
    state.savedLists.push({
        name: listName,
        words: state.currentList
    });
    
    saveToLocalStorage();
    updateSavedListsDropdown();
    showAlert('List saved successfully!');
});

startTest.addEventListener('click', startSpellingTest);

pauseTest.addEventListener('click', () => {
    state.isPaused = !state.isPaused;
    pauseTest.innerHTML = `<i class="material-icons">${state.isPaused ? 'play_arrow' : 'pause'}</i>`;
});

repeatWord.addEventListener('click', () => {
    if (!state.testInProgress) return;
    clearInterval(state.countdown);
    speakCurrentWord();
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
});

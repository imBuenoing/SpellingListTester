// Switching Modes
function enterSetupMode() {
    document.getElementById("setupMode").style.display = "block";
    document.getElementById("testMode").style.display = "none";
}

function enterTestMode() {
    document.getElementById("setupMode").style.display = "none";
    document.getElementById("testMode").style.display = "block";
}

// Generating Word List
function generateWordList() {
    const difficulty = document.getElementById("difficulty").value;
    const generationType = document.getElementById("generationType").value;
    const wordCount = document.getElementById("wordCount").value;

    let wordList = []; // Mock generated list based on difficulty and generation type
    
    for (let i = 1; i <= wordCount; i++) {
        const word = `Word${i}`; // Placeholder for generated word
        const sentence = `This is a sentence with the word <b><u>${word}</u></b>.`;
        wordList.push({ word, sentence });
    }

    localStorage.setItem('spellingList', JSON.stringify(wordList));
    displayWordList(wordList);
}

function displayWordList(wordList) {
    const container = document.getElementById("wordListContainer");
    container.innerHTML = "";
    wordList.forEach((item, index) => {
        const listItem = document.createElement("p");
        listItem.innerHTML = `${index + 1}. ${item.word} - ${item.sentence}`;
        container.appendChild(listItem);
    });
}

// Test Mode - Start Test
function startTest() {
    const wordList = JSON.parse(localStorage.getItem('spellingList'));
    if (!wordList || wordList.length === 0) {
        alert("No words to test. Please generate or upload a list first.");
        return;
    }

    const order = document.getElementById("testOrder").value;
    const interval = parseInt(document.getElementById("interval").value) * 1000;
    const testWords = order === "random" ? shuffle(wordList) : wordList;

    let currentIndex = 0;

    function nextWord() {
        if (currentIndex >= testWords.length) {
            finalCountdown();
            return;
        }

        const { word, sentence } = testWords[currentIndex];
        speak(`${word}. ${sentence}`);
        currentIndex++;
        
        setTimeout(nextWord, interval);
    }

    function finalCountdown() {
        let countdown = 60;
        const countdownDisplay = document.getElementById("countdownContainer");
        const intervalId = setInterval(() => {
            countdownDisplay.textContent = `Final Check: ${countdown} seconds remaining`;
            countdown--;

            if (countdown <= 0) {
                clearInterval(intervalId);
                speak("The test has ended. Please put down your pencil.");
            }
        }, 1000);
    }

    nextWord();
}

// Speech Synthesis
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
}

// Utility: Shuffle Array
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

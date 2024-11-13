// Function to call OpenAI API and generate words with sentences
async function fetchWordsFromOpenAI(apiKey, numberOfWords) {
    const prompt = `
    Generate a list of ${numberOfWords} simple and child-friendly words with sentences. 
    The sentences should use each word in a way that is easy for a 5-year-old to understand. 
    Avoid using complex or technical terms. Provide each word with a sentence where the word is used in context.
    `;

    const data = {
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.7
    };

    try {
        const response = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.choices && result.choices.length > 0) {
            const wordList = result.choices[0].text.trim().split("\n").map((item, index) => {
                const [word, ...sentence] = item.split(" - ");
                return {
                    id: index + 1,
                    word: word.trim(),
                    sentence: sentence.join(" - ").trim()
                };
            });

            localStorage.setItem('spellingList', JSON.stringify(wordList));
            return wordList;
        } else {
            alert('Error generating words. Please check your API key or try again.');
            return [];
        }

    } catch (error) {
        console.error("Error fetching words from OpenAI:", error);
        alert("Failed to fetch words. Please check your API key and try again.");
        return [];
    }
}

// Generate and Display Word List
async function generateAndDisplayWordList(apiKey, numberOfWords) {
    const wordList = await fetchWordsFromOpenAI(apiKey, numberOfWords);

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
    const apiKey = document.getElementById("apiKey").value.trim();
    const numberOfWords = parseInt(document.getElementById("wordCountSelect").value);

    if (!apiKey) {
        alert("Please enter a valid OpenAI API key.");
        return;
    }

    generateAndDisplayWordList(apiKey, numberOfWords);
});

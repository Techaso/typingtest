document.getElementById('setup-form').addEventListener('submit', function(event) {
    event.preventDefault();
    console.log('Form submitted');
    const customText = document.getElementById('custom-text').value;
    console.log('Custom text:', customText);
    let selectedTime = timerSelect.value === 'custom'
        ? parseInt(customTimerInput.value)
        : parseInt(timerSelect.value);
    console.log('Selected time:', selectedTime);
    const timer = selectedTime * 60;
    startTypingTest(customText, timer);
});

document.getElementById('upload-btn').addEventListener('click', () => {
    document.getElementById('file-input').click();
});
document.getElementById('file-input').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('custom-text').value = event.target.result;
            e.target.value = ""; // clear file input to avoid conflicts
            console.log('File uploaded and text set');
        };
        reader.readAsText(e.target.files[0]);
    }
});

const timerSelect = document.getElementById('timer');
const customTimerInput = document.getElementById('custom-timer');

timerSelect.addEventListener('change', () => {
    if (timerSelect.value === 'custom') {
        customTimerInput.style.display = 'block';
        customTimerInput.required = true;
    } else {
        customTimerInput.style.display = 'none';
        customTimerInput.required = false;
    }
});

function startTypingTest(text, time) {
    console.log('Starting typing test');
    document.getElementById('setup-form').style.display = 'none';
    const typingTest = document.getElementById('typing-test');
    typingTest.classList.add('active');
    
    // Store original text globally for later comparison
    window.originalText = text;
    
    const typingTextContainer = document.getElementById('typing-text');
    // Improved rendering for large text using a DocumentFragment.
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.textContent = text[i];
        fragment.appendChild(span);
    }
    typingTextContainer.innerHTML = '';
    typingTextContainer.appendChild(fragment);
    console.log('Rendered text length:', text.length);
    
    const typingInput = document.getElementById('typing-input');
    typingInput.value = '';
    typingInput.focus();

    // Disable copy, paste, cut, context menu and common shortcuts
    typingInput.addEventListener('cut', e => e.preventDefault());
    typingInput.addEventListener('paste', e => e.preventDefault());
    typingInput.addEventListener('copy', e => e.preventDefault());
    typingInput.addEventListener('contextmenu', e => e.preventDefault());
    typingInput.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }
    });

    // Set initial timer display based on user provided time
    updateTimerDisplay(time);
    
    // Live update: compare each letter with provided text
    typingInput.addEventListener('input', function() {
        let inputValue = typingInput.value;
        let newHTML = '';
        for (let i = 0; i < text.length; i++) {
            let expected = text[i];
            if (i < inputValue.length) {
                newHTML += inputValue[i] === expected
                    ? `<span style="color: green;">${expected}</span>`
                    : `<span style="color: red;">${expected}</span>`;
            } else {
                newHTML += `<span>${expected}</span>`;
            }
        }
        typingTextContainer.innerHTML = newHTML;
    });
    
    let timerStarted = false;
    let startTime, interval;
    
    typingInput.addEventListener('keydown', function onFirstKey() {
        if (!timerStarted) {
            timerStarted = true;
            startTime = Date.now();
            interval = setInterval(() => {
                let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                let remainingTime = time - elapsedTime;
                if (remainingTime <= 0) {
                    updateTimerDisplay(0);
                    clearInterval(interval);
                    calculateSpeed(typingInput.value.length, time);
                } else {
                    updateTimerDisplay(remainingTime);
                }
            }, 1000);
        }
    });
    
    typingInput.style.overflowY = 'hidden';
    
    // End Test button event
    const endTestBtn = document.getElementById('end-test');
    endTestBtn.addEventListener('click', function() {
        if (interval) clearInterval(interval);
        let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        calculateSpeed(typingInput.value.length, elapsedTime);
    });
}

function updateTimerDisplay(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    document.getElementById('timer-display').innerText = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function calculateSpeed(charsTyped, elapsedTime) {
    const keysPerMinute = (charsTyped / elapsedTime) * 60;
    const inputText = document.getElementById('typing-input').value;
    const typedWords = inputText.trim().split(/\s+/).filter(w => w.length);
    const totalTypedWords = typedWords.length;
    const wordsPerMinute = (totalTypedWords / elapsedTime) * 60;
    
    // Get original text stats
    const originalText = window.originalText;
    const totalOriginalLetters = originalText.length;
    const originalWordsArr = originalText.trim().split(/\s+/).filter(w => w.length);
    const totalOriginalWords = originalWordsArr.length;
    
    // Count correct words in order (comparing with original text)
    let correctWords = 0;
    for (let i = 0; i < Math.min(totalTypedWords, totalOriginalWords); i++) {
        if (typedWords[i] === originalWordsArr[i]) {
            correctWords++;
        }
    }
    const wrongWords = totalTypedWords - correctWords;
    const correctWordsPercent = totalTypedWords ? (correctWords / totalTypedWords) * 100 : 0;
    const wrongWordsPercent = totalTypedWords ? (wrongWords / totalTypedWords) * 100 : 0;
    
    // Count letter errors based on typed letters only
    const totalTypedLetters = inputText.length;
    let correctLetters = 0;
    const minLen = Math.min(totalTypedLetters, totalOriginalLetters);
    for (let i = 0; i < minLen; i++) {
        if (inputText[i] === originalText[i]) correctLetters++;
    }
    const wrongLetters = totalTypedLetters - correctLetters;
    const correctLettersPercent = totalTypedLetters ? (correctLetters / totalTypedLetters) * 100 : 0;
    const wrongLettersPercent = totalTypedLetters ? (wrongLetters / totalTypedLetters) * 100 : 0;
    
    // Build results table with new original text stats rows
    const resultHTML = `
      <table>
          <tr>
              <th>Metric</th>
              <th>Result</th>
          </tr>
          <tr>
              <td>Keys per Minute</td>
              <td>${keysPerMinute.toFixed(2)}</td>
          </tr>
          <tr>
              <td>Words per Minute</td>
              <td>${wordsPerMinute.toFixed(2)}</td>
          </tr>
          <tr>
              <td>Correct Words</td>
              <td>${correctWords} / ${totalTypedWords} (${correctWordsPercent.toFixed(2)}%)</td>
          </tr>
          <tr>
              <td>Wrong Words</td>
              <td>${wrongWords} / ${totalTypedWords} (${wrongWordsPercent.toFixed(2)}%)</td>
          </tr>
          <tr>
              <td>Correct Letters</td>
              <td>${correctLetters} / ${totalTypedLetters} (${correctLettersPercent.toFixed(2)}%)</td>
          </tr>
          <tr>
              <td>Wrong Letters</td>
              <td>${wrongLetters} / ${totalTypedLetters} (${wrongLettersPercent.toFixed(2)}%)</td>
          </tr>
          <tr>
              <td>Total Typed Letters</td>
              <td>${totalTypedLetters}</td>
          </tr>
          <tr>
              <td>Total Typed Words</td>
              <td>${totalTypedWords}</td>
          </tr>
          <tr>
              <td>Total Original Letters</td>
              <td>${totalOriginalLetters}</td>
          </tr>
          <tr>
              <td>Total Original Words</td>
              <td>${totalOriginalWords}</td>
          </tr>
      </table>
    `;
    
    // Display results and hide typing test container
    document.getElementById('test-results').innerHTML = resultHTML;
    document.getElementById('test-results').style.display = 'block'; // reveal results container

    // Hide the container so that only the results are shown
    document.querySelector('.container').style.display = 'none';
    // Optionally, disable further input if needed.
}
document.getElementById('setup-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Check which radio is selected
    if (randomTextRadio.checked) {
      let count = parseInt(randomWordCountSelect.value);
      if (randomWordCountSelect.value === 'custom') {
        count = parseInt(customWordCountInput.value) || 50;
      }
      // Generate random text
      const randomText = getRandomWords(count);
      startTypingTest(randomText, resolveSelectedTime());
    } else {
      // ...existing custom text check...
      const customTextEl = document.getElementById('custom-text');
      const customText = customTextEl.innerText.trim();
      if (!customText) {
        customTextEl.classList.add('input-error');
        return;
      } else {
        customTextEl.classList.remove('input-error');
      }
      startTypingTest(customText, resolveSelectedTime());
    }
});

document.getElementById('custom-text').addEventListener('input', function() {
    if (this.innerText.trim()) {
        this.classList.remove('input-error');
    }
    updateWordCount();
});

document.getElementById('upload-btn').addEventListener('click', () => {
    document.getElementById('file-input').click();
});
document.getElementById('file-input').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const reader = new FileReader();
        reader.onload = (event) => {
            // Changed from .value to .innerText for a contenteditable div
            document.getElementById('custom-text').innerText = sanitizeQuotesAndDashes(event.target.result);
            updateWordCount();
            e.target.value = ""; // clear file input to avoid conflicts
        };
        reader.readAsText(e.target.files[0]);
    }
});

// Allow pasting into custom-text but sanitize
document.getElementById('custom-text').addEventListener('paste', function(e) {
    e.preventDefault();
    let pastedData = (e.clipboardData || window.clipboardData).getData('text');
    pastedData = sanitizeQuotesAndDashes(pastedData);
    document.getElementById('custom-text').focus();
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(pastedData));
    }
    updateWordCount();
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

// Radio button and random text elements
const randomTextRadio = document.getElementById('random-text-radio');
const customTextRadio = document.getElementById('custom-text-radio');
const randomTextGroup = document.getElementById('random-text-group');
const uploadContainer = document.getElementById('upload-container');
const randomWordCountSelect = document.getElementById('randomWordCount');
const customWordCountInput = document.getElementById('customWordCount');

// Show/hide sections based on initial selection
if (randomTextRadio.checked) {
  randomTextGroup.style.display = 'block';
  uploadContainer.style.display = 'none';
}
randomTextRadio.addEventListener('change', () => {
  randomTextGroup.style.display = 'block';
  uploadContainer.style.display = 'none';
});
customTextRadio.addEventListener('change', () => {
  randomTextGroup.style.display = 'none';
  uploadContainer.style.display = 'block';
});

// Toggle custom word count input
randomWordCountSelect.addEventListener('change', () => {
  if (randomWordCountSelect.value === 'custom') {
    customWordCountInput.style.display = 'inline-block';
    customWordCountInput.required = true;
  } else {
    customWordCountInput.style.display = 'none';
    customWordCountInput.required = false;
  }
});

// Generate random words
function getRandomWords(count) {
  const words = [
    'lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit',
    'sed','do','eiusmod','tempor','incididunt','labore','et','dolore',
    'magna','aliqua','ut','enim','ad','minim','veniam','quis','nostrud',
    'exercitation','ullamco','laboris','nisi','aliquip','ex','commodo'
    // ... some more if you like ...
  ];
  let result = [];
  // Generate requested number of random words
  for (let i = 0; i < count; i++) {
    result.push(words[Math.floor(Math.random() * words.length)]);
  }
  return result.join(' ');
}

// Utility to resolve selected time
function resolveSelectedTime() {
  let selectedTime = timerSelect.value === 'custom'
      ? parseInt(customTimerInput.value)
      : parseInt(timerSelect.value);
  return selectedTime * 60;
}

function sanitizeQuotesAndDashes(str) {
    // Convert fancy quotes (single and double) and em dashes to their standard forms
    return str
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/—/g, "--");
}

function startTypingTest(text, time) {
    document.getElementById('setup-form').style.display = 'none';
    const typingTest = document.getElementById('typing-test');
    // Sanitize original text
    text = sanitizeQuotesAndDashes(text);
    // Normalize each line to replace consecutive spaces with a single space.
    text = text.split('\n').map(line => line.replace(/\s+/g, ' ')).join('\n');
    window.originalText = text;
    
    const typingTextContainer = document.getElementById('typing-text');
    // Improved rendering for large text using a DocumentFragment.
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '\n') {
            fragment.appendChild(document.createElement('br'));
        } else {
            const span = document.createElement('span');
            span.textContent = text[i];
            fragment.appendChild(span);
        }
    }
    typingTextContainer.innerHTML = '';
    typingTextContainer.appendChild(fragment);
    typingTest.classList.add('active');
    const typingInput = document.getElementById('typing-input');
    // Replace value clear with innerText clear
    typingInput.innerText = '';
    typingInput.focus();

    // Disable copy, paste, cut, context menu and common shortcuts
    // typingInput.addEventListener('cut', e => e.preventDefault());
    // typingInput.addEventListener('paste', e => e.preventDefault());
    // typingInput.addEventListener('copy', e => e.preventDefault());
    // typingInput.addEventListener('contextmenu', e => e.preventDefault());
    // typingInput.addEventListener('keydown', e => {
    //     if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
    //         e.preventDefault();
    //     }
    // });

    // Prevent insertion of extra space when editing text (if caret is not at end)
    typingInput.addEventListener('keydown', function(e) {
        if (e.key === ' ') {
            // Get caret position using window.getSelection for contenteditable
            const sel = window.getSelection();
            const pos = sel ? sel.anchorOffset : 0;
            // If caret is not at the end and previous character is already a space, prevent extra insertion
            if (pos < typingInput.innerText.length && pos > 0 && typingInput.innerText[pos - 1] === ' ') {
                e.preventDefault();
            }
        }
    });

    // Set initial timer display based on user provided time
    updateTimerDisplay(time);
    
    // Live update: compare each letter with provided text
    let timerStarted = false;
    let startTime, interval;

    // Initialize currentWordIndex at 0
    let currentWordIndex = 0;

    // NEW: Set blur based on mode when test starts.
    if (modeSelect.value === 'blind') {
        typingInput.style.filter = "blur(8px)";
    } else {
        typingInput.style.filter = "";
    }

    typingInput.addEventListener('input', function() {
        const inputValue = sanitizeQuotesAndDashes(typingInput.innerText);
        const typedWordsArr = inputValue.split(/\s+/);
        const originalWordsArr = text.split(/\s+/);
        const currentMode = modeSelect.value;
        let newHTML = '';
        let overallIndex = 0;
        // Declare only once:
        let currentWordIndex = inputValue === '' ? 0 : (inputValue.endsWith(' ') ? typedWordsArr.length : typedWordsArr.length - 1);
        
        for (let w = 0; w < originalWordsArr.length; w++) {
            let currentWordHTML = '';
            const word = originalWordsArr[w];
            const typedWord = w < typedWordsArr.length ? typedWordsArr[w] : '';
            for (let c = 0; c < word.length; c++) {
                let spanStyle = "";
                if (currentMode === 'practice') {
                    if (w === currentWordIndex) {
                        if (c < typedWord.length) {
                            spanStyle = (typedWord[c] === word[c]) ? 'style="color: green;"' : 'style="color: red;"';
                        }
                    } else {
                        if (c < typedWord.length) {
                            spanStyle = (typedWord[c] === word[c]) ? 'style="color: green;"' : 'style="color: red;"';
                        }
                    }
                }
                // In exam mode, spanStyle remains empty.
                currentWordHTML += `<span ${spanStyle}>${word[c]}</span>`;
                overallIndex++;
            }
            if (w === currentWordIndex && currentMode === 'practice') {
                currentWordHTML = `<span style="background-color: yellow;">${currentWordHTML}</span>`;
            }
            newHTML += currentWordHTML;
            while (overallIndex < text.length && (text[overallIndex] === ' ' || text[overallIndex] === '\n')) {
                if (text[overallIndex] === ' ') {
                    newHTML += ((inputValue[overallIndex] === ' ') && (currentMode === 'practice') ? `<span style="color: green;"> </span>` : `<span> </span>`);
                } else if (text[overallIndex] === '\n') {
                    newHTML += '<br>';
                }
                overallIndex++;
            }
        }
        typingTextContainer.innerHTML = newHTML;
        typingInput.setSelectionRange(inputValue.length, inputValue.length);
        typingInput.focus();
    });
    
    timerStarted = false;
    
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
                    // Updated to use innerText for contenteditable element
                    calculateSpeed(typingInput.innerText.length, time);
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
        // Updated to use innerText for contenteditable element
        calculateSpeed(typingInput.innerText.length, elapsedTime);
    });
}

function updateTimerDisplay(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    document.getElementById('timer-display').innerText = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function calculateSpeed(charsTyped, elapsedTime) {
    // New Code: Change heading text
    document.querySelector('.top-section h1').innerText = "Test Results";
    
    // Use the typed text from the typing-input once
    const inputText = document.getElementById('typing-input').innerText;
    const typedWords = inputText.trim().split(/\s+/).filter(w => w.length);
    const totalTypedWords = typedWords.length;
    const wordsPerMinute = (totalTypedWords / elapsedTime) * 60;

    // Get original text stats using one declaration
    const originalText = window.originalText;
    const totalOriginalLetters = originalText.length;
    const originalWordsArr = originalText.trim().split(/\s+/).filter(w => w.length);
    const totalOriginalWords = originalWordsArr.length;

    // Count correct words in order
    let correctWords = 0;
    for (let i = 0; i < Math.min(totalTypedWords, totalOriginalWords); i++) {
        if (typedWords[i] === originalWordsArr[i]) {
            correctWords++;
        }
    }
    const wrongWords = totalTypedWords - correctWords;
    const correctWordsPercent = totalTypedWords ? (correctWords / totalTypedWords) * 100 : 0;
    const wrongWordsPercent = totalTypedWords ? (wrongWords / totalTypedWords) * 100 : 0;

    // Per-word letter comparison
    let correctLetters = 0;
    let wrongLetters = 0;
    for (let i = 0; i < typedWords.length; i++) {
        const typedWord = typedWords[i] || '';
        const origWord = originalWordsArr[i] || '';
        const len = Math.min(typedWord.length, origWord.length);
        for (let j = 0; j < len; j++) {
            if (typedWord[j] === origWord[j]) {
                correctLetters++;
            } else {
                wrongLetters++;
            }
        }
        wrongLetters += Math.abs(typedWord.length - origWord.length);
    }
    const totalTypedLetters = correctLetters + wrongLetters;
    const correctLettersPercent = totalTypedLetters ? (correctLetters / totalTypedLetters) * 100 : 0;
    const wrongLettersPercent = totalTypedLetters ? (wrongLetters / totalTypedLetters) * 100 : 0;

    const keysPerMinute = (charsTyped / elapsedTime) * 60;

    // Build results table with extra metrics rows (unchanged)
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
    
    // Display results and hide test elements
    document.getElementById('test-results').innerHTML = resultHTML;
    document.getElementById('test-results').style.display = 'block';
    document.getElementById('timer-display').style.display = 'none';
    document.getElementById('typing-input').style.display = 'none';
    document.getElementById('end-test').style.display = 'none';

    // Disable further editing of the typing input
    document.getElementById('typing-input').setAttribute('contenteditable', 'false');


    updateParagraphHighlight(); // Re-render typing-text with extra spaces highlighted.
}

function updateWordCount() {
  const text = document.getElementById('custom-text').innerText.trim();   // End New Code
  const words = text === '' ? 0 : text.split(/\s+/).length;
  document.getElementById('word-count').innerText = `Word Count: ${words}`;
}

const modeSelect = document.getElementById('mode-select');

// Updated global alignWords helper with tie-breaking (prefer deletion when costs tie)
function alignWords(original, typed) {
    const m = original.length, n = typed.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++){
        for (let j = 1; j <= n; j++){
            if (original[i - 1] === typed[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,        // deletion
                    dp[i - 1][j - 1] + 1,      // substitution
                    dp[i][j - 1] + 1           // insertion
                );
            }
        }
    }
    let i = m, j = n;
    const aligned = [];
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && original[i - 1] === typed[j - 1]) {
            aligned.unshift({ original: original[i - 1], typed: typed[j - 1] });
            i--; j--;
        } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
            // Prefer deletion in a tie, so if omission, mark original word missing
            aligned.unshift({ original: original[i - 1], typed: null });
            i--;
        } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
            aligned.unshift({ original: original[i - 1], typed: typed[j - 1] });
            i--; j--;
        } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
            aligned.unshift({ original: null, typed: typed[j - 1] });
            j--;
        }
    }
    return aligned;
}

// NEW: Apply blur if Blind Test mode is selected
modeSelect.addEventListener('change', function() {
    const typingInput = document.getElementById('typing-input');
    if (this.value === 'blind') {
        typingInput.style.filter = "blur(8px)";
    } else {
        typingInput.style.filter = "";
    }
});
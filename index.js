const styledTypedText = document.getElementById('typed-text');
const typingTextLive = document.getElementById('typing-text-live');
const modeSelect = document.getElementById('mode-select');
const timerSelect = document.getElementById('timer');
const customTimerInput = document.getElementById('custom-timer');
const customText = document.getElementById('custom-text');
const saveTextBtn = document.getElementById('save-text-btn');
const viewSavedBtn = document.getElementById('view-saved-btn');
const randomTextRadio = document.getElementById('random-text-radio');
const customTextRadio = document.getElementById('custom-text-radio');
const randomTextGroup = document.getElementById('random-text-group');
const uploadContainer = document.getElementById('upload-container');
const randomWordCountSelect = document.getElementById('randomWordCount');
const customWordCountInput = document.getElementById('customWordCount');
const typingTest = document.getElementById('typing-test');
const typingTextContainer = document.getElementById('typing-text-live');
const typingInput = document.getElementById('typing-input');
const testResults = document.getElementById('test-results');
const timerDisplay = document.getElementById('timer-display');
const endTest = document.getElementById('end-test');
const bottomSection = document.querySelector('.bottom-section');
const endTestContainer = document.querySelector('.end-test-container');

// Show/hide sections based on initial selection
if (randomTextRadio.checked) {
    randomTextGroup.style.display = 'flex';  // Changed from 'block' to 'flex'
    uploadContainer.style.display = 'none';
  }
randomTextRadio.addEventListener('change', () => {
    randomTextGroup.style.display = 'flex';  // Changed from 'block' to 'flex'
    uploadContainer.style.display = 'none';
    customWordCountInput.disabled = false;
});

customTextRadio.addEventListener('change', () => {
    randomWordCountSelect.value = "100";
    customWordCountInput.value = ""; 
    customWordCountInput.disabled = true;
    randomTextGroup.style.display = 'none';
    uploadContainer.style.display = 'block';
    // NEW: Check if saved texts exist and toggle the View Saved Texts button
    let saved = JSON.parse(localStorage.getItem('savedTexts') || '[]');
    if (saved.length > 0) {
        viewSavedBtn.style.display = 'inline-block';
    } else {
        viewSavedBtn.style.display = 'none';
    }
});
  
  // Toggle custom word count input
randomWordCountSelect.addEventListener('change', () => {
    if (randomWordCountSelect.value === 'custom') {
      customWordCountInput.style.display = 'inline-block';
      customWordCountInput.required = true;
      customWordCountInput.disabled = false;
    } else {
      customWordCountInput.style.display = 'none';
      customWordCountInput.required = false;
      customWordCountInput.disabled = true;
    }
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
            document.getElementById('custom-text').dispatchEvent(new Event('input', { bubbles: true }));
        };
        reader.readAsText(e.target.files[0]);
    }
});

// Update the paste event handler for #custom-text:
document.getElementById('custom-text').addEventListener('paste', function(e) {
    e.preventDefault();
    let pastedData = (e.clipboardData || window.clipboardData).getData('text');
    pastedData = sanitizeQuotesAndDashes(pastedData);
    const customText = document.getElementById('custom-text');
    customText.focus();
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(pastedData));
    }
    // Trigger input event after paste so that Save Text button is updated
    customText.dispatchEvent(new Event('input', { bubbles: true }));
});

document.getElementById('custom-text').addEventListener('input', function() {
    if (this.innerText.trim()) {
        this.classList.remove('input-error');
    }
    updateWordCount();
});

function sanitizeQuotesAndDashes(str) {
    // Convert fancy quotes (single and double) and em dashes to their standard forms
    return str
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/—/g, "--");
}

timerSelect.addEventListener('change', () => {
    if (timerSelect.value === 'custom') {
        customTimerInput.style.display = 'block';
        customTimerInput.required = true;
    } else {
        customTimerInput.style.display = 'none';
        customTimerInput.required = false;
    }
});



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
    //   styleTypedText(randomText);
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
    //   styleTypedText(customText);
    }
});

// Generate random words
function getRandomWords(count) {
  const words = [
    'lorem','Ipsum','dolor','sit','amet','consectetur','adipiscing','elit',
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

// Show Save Text button if custom-text has non-empty text
customText.addEventListener('input', function() {
    updateWordCount();
    if (this.innerText.trim().length > 0) {
        saveTextBtn.style.display = 'inline-block';
    } else {
        saveTextBtn.style.display = 'none';
    }
});

// NEW: Define a custom modal for saving text (replacing prompt for heading)
function openSaveTextModal(callback) {
    const modalOverlay = document.createElement('div');
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.zIndex = '1000';

    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '600px';
    modalContent.innerHTML = `
        <h2>Save Your Text</h2>
        <label>Heading: <span style="color: red;">*</span></label><br>
        <input type="text" id="save-heading" style="width: 100%;" required>
        <p id="heading-error" style="color: red; display: none;">Heading is required</p><br>
        <button id="save-text-submit">Save</button>
        <button id="save-text-cancel">Cancel</button>
    `;
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    document.getElementById('save-text-submit').addEventListener('click', () => {
        const heading = document.getElementById('save-heading').value.trim();
        const errorElement = document.getElementById('heading-error');
        
        // Validate the heading field
        if (!heading) {
            errorElement.style.display = 'block';
            return; // Stop execution if heading is empty
        }
        
        // If heading is valid, continue with saving
        errorElement.style.display = 'none';
        modalContent.innerHTML = `<h2>Text saved successfully</h2>`;
        setTimeout(() => {
            if(document.body.contains(modalOverlay)) {
                document.body.removeChild(modalOverlay);
            }
            callback(heading);
        }, 1000); // wait 1 second before closing
    });
    
    document.getElementById('save-text-cancel').addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
}

// Replace existing saveTextBtn event listener:
saveTextBtn.addEventListener('click', function() {
    const textValue = customText.innerText.trim();
    if (!textValue) return;
    openSaveTextModal(function(heading) {
        if (!heading) return;
        let saved = JSON.parse(localStorage.getItem('savedTexts') || '[]');
        saved.push({ heading, text: textValue });
        localStorage.setItem('savedTexts', JSON.stringify(saved));
        // Immediately show the View Saved Texts button
        const viewSavedBtn = document.getElementById('view-saved-btn');
        if (viewSavedBtn) {
            viewSavedBtn.style.display = 'inline-block';
        }
        showModalAutoDismiss("Text saved!");
    });
});

// Update customTextRadio event listener:
customTextRadio.addEventListener('change', () => {
    randomWordCountSelect.value = "100";
    customWordCountInput.value = "";
    customWordCountInput.disabled = true;
    randomTextGroup.style.display = 'none';
    uploadContainer.style.display = 'block';
    // NEW: Check if saved texts exist and toggle the View Saved Texts button
    let saved = JSON.parse(localStorage.getItem('savedTexts') || '[]');
    if (saved.length > 0) {
        viewSavedBtn.style.display = 'inline-block';
    } else {
        viewSavedBtn.style.display = 'none';
    }
});

// NEW: When View Saved Texts button is clicked, navigate to the saved texts page
viewSavedBtn.addEventListener('click', () => {
    window.location.href = 'saved-texts.html';
});

// At the start of your script, add this to check for a saved text to use:
document.addEventListener('DOMContentLoaded', function() {
    const useTextValue = localStorage.getItem("useSavedText");
    if (useTextValue) {
        // Select and check the custom-text radio button
        document.getElementById('custom-text-radio').checked = true;
        // Dispatch change event to update UI accordingly
        document.getElementById('custom-text-radio').dispatchEvent(new Event('change', { bubbles: true }));
        // Paste the saved text into the custom-text field
        document.getElementById('custom-text').innerText = useTextValue;
        // Remove the temporary key
        localStorage.removeItem("useSavedText");
    }
});

// Utility to resolve selected time
function resolveSelectedTime() {
  let selectedTime = timerSelect.value === 'custom'
      ? parseInt(customTimerInput.value)
      : parseInt(timerSelect.value);
  return selectedTime * 60;
}

function startTypingTest(text, time) {
    document.getElementById('setup-form').style.display = 'none';
    // Sanitize original text
    text = sanitizeQuotesAndDashes(text);
    window.originalText = text;
    // Remove non-breaking spaces that can occur in contenteditable divs
    text = text.replace(/\u00A0/g, ' ');
    // Initialize typing-text-live with character spans for highlighting
    typingTextContainer.innerHTML = '';
    
    // Wrap each character in a span for individual styling
    for (let i = 0; i < text.length; i++) {
        const charSpan = document.createElement('span');
        charSpan.textContent = text[i];
        
        // Highlight the first character to start
        if (i === 0) {
            charSpan.style.backgroundColor = 'yellow';
        }
        
        typingTextContainer.appendChild(charSpan);
    }
    
    typingTest.classList.add('active');
    typingInput.innerText = '';
    typingInput.focus();
    
    timerStarted = false;
    
    // Add keydown event to handle backspace properly
    typingInput.addEventListener('keydown', function(e) {
        // Start timer on first key press
        if (!timerStarted) {
            timerStarted = true;
            startTime = Date.now();
            interval = setInterval(() => {
                let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                let remainingTime = time - elapsedTime;
                if (remainingTime <= 0) {
                    updateTimerDisplay(0);
                    clearInterval(interval);
                    calculateSpeed(typingInput.innerText.length, time);
                } else {
                    updateTimerDisplay(remainingTime);
                }
            }, 1000);
        }

        if (e.key === 'Backspace') {
            // Get current typed text before backspace takes effect
            const currentTypedText = typingInput.innerText;
            
            // After a brief delay to let the backspace take effect
            setTimeout(() => {
                const charSpans = typingTextContainer.querySelectorAll('span');
                const newTypedLength = typingInput.innerText.length;
                
                // If backspace was pressed at position > 0, reset styling for the character at the position
                if (currentTypedText.length > 0 && newTypedLength < currentTypedText.length) {
                    // Clear color of the character that was deleted
                    if (newTypedLength < charSpans.length) {
                        charSpans[newTypedLength].style.color = '';
                        // And highlight it yellow
                        charSpans[newTypedLength].style.backgroundColor = 'yellow';
                    }
                    
                    // Remove highlight from next character
                    if (newTypedLength + 1 < charSpans.length) {
                        charSpans[newTypedLength + 1].style.backgroundColor = '';
                    }
                }
            }, 10);
        }
        
    });
    
    // Add input event listener to track typing progress and update highlighting
    typingInput.addEventListener('input', function() {
        const typedText = typingInput.innerText.replace(/\u00A0/g, ' '); 
        // Force empty string if only newlines or whitespace
        if (!typingInput.innerText.trim()) {
            typingInput.innerHTML = '';
        }
        
        const charSpans = typingTextContainer.querySelectorAll('span');
        
        // Reset all spans for re-evaluation
        for (let i = 0; i < charSpans.length; i++) {
            charSpans[i].style.backgroundColor = '';
            charSpans[i].style.color = '';
        }
        
        // Process each character that has been typed
        for (let i = 0; i < typedText.length; i++) {
            if (i < text.length) {
                const isCorrect = typedText[i] === text[i];
                // console.log(typedText[i], text[i], isCorrect, typedText.charCodeAt(i), text.charCodeAt(i));
                // Special handling for spaces
                if (text[i] === ' ') {
                    if (typedText[i] === ' ') {
                        // charSpans[i].style.backgroundColor = '#D4EFDF';
                    } else {
                        charSpans[i].style.backgroundColor = 'red';
                    }
                } else {
                    // Regular styling for non-space characters
                    charSpans[i].style.color = isCorrect ? 'green' : 'red';
                }
            }
        }
        
        // Highlight current position if within text bounds
        if (typedText.length < text.length) {
            charSpans[typedText.length].style.backgroundColor = 'yellow';
        }
    });

    typingInput.style.overflowY = 'hidden';
    
    // End Test button event
    const endTestBtn = document.getElementById('end-test');
    endTestBtn.addEventListener('click', function() {
        if (interval) clearInterval(interval);
        let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        calculateSpeed(typingInput.innerText.length, elapsedTime);
    });
}

function updateTimerDisplay(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    document.getElementById('timer-display').innerText = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function calculateSpeed(charsTyped, elapsedTime) {
    const h2 = document.createElement('h2');
    h2.innerText = "Test Results";
    document.querySelector('.top-section').appendChild(h2);
    
    // Get the typed text (with non-breaking spaces converted to regular spaces)
    const typedText = typingInput.innerText.replace(/\u00A0/g, ' ');
    const originalText = window.originalText;
    
    // Calculate time in minutes for rate calculations
    const timeInMinutes = elapsedTime / 60;
    
    // Basic metrics
    const keysPerMinute = timeInMinutes > 0 ? charsTyped / timeInMinutes : 0;
    const wordsPerMinute = timeInMinutes > 0 ? (charsTyped / 5) / timeInMinutes : 0;
    
    // Character accuracy metrics
    const totalTypedLetters = typedText.length;
    const totalOriginalLetters = originalText.length;
    
    // Count correct and wrong characters
    let correctLetters = 0;
    for (let i = 0; i < Math.min(totalTypedLetters, totalOriginalLetters); i++) {
        if (typedText[i] === originalText[i]) {
            correctLetters++;
        }
    }
    const wrongLetters = totalTypedLetters - correctLetters;
    
    // Calculate percentages
    const correctLettersPercent = totalTypedLetters > 0 ? (correctLetters / totalTypedLetters) * 100 : 0;
    const wrongLettersPercent = totalTypedLetters > 0 ? (wrongLetters / totalTypedLetters) * 100 : 0;

    // Word accuracy metrics
    const typedWords = typedText.split(/\s+/);
    const originalWords = originalText.split(/\s+/);
    const totalTypedWords = typedWords.filter(word => word.trim().length > 0).length;
    const totalOriginalWords = originalWords.length;
    
    // Count correct and wrong words
    let correctWords = 0;
    for (let i = 0; i < Math.min(typedWords.length, originalWords.length); i++) {
        if (typedWords[i] === originalWords[i]) {
            correctWords++;
        }
    }
    const wrongWords = totalTypedWords - correctWords;
    
    // Calculate word percentages
    const correctWordsPercent = totalTypedWords > 0 ? (correctWords / totalTypedWords) * 100 : 0;
    const wrongWordsPercent = totalTypedWords > 0 ? (wrongWords / totalTypedWords) * 100 : 0;

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
    testResults.innerHTML = resultHTML;
    testResults.style.display = 'block';
    timerDisplay.style.display = 'none';
    typingInput.style.display = 'none';
    endTest.style.display = 'none';

    // Disable further editing of the typing input
    typingInput.setAttribute('contenteditable', 'false');

    // Remove the bottom-section element
    bottomSection.remove();
    endTestContainer.remove();
}

function updateWordCount() {
  const text = customText.innerText.trim();   // End New Code
  const words = text === '' ? 0 : text.split(/\s+/).length;
  document.getElementById('word-count').innerText = `Word Count: ${words}`;
}

// NEW: Apply blur if Blind Test mode is selected
modeSelect.addEventListener('change', function() {
    if (this.value === 'blind') {
        typingInput.style.filter = "blur(8px)";
    } else {
        typingInput.style.filter = "";
    }
});


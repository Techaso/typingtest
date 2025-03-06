const styledTypedText = document.getElementById('typed-text');
const typingTextLive = document.getElementById('typing-text-live');
const modeSelect = document.getElementById('mode-select');
const timerSelect = document.getElementById('timer');
const customTimerInput = document.getElementById('custom-timer');
const customText = document.getElementById('custom-text');
const saveTextBtn = document.getElementById('save-text-btn');
const viewSavedBtn = document.getElementById('view-saved-btn');
const predefinedTextRadio = document.getElementById('predefined-text-radio');
const customTextRadio = document.getElementById('custom-text-radio');
const wordLimitGroup = document.getElementById('word-limit-group');
const uploadContainer = document.getElementById('upload-container');
const wordLimitSelect = document.getElementById('wordLimit');
const customWordLimitInput = document.getElementById('customWordLimit');
const typingTest = document.getElementById('typing-test');
const typingTextContainer = document.getElementById('typing-text-live');
const typingInput = document.getElementById('typing-input');
const testResults = document.getElementById('test-results');
const timerDisplay = document.getElementById('timer-display');
const endTest = document.getElementById('end-test');
const bottomSection = document.querySelector('.bottom-section');
const endTestContainer = document.querySelector('.end-test-container');
const websiteHeading = document.getElementById('website-heading');
const reloadButton = document.getElementById('reload-button');
const generateTextButton = document.getElementById('generate-btn');
const aiContainer = document.getElementById('ai-container');

// Add these global variables
let interval;
let timerStarted = false;
let excessCharacters = '';

// Show/hide sections based on initial selection
if (predefinedTextRadio.checked) {
    wordLimitGroup.style.display = 'flex';  // Changed from 'block' to 'flex'
    uploadContainer.style.display = 'none';
}
predefinedTextRadio.addEventListener('change', () => {
    const noLimitOption = document.getElementById('no-limit-option');
    noLimitOption.style.display = 'none';
    wordLimitSelect.value = "100";
    wordLimitGroup.style.display = 'flex';  // Changed from 'block' to 'flex'
    uploadContainer.style.display = 'none';
    customWordLimitInput.disabled = false;
    aiContainer.style.display = 'none';
});

customTextRadio.addEventListener('change', () => {
    const noLimitOption = document.getElementById('no-limit-option');
    wordLimitSelect.value = noLimitOption.value;
    noLimitOption.style.display = '';
    customWordLimitInput.value = ""; 
    customWordLimitInput.disabled = true;
    // Keep word limit group visible for custom text too
    wordLimitGroup.style.display = 'flex';
    uploadContainer.style.display = 'block';
    aiContainer.style.display = 'block';
    // Update word count against limit
    updateWordCount();
    // NEW: Check if saved texts exist and toggle the View Saved Texts button
    let saved = JSON.parse(localStorage.getItem('savedTexts') || '[]');
    if (saved.length > 0) {
        viewSavedBtn.style.display = 'inline-block';
    } else {
        viewSavedBtn.style.display = 'none';
    }
});
  
// Toggle custom word count input
wordLimitSelect.addEventListener('change', () => {
    if (wordLimitSelect.value === 'custom') {
      customWordLimitInput.style.display = 'inline-block';
      customWordLimitInput.required = true;
      customWordLimitInput.disabled = false;
    } else {
      customWordLimitInput.style.display = 'none';
      customWordLimitInput.required = false;
      customWordLimitInput.disabled = true;
    }
});

document.getElementById('upload-btn').addEventListener('click', () => {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const reader = new FileReader();
        reader.onload = (event) => {
            // Process file content through our comprehensive text cleaning function
            cleanAndPasteText(event.target.result, customText);
            e.target.value = ""; // clear file input to avoid conflicts
        };
        reader.readAsText(e.target.files[0]);
    }
});

/**
 * Comprehensive function to clean and paste text into a contenteditable element
 * Handles: non-English characters removal, converting formatting (superscript/subscript) to normal text,
 * quote/dash normalization, and proper cursor positioning
 */
function cleanAndPasteText(text, targetElement) {
    if (!text || !targetElement) return;
    
    // Step 1: Clean the text
    let cleanedText = text;
    
    // Convert HTML superscript/subscript to normal text instead of removing
    cleanedText = cleanedText.replace(/<sup>(.*?)<\/sup>/gi, function(match, group) {
        // Convert superscript numbers to normal numbers
        return group;
    });
    
    cleanedText = cleanedText.replace(/<sub>(.*?)<\/sub>/gi, function(match, group) {
        // Convert subscript numbers to normal numbers
        return group;
    });
    
    // Convert Unicode superscript characters to normal characters
    const superscriptMap = {
        // Numbers
        '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', 
        '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
        
        // Operators and symbols
        '⁺': '+', '⁻': '-', '⁼': '=', '⁽': '(', '⁾': ')',
        '⁄': '/', '⁎': '*', '˙': '.', '‸': '^', '˚': '°',
        '∗': '*', '□': '#', '⁀': '~', '´': "'", '˝': '"',
        '˂': '<', '˃': '>', '˄': '^', '˅': 'v', '˜': '~',
        '˟': 'x', '‍ᵏ': 'k', '˒': ',', '˓': '!', '˔': '?',
        '˕': ';', '˖': '+', '˗': '-', '˘': '`', 'ᵉⁿ': 'en',
        
        // Lowercase letters
        'ᵃ': 'a', 'ᵇ': 'b', 'ᶜ': 'c', 'ᵈ': 'd', 'ᵉ': 'e',
        'ᶠ': 'f', 'ᵍ': 'g', 'ʰ': 'h', 'ⁱ': 'i', 'ʲ': 'j',
        'ᵏ': 'k', 'ˡ': 'l', 'ᵐ': 'm', 'ⁿ': 'n', 'ᵒ': 'o',
        'ᵖ': 'p', 'ᵠ': 'q', 'ʳ': 'r', 'ˢ': 's', 'ᵗ': 't', 
        'ᵘ': 'u', 'ᵛ': 'v', 'ʷ': 'w', 'ˣ': 'x', 'ʸ': 'y', 'ᶻ': 'z',
        
        // Uppercase letters
        'ᴬ': 'A', 'ᴮ': 'B', 'ᶜ': 'C', 'ᴰ': 'D', 'ᴱ': 'E', 'ᶠ': 'F', 'ᴳ': 'G',
        'ᴴ': 'H', 'ᴵ': 'I', 'ᴶ': 'J', 'ᴷ': 'K', 'ᴸ': 'L', 'ᴹ': 'M', 'ᴺ': 'N', 
        'ᴼ': 'O', 'ᴾ': 'P', 'ᵠ': 'Q', 'ᴿ': 'R', 'ˢ': 'S', 'ᵀ': 'T', 'ᵁ': 'U', 
        'ⱽ': 'V', 'ᵂ': 'W', 'ˣ': 'X', 'ʸ': 'Y', 'ᶻ': 'Z'
    };
    
    // Convert Unicode subscript characters to normal characters
    const subscriptMap = {
        // Numbers
        '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
        '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
        
        // Operators and symbols
        '₊': '+', '₋': '-', '₌': '=', '₍': '(', '₎': ')',
        '₣': 'f', '₤': 'L', '₧': 'Pts', '₨': 'Rs', '₩': 'W',
        '₪': 'NS', '₫': 'd', '€': 'E', '₭': 'K', '₮': 'T',
        '₯': 'Dr', '₰': 'Pf', '₱': 'P', '₲': 'G', '₳': 'A',
        '₴': 'UAH', '₵': 'C', '₸': 'T', '₹': 'Rs', '₺': 'TL',
        '₼': 'man', '₽': 'P', '₾': 'GEL', '₿': 'B',
        
        // Lowercase letters
        'ₐ': 'a', 'ₑ': 'e', 'ₕ': 'h', 'ᵢ': 'i', 'ⱼ': 'j', 
        'ₖ': 'k', 'ₗ': 'l', 'ₘ': 'm', 'ₙ': 'n', 'ₒ': 'o', 
        'ₚ': 'p', 'ᵣ': 'r', 'ₛ': 's', 'ₜ': 't', 'ᵤ': 'u', 
        'ᵥ': 'v', 'ₓ': 'x', 'ᵦ': 'b', 'ᵧ': 'y', 'ᵨ': 'p', 
        'ᵩ': 'φ', 'ᵪ': 'x', 'ₔ': 'q', 'ₕ': 'h', 'ₖ': 'k',
        'ₙ': 'n', 'ₚ': 'p', 'ₛ': 's', 'ₜ': 't', 'ₓ': 'x',
        'ₐ': 'a', 'ₑ': 'e', 'ᵦ': 'β', 'ᵧ': 'γ', 'ᵨ': 'ρ', 'ᵩ': 'φ'
    };
    
    // Preserve ASCII characters and convert Unicode superscript/subscript
    let result = '';
    for (let i = 0; i < cleanedText.length; i++) {
        const char = cleanedText[i];
        
        // Check if the character is in the superscript map
        if (superscriptMap[char]) {
            result += superscriptMap[char];
        }
        // Check if the character is in the subscript map
        else if (subscriptMap[char]) {
            result += subscriptMap[char];
        }
        // If it's an ASCII character or space, keep it
        else if (/[\x00-\x7F\s]/.test(char)) {
            result += char;
        }
        // Otherwise, it's a non-ASCII character we want to exclude
    }
    
    // Update cleanedText with our converted result
    cleanedText = result;
    
    // Normalize quotes and dashes
    cleanedText = sanitizeQuotesAndDashes(cleanedText);
    
    // Convert non-breaking spaces to regular spaces
    cleanedText = cleanedText.replace(/\u00A0/g, ' ');
    
    // Step 2: Insert the cleaned text into the target element
    targetElement.focus();
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0) {
        // Delete any currently selected text
        selection.deleteFromDocument();
        
        // Insert the cleaned text as a plain text node
        const textNode = document.createTextNode(cleanedText);
        selection.getRangeAt(0).insertNode(textNode);
        
        // Move cursor to the end of inserted text
        const range = document.createRange();
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        // If no selection range, just set the content directly
        targetElement.innerText = cleanedText;
    }
    
    // Step 3: Update UI and trigger events
    if (targetElement.id === 'custom-text') {
        updateWordCount();
    }
    
    // Trigger input event after paste so that UI updates appropriately
    targetElement.dispatchEvent(new Event('input', { bubbles: true }));
}

// Update the paste event handler for #custom-text to use the new function:
customText.addEventListener('paste', function(e) {
    e.preventDefault();
    let pastedData = (e.clipboardData || window.clipboardData).getData('text');
    cleanAndPasteText(pastedData, customText);
});

customText.addEventListener('input', function() {
    if (this.innerText.trim()) {
        this.classList.remove('input-error');
    }
    updateWordCount();
});

function sanitizeQuotesAndDashes(str) {
    // Convert fancy quotes (single and double) and em dashes to their standard forms
    return str
        .replace(/['']/g, "'")
        .replace(/[""]/g, '"')
        .replace(/[—–]/g, "--"); // Added en dash to the replacements
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



document.getElementById('setup-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get the selected word limit
    let wordLimit = parseInt(wordLimitSelect.value);
    if (wordLimitSelect.value === 'custom') {
        wordLimit = parseInt(customWordLimitInput.value) || 50;
    }

    // Check which radio is selected
    if (predefinedTextRadio.checked) {
        // Generate random text
        const predefinedText = await getPredefinedWords(wordLimit);
        startTypingTest(predefinedText, resolveSelectedTime());
    } else {
        // Handle custom text
        const customTextContent = customText.innerText.trim();
        if (!customTextContent) {
            customText.classList.add('input-error');
            return;
        } else {
            customText.classList.remove('input-error');
        }

        // Truncate custom text to word limit
        const truncatedText = truncateTextToWordLimit(customTextContent, wordLimit);
        startTypingTest(truncatedText, resolveSelectedTime());
    }
});

// Function to truncate text to a specified word limit
function truncateTextToWordLimit(text, limit) {
    const words = text.split(/\s+/);
    if (words.length <= limit) {
        return text; // No truncation needed
    }
    
    // Take only the specified number of words
    return words.slice(0, limit).join(' ');
}

// Generate random words
async function generateText() {
    let wordLimit = parseInt(wordLimitSelect.value);
    if (wordLimitSelect.value === 'custom') {
        wordLimit = parseInt(customWordLimitInput.value) || 50;
    }
    
    const generationType = generationOptions.value;
    const userPrompt = userPromptInput.value.trim();
    
    try {
        const apiUrl = new URL('https://goldfish-app-yq66j.ondigitalocean.app/api/generate-text');
        apiUrl.searchParams.append('wordLimit', wordLimit);
        apiUrl.searchParams.append('type', generationType);
        
        if (generationType === 'custom' && userPrompt) {
            apiUrl.searchParams.append('prompt', userPrompt);
        }
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!response.ok) {
            return getPredefinedWords(wordLimit);
        }
        return data.text;
    } catch (error) {
        console.error('Error fetching random text:', error);
        return getPredefinedWords(wordLimit);
    }
}
  
  // Keep original function as fallback
  async function getPredefinedWords(wordLimit) {
    const response = await fetch('predefined.txt');
    const text = await response.text();
    const words = text.split(/\s+/);
    let result = [];
    for (let i = 0; i < wordLimit; i++) {
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
    });
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
        customText.innerText = useTextValue;
        // Update the word count
        updateWordCount();
        // Also show the save button since there's text
        saveTextBtn.style.display = 'inline-block';
        // Remove the temporary key
        localStorage.removeItem("useSavedText");
    }
    // Initially hide word count if custom text is empty
    const wordCountDiv = document.getElementById('word-count');
    if (!customText.innerText.trim()) {
        wordCountDiv.style.display = 'none';
    }

    if (generationOptions.value === 'no') {
        generateTextButton.style.display = 'none';
        userPromptInput.style.display = 'none';
    } else if (generationOptions.value === 'custom') {
        userPromptInput.style.display = 'inline-block';
    }
    if (predefinedTextRadio.checked) {
        aiContainer.style.display = 'none';
    } else if (customTextRadio.checked) {
        aiContainer.style.display = 'block';
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
    // Reset UI from any previous test
    testResults.style.display = 'none';
    bottomSection.style.display = 'flex';
    endTestContainer.style.display = 'block';
    timerDisplay.style.display = 'block';
    typingInput.style.display = 'block';
    // Reset contenteditable attribute to allow typing
    typingInput.setAttribute('contenteditable', 'true');
    
    // Reset test state
    window.hasTestEnded = false;
    window.lastTestElapsedTime = null; // Reset the stored elapsed time
    
    // Clear any existing interval
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
    
    // Reset timerStarted flag and clear any existing timer data
    timerStarted = false;
    excessCharacters = '';
    
    document.getElementById('setup-form').style.display = 'none';
    // Sanitize original text
    text = sanitizeQuotesAndDashes(text);
    window.originalText = text;
    // Remove non-breaking spaces that can occur in contenteditable divs
    text = text.replace(/\u00A0/g, ' ');
    // Initialize typing-text-live with character spans for highlighting
    typingTextContainer.innerHTML = '';
    
    // FIXED: Clone and replace the home button to remove existing event listeners
    const homeBtn = document.getElementById('home-button');
    const newHomeBtn = homeBtn.cloneNode(true);
    newHomeBtn.removeAttribute('onclick'); // Remove the onclick attribute to prevent double triggering
    homeBtn.parentNode.replaceChild(newHomeBtn, homeBtn);
    
    // Add new event listener to the fresh home button
    newHomeBtn.addEventListener('click', navigateHome);
    
    // Remove previous event listener by cloning and replacing the button
    const reloadBtn = document.getElementById('reload-button');
    const newReloadBtn = reloadBtn.cloneNode(true);
    reloadBtn.parentNode.replaceChild(newReloadBtn, reloadBtn);
    
    // Add new event listener to the fresh button element
    newReloadBtn.addEventListener('click', function() {
        if (!window.hasTestEnded && timerStarted) {
            if (confirm("Are you sure you want to restart the test? Your current progress will be lost.")) {
                clearInterval(interval);
                interval = null;
                startTypingTest(window.originalText, time);
            }
        } else {
            if(confirm("Are you sure you want to restart the test?")){
                clearInterval(interval);
                interval = null;
                // Force a complete reset of test state
                window.hasTestEnded = false;
                timerStarted = false;
                startTypingTest(window.originalText, time);
            }
        }
        newReloadBtn.innerHTML = '<i class="fas fa-redo-alt"></i> Restart Test';
    });
    
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
    updateTimerDisplay(time);
    
    // Always create a fresh startTime that will be assigned on first keypress
    let startTime = Date.now();
    
    // Update paste event listener to use cleanAndPasteText function for proper handling of formatted text
    typingInput.addEventListener('paste', function(e) {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        cleanAndPasteText(pastedText, typingInput);
    });
    
    // Add keydown event to handle backspace properly
    typingInput.addEventListener('keydown', function(e) {
        // Start timer on first key press
        if (!timerStarted) {
            timerStarted = true;
            // Clear any existing interval just to be safe
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
            interval = setInterval(() => {
                let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                let remainingTime = time - elapsedTime;
                if (remainingTime <= 0) {
                    updateTimerDisplay(0);
                    clearInterval(interval);
                    // Pass the actual elapsed time instead of planned time
                    calculateSpeed(typingInput.innerText.length, elapsedTime);
                } else {
                    updateTimerDisplay(remainingTime);
                }
            }, 1000);
        }

        if (e.key === 'Backspace') {
            // Get current typed text before backspace takes effect
            let currentTypedText = typingInput.innerText.replace(/\u00A0/g, ' ');
            currentTypedText = sanitizeQuotesAndDashes(typingInput.innerText);
            
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
        let typedText = typingInput.innerText.replace(/\u00A0/g, ' ');
        typedText = sanitizeQuotesAndDashes(typedText);
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
        
        excessCharacters = '';

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
            } else {
                // Handle excess characters
                if (typedText[i] === ' ') {
                    // Space with red background
                    excessCharacters += '<span style="background-color: red;">&nbsp;</span>';
                } else {
                    // Regular character with red text
                    excessCharacters += '<span style="color: red;">' + typedText[i] + '</span>';
                }
            }
        }
        
        // Highlight current position if within text bounds
        if (typedText.length < text.length) {
            charSpans[typedText.length].style.backgroundColor = 'yellow';
        }
    });

    typingInput.style.overflowY = 'hidden';
    
    // Remove any existing event listeners from End Test button
    const endTestBtn = document.getElementById('end-test');
    const newEndTestBtn = endTestBtn.cloneNode(true);
    endTestBtn.parentNode.replaceChild(newEndTestBtn, endTestBtn);
    
    // End Test button event
    newEndTestBtn.addEventListener('click', function() {
        // Calculate how much time has elapsed
        let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        let remainingTime = time - elapsedTime;
        
        // If there's still time remaining on the clock, confirm submission
        if (remainingTime > 0 || isNaN(remainingTime)) {
            showConfirmSubmitModal(function(confirmed) {
                if (confirmed) {
                    if (interval) {
                        clearInterval(interval);
                        interval = null;
                    }
                    // Reset timer display when submitting early
                    updateTimerDisplay(time);
                    calculateSpeed(typingInput.innerText.length, elapsedTime);
                }
            });
        } else {
            // If timer already finished, just submit
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
            calculateSpeed(typingInput.innerText.length, elapsedTime);
        }
    });
}

function showConfirmSubmitModal(callback) {
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

    const modal = document.createElement('div');
    modal.style.backgroundColor = '#fff';
    modal.style.padding = '20px';
    modal.style.borderRadius = '8px';
    modal.style.maxWidth = '400px';
    modal.style.textAlign = 'center';

    const heading = document.createElement('h3');
    heading.textContent = 'Submit Test Early?';
    heading.style.marginTop = '0';
    
    const msgPara = document.createElement('p');
    msgPara.innerText = "Time hasn't run out yet. Are you sure you want to submit?";
    
    const btnContainer = document.createElement('div');
    btnContainer.style.marginTop = '20px';
    
    const submitBtn = document.createElement('button');
    submitBtn.innerText = 'Yes';
    submitBtn.style.marginRight = '10px';
    submitBtn.style.padding = '8px 16px';
    submitBtn.style.backgroundColor = '#333';
    submitBtn.style.color = '#fff';
    submitBtn.style.border = 'none';
    submitBtn.style.borderRadius = '4px';
    submitBtn.style.cursor = 'pointer';
    
    submitBtn.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
        callback(true);
    });
    
    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'No';
    cancelBtn.style.padding = '8px 16px';
    cancelBtn.style.border = '1px solid #ccc';
    cancelBtn.style.borderRadius = '4px';
    cancelBtn.style.cursor = 'pointer';
    
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
        callback(false);
    });
    
    btnContainer.appendChild(submitBtn);
    btnContainer.appendChild(cancelBtn);
    modal.appendChild(heading);
    modal.appendChild(msgPara);
    modal.appendChild(btnContainer);
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
}

function showModalAutoDismiss(message) {
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

    const modal = document.createElement('div');
    modal.style.backgroundColor = '#fff';
    modal.style.padding = '20px';
    modal.style.borderRadius = '8px';
    modal.style.maxWidth = '80%';
    modal.style.maxHeight = '80%';
    modal.style.overflowY = 'auto';
    modal.innerText = message;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    setTimeout(() => {
        if (document.body.contains(modalOverlay)) {
            document.body.removeChild(modalOverlay);
        }
    }, 2000);
}

function updateTimerDisplay(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    document.getElementById('timer-display').innerText = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function calculateSpeed(charsTyped, elapsedTime) {
    // Set flag that test is completed
    window.hasTestEnded = true;
    reloadButton.innerHTML = '<i class="fas fa-redo-alt"></i> Retake Test';  

    if (excessCharacters) {
        const excessDiv = document.createElement('div');
        excessDiv.innerHTML = excessCharacters;
        excessDiv.style.display = 'inline-block';
        typingTextContainer.appendChild(excessDiv);
    }

    // Get the typed text (with non-breaking spaces converted to regular spaces)
    const typedText = typingInput.innerText.replace(/\u00A0/g, ' ');
    const originalText = window.originalText;
    
    // Make sure we have a valid elapsed time (store for potential restart)
    elapsedTime = Math.max(1, elapsedTime); // Prevent division by zero
    window.lastTestElapsedTime = elapsedTime; // Store for reference
    
    // Calculate time in minutes for rate calculations
    const timeInMinutes = elapsedTime / 60;
    
    // Basic metrics
    const keysPerMinute = timeInMinutes > 0 ? charsTyped / timeInMinutes : 0;
    const wordsPerMinute = timeInMinutes > 0 ? (charsTyped / 5) / timeInMinutes : 0;
    
    // Character accuracy metrics
    const totalTypedLetters = typedText.length;
    const totalOriginalLetters = originalText.length;
    
    // IMPROVED ERROR CALCULATION LOGIC
    // Count correct characters and errors within the compared range
    let correctLetters = 0;
    let errorsInComparison = 0;
    
    // Calculate errors within overlapping section (min of both texts)
    for (let i = 0; i < Math.min(totalTypedLetters, totalOriginalLetters); i++) {
        if (typedText[i] === originalText[i]) {
            correctLetters++;
        } else {
            errorsInComparison++;
        }
    }
    
    // Extra characters typed beyond original text length are considered errors
    const extraCharacters = Math.max(0, totalTypedLetters - totalOriginalLetters);
    
    // Missing characters (if user typed less than original) are counted as errors
    const missingCharacters = Math.max(0, totalOriginalLetters - totalTypedLetters);
    
    // Total errors = errors in overlapping comparison + extra characters + missing characters
    const totalErrors = errorsInComparison + extraCharacters;
    
    // Calculate more accurate error rates and percentages
    // Use the total original length as the base for accuracy calculation
    const accuracy = totalOriginalLetters > 0 ? (correctLetters / totalOriginalLetters) * 100 : 0;
    
    // Error rate based on original text length
    const errorRate = totalOriginalLetters > 0 ? (totalErrors / totalOriginalLetters) * 100 : 0;
    
    // Calculate percentages for display
    const completionPercent = totalOriginalLetters > 0 ? (Math.min(totalTypedLetters, totalOriginalLetters) / totalOriginalLetters) * 100 : 0;

    // Word accuracy metrics - keeping this part of the original code
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
    const correctWordsPercent = totalOriginalWords > 0 ? (correctWords / totalOriginalWords) * 100 : 0;
    const wrongWordsPercent = totalOriginalWords > 0 ? ((totalTypedWords - correctWords) / totalOriginalWords) * 100 : 0;

    // Build results table with improved metrics
    const resultHTML = `
      <h2 style="text-align:center;">Test Results</h2>
      <table>
          <tr>
              <th>Metric</th>
              <th>Result</th>
          </tr>
          <tr>
              <td>Words per Minute</td>
              <td><h4>${wordsPerMinute.toFixed(2)} WPM</h4></td>
          </tr>
          <tr>
              <td>Keys per Minute</td>
              <td><h4>${keysPerMinute.toFixed(2)} KPM</h4></td>
          </tr>
          <tr>
              <td>Accuracy</td>
              <td>${accuracy.toFixed(2)}%</</td>
          </tr>
          <tr>
              <td>Error Rate</td>
              <td>${errorRate.toFixed(2)}%</td>
          </tr>
          <tr>
              <td>Correct Characters (Original Text)</td>
              <td>${correctLetters} / ${totalOriginalLetters} (${(correctLetters / totalOriginalLetters * 100).toFixed(2)}%)</td>
          </tr>
          <tr>
              <td>Wrong Characters (Original Text)</td>
              <td>${errorsInComparison} (${Math.min(totalTypedLetters, totalOriginalLetters) > 0 ? (errorsInComparison / Math.min(totalTypedLetters, totalOriginalLetters) * 100).toFixed(2) : '0.00'}%)</td>
          </tr>
          <tr>
              <td>Extra Characters</td>
              <td>${extraCharacters}</td>
          </tr>
          <tr>
              <td>Missing Characters</td>
              <td>${missingCharacters} (${(missingCharacters / totalOriginalLetters * 100).toFixed(2)}%)</td>
          </tr>
          <tr>
              <td>Total Errors</td>
              <td>${totalErrors} (${errorRate.toFixed(2)}%)</td>
          </tr>
          <tr>
              <td>Completion</td>
              <td>${completionPercent.toFixed(2)}%</td>
          </tr>
          <tr>
              <td>Correct Words</td>
              <td>${correctWords} / ${totalOriginalWords} (${correctWordsPercent.toFixed(2)}%)</td>
          </tr>
          <tr>
              <td>Wrong Words</td>
              <td>${wrongWords} / ${totalOriginalWords} (${wrongWordsPercent.toFixed(2)}%)</td>
          </tr>
      </table>
    `;
    
    // Display results and hide test elements
    testResults.style.display = 'block';
    testResults.innerHTML = resultHTML;
    
    // Hide elements instead of removing them
    timerDisplay.style.display = 'none';
    typingInput.style.display = 'none';
    endTest.style.display = 'none';
    
    // Keep bottom-section but hide it, don't remove it
    bottomSection.style.display = 'none';
    endTestContainer.style.display = 'none';
    
    // Disable further editing of the typing input
    typingInput.setAttribute('contenteditable', 'false');
}

function updateWordCount() {
  const text = customText.innerText.trim();
  const words = text === '' ? 0 : text.split(/\s+/).length;
  const limit = parseInt(wordLimitSelect.value) || 100;
  const wordCountDiv = document.getElementById('word-count');
  
  // Only show word count if there is text
  if (text === '') {
    wordCountDiv.style.display = 'none';
    return;
  } else {
    wordCountDiv.style.display = 'block';
  }
  
  // Show word count against limit for custom text
  if (customTextRadio.checked) {
    
    // Warn if over limit
    if (words > limit) {
        document.getElementById('word-count').innerHTML = `Word Count: <span style="${words > limit ? 'color:red;' : ''}">${words} > ${limit}</span>`;
        document.getElementById('word-count').innerHTML += `<span style="color:red; font-size:0.8em;"> (So, text will be truncated to ${limit} words.)</span>`;
    }else {
        document.getElementById('word-count').innerHTML = `Word Count: <span style="${words > limit ? 'color:red;' : ''}">${words}</span>`;
    }
  } else {
    wordCountDiv.innerText = `Word Count: ${words}`;
  }
}

// NEW: Apply blur if Blind Test mode is selected
modeSelect.addEventListener('change', function() {
    if (this.value === 'blind') {
        typingInput.style.filter = "blur(8px)";
    } else {
        typingInput.style.filter = "";
    }
});

// Add this function to index.js
function navigateHome() {
    if (!window.hasTestEnded && timerStarted) {
        if (confirm("Are you sure you want to leave the test? Your current progress will be lost.")) {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
            if (websiteHeading) {
                websiteHeading.textContent = 'Typing Exam Practice';
            }
            window.location.href = 'index.html';
        }
    } else {
        window.location.href = 'index.html';
    }
}

// Add word limit change listener
wordLimitSelect.addEventListener('change', updateWordCount);
customWordLimitInput.addEventListener('input', updateWordCount);
customText.addEventListener('input', updateWordCount);

// Add event listener for generate button
generateTextButton.addEventListener('click', async function() {
    
    // Show loading indicator on button
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    this.disabled = true;
    
    try {
        // Call the generateText function to get random text
        const generatedText = await generateText(wordLimit);
        
        // Put the generated text into the custom-text element
        customText.innerText = generatedText;
        
        // Update the word count display and ensure visibility
        updateWordCount();
        
        // Show the save button since we now have text
        saveTextBtn.style.display = 'inline-block';
    } catch (error) {
        console.error('Error generating text:', error);
        // Optionally show error message to user
    } finally {
        // Restore the button text and enable it
        this.innerHTML = 'Generate';
        this.disabled = false;
    }
});

// Get references to new elements
const generationOptions = document.getElementById('generation-options');
const userPromptInput = document.getElementById('user-prompt');

// Add event listener to show/hide generate button based on selection
generationOptions.addEventListener('change', function() {
    const label = document.querySelector('label[for="generation-options"]');
    if (this.value === 'no') {
        generateTextButton.style.display = 'none';
        userPromptInput.style.display = 'none';
        label.style.fontWeight = 'normal';
    } else if (this.value === 'custom') {
        if (label) {
            label.style.fontWeight = 'bold';
        }
        generateTextButton.style.display = 'inline-block';
        userPromptInput.style.display = 'inline-block';
    } else {
        generateTextButton.style.display = 'inline-block';
        userPromptInput.style.display = 'none';
        label.style.fontWeight = 'normal';
    }
});

// Update generate button click handler to ensure custom text radio is selected
generateTextButton.addEventListener('click', async function() {
    // Select custom text radio if it's not already selected
    if (!customTextRadio.checked) {
        customTextRadio.checked = true;
        customTextRadio.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Show loading indicator on button
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    this.disabled = true;
    
    try {
        // Call the generateText function to get text based on selected type
        const generatedText = await generateText();
        
        // Put the generated text into the custom-text element
        customText.innerText = generatedText;
        
        // Update the word count display and ensure visibility
        updateWordCount();
        
        // Show the save button since we now have text
        saveTextBtn.style.display = 'inline-block';
    } catch (error) {
        console.error('Error generating text:', error);
        // Optionally show error message to user
        showModalAutoDismiss("Failed to generate text. Please try again.");
    } finally {
        // Restore the button text and enable it
        this.innerHTML = 'Generate';
        this.disabled = false;
    }
});
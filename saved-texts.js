// Retrieve saved texts from localStorage
function loadSavedTexts() {
    let saved = JSON.parse(localStorage.getItem('savedTexts') || '[]');
    // Reverse the array to show newest items first
    const reversedSaved = [...saved].reverse();

    const container = document.getElementById('saved-texts-container');
    container.innerHTML = "";

    if (saved.length === 0) {
      container.innerHTML = "<p style='text-align: center;'>No saved texts yet.</p>";
      return;
    }

    // Add "Most Recently Saved" heading
    const recentHeading = document.createElement('h3');
    recentHeading.textContent = "Most Recently Saved Text";
    recentHeading.style.textAlign = "center";
    container.appendChild(recentHeading);

    // Add the most recent item (first in the reversed array)
    if (reversedSaved.length > 0) {
      const item = reversedSaved[0];
      const originalIndex = saved.length - 1; // Calculate original index
      const preview = item.text.substr(0,150) + (item.text.length>150?"...":"");
      const div = document.createElement('div');
      div.className = "saved-item";
      div.innerHTML = `
        <div class="saved-heading">${item.heading}</div>
        <div class="saved-preview">${preview}</div>
        <div class="options">
          <button onclick="useText(${originalIndex})">Use</button>
          <button onclick="viewText(${originalIndex})">View</button>
          <button onclick="copyText(${originalIndex})">Copy</button>
          <button onclick="editText(${originalIndex})">Edit</button>
          <button onclick="deleteText(${originalIndex})">Delete</button>
        </div>
      `;
      container.appendChild(div);
    }

    // Add "Previously Saved" heading if there are more items
    if (reversedSaved.length > 1) {
      const previousHeading = document.createElement('h3');
      previousHeading.textContent = "Previously Saved Texts";
      previousHeading.style.textAlign = "center";
      previousHeading.style.marginTop = "30px";
      container.appendChild(previousHeading);

      // Add the remaining items
      for (let i = 1; i < reversedSaved.length; i++) {
        const item = reversedSaved[i];
        const originalIndex = saved.length - 1 - i; // Calculate original index
        const preview = item.text.substr(0,150) + (item.text.length>150?"...":"");
        const div = document.createElement('div');
        div.className = "saved-item";
        div.innerHTML = `
          <div class="saved-heading">${item.heading}</div>
          <div class="saved-preview">${preview}</div>
          <div class="options">
            <button onclick="useText(${originalIndex})">Use</button>
            <button onclick="viewText(${originalIndex})">View</button>
            <button onclick="copyText(${originalIndex})">Copy</button>
            <button onclick="editText(${originalIndex})">Edit</button>
            <button onclick="deleteText(${originalIndex})">Delete</button>
          </div>
        `;
        container.appendChild(div);
      }
    }
  }

// Function to get saved texts array
function getSavedTexts() {
return JSON.parse(localStorage.getItem('savedTexts') || '[]');
}

function setSavedTexts(texts) {
localStorage.setItem('savedTexts', JSON.stringify(texts));
loadSavedTexts();
}

// Update useText function:
function useText(index) {
const saved = getSavedTexts();
if (saved[index]) {
    // Save the text temporarily in localStorage
    localStorage.setItem("useSavedText", saved[index].text);
    // Navigate to the home page (index.html)
    window.location.href = 'index.html';
}
}

// Keep the original modal for viewText etc.
function showModalMessage(message) {
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

    // Dismiss modal on click anywhere
    modalOverlay.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
}

// NEW: Create a separate auto-dismiss modal for copying
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

// NEW: Add a custom modal function for view with an "Okay" button.
function showModalWithOk(message) {
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
    modal.style.maxWidth = '65%';
    modal.style.maxHeight = '66%';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.overflow = 'hidden';

    // Create a scrollable message container
    const messageContainer = document.createElement('div');
    messageContainer.style.flex = '1';
    messageContainer.style.overflowY = 'auto';
    messageContainer.style.marginBottom = '10px';
    messageContainer.innerText = message;

    const okButton = document.createElement('button');
    okButton.innerText = 'Okay';
    okButton.style.alignSelf = 'center';
    okButton.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });

    modal.appendChild(messageContainer);
    modal.appendChild(okButton);
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
}

// NEW: Add a custom confirmation modal for deletion
function showConfirmModal(message, onConfirm) {
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

    const msgPara = document.createElement('p');
    msgPara.innerText = message;
    modal.appendChild(msgPara);

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete';
    deleteBtn.style.marginRight = '10px';
    deleteBtn.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
        onConfirm(true);
    });
    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel';
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
        onConfirm(false);
    });
    modal.appendChild(deleteBtn);
    modal.appendChild(cancelBtn);

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
}

// Replace alert in viewText:
function viewText(index) {
    const saved = getSavedTexts();
    if (saved[index]) {
        showModalWithOk(saved[index].text);
    }
}

// Update copyText function to use the auto-dismiss modal:
function copyText(index) {
    const saved = getSavedTexts();
    if (saved[index]) {
        navigator.clipboard.writeText(saved[index].text)
        .then(() => showModalAutoDismiss("Text copied to clipboard!"));
}
}

// NEW: Add a custom modal for editing saved text
function openEditModal(currentHeading, currentText, callback) {
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
    // Updated innerHTML with matching font-family and font-size:
    modalContent.innerHTML = `
        <h2>Edit Saved Text</h2>
        <label>Heading:</label><br>
        <input type="text" id="edit-heading" style="width: 100%; font-family: Arial, Helvetica, sans-serif; font-size: 14px;" value="${currentHeading}"><br><br>
        <label>Text:</label><br>
        <textarea id="edit-text" style="width: 100%; font-family: Arial, Helvetica, sans-serif; font-size: 14px; max-width:600px; min-width:600px; height: 200px; max-height: 400px; min-height:100px;">${currentText}</textarea><br><br>
        <button id="edit-save">Save</button>
        <button id="edit-cancel">Cancel</button>
    `;
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    document.getElementById('edit-save').addEventListener('click', () => {
        const newHeading = document.getElementById('edit-heading').value;
        const newText = document.getElementById('edit-text').value;
        document.body.removeChild(modalOverlay);
        callback(newHeading, newText);
    });
    document.getElementById('edit-cancel').addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
}

// Replace editText function with one that uses the modal:
function editText(index) {
    let saved = getSavedTexts();
    if (saved[index]) {
        openEditModal(saved[index].heading, saved[index].text, (newHeading, newText) => {
        if (newHeading !== null && newText !== null) {
            saved[index] = { heading: newHeading, text: newText };
            setSavedTexts(saved);
        }
        });
    }
}

// Replace deleteText to use the custom confirmation modal:
function deleteText(index) {
    let saved = getSavedTexts();
    showConfirmModal("Delete this saved text?", function(confirmed) {
        if (confirmed) {
            saved.splice(index, 1);
            setSavedTexts(saved);
        }
    });
}

function navigateHome() {
    window.location.href = 'index.html';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initial load of saved texts
    loadSavedTexts();
    
    // Add event listener to home button
    const homeButton = document.getElementById('home-button');
    if (homeButton) {
        homeButton.addEventListener('click', navigateHome);
    }
});
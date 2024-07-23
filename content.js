// Create and style the floating button
function createFloatingButton() {
    const existingButton = document.getElementById('floatingReadAloudButton');
    if (existingButton) return; // Do not create a new button if it already exists

    const button = document.createElement('button');
    button.id = 'floatingReadAloudButton';
    button.textContent = '▶'; // Play icon
    button.style.position = 'fixed';
    button.style.top = '10px'; // Adjust the top position
    button.style.right = '10px'; // Adjust the right position
    button.style.zIndex = '10000';
    button.style.backgroundColor = 'white';
    button.style.border = '1px solid black';
    button.style.padding = '5px';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '16px';
    button.style.fontWeight = 'bold';

    document.body.appendChild(button);

    button.addEventListener('click', () => {
        // Send message to background script to read aloud selected text
        chrome.runtime.sendMessage({ action: "playSelectedText" });
    });
}

// Ensure the button is created when the script loads
createFloatingButton();

// Add event listener to handle selection and store it
document.addEventListener('mouseup', function() {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
        chrome.storage.local.set({ selectedText: selectedText });
    }
});

function preprocessText(text) {
    let processedText = text.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '');
    processedText = processedText.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾]/g, ''); // Superscripts
    processedText = processedText.replace(/[₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎]/g, ''); // Subscripts
    return processedText.trim();
}

// Store the selected text in local storage
function storeSelectedText() {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
        chrome.storage.local.set({ selectedText: selectedText });
    }
}

// Add event listener to handle text selection
document.addEventListener('mouseup', storeSelectedText);

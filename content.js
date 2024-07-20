document.addEventListener('mouseup', function(event) {
    const selectedText = window.getSelection().toString();
    if (selectedText.length > 0) {
        // let floatingButton = document.getElementById('floatingReadAloudButton');
        if (!floatingButton) {
            floatingButton = document.createElement('button');
            floatingButton.id = 'floatingReadAloudButton';
            floatingButton.textContent = '▶';
            floatingButton.style.position = 'absolute';
            floatingButton.style.zIndex = '10000';
            floatingButton.style.backgroundColor = 'white';
            floatingButton.style.border = '1px solid black';
            floatingButton.style.borderRadius = '50%';
            floatingButton.style.padding = '5px';
            floatingButton.addEventListener('click', function() {
                chrome.storage.local.get(['defaultVoice', 'serverIp'], function(result) {
                    if (!result.defaultVoice) {
                        alert('Please set a default voice in the extension popup.');
                        return;
                    }
                    const voiceId = result.defaultVoice;
                    const serverIp = result.serverIp || 'localhost';
                    const text = preprocessText(selectedText);
                    chrome.runtime.sendMessage({
                        action: 'initializePlayer',
                        text: text,
                        voiceId: voiceId,
                        serverIp: serverIp
                    });
                });
            });
            document.body.appendChild(floatingButton);
        }
        floatingButton.style.top = `${event.pageY}px`;
        floatingButton.style.left = `${event.pageX}px`;
        floatingButton.style.display = 'block';
    } else {
        const floatingButton = document.getElementById('floatingReadAloudButton');
        if (floatingButton) {
            floatingButton.style.display = 'none';
        }
    }
});

function preprocessText(text) {
    let processedText = text.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '');
    processedText = processedText.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾]/g, ''); // Superscripts
    processedText = processedText.replace(/[₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎]/g, ''); // Subscripts
    return processedText.trim();
}

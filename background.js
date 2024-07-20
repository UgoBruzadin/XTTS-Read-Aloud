chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "readAloud",
        title: "Read Aloud",
        contexts: ["selection"]
    });
    loadVoiceList();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "readAloud" && info.selectionText) {
        chrome.storage.local.get(['defaultVoice', 'serverIp'], (result) => {
            if (!result.defaultVoice) {
                alert('Please set a default voice in the extension popup.');
                return;
            }
            const voiceId = result.defaultVoice;
            const serverIp = result.serverIp || 'localhost';
            const text = preprocessText(info.selectionText);
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: initializePlayer,
                args: [text, voiceId, serverIp]
            });
        });
    }
});

function preprocessText(text) {
    let processedText = text.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '');
    processedText = processedText.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾]/g, ''); // Superscripts
    processedText = processedText.replace(/[₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎]/g, ''); // Subscripts
    return processedText.trim();
}

function initializePlayer(text, voiceId, serverIp) {
    const apiUrl = `http://${serverIp}:8020/tts_stream?text=${encodeURIComponent(text)}&speaker_wav=${encodeURIComponent(voiceId)}&language=en`;
    let existingPlayer = document.getElementById('floatingAudioPlayer');
    if (!existingPlayer) {
        existingPlayer = document.createElement('audio');
        existingPlayer.id = 'floatingAudioPlayer';
        existingPlayer.controls = true;
        existingPlayer.style.position = 'fixed';
        existingPlayer.style.bottom = '10px';
        existingPlayer.style.right = '10px';
        existingPlayer.style.zIndex = '10000';
        document.body.appendChild(existingPlayer);
    }
    existingPlayer.src = apiUrl;
    existingPlayer.play();
}

function loadVoiceList() {
    chrome.storage.local.get(['serverIp'], (result) => {
        const serverIp = result.serverIp || 'localhost';
        fetch(`http://${serverIp}:8020/speakers`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        })
        .then(response => response.json())
        .then(voices => {
            chrome.storage.local.set({ voices: voices });
        })
        .catch(error => {
            console.error('Error fetching voices:', error);
            alert('Failed to load voices: ' + error.message);
        });
    });
}

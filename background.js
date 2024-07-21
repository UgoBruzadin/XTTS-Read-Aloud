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
        existingPlayer = document.createElement('div');
        existingPlayer.id = 'floatingAudioPlayerContainer';
        existingPlayer.style.position = 'fixed';
        existingPlayer.style.bottom = '10px';
        existingPlayer.style.right = '10px';
        existingPlayer.style.zIndex = '10000';
        existingPlayer.style.backgroundColor = 'white';
        existingPlayer.style.border = '1px solid black';
        existingPlayer.style.padding = '10px';
        existingPlayer.style.borderRadius = '5px';

        const audioElement = document.createElement('audio');
        audioElement.id = 'floatingAudioPlayer';
        audioElement.controls = true;
        existingPlayer.appendChild(audioElement);

        const speedLabel = document.createElement('label');
        speedLabel.textContent = 'Speed:';
        speedLabel.style.marginRight = '5px';
        existingPlayer.appendChild(speedLabel);

        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.id = 'speedSlider';
        speedSlider.min = '0.5';
        speedSlider.max = '2.0';
        speedSlider.step = '0.1';
        speedSlider.value = '1.0';
        existingPlayer.appendChild(speedSlider);

        document.body.appendChild(existingPlayer);

        speedSlider.addEventListener('input', function() {
            audioElement.playbackRate = parseFloat(speedSlider.value);
        });
    }

    const audioElement = document.getElementById('floatingAudioPlayer');
    audioElement.src = apiUrl;
    audioElement.play();
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

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "readAloud",
        title: "Read Aloud",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "readAloud" && info.selectionText) {
        chrome.storage.local.get(['selectedVoice', 'serverIp'], (result) => {
            const voiceId = result.selectedVoice || 'defaultVoiceId';
            const serverIp = result.serverIp || 'localhost';
            const text = info.selectionText;
            const apiUrl = `http://${serverIp}:8020/tts_stream?text=${encodeURIComponent(text)}&speaker_wav=${encodeURIComponent(voiceId)}&language=en`;
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: showFloatingPlayer,
                args: [apiUrl]
            });
        });
    }
});

function showFloatingPlayer(apiUrl) {
    const existingPlayer = document.getElementById('floatingAudioPlayer');
    if (existingPlayer) {
        existingPlayer.src = apiUrl;
        existingPlayer.play();
        return;
    }
    
    const audioPlayer = document.createElement('audio');
    audioPlayer.id = 'floatingAudioPlayer';
    audioPlayer.controls = true;
    audioPlayer.src = apiUrl;
    audioPlayer.style.position = 'fixed';
    audioPlayer.style.bottom = '10px';
    audioPlayer.style.right = '10px';
    audioPlayer.style.zIndex = '10000';
    document.body.appendChild(audioPlayer);
    audioPlayer.play();
}

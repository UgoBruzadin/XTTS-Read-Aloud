document.addEventListener('mouseup', function() {
    const selectedText = window.getSelection().toString();
    if (selectedText.length > 0) {
        let floatingButton = document.getElementById('floatingReadAloudButton');
        if (!floatingButton) {
            floatingButton = document.createElement('button');
            floatingButton.id = 'floatingReadAloudButton';
            floatingButton.textContent = 'Read Aloud';
            floatingButton.style.position = 'fixed';
            floatingButton.style.bottom = '50px';
            floatingButton.style.right = '10px';
            floatingButton.style.zIndex = '10000';
            floatingButton.addEventListener('click', function() {
                chrome.storage.local.get(['selectedVoice', 'serverIp'], function(result) {
                    const voiceId = result.selectedVoice || 'defaultVoiceId';
                    const serverIp = result.serverIp || 'localhost';
                    const text = selectedText;
                    const apiUrl = `http://${serverIp}:8020/tts_stream?text=${encodeURIComponent(text)}&speaker_wav=${encodeURIComponent(voiceId)}&language=en`;
                    showFloatingPlayer(apiUrl);
                });
            });
            document.body.appendChild(floatingButton);
        }
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

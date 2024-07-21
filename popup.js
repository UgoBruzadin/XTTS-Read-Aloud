document.addEventListener('DOMContentLoaded', function() {
    // Function to update the dropdown list with voices
    function updateVoiceList(voices) {
        const voiceList = document.getElementById('voiceList');
        voiceList.innerHTML = ''; // Clear existing options
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.voice_id;
            option.textContent = voice.name;
            voiceList.appendChild(option);
        });
    }

    // Load voices when the popup is opened
    chrome.storage.local.get(['voices'], function(result) {
        if (result.voices) {
            updateVoiceList(result.voices);
        } else {
            refreshVoiceList();
        }
    });

    // Function to refresh the voice list from the server
    function refreshVoiceList() {
        chrome.storage.local.get(['serverIp'], function(result) {
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
                updateVoiceList(voices);
            })
            .catch(error => {
                console.error('Error fetching voices:', error);
                alert('Failed to load voices: ' + error.message);
            });
        });
    }

    // Event listener for the Save Server IP button
    document.getElementById('saveServerIp').addEventListener('click', function() {
        const serverIp = document.getElementById('serverIp').value;
        chrome.storage.local.set({serverIp: serverIp}, function() {
            console.log("Server IP saved:", serverIp);
        });
    });

    // Event listener for the Refresh List button
    document.getElementById('refreshList').addEventListener('click', refreshVoiceList);

    // Event listener for the Load Voice button
    document.getElementById('loadVoice').addEventListener('click', function() {
        const selectedVoice = document.getElementById('voiceList').value;
        chrome.storage.local.set({selectedVoice: selectedVoice}, function() {
            console.log("Voice selection saved:", selectedVoice);
        });
    });

    // Event listener for the Save Default Voice button
    document.getElementById('saveDefaultVoice').addEventListener('click', function() {
        const selectedVoice = document.getElementById('voiceList').value;
        chrome.storage.local.set({defaultVoice: selectedVoice}, function() {
            console.log("Default voice saved:", selectedVoice);
            alert("Default voice saved!");
        });
    });
});

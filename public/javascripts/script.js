const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const socket = io();

recognition.lang = 'en-US';
recognition.interimResults = false;

document.addEventListener("DOMContentLoaded", function() {
    openTab("voice_recognition_tab", "Voice_Recognition");
});

document.querySelector('button').addEventListener('click', () => {
    recognition.start();
});

recognition.addEventListener('result', (e) => {
    let last = e.results.length - 1;
    let text = e.results[last][0].transcript;
    console.log('Confidence: ' + e.results[0][0].confidence);
    document.getElementsByClassName("output-you")[0].innerHTML = text;
    socket.emit("chat message", text);
    socket.on("bot-response", (response) => {
        console.log(response.fulfillmentText);
        response.refCount++;
        if (response.refCount === 1)
        {
            document.getElementsByClassName("output-bot")[0].innerHTML = response.fulfillmentText;
            synthVoice(response.fulfillmentText);
        }
    });
});

function synthVoice(text) {
    if ( 'speechSynthesis' in window )
    {
        const to_speak = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(to_speak);
    }
    else
    {
        notice.innerText = 'Unfortunately your browser doesn’t support this speak feature.';
    }
}

function openTab(tabButton, tabName) {
    let tabContent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    let element = document.getElementsByClassName("tablinks active")[0];
    if (element) {
        element.className = "tablinks";
    }
    let currentTab = document.getElementById(tabName);
    currentTab.style.display = "block";
    document.getElementById(tabButton.id).className += " active";
}

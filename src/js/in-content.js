/* in-content.js
 *
 * This file has an example on how to communicate with other parts of the extension through a long lived connection (port) and also through short lived connections (chrome.runtime.sendMessage).
 *
 * Note that in this scenario the port is open from the popup, but other extensions may open it from the background page or not even have either background.js or popup.js.
 * */

// Set globals
let formLoaded = false;
let looping = false;

// Extension port to communicate with the popup, also helps detecting when it closes
let port = null;

// Send messages to the open port (Popup)
const sendPortMessage = data => port.postMessage(data);

// Handle incoming popup messages
// const popupMessageHandler = message => {
//     if(message.url) alert('received url', message.url)
// }

// Start scripts after setting up the connection to popup
chrome.extension.onConnect.addListener(popupPort => {
    // Listen for popup messages
    popupPort.onMessage.addListener(popupMessageHandler);
    // Set listener for disconnection (aka. popup closed)
    popupPort.onDisconnect.addListener(() => {
        console.log('in-content.js - disconnected from popup');
    });
    // Make popup port accessible to other methods
    port = popupPort;
    // Perform any logic or set listeners
    sendPortMessage('message from in-content.js');
});

// Response handler for short lived messages
const handleBackgroundResponse = response =>
    console.log('in-content.js - Received response:', response);

// Send a message to background.js
// chrome.runtime.sendMessage('Message from in-content.js!', handleBackgroundResponse);

// const getFormValues = () =>{
//     const start = document.getElementsByName("startTime").value
//     const end = document.getElementsByName("endTime").value
//     alert(start, end)
// }

const toggleFormDisplay = () => {
    let formSubmitButton = document.getElementsByName('submitTimestampInput');
    let stopRunningLoopButton = document.getElementsByName('stopRunningLoop');
    if (formSubmitButton[0].style.display === 'none') {
        formSubmitButton[0].style.display = 'block';
        stopRunningLoopButton[0].style.display = 'none';
    } else {
        formSubmitButton[0].style.display = 'none';
        stopRunningLoopButton[0].style.display = 'block';
    }
};

const convertTimeInput = time => {
    let rawString = time.replace(':', '');
    if (rawString.length < 1 || rawString.length > 6) throw 'Please enter a valid timestamp';
    if (rawString.length > 3) return rawString;
    if (rawString.length > 2 && rawString.length < 5) {
        let minutes = rawString.slice(0, rawString.length - 2);
        return Number(minutes * 60) + Number(rawString.slice(rawString.length - 2, rawString.length));
    }
    if (rawString.length > 4 && rawString.length < 5) {
        let hours = rawString.slice(0, rawString.length - 4);
        let minutes = rawString.slice(0, rawString.length - 2);
        return Number(hours * 3600) + Number(minutes * 60) + Number(rawString.slice(rawString.length - 2, rawString.length));
    }
};

const setYoutubeLoop = (start, end) => {
    looping = true;
    while (looping) {
        let htmlVideoPlayer = document.getElementsByTagName('video')[0];
        let currentTime = htmlVideoPlayer.currentTime

        // alert(currentTime)

        let startSeconds = convertTimeInput(start);
        let endSeconds = convertTimeInput(end);

        while (currentTime < endSeconds) {
            currentTime = htmlVideoPlayer.currentTime
        }
        alert(`&t=${startSeconds}`)
        // window.location.href = `&t=${startSeconds}`;
    }
};

const stopYoutubeLoop = () => {
    looping = false;
    toggleFormDisplay()
};

const hidePluginForm = () => {
    var pluginForm = document.getElementsByName('timestampInput');
    if(pluginForm[0] !== undefined && pluginForm[0].style){
        pluginForm[0].style.display = 'none';
    }
};

const showPluginForm = () => {
    var pluginForm = document.getElementsByName('timestampInput');
    if(pluginForm[0] !== undefined && pluginForm[0].style){
        pluginForm[0].style.display = 'block';
    }
};

const loadPluginForm = () => {
    if(formLoaded === false){
        const parentNode = document.getElementById('content');
        var masthead = document.getElementById('masthead-container');
        var newNode = document.createElement('div'); // Create a <div> element
        var form = document.createElement('form');
        var startTime = document.createElement('input');
        var endTime = document.createElement('input');
        var submitForm = document.createElement('button');
        var stopRunningLoop = document.createElement('button');
    
        // set button defaults
        stopRunningLoop.name = 'stopRunningLoop';
        stopRunningLoop.innerText = 'Stop Looper';
        stopRunningLoop.style.display = 'none'; // hidden at first
        submitForm.name = 'submitTimestampInput';
        submitForm.innerText = 'Start Loop';
        submitForm.type = 'button';
        submitForm.style.display = 'block'; // visible at first
    
        //assign form name so we can hide it
        form.name = 'timestampInput';
    
        //assign form styles
        form.style.width = '200px';
        form.style.marginTop = '10%';
    
        form.style.marginLeft = '40%';
        form.style.zIndex = '9999';
        form.style.border = '3px solid red';
    
        // add button click listener
        stopRunningLoop.addEventListener('click', stopYoutubeLoop);
    
        // Handle data from form
        submitForm.addEventListener('click', () => {
            const form = document.querySelector('form');
            new FormData(form); // construct a FormData object, which fires the formdata event
            toggleFormDisplay()
        });
    
        form.addEventListener('formdata', e => {
            // Get the form data from the event object
            let start = e.target[0].value;
            let end = e.target[1].value;
            setYoutubeLoop(start, end);
        });
    
        // assign default values for form input elements
        startTime.type = 'text';
        startTime.name = 'startTime';
        startTime.placeholder = '0:00';
        endTime.type = 'text';
        endTime.name = 'endTime';
        endTime.placeholder = '0:00';
    
        //add input elements to form
        form.appendChild(startTime);
        form.appendChild(endTime);
        form.appendChild(submitForm);
        form.appendChild(stopRunningLoop);

    
        //add form to wrapper div
        newNode.appendChild(form);
    
        //insert new div with form at top of page
        let insertedNode = parentNode.insertBefore(newNode, masthead);
        formLoaded = true;
    }else if(formLoaded === true){
        var pluginForm = document.getElementsByName('timestampInput');
        if(pluginForm !== undefined && pluginForm.style){
            pluginForm.style.display = 'block';
        }
    }
};

window.onload = function() {
    let currentPage = window.location.href;
    let video_id = currentPage.split('v=')[1];
    if(video_id === undefined && formLoaded === false){
        console.log("Not a youtube video")
    }else if(video_id === undefined && formLoaded === true){
        hidePluginForm()
    }else if(video_id !== undefined && formLoaded === false){
        loadPluginForm()
    }else if(video_id !== undefined && formLoaded === true){
        showPluginForm()
    }

    // listen for changes
    setInterval(function() {
        if (currentPage !== window.location.href) {
            // page has changed, set new page as 'current'
            currentPage = window.location.href;

            video_id = currentPage.split('v=')[1];

            if(video_id === undefined && formLoaded === false){
                console.log("Not a youtube video")
            }else if(video_id === undefined && formLoaded === true){
                hidePluginForm()
            }else if(video_id !== undefined && formLoaded === false){
                loadPluginForm()
            }else if(video_id !== undefined && formLoaded === true){
                showPluginForm()
            }
        }
    }, 500);
};

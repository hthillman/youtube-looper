/* in-content.js
 *
 * This file has an example on how to communicate with other parts of the extension through a long lived connection (port) and also through short lived connections (chrome.runtime.sendMessage).
 *
 * Note that in this scenario the port is open from the popup, but other extensions may open it from the background page or not even have either background.js or popup.js.
 * */

// Extension port to communicate with the popup, also helps detecting when it closes
let port = null;

// Send messages to the open port (Popup)
const sendPortMessage = data => port.postMessage(data);

// Handle incoming popup messages
const popupMessageHandler = message => {
    if(message.url) console.log('received url', message.url)
}

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

const handleSubmit = (e) => {
    console.log('formdata event fired');

    
    // Get the form data from the event object
    let data = e.formData;
    for (var value of data.values()) {
        alert(value);
    }

    this.looping = true
    setYoutubeLoop(value[0], value[1])
}

const toggleFormDisplay = () =>{
    let formSubmitButton = document.getElementsByName('submitTimestampInput')
    let stopRunningLoopButton = document.getElementsByName('stopRunningLoop')
    if (formSubmitButton.style.display === "none") {
        formSubmitButton.style.display = "block";
        stopRunningLoopButton.style.display = "none";
      } else {
        formSubmitButton.style.display = "none";
        stopRunningLoopButton.style.display = "block";
    }
}

const convertTimeInput = (time) => {
    let number = time.replace(":","").parseFloat();
    if(number.length < 1 || number.length > 6) throw "Please enter a valid timestamp"
    if(number.length > 3) return number
    if(number.length > 2 && number.length <5){
        let minutes = String(number).slice(0, number.length - 2)
        return (minutes*60 + String(number).slice(number.length - 2, number.length))
    }
    if(number.length > 4 && number.length <5){
        let hours = String(number).slice(0, number.length - 4)
        let minutes = String(number).slice(0, number.length - 2)
        return ((hours*3600) + (minutes*60) + String(number).slice(number.length - 2, number.length))
    }
}


const setYoutubeLoop = (start, end) =>{
    while(this.looping){
        let YT = document.getElementById("movie_player");
        let currentTime = YT.getCurrentTime();
        let startSeconds = convertTimeInput(start);
        let endSeconds = convertTimeInput(end);
    
        while(currentTime < endSeconds){
            currentTime = YT.getCurrentTime();
        }
    
        window.location.href = `&t=${startSeconds}`
    }
}

const stopYoutubeLoop = () =>{
    this.looping = false;
}

const loadPluginForm = () =>{
    const parentNode = document.getElementsByTagName('body')
    var firstChild = parentNode[0].childNodes[0];
    var newNode = document.createElement('div');   // Create a <div> element
    var form = document.createElement('form');
    var startTime = document.createElement('input')
    var endTime = document.createElement('input')
    var submitForm = document.createElement('input')
    var stopRunningLoop = document.createElement('button')


    // set button defaults
    stopRunningLoop.name = "stopRunningLoop";
    stopRunningLoop.innerText = "Stop Looper";
    stopRunningLoop.style.display = "none"; // hidden at first

    // add button click listener
    stopRunningLoop.addEventListener ("click",stopYoutubeLoop);

    // Handle data from form
    form.onformdata = handleSubmit;

    //assign form name so we can hide it
    form.name = "timestampInput"

    // assign default values for form input elements
    submitForm.type = 'submit';
    submitForm.name = "submitTimestampInput"
    startTime.type = 'text';
    startTime.name = "startTime";
    startTime.placeholder = "0:00";
    endTime.type = 'text';
    endTime.name = "endTime";
    endTime.placeholder = "0:00";

    //add input elements to form
    form.appendChild(startTime)
    form.appendChild(endTime)
    form.appendChild(submitForm)

    //add form to wrapper div
    newNode.appendChild(form)
    newNode.appendChild(stopRunningLoop)

    //insert new div with form at top of page
    let insertedNode = parentNode[0].insertBefore(newNode, firstChild);
}
    

window.onload = function() {
    loadPluginForm()
}

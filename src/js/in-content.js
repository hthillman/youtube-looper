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

const handleFormData = (e) => {
        console.log('formdata event fired');
       
        // Get the form data from the event object
        let data = e.formData;
        for (var value of data.values()) {
          alert(value);
        }
}

const loadPluginForm = () =>{
    const parentNode = document.getElementsByTagName('body')
    var firstChild = parentNode[0].childNodes[0];
    var newNode = document.createElement('div');   // Create a <div> element
    var form = document.createElement('form');
    var startTime = document.createElement('input')
    var endTime = document.createElement('input')
    var submitForm = document.createElement('input')

    // Handle data from form
    form.onformdata = handleFormData;

    // assign default values for form input elements
    submitForm.type = 'submit';
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

    //insert new div with form at top of page
    let insertedNode = parentNode[0].insertBefore(newNode, firstChild);
}
    

window.onload = function() {
    loadPluginForm()
}

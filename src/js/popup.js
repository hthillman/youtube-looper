/* popup.js
 *
 * This file initializes its scripts after the popup has loaded.
 *
 * It shows how to access global variables from background.js.
 * Note that getViews could be used instead to access other scripts.
 *
 * A port to the active tab is open to send messages to its in-content.js script.
 *
 */

const backgroundWindow = chrome.extension.getBackgroundPage();

// add popup basic info
let popupInfo = {
    title: "Youtube Clip Looper",
    description: "Below your video, you can set a start time and end time!"
}


// Start the popup script, this could be anything from a simple script to a webapp

const initPopupScript = () => {
    // Access the background window object
    const backgroundWindow = chrome.extension.getBackgroundPage();
    // Do anything with the exposed variables from background.js
    // console.log(backgroundWindow.backgroundGlobal);
   

    // This port enables a long-lived connection to in-content.js
    let port = null;

    // Send messages to the open port
    const sendPortMessage = message => port.postMessage(message);

    // Find the current active tab
    const getTab = () =>
        new Promise(resolve => {
            chrome.tabs.query(
                {
                    active: true,
                    currentWindow: true
                },
                tabs => resolve(tabs[0])
            );
        });

    // Handle port messages
    const messageHandler = message => {
        console.log('popup.js - received message:', message);
    };

    // Find the current active tab, then open a port to it
    getTab().then(tab => {
        // Connects to tab port to enable communication with inContent.js
        port = chrome.tabs.connect(tab.id, { name: 'chrome-extension-template' });
        // Set up the message listener
        port.onMessage.addListener(messageHandler);
        // Send a test message to in-content.js
        sendPortMessage('Message from popup!');
    });
};

function insertText(){
    document.getElementById('title').innerHTML = popupInfo.title;
    document.getElementById('description').innerHTML = popupInfo.description;
}

// Fire scripts after page has loaded
window.onload = function() {
    insertText();
    document.addEventListener('DOMContentLoaded', initPopupScript);
} 


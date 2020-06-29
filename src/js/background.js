/* background.js */

// A sample object that will be exposed further down and used on popup.js
var backgroundGlobal = {
    url: null
};

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(tab.id, {
        file: 'in-content.js'
    });
});

// Listen to short lived messages from in-content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Perform any ther actions depending on the message
    console.log('background.js - received message from in-content.js:', message);
    // Respond message
    sendResponse('👍');
});

// Make variables accessible from chrome.extension.getBackgroundPage()
window.backgroundGlobal = backgroundGlobal;

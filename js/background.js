chrome.browserAction.onClicked.addListener(function(tab) {
    let imgData = chrome.tabs.captureVisibleTab(null,{format:"png"},function(string){});
    chrome.tabs.sendMessage(tab.id, {poyo:imgData});
});
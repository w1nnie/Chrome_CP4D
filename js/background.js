chrome.browserAction.onClicked.addListener(function(tab) {
    dataUrl = chrome.tabs.captureVisibleTab(null,{format:"png"},function(dataUrl){
        chrome.tabs.sendMessage(tab.id, {message: dataUrl});
    });
    
});
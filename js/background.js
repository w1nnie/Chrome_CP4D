chrome.browserAction.onClicked.addListener(function(tab) {
    dataUrl = chrome.tabs.captureVisibleTab(null,{format:"png"},function(dataUrl){
        chrome.tabs.sendMessage(tab.id, {message: dataUrl});
    });  
});

chrome.runtime.onMessage.addListener(
	function(request,sender,sendResponse){
        if (request == "activated") {
            chrome.browserAction.disable();
        }
        if (request == "quit") {
            chrome.browserAction.enable();
        }
	}
);

chrome.tabs.onUpdated.addListener(function(){
        chrome.browserAction.enable();
    }
);
chrome.tabs.onRemoved.addListener(function(){
    chrome.browserAction.enable();
}
);
chrome.browserAction.onClicked.addListener(function(tab) {
    let cs,cf,du;
    function getFromStorage() {
        chrome.storage.sync.get({
            colorSpace: 'HSV',
            colorFormat: 'HexRGB',
            HSLorHLS: 'HSL',
            popupSize: '250'
        }, function(items){
            cs = items.colorSpace;
            cf = items.colorFormat;
            sol = items.HSLorHLS;
            sz = items.popupSize;
        });
    }
    function capture() {
        return new Promise(resolve => {
            chrome.tabs.captureVisibleTab(null,{format:"png"},function(dataUrl){
            resolve(dataUrl);
            })
        });
    };

    async function sendMessage() {
        getFromStorage();
        du = await capture();
    }
    sendMessage().then(()=>{
        chrome.tabs.sendMessage(tab.id, {colorSpace: cs, colorFormat: cf, HSLorHLS: sol, popupSize: sz, message: du});
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
});
chrome.tabs.onRemoved.addListener(function(){
    chrome.browserAction.enable();
});
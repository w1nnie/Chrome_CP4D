chrome.browserAction.onClicked.addListener(function(tab) {
    console.log("bg dayo");
    let imgData;
    chrome.tabs.captureVisibleTab(null,{format:"png"},(base64Data) =>{
        console.log("capture");
        imgData = base64Data;
    });
    chrome.tabs.sendMessage(tab.id, {imgData});
    console.log("okuttayo");
});
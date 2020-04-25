chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("content ni kitayo");
    console.log(request);
    document.body.style.background = "#ff0000";
    console.log("body.src ni imgData iretayo");
}); 
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("content ni kitayo");
    console.log(request.message);
    console.log(sender);

    let po = document.createElement('img');
    po.src = request.message;
    po.style = 'overflow:hidden;z-index:100000000;position:fixed;width:100vw;height:100vh;top:0px;left:0px;:margin:0px;padding:0px;';
    document.body.appendChild(po);
    console.log("body.src ni imgData iretayo");
}); 
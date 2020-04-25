chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("content ni kitayo");
    console.log(request);
    let po = document.createElement('div');
    po.textContent = '../image/128.png';
    po.style = 'overflow:hidden;z-index:100;position:fixed;width:100vw;height:100vh;top:0px;left:0px;:margin:0px;padding:0px;';
    document.body.appendChild(po);
    console.log("body.src ni imgData iretayo");
}); 
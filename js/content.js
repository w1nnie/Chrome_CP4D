chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

    // canvasを作りbackground.jsから受け取ったimagePathを流し込み、domへ追加(全面にスクショ画像を表示)
    let canvas = document.createElement('canvas');
    let imagePath = request.message;
    let ctx = canvas.getContext("2d");
    draw(canvas,imagePath,ctx);
    canvas.style = 'overflow:hidden;z-index:10000;position:fixed;width:100vw;height:100vh;top:0px;left:0px;:margin:0px;padding:0px;';
    document.body.appendChild(canvas);

    let colorInfo = document.createElement('div');
    colorInfo.style = 'width:200px;height:200px;z-index:10001;position:fixed;top:0;left:0;';
    document.body.appendChild(colorInfo);

    // ポインタの座標から画像のRGBA値を取得
    canvas.addEventListener('mousemove',function(e){
        let mousePos = getMousePosition(e);
        console.log(mousePos);
        imageData = ctx.getImageData(mousePos.x,mousePos.y,1,1);
        console.log("R:" + imageData.data[0] + " G:" + imageData.data[1] + " B:" + imageData.data[2] + " A:" + imageData.data[3]);
        colorInfo.style.backgroundColor = "rgba(" + imageData.data[0] + "," + imageData.data[1] + "," + imageData.data[2] + "," + imageData.data[3]/255 + ")";
    })
    

}); 

// canvasに画像を表示
function draw(canvas,imagePath,ctx) {
    const image = new Image();
    image.addEventListener("load", function (){
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);
        console.log("load!");
    });
    image.src = imagePath;
}

// ポインタの座標を取得(retina displayだと2倍(?))
function getMousePosition(e){
    return {
        x: parseInt(e.offsetX*window.devicePixelRatio),
        y: parseInt(e.offsetY*window.devicePixelRatio)
    };
}

// ポインタの座標から画像のRGBA値を取得

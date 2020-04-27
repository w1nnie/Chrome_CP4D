chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

    // canvasを作りbackground.jsから受け取ったimagePathを流し込み、domへ追加(全面にスクショ画像を表示)
    let canvas = document.createElement('canvas');
    canvas.className = 'screen-shot'
    let imagePath = request.message;
    let ctx = canvas.getContext("2d");
    draw(canvas,imagePath,ctx);
    document.body.appendChild(canvas);

    // マウスに追従するポップアップ
    let colorInfo = document.createElement('div');
    colorInfo.className = 'mouse-tracker';
    document.body.appendChild(colorInfo);

    // カラーサークルを表示するポップアップ
    let colorCircles = document.createElement('div');
    colorCircles.className = 'color-circles';
    document.body.appendChild(colorCircles);

    let hsl = document.createElement('canvas');
    hsl.className = 'hsl';
    colorCircles.appendChild(hsl);

    // mousemoveを検知してimageDataを取得、処理
    canvas.addEventListener('mousemove',function(e){
        let mousePos = getMousePosition(e);
        console.log(mousePos);
        imageData = ctx.getImageData(mousePos.x*window.devicePixelRatio,mousePos.y*window.devicePixelRatio,1,1);
        // console.log("R:" + imageData.data[0] + " G:" + imageData.data[1] + " B:" + imageData.data[2] + " A:" + imageData.data[3]);

        colorInfo.style.backgroundColor = "rgba(" + imageData.data[0] + "," + imageData.data[1] + "," + imageData.data[2] + "," + imageData.data[3]/255 + ")";
        colorInfo.style.top = mousePos.y+50 + "px";
        colorInfo.style.left = mousePos.x+50 + "px";


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
        x: parseInt(e.offsetX),
        y: parseInt(e.offsetY)
    };
}

// ポインタの座標から画像のRGBA値を取得

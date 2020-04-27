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

    drawColorCircleHSL(colorCircles);
    




    // mousemoveを検知してimageDataを取得、処理
    canvas.addEventListener('mousemove',function(e) {
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
function getMousePosition(e) {
    return {
        x: parseInt(e.offsetX),
        y: parseInt(e.offsetY)
    };
}

function drawColorCircleHSL(colorCircles) {
    let hsl = document.createElement('canvas');
    hsl.className = 'hsl';
    hsl.width = '250';
    hsl.height = '250';

    w = parseInt(hsl.width);
    h = parseInt(hsl.height);
    let ctx = hsl.getContext('2d');
    let clock = new Object();
    clock.x = w / 2;
    clock.y = h / 2;
    
    rad = w/2*0.9;
    offsetAngle = Math.PI * 1/16;
    ax = Math.round(Math.cos(Math.PI * 1/3) * rad * 1000) / 1000;
    ay = Math.round(Math.sin(Math.PI * 1/3) * rad * 1000) / 1000;
    let trirants = [
        {
            "angleStart": Math.PI,
            "angleEnd": Math.PI * 4/3 + 0.01,
            "x1": clock.x - rad,
            "y1": clock.y,
            "x2": clock.x - ax,
            "y2": clock.y - ay,
            "colorStops": [
                {"stop": 0, "color": "red"},
                {"stop": 1, "color": "yellow"}
            ]
        },
        {
            "angleStart": Math.PI * 4/3,
            "angleEnd": Math.PI * 5/3 + 0.01,
            "x1": clock.x - ax,
            "y1": clock.y - ay,
            "x2": clock.x + ax,
            "y2": clock.y - ay,
            "colorStops": [
                {"stop": 0, "color": "yellow"},
                {"stop": 1, "color": "green"}
            ]
        },
        {
            "angleStart": Math.PI * -1/3,
            "angleEnd": 0 + 0.01,
            "x1": clock.x + ax,
            "y1": clock.y - ay,
            "x2": clock.x + rad,
            "y2": clock.y,
            "colorStops": [
                {"stop": 0, "color": "green"},
                {"stop": 1, "color": "cyan"}
            ]
        },
        {
            "angleStart": 0,
            "angleEnd": Math.PI * 1/3 + 0.01,
            "x1": clock.x + rad,
            "y1": clock.y,
            "x2": clock.x + ax,
            "y2": clock.y + ay,
            "colorStops": [
                {"stop": 0, "color": "cyan"},
                {"stop": 1, "color": "blue"}
            ]
        },
        {
            "angleStart": Math.PI * 1/3,
            "angleEnd": Math.PI * 2/3 + 0.01,
            "x1": clock.x + ax,
            "y1": clock.y + ay,
            "x2": clock.x - ax,
            "y2": clock.y + ay,
            "colorStops": [
                {"stop": 0, "color": "blue"},
                {"stop": 1, "color": "magenta"}
            ]
        },
        {
            "angleStart": Math.PI * 2/3,
            "angleEnd": Math.PI + 0.01,
            "x1": clock.x - ax,
            "y1": clock.y + ay,
            "x2": clock.x - rad,
            "y2": clock.y,
            "colorStops": [
                {"stop": 0, "color": "magenta"},
                {"stop": 1, "color": "red"}
            ]
        },
    ]
    for (let i = 0; i < trirants.length; i++) {
        let tri = trirants[i];
        console.log(tri.x1 + ", " + tri.y1 + ", " + tri.x2 + ", " + tri.y2);
        let grad = ctx.createLinearGradient(tri.x1, tri.y1, tri.x2, tri.y2);
        for (let j = 0; j < tri.colorStops.length; j++) {
            let cs = tri.colorStops[j];
            grad.addColorStop(cs.stop, cs.color);
        }
        ctx.beginPath();
        console.log(clock.x, clock.y, rad, tri.angleStart, tri.angleEnd);
        ctx.arc(clock.x, clock.y, rad, tri.angleStart, tri.angleEnd);
        ctx.strokeStyle = grad;
        ctx.lineWidth = w/20;
        // ctx.translate(clock.x,clock.y);
        // ctx.rotate(offsetAngle);
        // ctx.translate(-clock.x,-clock.y);
        ctx.stroke();

    }

    colorCircles.appendChild(hsl);
}
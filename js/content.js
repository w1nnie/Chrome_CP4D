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

    drawColorCircle(colorCircles,250);
    




    // mousemoveを検知してimageDataを取得、処理
    canvas.addEventListener('mousemove',function(e) {
        let mousePos = getMousePosition(e);
        console.log(mousePos);
        imageData = ctx.getImageData(mousePos.x*window.devicePixelRatio,mousePos.y*window.devicePixelRatio,1,1);
        // console.log("R:" + imageData.data[0] + " G:" + imageData.data[1] + " B:" + imageData.data[2] + " A:" + imageData.data[3]);

        colorInfo.style.backgroundColor = "rgba(" + imageData.data[0] + "," + imageData.data[1] + "," + imageData.data[2] + "," + imageData.data[3]/255 + ")";
        colorInfo.style.top = mousePos.y+50 + "px";
        colorInfo.style.left = mousePos.x+50 + "px";
    });

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

function drawOuterColorCircle(ctx,size) {
    let center = new Object();
    center.x = size / 2;
    center.y = size / 2;
    
    rad = size/2*0.9;
    offsetAngle = Math.PI * 1/16;
    ax = Math.round(Math.cos(Math.PI * 1/3) * rad * 1000) / 1000;
    ay = Math.round(Math.sin(Math.PI * 1/3) * rad * 1000) / 1000;
    let trirants = [
        {
            "angleStart": Math.PI,
            "angleEnd": Math.PI * 4/3 + 0.01,
            "x1": center.x - rad,
            "y1": center.y,
            "x2": center.x - ax,
            "y2": center.y - ay,
            "colorStops": [
                {"stop": 0, "color": "red"},
                {"stop": 1, "color": "yellow"}
            ]
        },
        {
            "angleStart": Math.PI * 4/3,
            "angleEnd": Math.PI * 5/3 + 0.01,
            "x1": center.x - ax,
            "y1": center.y - ay,
            "x2": center.x + ax,
            "y2": center.y - ay,
            "colorStops": [
                {"stop": 0, "color": "yellow"},
                {"stop": 1, "color": "lime"}
            ]
        },
        {
            "angleStart": Math.PI * -1/3,
            "angleEnd": 0 + 0.01,
            "x1": center.x + ax,
            "y1": center.y - ay,
            "x2": center.x + rad,
            "y2": center.y,
            "colorStops": [
                {"stop": 0, "color": "lime"},
                {"stop": 1, "color": "cyan"}
            ]
        },
        {
            "angleStart": 0,
            "angleEnd": Math.PI * 1/3 + 0.01,
            "x1": center.x + rad,
            "y1": center.y,
            "x2": center.x + ax,
            "y2": center.y + ay,
            "colorStops": [
                {"stop": 0, "color": "cyan"},
                {"stop": 1, "color": "blue"}
            ]
        },
        {
            "angleStart": Math.PI * 1/3,
            "angleEnd": Math.PI * 2/3 + 0.01,
            "x1": center.x + ax,
            "y1": center.y + ay,
            "x2": center.x - ax,
            "y2": center.y + ay,
            "colorStops": [
                {"stop": 0, "color": "blue"},
                {"stop": 1, "color": "magenta"}
            ]
        },
        {
            "angleStart": Math.PI * 2/3,
            "angleEnd": Math.PI + 0.01,
            "x1": center.x - ax,
            "y1": center.y + ay,
            "x2": center.x - rad,
            "y2": center.y,
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
        console.log(center.x, center.y, rad, tri.angleStart, tri.angleEnd);
        ctx.arc(center.x, center.y, rad, tri.angleStart, tri.angleEnd);
        ctx.strokeStyle = grad;
        ctx.lineWidth = size/15;
        // ctx.translate(center.x,center.y);
        // ctx.rotate(offsetAngle);
        // ctx.translate(-center.x,-center.y);
        ctx.stroke();
    }
}

function drawInnerColorCircleHSV(ctx,size,rgba) {
    let center = new Object();
    center.x = size / 2;
    center.y = size / 2;
    length = size * 0.8;

    let hue = 300;
    let quant = size * 0.55; //量子化数
    for (let i = 0; i < quant; i++) {
        for (let j = 0; j < quant; j++) {
            // hsv (h, i. quant-1-j)
            h = (hue / 60) % 1
            A = (quant - 1 - j)/quant * 255;
            B = (quant - 1 - j)/quant * (1 - i/quant) * 255;
            C = (quant - 1 - j)/quant * (1 - i/quant * h) * 255;
            D = (quant - 1 - j)/quant * (1 - i/quant * (1 - h)) * 255;
            if (i == 0) {
                r = A; g = A; b = A;
            } else if (hue < 60) {
                r = A, g = D, b = B;
            } else if (hue < 120) {
                r = C, g = A, b = B;
            } else if (hue < 180) {
                r = B, g = A. b = D;
            } else if (hue < 240) {
                r = B, g = C, g = A;
            } else if (hue < 300) {
                r = D, g = B, g = A;
            } else {
                r = A, g = B, b = C;
            }
            ctx.fillStyle = 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')'; 
            // console.log(ctx.fillStyle);
            ctx.fillRect(i + center.x - quant/2,j + center.y - quant/2,1,1);
        }
    }
    ctx.translate(center.x - quant/2, center.y - quant/2);
}

function drawColorCircle(el, size, rgba) {
    let colorCircle = document.createElement('canvas');
    colorCircle.className = 'color-circle';
    colorCircle.width = size;
    colorCircle.height = size;
    let ctx = colorCircle.getContext('2d');
    
    drawOuterColorCircle(ctx,size);
    drawInnerColorCircleHSV(ctx,size,rgba);
    el.appendChild(colorCircle);
}
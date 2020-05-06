chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

    // 二度押しの禁止
    chrome.runtime.sendMessage("activated");


    // canvasを作りbackground.jsから受け取ったimagePathを流し込み、domへ追加(全面にスクショ画像を表示)
    let canvas = document.createElement('canvas');
    canvas.className = 'screen-shot'
    let imagePath = request.message;
    let ctx = canvas.getContext("2d");
    draw(canvas,imagePath,ctx);
    document.body.appendChild(canvas);

    // マウスに追従するポップアップ
    let colorInfo = document.createElement('canvas');
    colorInfo.className = 'mouse-tracker';
    document.body.appendChild(colorInfo);

    // カラーサークルを表示するポップアップ
    let colorCircles = document.createElement('div');
    colorCircles.className = 'color-circles';
    document.body.appendChild(colorCircles);

    // HSVの静的エレメント(外輪)
    let staticColorCircleHSV = document.createElement('canvas');
    staticColorCircleHSV.className = 'color-circle';
    size = 250;
    staticColorCircleHSV.width = size;
    staticColorCircleHSV.height = size;
    colorCircles.appendChild(staticColorCircleHSV);
    let ctxSHSV = staticColorCircleHSV.getContext('2d');
    drawOuterColorCircle(ctxSHSV, size)

    // HSVの動的エレメント(内部, プロット)
    let dynamicColorCircleHSV = document.createElement('canvas');
    dynamicColorCircleHSV.className = 'color-circle';
    dynamicColorCircleHSV.style = 'position:absolute;top:0;left:0;';
    dynamicColorCircleHSV.height = size;
    dynamicColorCircleHSV.width = size;
    colorCircles.appendChild(dynamicColorCircleHSV);
    let ctxDHSV = dynamicColorCircleHSV.getContext('2d');
    drawInnerColorCircleHSV(ctxDHSV, size, [255, 255, 255, 255]);

    // HSLの静的エレメント(外輪)
    let staticColorCircleHSL = document.createElement('canvas');
    staticColorCircleHSL.className = 'color-circle';
    size = 250;
    staticColorCircleHSL.width = size;
    staticColorCircleHSL.height = size;
    colorCircles.appendChild(staticColorCircleHSL);
    let ctxSHSL = staticColorCircleHSL.getContext('2d');
    drawOuterColorCircle(ctxSHSL, size)

    // HSLの動的エレメント(内部, プロット)
    let dynamicColorCircleHSL = document.createElement('canvas');
    dynamicColorCircleHSL.className = 'color-circle';
    dynamicColorCircleHSL.style = 'position:absolute;top:0;right:0;';
    dynamicColorCircleHSL.height = size;
    dynamicColorCircleHSL.width = size;
    colorCircles.appendChild(dynamicColorCircleHSL);
    let ctxDHSL = dynamicColorCircleHSL.getContext('2d');
    drawInnerColorCircleHSL(ctxDHSL, size, [255, 255, 255, 255]);

    // mousemoveを検知してimageDataを取得、カラーサークルを更新
    canvas.addEventListener('mousemove',_.debounce(function(e) {
        updateColorCircle(e, ctx, colorInfo, ctxDHSV, ctxDHSL, size);
    },1));

    // escキーでdomを削除
    document.addEventListener("keydown",function(e){
        if (e.keyCode == 27) {
            chrome.runtime.sendMessage("quit");
            a = document.body.getElementsByClassName("color-circles");
            b = document.body.getElementsByClassName("mouse-tracker");
            c = document.body.getElementsByClassName("screen-shot");
            document.body.removeChild(a[0]);
            document.body.removeChild(b[0]);
            document.body.removeChild(c[0]);
            document.removeEventListener('mousemove',updateColorCircle(e, ctx, colorInfo, ctxDHSV, ctxSHSL, size));
        }
    });

}); 

function updateColorCircle(e, ctx, colorInfo, ctxDHSV, ctxDHSL, size) {
    let mousePos = getMousePosition(e);
    // console.log(mousePos);
    imageData = ctx.getImageData(mousePos.x*window.devicePixelRatio,mousePos.y*window.devicePixelRatio,1,1);
    // console.log("R:" + imageData.data[0] + " G:" + imageData.data[1] + " B:" + imageData.data[2] + " A:" + imageData.data[3]);

    magnifier(mousePos, ctx);
    colorInfo.style.top = mousePos.y+10 + "px";
    colorInfo.style.left = mousePos.x+10 + "px";

    // HSVのプロットと四角の描画を更新
    drawOuterColorCirclePoint(ctxDHSV, size, imageData.data);
    drawInnerColorCircleHSV(ctxDHSV, size, imageData.data);
    drawInnerColorCircleHSVPoint(ctxDHSV, size, imageData.data);

    // HSLのプロットと三角の描画を更新
    drawOuterColorCirclePoint(ctxDHSL, size, imageData.data);
    drawInnerColorCircleHSL(ctxDHSL, size, imageData.data);
    drawInnerColorCircleHSLPoint(ctxDHSL, size, imageData.data);
};

// 拡大鏡
function magnifier(mousePos, ctx) {
    let mt = document.getElementsByClassName("mouse-tracker")[0];
    magnifierGridSize = 70; // 奇数
    magnifierPopupSize = 240;
    mt.width = magnifierPopupSize;
    mt.height = magnifierPopupSize;

    unitSquareSize = Math.floor(magnifierPopupSize / magnifierGridSize); // 整数である必要がある
    ctxMT = mt.getContext('2d');
    imageDataForMagnifier = ctx.getImageData(mousePos.x*window.devicePixelRatio　- Math.floor(magnifierGridSize/2),mousePos.y*window.devicePixelRatio - Math.floor(magnifierGridSize/2),magnifierGridSize,magnifierGridSize);
    let w = unitSquareSize;
    let h = unitSquareSize;
    let x = 0;
    let y = 0;
    let cx,cy;
    let ex,ey;
    for (let i = 0; i < magnifierGridSize; i++) {
        x = 0;
        for (let j = 0; j < magnifierGridSize; j++) {
            r = imageDataForMagnifier.data[(i * magnifierGridSize + j) * 4];
            g = imageDataForMagnifier.data[(i * magnifierGridSize + j) * 4 + 1];
            b = imageDataForMagnifier.data[(i * magnifierGridSize + j) * 4 + 2];
            ctxMT.fillStyle = "rgb(" + r + "," + g + "," + b  + ")";
            if (i == Math.floor(magnifierGridSize/2) && j == Math.floor(magnifierGridSize/2)) {
                w = unitSquareSize * 4;
                h = unitSquareSize * 4;
                ctxMT.fillRect(x, y, w, h);
                cx = x;
                cy = y;
            } else if (i == Math.floor(magnifierGridSize/2)) {
                w = unitSquareSize;
                h = unitSquareSize * 4;
                ctxMT.fillRect(x, y, w, h);
            } else if (j == Math.floor(magnifierGridSize/2)) {
                w = unitSquareSize * 4;
                h = unitSquareSize;
                ctxMT.fillRect(x, y, w, h);
            } else {
                w = unitSquareSize;
                h = unitSquareSize;
                ctxMT.fillRect(x, y, w, h);
            }
            x += w;
            if (j == magnifierGridSize - 1) {
                ex = x + unitSquareSize;
            }
        }
        y += h;
        if (i == magnifierGridSize - 1) {
            ey = y + unitSquareSize;
        }
    }
    ctxMT.strokeStyle = 'black';
    ctxMT.strokeRect(0, 0, ex, ey);
    ctxMT.strokeRect(cx, 0, unitSquareSize * 4, ey);
    ctxMT.strokeRect(0, cy, ex, unitSquareSize * 4);
}

// 終了処理
function quitFunc(e, ctx, colorInfo, ctxDHSV, ctxDHSL, size) {
    // escapeのkeycodeは27
    a = document.body.getElementsByClassName("color-circles");
    b = document.body.getElementsByClassName("mouse-tracker");
    c = document.body.getElementsByClassName("screen-shot");
    if (e.keyCode == 27) {
        document.removeEventListener('mousemove',updateColorCircle(e, ctx, colorInfo, ctxDHSV, ctxDHSL, size));
        chrome.runtime.sendMessage("quit");
        document.body.removeChild(a[0]);
        document.body.removeChild(b[0]);
        document.body.removeChild(c[0]);
    }
}

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
        // console.log(tri.x1 + ", " + tri.y1 + ", " + tri.x2 + ", " + tri.y2);
        let grad = ctx.createLinearGradient(tri.x1, tri.y1, tri.x2, tri.y2);
        for (let j = 0; j < tri.colorStops.length; j++) {
            let cs = tri.colorStops[j];
            grad.addColorStop(cs.stop, cs.color);
        }
        ctx.beginPath();
        // console.log(center.x, center.y, rad, tri.angleStart, tri.angleEnd);
        ctx.arc(center.x, center.y, rad, tri.angleStart, tri.angleEnd);
        ctx.strokeStyle = grad;
        ctx.lineWidth = size/15;
        // ctx.translate(center.x,center.y);
        // ctx.rotate(offsetAngle);
        // ctx.translate(-center.x,-center.y);
        ctx.stroke();
    }
}

function drawOuterColorCirclePoint(ctx, size, rgba) {
    let center = new Object();
    center.x = size / 2;
    center.y = size / 2;
    ctx.clearRect(0,0,size,size);
    rad = size/2*0.9;
    hsv = RGBtoHSVorHSL(rgba, 'HSV');
    ctx.beginPath();
    ctx.arc(center.x + rad * Math.cos(((hsv[0] / 180 + 1) % 2) * Math.PI), center.y + rad * Math.sin(((hsv[0] / 180 + 1) % 2) * Math.PI), size/30, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgb(255,255,255)';
    ctx.stroke();
}

function drawInnerColorCircleHSVPoint(ctx, size, rgba) {
    let center = new Object();
    center.x = size / 2;
    center.y = size / 2;
    let quant = Math.round(size * 0.55);

    hsv = RGBtoHSVorHSL(rgba, 'HSV');
    ctx.beginPath();
    // ctx.arc(center.x - quant/2 + hsv[2]/100 * quant, center.y - quant/2 + hsv[1]/100 * quant, size/30, 0, 2 * Math.PI);
    ctx.arc(center.x-quant/2 + hsv[1]/100 * quant ,center.y-quant/2 + (1 - hsv[2]/100) * quant ,size/30, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgb(255,255,255)';
    ctx.stroke();
}

function drawInnerColorCircleHSLPoint(ctx, size, rgba) {
    let center = new Object();
    center.x = size / 2;
    center.y = size / 2;

    let quant = Math.round(size * 0.65);

    hsl = RGBtoHSVorHSL(rgba, 'HSL');
    ctx.beginPath();
    x1 = 
    ctx.arc(center.x - quant * Math.sin(Math.PI * 1/3) / 3 + hsl[1]/100 * (0.5 - Math.abs(0.5 - hsl[2] / 100)) * quant * Math.tan(Math.PI / 1/3),center.y - quant * Math.cos(Math.PI * 1/3) + (1 - hsl[2] / 100) * quant, size/30, 0, 2 * Math.PI);

    ctx.strokeStyle = 'rgb(255,255,255)';
    ctx.stroke();
}

function drawInnerColorCircleHSV(ctx,size,rgba) {
    let center = new Object();
    center.x = size / 2;
    center.y = size / 2;

    hsv = RGBtoHSVorHSL(rgba, 'HSV');
    let hue = hsv[0];
    let quant = Math.round(size * 0.55); //量子化数
    for (let i = 0; i < quant; i++) {
        // hsv (h, i. quant-1-j)
        h = (hue / 60) % 1;
        A = Math.round((quant - i) / quant * 255);
        B = 0;
        C = Math.round((quant - i) / quant * (1 - h) * 255);
        D = Math.round((quant - i) / quant * (1 - (1 - h)) * 255);
        if (hue < 60) {
            r = A; g = D; b = B;
        } else if (hue < 120) {
            r = C; g = A; b = B;
        } else if (hue < 180) {
            r = B; g = A; b = D;
        } else if (hue < 240) {
            r = B; g = C; b = A;
        } else if (hue < 300) {
            r = D; g = B; b = A;
        } else {
            r = A; g = B; b = C;
        }
        r2 = Math.round((quant - i) / quant * 255);
        g2 = Math.round((quant - i) / quant * 255);
        b2 = Math.round((quant - i) / quant * 255);
        grad = ctx.createLinearGradient(center.x - quant/2, center.y - quant/2 + i, center.x + quant/2, center.y - quant/2 + i);
        grad.addColorStop(0, 'rgb(' + r2 + ',' + g2 + ',' + b2 + ')');
        grad.addColorStop(1, 'rgb(' + r + ',' + g + ',' + b + ')');
        ctx.fillStyle = grad;
        ctx.fillRect(center.x - quant/2, center.y - quant/2 + i, quant, 1);
    }
}

function drawInnerColorCircleHSL(ctx,size,rgba) {
    let center = new Object();
    center.x = size / 2;
    center.y = size / 2;

    hsl = RGBtoHSVorHSL(rgba,'HSL');

    hue = hsl[0];
    let quant = Math.round(size * 0.65);
    centroidX = quant * Math.sin(Math.PI * 1/3) / 3;
    for (let i = 0; i < quant; i++) {
        width = 2 * Math.sin(Math.PI * 1/3) * (- Math.abs(quant/2 - i) + quant/2);
        grad = ctx.createLinearGradient(center.x - centroidX, center.y - quant/2, center.x - centroidX + width, center.y - quant/2);
        grad.addColorStop(0, 'hsl(' + hue + ',0%,' + Math.round((quant - i) / quant * 100) + '%)');
        grad.addColorStop(1, 'hsl(' + hue + ',100%,' + Math.round((quant - i) / quant * 100) + '%)');
        ctx.fillStyle = grad;
        ctx.fillRect(center.x - centroidX, Math.round(i + center.y - quant / 2), width, 1);
    }
}

function RGBtoHSVorHSL(rgba,colorSpace) {
    r = rgba[0]; g = rgba[1]; b = rgba[2];
    let rgb = [r,g,b];
    max = Math.max.apply(null,rgb);
    min = Math.min.apply(null,rgb);
    maxi = maxIndex(rgb);
    let h;
    if (max - min == 0){
        h = 0;
    } else if (maxi == 0) {
        h = (Math.round((g - b) / (max - min) * 60) + 360) % 360;
    } else if (maxi == 1) { 
        h = Math.round((b - r) / (max - min) * 60 + 120);
    } else if (maxi == 2){
        h = Math.round((r - g) / (max - min) * 60 + 240);
    }
    if (colorSpace == 'HSV'){
        let s = Math.round((max - min) / max * 100);
        let v = Math.round(max / 255 * 100);
        let hsv = [h,s,v];
        // console.log("hsv = " + hsv);
        return hsv;
    } else {
        let l = Math.round((max + min) / 2 * 100 / 255);
        let s2;
        if (l < 50) {
            s2 = Math.round((max - min) / (max + min) * 100);
        } else if (l < 99) {
            s2 = Math.round((max - min) / (510 - (max + min)) * 100);
        } else {
            s2 = 100;
        }
        let hsl = [h,s2,l];
        // console.log("hsl = " + hsl);
        return hsl; 
    }
}

function maxIndex(array){
    let index = 0;
    let value = -100;
    for (let i = 0; i < array.length; i++) {
        if (value < array[i]) {
            value = array[i];
            index = i;
        }
    }
    return index;
}

function drawColorCircle(ctx, size, rgba) {
    // HSVカラーサークルの描画


    drawOuterColorCircle(ctx,size,rgba);
    drawInnerColorCircleHSV(ctx,size,rgba);


    // HSLカラーサークルの描画

    // ctx = colorCircleHSL.getContext('2d');
    // drawOuterColorCircle(ctx,size);
    // drawInnerColorCircleHSL(ctx,size,rgba);


}
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
    colorInfo.style.backgroundColor = 'rgba(0,0,0,1)';
    document.body.appendChild(colorInfo);

    size = 250;
    colorValueHeight = 40;

    let colorCircleContainer = document.createElement('div');
    colorCircleContainer.className = 'color-circle-container';
    colorCircleContainer.style.width = size;
    colorCircleContainer.style.height = size + colorValueHeight;
    document.body.appendChild(colorCircleContainer);

    // カラーサークルを表示するポップアップ
    let colorCircle = document.createElement('div');
    colorCircle.className = 'color-circle';
    colorCircleContainer.appendChild(colorCircle);

    let colorValue = document.createElement('div');
    colorValue.className = 'color-value';
    colorValue.style.width = size;
    colorValue.style.height = colorValueHeight;
    colorCircleContainer.appendChild(colorValue);

    // HSVの静的エレメント(外輪)
    let staticColorCircleHSV = document.createElement('canvas');
    staticColorCircleHSV.className = 'color-circle';
    staticColorCircleHSV.width = size;
    staticColorCircleHSV.height = size;
    colorCircle.appendChild(staticColorCircleHSV);
    let ctxSHSV = staticColorCircleHSV.getContext('2d');
    drawOuterColorCircle(ctxSHSV, size)

    // HSVの動的エレメント(内部, プロット)
    let dynamicColorCircleHSV = document.createElement('canvas');
    dynamicColorCircleHSV.className = 'color-circle';
    dynamicColorCircleHSV.style = 'position: absolute; top: 0; left: 0;';
    dynamicColorCircleHSV.height = size;
    dynamicColorCircleHSV.width = size;
    colorCircle.appendChild(dynamicColorCircleHSV);
    let ctxDHSV = dynamicColorCircleHSV.getContext('2d');
    // drawInnerColorCircleHSV(ctxDHSV, size, [255, 255, 255, 255]);

    // HSLの静的エレメント(外輪)
    let staticColorCircleHSL = document.createElement('canvas');
    staticColorCircleHSL.className = 'color-circle';
    staticColorCircleHSL.width = size;
    staticColorCircleHSL.height = size;
    staticColorCircleHSL.style = "position: absolute; top: 0; left: 0";
    colorCircle.appendChild(staticColorCircleHSL);
    let ctxSHSL = staticColorCircleHSL.getContext('2d');
    // drawOuterColorCircle(ctxSHSL, size)

    // HSLの動的エレメント(内部, プロット)
    let dynamicColorCircleHSL = document.createElement('canvas');
    dynamicColorCircleHSL.className = 'color-circle';
    dynamicColorCircleHSL.style = 'position: absolute; top: 0; left: 0;';
    dynamicColorCircleHSL.height = size;
    dynamicColorCircleHSL.width = size;
    colorCircle.appendChild(dynamicColorCircleHSL);
    let ctxDHSL = dynamicColorCircleHSL.getContext('2d');
    // drawInnerColorCircleHSL(ctxDHSL, size, [255, 255, 255, 255]);


    colorValue = colorCircleContainer.getElementsByClassName('color-value')[0];

    isHSV = true;
    if (request.colorSpace == 'HSV') {
        isHSV = true;
    } else {
        isHSV = false;
    }
    colorCircle.onclick = (e) => {
        isHSV = !isHSV;
        if (isHSV) {
            dynamicColorCircleHSV.style.display = 'block';
            dynamicColorCircleHSL.style.display = 'none';
            drawOuterColorCirclePoint(ctxDHSV, size, imageData.data);
            drawInnerColorCircleHSV(ctxDHSV, size, imageData.data);
            drawInnerColorCircleHSVPoint(ctxDHSV, size, imageData.data);
            valueMode = valueModesHSV[(startMode + colorValueClickCounter) % 3];
            colorValue.textContent = valueModeText(valueMode, imageData);
        } else {
            dynamicColorCircleHSV.style.display = 'none';
            dynamicColorCircleHSL.style.display = 'block';
            drawOuterColorCirclePoint(ctxDHSL, size, imageData.data);
            drawInnerColorCircleHSL(ctxDHSL, size, imageData.data);
            drawInnerColorCircleHSLPoint(ctxDHSL, size, imageData.data);
            valueMode = valueModesHSL[(startMode + colorValueClickCounter) % 3];
            colorValue.textContent = valueModeText(valueMode, imageData);
        }
    }

    let colorValueClickCounter = 0;
    let startMode = 0;
    if (request.colorFormat == 'HexRGB') {
        startMode = 0;
    } else if (request.colorFormat == 'RGB') {
        startMode = 1;
    } else if (request.colorFormat == 'HS') {
        startMode = 2;
    }
    let valueModesHSV = ["HexRGB","RGB","HSV"];
    let valueModesHSL = ["HexRGB","RGB","HSL"];
    let valueMode = valueModesHSV[startMode];
    colorValue.onclick = () => {
        colorValueClickCounter ++;
        if (isHSV) {
            valueMode = valueModesHSV[(startMode + colorValueClickCounter) % 3];
            colorValue.textContent = valueModeText(valueMode, imageData);
        } else {
            valueMode = valueModesHSL[(startMode + colorValueClickCounter) % 3];
            colorValue.textContent = valueModeText(valueMode, imageData);
        }
    }



    let clickCount = 0;
    debounce = _.debounce((e)=>updateColorCircle(e, ctx, colorInfo, ctxDHSV, ctxDHSL, size, colorCircleContainer, valueMode, isHSV),1);
    window.addEventListener('mousemove', debounce);

    canvas.addEventListener('click',function(){
        clickCount ++;
        if (clickCount % 2 == 1){
            window.removeEventListener('mousemove', debounce);
            colorInfo.style.opacity = 0.6;
        } else {
            window.addEventListener('mousemove', debounce);
            colorInfo.style.opacity = 1;
        }
    });

    // escキーでdomを削除
    quitEvent = e => quit(e);
    window.addEventListener("keyup",quitEvent);


});


// 終了処理
function quit(e){
    if (e.keyCode == 27) {
        chrome.runtime.sendMessage("quit");
        window.removeEventListener('mousemove',debounce);
        a = document.body.getElementsByClassName("color-circle-container");
        b = document.body.getElementsByClassName("mouse-tracker");
        c = document.body.getElementsByClassName("screen-shot");
        document.body.removeChild(a[0]);
        document.body.removeChild(b[0]);
        document.body.removeChild(c[0]);
        window.removeEventListener("keyup",quitEvent);
    }
}

// マウスの移動によって描画を更新
function updateColorCircle(e, ctx, colorInfo, ctxDHSV, ctxDHSL, size, colorCircleContainer, valueMode, isHSV) {
    let mousePos = getMousePosition(e);
    // console.log(mousePos);
    imageData = ctx.getImageData(mousePos.x*window.devicePixelRatio,mousePos.y*window.devicePixelRatio,1,1);

    if (mousePos.x < size + 30 && mousePos.y < size + 30 + 40) {
        colorCircleContainer.style.bottom = "0";
        colorCircleContainer.style.top = "auto";
    } else {
        colorCircleContainer.style.bottom = "auto";
        colorCircleContainer.style.top = "0";
    }

    colorValue = colorCircleContainer.getElementsByClassName('color-value')[0];
    colorValue.textContent = valueModeText(valueMode, imageData);

    magnifier(mousePos, ctx);
    borderX = window.innerWidth - size - 30;
    borderY = window.innerHeight - size - 30;
    if (mousePos.x > borderX && mousePos.y < borderY) {
        colorInfo.style.top = mousePos.y+10 + "px";
        colorInfo.style.left = (mousePos.x - 10 - size) + "px";
    } else if (mousePos.x < borderX && mousePos.y > borderY) {
        colorInfo.style.top = (mousePos.y - 10 - size) + "px";
        colorInfo.style.left = (mousePos.x + 10) + "px";
    } else if (mousePos.x > borderX && mousePos.y > borderY) {
        colorInfo.style.top = (mousePos.y - 10 - size) + "px";
        colorInfo.style.left = (mousePos.x - 10 - size) + "px";
    } else {
        colorInfo.style.top = (mousePos.y + 10) + "px";
        colorInfo.style.left = (mousePos.x + 10) + "px";
    }

    if (isHSV) {
        drawOuterColorCirclePoint(ctxDHSV, size, imageData.data);
        drawInnerColorCircleHSV(ctxDHSV, size, imageData.data);
        drawInnerColorCircleHSVPoint(ctxDHSV, size, imageData.data);
    } else {
        drawOuterColorCirclePoint(ctxDHSL, size, imageData.data);
        drawInnerColorCircleHSL(ctxDHSL, size, imageData.data);
        drawInnerColorCircleHSLPoint(ctxDHSL, size, imageData.data);
    }

    
}

function valueModeText(valueMode,imageData) {
    let text;
    r = imageData.data[0];
    g = imageData.data[1];
    b = imageData.data[2];
    colorValue = document.body.getElementsByClassName('colorValue')[0];
    if (valueMode == 'HexRGB') {
        let rStr;
        let gStr;
        let bStr;
        if (r < 16) {
            rStr = '0' + r.toString(16);
        } else {
            rStr = r.toString(16);
        }
        if (g < 16) {
            gStr = '0' + g.toString(16);
        } else {
            gStr = g.toString(16);
        }
        if (b < 16) {
            bStr = '0' + b.toString(16);
        } else {
            bStr = b.toString(16);
        }
        text = '#' + rStr + gStr + bStr;
    } else if (valueMode == 'RGB') {
        text = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    } else if (valueMode == 'HSV') {
        hsv = RGBtoHSVorHSL(imageData.data,'HSV');
        text = 'hsv(' + hsv[0] + ', ' + hsv[1] + '%, ' + hsv[2] + '%)';
    } else if (valueMode == 'HSL') {
        hsl = RGBtoHSVorHSL(imageData.data,'HSL');
        text = 'hsl(' + hsl[0] + ', ' + hsl[1] + '%, ' + hsl[2] + '%)';
    }
    return text;
}

// 拡大鏡
function magnifier(mousePos, ctx) {
    let mt = document.getElementsByClassName("mouse-tracker")[0];
    magnifierGridSize = 75; // 奇数
    magnifierPopupSize = 236;
    mt.width = magnifierPopupSize;
    mt.height = magnifierPopupSize;

    unitSquareSize = Math.floor(magnifierPopupSize / magnifierGridSize); // 整数である必要がある
    ctxMT = mt.getContext('2d');
    imageDataForMagnifier = ctx.getImageData(mousePos.x*window.devicePixelRatio - Math.floor(magnifierGridSize/2),mousePos.y*window.devicePixelRatio - Math.floor(magnifierGridSize/2),magnifierGridSize,magnifierGridSize);
    let w = unitSquareSize;
    let h = unitSquareSize;
    let offsetX = Math.floor((magnifierPopupSize - (magnifierGridSize + 3) * unitSquareSize) / 2);
    let offsetY = Math.floor((magnifierPopupSize - (magnifierGridSize + 3) * unitSquareSize) / 2);
    let x = offsetX;
    let y = offsetY;
    let cx,cy;
    let ex,ey;
    for (let i = 0; i < magnifierGridSize; i++) {
        x = offsetX;
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
                ex = x + unitSquareSize - offsetX - w;
            }
        }
        y += h;
        if (i == magnifierGridSize - 1) {
            ey = y + unitSquareSize - offsetY - h;
        }
    }
    ctxMT.strokeStyle = 'black';
    ctxMT.strokeRect(offsetX, offsetY, ex, ey);
    ctxMT.strokeRect(cx, offsetY, unitSquareSize * 4, ey);
    ctxMT.strokeRect(offsetX, cy, ex, unitSquareSize * 4);
    ctxMT.strokeRect(cx - 1, cy - 1, unitSquareSize * 4 + 2, unitSquareSize * 4 + 2)
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
        x: parseInt(e.clientX),
        y: parseInt(e.clientY)
    };
}

// 外輪の描画
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

// 外輪のプロットの描画
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

// 内四角のプロットの描画
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

// 内三角のプロットの描画
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

// 内四角の描画
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

// 内三角の描画
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

// RGBをHSVまたはHSLに変換
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
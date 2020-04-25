//HTML内に画像を表示
html2canvas(document.body,{
onrendered: function(canvas){
    //imgタグのsrcの中に、html2canvasがレンダリングした画像を指定する。
    var imgData = canvas.toDataURL();
    document.body.src = imgData;
}
});
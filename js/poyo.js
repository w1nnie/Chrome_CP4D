//ロードされた際の処理として実施：
window.onload = function(){

  //HTML内に画像を表示
  html2canvas(document.body,{
    onrendered: function(canvas){
      //imgタグのsrcの中に、html2canvasがレンダリングした画像を指定する。
      var imgData = canvas.toDataURL();
      document.getElementById("result").src = imgData;
    }
  });

}
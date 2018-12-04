export default function otsuMethod(ctx, w, h){

    greyscale(ctx, w, h); 
    var histogram = hist(ctx, w, h);
    var threshold = otsu(histogram, w*h);
    binarize(threshold, ctx, w, h);


}



function greyscale(context, w, h){
    const RED_INTENCITY_COEF = 0.2126;
    const GREEN_INTENCITY_COEF = 0.7152;
    const BLUE_INTENCITY_COEF = 0.0722;
    var imageData = context.getImageData(0, 0, w, h);
    var data = imageData.data;
    let brightness;
  
    for (let i = 0; i < data.length; i += 4) {
        brightness = RED_INTENCITY_COEF * data[i] + GREEN_INTENCITY_COEF * data[i + 1] + BLUE_INTENCITY_COEF * data[i + 2];
        //brightness = (data[i] +  data[i+1] + data[i+2]) / 3;
        data[i] = brightness;
        data[i + 1] = brightness;
        data[i + 2] = brightness;
      }
    
    context.putImageData(imageData, 0, 0);
}
  
function hist(context, w, h) {
    
      var imageData = context.getImageData(0, 0, w, h);
      var data = imageData.data;
      var brightness;
      var brightness256Val;
      var histArray = Array.apply(null, new Array(256)).map(Number.prototype.valueOf,0);
  
      for (var i = 0; i < data.length; i += 4) {
          brightness = data[i];
          brightness256Val = Math.floor(brightness);
          histArray[brightness256Val] += 1;
      }
      
      return histArray;
}
  
function otsu(histogram, total) {
      var sum = 0;
      //var n = 0;
      for (let i = 1; i < 256; ++i)
      {
          sum += i * histogram[i];
          //n += histogram[i];     // for i=0, n instead of total (total num of pixels)
      }
      //console.log(n, total);    
      var sumB = 0;
      var wB = 0;
      var wF = 0;
      var mB;
      var mF;
      var max = -1.0;
      var between = 0.0;
      var threshold = 1;
    
      for (let i = 0; i < 256; ++i) {
          wB += histogram[i];
          if (wB == 0)
              continue;
          wF = total - wB;
          if (wF == 0)
              break;
          sumB += i * histogram[i];
          mB = sumB / wB;
          mF = (sum - sumB) / wF;
          between = wB * wF * Math.pow(mB - mF, 2);
          if ( between > max ) {
              threshold = i;
              max = between;            
          }
      }
      if (threshold == 0) threshold = 128;
      return threshold;
}
  
  
function binarize(threshold, context, w, h) {
    
      var imageData = context.getImageData(0, 0, w, h);
      var data = imageData.data;
      var val;
      
      for(let i = 0; i < data.length; i += 4) {
          var brightness = data[i];
          val = ((brightness > threshold) ? 255 : 0);
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
      }
      
      // overwrite original image
      context.putImageData(imageData, 0, 0);
}
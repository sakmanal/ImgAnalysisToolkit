export default function binarize(threshold, context, w, h) {
    var RED_INTENCITY_COEF = 0.2126;
    var GREEN_INTENCITY_COEF = 0.7152;
    var BLUE_INTENCITY_COEF = 0.0722;
      var imageData = context.getImageData(0, 0, w, h);
      var data = imageData.data;
      var val;
      
      for(var i = 0; i < data.length; i += 4) {
          var brightness = RED_INTENCITY_COEF * data[i] + GREEN_INTENCITY_COEF * data[i + 1] + BLUE_INTENCITY_COEF * data[i + 2];
          val = ((brightness >= threshold) ? 255 : 0);
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
      }
      
      // overwrite original image
      context.putImageData(imageData, 0, 0);
  }
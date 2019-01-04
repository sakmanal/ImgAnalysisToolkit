export default function binarize(threshold, context, w, h) {
    const RED_INTENCITY_COEF = 0.2126;
    const GREEN_INTENCITY_COEF = 0.7152;
    const BLUE_INTENCITY_COEF = 0.0722;
    const imageData = context.getImageData(0, 0, w, h);
    const data = imageData.data;
      
      
      for(var i = 0; i < data.length; i += 4) {
          const brightness = RED_INTENCITY_COEF * data[i] + GREEN_INTENCITY_COEF * data[i + 1] + BLUE_INTENCITY_COEF * data[i + 2];
          const val = ((brightness >= threshold) ? 255 : 0);
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
      }
      
      // overwrite original image
      context.putImageData(imageData, 0, 0);
  }
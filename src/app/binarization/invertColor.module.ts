export default function InvertColours(context, w, h){
    var imageData = context.getImageData(0, 0, w, h);
    var data = imageData.data;
    for(var i = 0; i < data.length; i += 4) {
          data[i] = 250 - data[i];
          data[i + 1] = 250 - data[i + 1];
          data[i + 2] = 250 - data[i + 2];
    }
    context.putImageData(imageData, 0, 0);
  }
export default function InvertColours(context, w, h){
    const imageData = context.getImageData(0, 0, w, h);
    const data = imageData.data;
    for(let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];
          data[i + 1] = 255 - data[i + 1];
          data[i + 2] = 255 - data[i + 2];
    }
    context.putImageData(imageData, 0, 0);
  }
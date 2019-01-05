export default function InvertColours(context, w, h){
    const imageData = context.getImageData(0, 0, w, h);
    const data = imageData.data;
    for(let i = 0; i < data.length; i += 4) {
          data[i] = 250 - data[i];
          data[i + 1] = 250 - data[i + 1];
          data[i + 2] = 250 - data[i + 2];
    }
    context.putImageData(imageData, 0, 0);
  }
export default function copy(image:ImageData):ImageData{

    const img:ImageData = new ImageData(image.width, image.height);

    for(let i = 0; i < img.data.length; i++){
         img.data[i] = image.data[i];
    }

    return img;
}
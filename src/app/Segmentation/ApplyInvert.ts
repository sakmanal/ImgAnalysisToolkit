export default function ApplyInvert(imagedata:ImageData):ImageData{
    
    for(let i=0; i<imagedata.data.length; i++){
        imagedata.data[i] = 255 - imagedata.data[i];
        imagedata.data[i + 1] = 255 - imagedata.data[i + 1];
        imagedata.data[i + 2] = 255 - imagedata.data[i + 2];
    }

    return imagedata;
}
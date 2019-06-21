declare function postMessage(message: any): void;


export const binarize = (d:any) => {
    
    const imageData = d.imageData;
    const threshold = d.threshold;
    let data = imageData.data;

    const RED_INTENCITY_COEF = 0.2126;
    const GREEN_INTENCITY_COEF = 0.7152;
    const BLUE_INTENCITY_COEF = 0.0722;

    for(let i = 0; i < data.length; i += 4) {
        const brightness = RED_INTENCITY_COEF * data[i] + GREEN_INTENCITY_COEF * data[i + 1] + BLUE_INTENCITY_COEF * data[i + 2];
        const val = ((brightness >= threshold) ? 255 : 0);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
    }



    postMessage(imageData);
}
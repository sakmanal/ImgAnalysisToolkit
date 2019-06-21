declare function postMessage(message: any): void;

export const histog = (d:any) => {
  
    
    const imageData = d.imageData;
    const w = imageData.width;
    const h = imageData.height;
    let data = imageData.data;
    greyscale(); 
    const histogram = hist();
    postMessage(histogram);

    function greyscale(){
        const RED_INTENCITY_COEF = 0.2126;
        const GREEN_INTENCITY_COEF = 0.7152;
        const BLUE_INTENCITY_COEF = 0.0722;
        
        let brightness;
      
        for (let i = 0; i < data.length; i += 4) {
            brightness = RED_INTENCITY_COEF * data[i] + GREEN_INTENCITY_COEF * data[i + 1] + BLUE_INTENCITY_COEF * data[i + 2];
            //brightness = (data[i] +  data[i+1] + data[i+2]) / 3;
            data[i] = brightness;
            data[i + 1] = brightness;
            data[i + 2] = brightness;
          }
        
      
    }
      
    function hist() {
        
          
          let brightness;
          let brightness256Val;
          const histArray = Array.apply(null, new Array(256)).map(Number.prototype.valueOf,0);
      
          for (let i = 0; i < data.length; i += 4) {
              brightness = data[i];
              brightness256Val = Math.floor(brightness);
              histArray[brightness256Val] += 1;
          }
          
          return histArray;
    }
}
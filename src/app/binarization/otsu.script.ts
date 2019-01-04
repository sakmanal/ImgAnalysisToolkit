declare function postMessage(message: any): void;


export const otsu = (d:any) => {
    let data:any;
    const imageData = d.imageData;
    const w = imageData.width;
    const h = imageData.height;
    data = imageData.data;
    greyscale(); 
    const histogram = hist();
    const threshold = otsu(histogram, w*h);
    binarize(threshold);
    postMessage(imageData);



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
      
    function otsu(histogram, total) {
          let sum = 0;
         
          for (let i = 1; i < 256; ++i)
          {
              sum += i * histogram[i];
             
          }
           
          let sumB = 0;
          let wB = 0;
          let wF = 0;
          let mB;
          let mF;
          let max = -1.0;
          let between = 0.0;
          let threshold = 1;
        
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
      
      
    function binarize(threshold) {
        
          let val;
          
          for(let i = 0; i < data.length; i += 4) {
              const brightness = data[i];
              val = ((brightness > threshold) ? 255 : 0);
              data[i] = val;
              data[i + 1] = val;
              data[i + 2] = val;
          }
          
         
    }
};
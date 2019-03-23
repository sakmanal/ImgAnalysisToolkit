//self is a keyword: Reference to this Worker 
//self.onmessage = sauvolaFilter;   --- self not really needed

onmessage = sauvolaFilter;

function sauvolaFilter( d: MessageEvent ) {
   const imageData = d.data.imageData;
   const w = imageData.width;
   const h = imageData.height;
   let data = imageData.data;

   greyscale(data);
   sauvola(data, w, h, d.data.masksize, d.data.stathera, d.data.rstathera, d.data.n);

   const x:any = [imageData.data.buffer]
   postMessage(imageData, x);
   // use:
   // self.close();
   // if you need to terminate worker from Worker Environment.
}



function make2Darray(w, h){ 

   const arr = new Array(h);
   for (let i = 0; i < arr.length; i++){
     arr[i] = new Array(w);
   }
   return arr;
}




function greyscale(data) {
   const RED_INTENCITY_COEF = 0.2126;
   const GREEN_INTENCITY_COEF = 0.7152;
   const BLUE_INTENCITY_COEF = 0.0722;
 
     
     
     for(let i = 0; i < data.length; i += 4) {
         const brightness = RED_INTENCITY_COEF * data[i] + GREEN_INTENCITY_COEF * data[i + 1] + BLUE_INTENCITY_COEF * data[i + 2];
       
         data[i] = brightness;
         data[i + 1] = brightness;
         data[i + 2] = brightness;
     }
    
 

}
 
 
function  sauvola(data, width, height, _masksize, _stathera, _rstathera, _n){
 
 
 
   let masksize =  _masksize;
   const stathera =  _stathera;
   const rstathera = _rstathera;
   const n = _n;
 

 
   let temp = make2Darray(width, height);
   let finalImage = make2Darray(width, height);
   let baseArray = make2Darray(width, height);
 
   masksize += 1;
   const stride = 4 * width;
   
   for (let i = 0; i < height; i++)
   {
     for (let k = 0; k < width; k++)
     {
        baseArray[i][k] = false;
        temp[i][k] = data[4 * k + i * stride];
 
     }
}
 
   
    for (let i = 0; i < height;  i = i + n)
   {
     for (let k = 0; k < width; k = k + n)
     {
        baseArray[i][k] = true;
        finalImage[i][k] = SauvolaMaskArray(temp, i, k, masksize, stathera, rstathera, width, height);
 
     }
   }
 
   
   if (n > 1)
   {
    for (let i = 0; i < height;  i = i + n)
    {
       for (let k = 0; k < width; k = k + n)
       {
           SauvolaAverage(finalImage, i, k, n, baseArray, width, height);
       }
    }
 
   }
 
   for (let i = 0; i < height; i++)
   {
     for (let k = 0; k < width; k++)
     {
         if (data[4 * k + i * stride] < finalImage[i][k])
         {
             data[4 * k + i * stride] = 0;
             data[4 * k + i * stride + 1] = 0;
             data[4 * k + i * stride + 2] = 0;
         }  
         else
         {
             data[4 * k + i * stride] = 255;
             data[4 * k + i * stride + 1] = 255;
             data[4 * k + i * stride + 2] = 255;
         }
     }
   }
 
 }
 
function  SauvolaMaskArray(temparray, h, w, masksize, stathera, rstathera, width, height)
 {
  
  let i, k, tempi, tempk;
  let mean, deviation;
 
   // Υπολογισμός Μέσης Τιμής
   mean = 0;
   for (i = h - masksize; i <= h + masksize; i++)
             {
                 for (k = w - masksize; k <= w + masksize; k++)
                 {
                     tempk = k;
                     if (k < 0)
                         tempk = 0;
                     if (k >= width)
                         tempk = width - 1;
                     tempi = i;
                     if (i < 0)
                         tempi = 0;
                     if (i >= height)
                         tempi = height - 1;
                     mean += temparray[tempi][tempk];
                 }
             }
    
   mean = mean /Math.pow((masksize * 2 + 1), 2);
 
   // Υπολογισμός Απόκλισης
   deviation = 0;
   for (i = h - masksize; i <= h + masksize; i++)
             {
                 for (k = w - masksize; k <= w + masksize; k++)
                 {
                     tempk = k;
                     if (k < 0)
                         tempk = 0;
                     if (k >= width)
                         tempk = width - 1;
                     tempi = i;
                     if (i < 0)
                         tempi = 0;
                     if (i >= height)
                         tempi = height - 1;
                     deviation += Math.pow((temparray[tempi][tempk] - mean), 2);
                 }
                 
             }
   deviation = Math.sqrt(deviation / ((masksize * 2 + 1) - 1));          
   return (mean + (1 + stathera * ((deviation / rstathera) - 1)));
}  
 
function  SauvolaAverage(finalImage, i, k, n, baseArray, width, height){
 
   let pa, pd, ka, kd;
   let ncount;
   let ii, kk;
 
   pa = pd = ka = kd = 0;
 
   for (ii = i; ii <= i + n; ii++)
             {
                 for (kk = k; kk <= k + n; kk++)
                 {
                     if (kk <= width - 1 && ii <= height - 1)
                     {
                         if (baseArray[ii][kk] == false)
                         {
                             pa = finalImage[i][k];
                             ncount = 1;
                             if ((k + n) <= width - 1 && i <= height - 1)
                             {
                                 pd = finalImage[i][k + n];
                                 ncount++;
                             }
                             if ((i + n) <= height - 1 && k <= width - 1)
                             {
                                 ka = finalImage[i + n][k];
                                 ncount++;
                             }
                             if ((k + n) <= width - 1 && (i + n) <= height - 1)
                             {
                                 kd = finalImage[i + n][k + n];
                                 ncount++;
                             }
                             finalImage[ii][kk] = Math.round((pa + pd + ka + kd) / ncount);
                             baseArray[ii][kk] = true;
                         }
                     }
                 }
             }
 
}
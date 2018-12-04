export default function gppMethod(ctx, w, h){

    greyscale(ctx, w, h);
    gpp(ctx, w, h);


}




function greyscale(context, w, h) {
    var RED_INTENCITY_COEF = 0.2126;
    var GREEN_INTENCITY_COEF = 0.7152;
    var BLUE_INTENCITY_COEF = 0.0722;
      var imageData = context.getImageData(0, 0, w, h);
      var data = imageData.data;
      
      
      for(var i = 0; i < data.length; i += 4) {
          var brightness = RED_INTENCITY_COEF * data[i] + GREEN_INTENCITY_COEF * data[i + 1] + BLUE_INTENCITY_COEF * data[i + 2];
        
          data[i] = brightness;
          data[i + 1] = brightness;
          data[i + 2] = brightness;
      }
     
      // overwrite original image
      context.putImageData(imageData, 0, 0);
}
  
function make2Darray(w, h){ 
  
   var arr = new Array(h);
   for (let i = 0; i < arr.length; i++){
     arr[i] = new Array(w);
   }
   return arr;
}
  
  
function gpp(context, width, height){
  
    var imageData = context.getImageData(0, 0, width, height);
    var data = imageData.data;
  
    //const imageSize = data.length;
    //console.log(imageSize, w*h*4);
  
    //Previous Global Parameters
    let Ix = width;
    let Iy = height;
  
    //params
    let dW = Math.min(Ix - 2, Math.min(10, Iy - 2));  //= 15;
  
    let k = 2.0;  //= 1;
    k = k / 10;
    let R = 128;
    let q = 1 / 1.7;   
    let p1 = 0.5;
    let p2 = 0.7;  //0.8;
    let upsampling = 1;
    let dW1 = Math.min(Ix - 1, Math.min(20, Iy - 1));
  
    var RH = Array.apply(null, new Array(256)).map(Number.prototype.valueOf,0);
    var GH = Array.apply(null, new Array(256)).map(Number.prototype.valueOf,0);
    var BH = Array.apply(null, new Array(256)).map(Number.prototype.valueOf,0);
    let I, I1;
    let pix, gray, gray2, TH, graygray, pix1 = 0, gray1 = 0;
    let ydWIx, ydW_1Ix, ydW1Ix, ydW1_1Ix;
    let m, s;
    let d;
    let d2;
  
    let a;
    let b;
    let aa, bb, cc, dd;
  
  /*  for (let i = 0; i < 256; i++)
    {
          RH[i] = 0;
          GH[i] = 0;
          BH[i] = 0;
    } */
  
  
    var IMAGE = make2Darray(width, height);
    var IMAGE11 = make2Darray(width, height);
    var IMAGE2 = make2Darray(Ix, Iy);
    for (let i = 0; i < height; i++)
    {
      for (let k = 0; k < width; k++)
      {
         IMAGE[i][k] = data[4 * k + i * 4 * width];
         IMAGE11[i][k] = data[4 * k + i * 4 * width];
      }
    }
  
    let IX_pix = new Array(Ix + 1);
    let IX_gray = new Array(Ix + 1);
    let IX_graygray = new Array(Ix + 1);
    let IX_pix1 = new Array(Ix + 1);
    let IX_gray1 = new Array(Ix + 1);
    let IX_graygray1 = new Array(Ix + 1);
  
    //1st step
    for (let y = 0; y < Iy; y++)
    {
        ydWIx = y + dW;
        ydW_1Ix = y - dW - 1;
        if (ydWIx >= Iy)
        {
            ydWIx = Iy - 1;
            ydW_1Ix = ydWIx - 1;
        }
        if (y == 0)
        {
            for (let x = 0; x < Ix; x++)
            {
                pix = 0;
                gray = 0;
                gray2 = 0;
                for (let iy = 0; iy <= dW; iy++)
                {
                    I = IMAGE[iy][x];
                    gray += I;
                    gray2 += I * I;
                }
                pix += dW + 1;
                IX_pix[x] = pix;
                IX_gray[x] = gray;
                IX_graygray[x] = gray2;
                IX_pix1[x] = IX_pix[x];
                IX_gray1[x] = IX_gray[x];
                IX_graygray1[x] = IX_graygray[x];
            }
        }
        else if (y <= dW)
        {
                for (let x = 0; x < Ix; x++)
                {
                    I = IMAGE[ydWIx][x];
                    IX_pix[x] = IX_pix1[x] + 1;
                    IX_gray[x] = IX_gray1[x] + I;
                    IX_graygray[x] = IX_graygray1[x] + I * I;
                    IX_pix1[x] = IX_pix[x];
                    IX_gray1[x] = IX_gray[x];
                    IX_graygray1[x] = IX_graygray[x];
                }
        }
        else if (y <= Iy - 1 - dW)
        {
                for (let x = 0; x < Ix; x++)
                {
                    I = IMAGE[ydWIx][x];
                    I1 = IMAGE[ydW_1Ix][x];
                    IX_pix[x] = IX_pix1[x];
                    IX_gray[x] = IX_gray1[x] + I - I1;
                    ;
                    IX_graygray[x] = IX_graygray1[x] + I * I - I1 * I1;
                    IX_pix1[x] = IX_pix[x];
                    IX_gray1[x] = IX_gray[x];
                    IX_graygray1[x] = IX_graygray[x];
                }
        }
        else
        {
                for (let x = 0; x < Ix; x++)
                {
                    I = IMAGE[ydW_1Ix][x];
                    IX_pix[x] = IX_pix1[x] - 1;
                    IX_gray[x] = IX_gray1[x] - I;
                    IX_graygray[x] = IX_graygray1[x] - I * I;
                    IX_pix1[x] = IX_pix[x];
                    IX_gray1[x] = IX_gray[x];
                    IX_graygray1[x] = IX_graygray[x];
                }
        }
  
        pix1 = 0;
        gray1 = 0;
        let graygray1 = 0;
        for (let x = 0; x < Ix; x++)
        {
            let localX = x + dW;
            if (localX >= Ix) localX = Ix - 1;  
  
            if (x == 0)
            {
                pix = 0;
                gray = 0;
                graygray = 0;
                for (let ix = 0; ix <= dW; ix++)
                {
                    pix += IX_pix[ix];
                    gray += IX_gray[ix];
                    graygray += IX_graygray[ix];
                }
            }
            else if (x <= dW)
            {
                pix = pix1 + IX_pix[localX];
                gray = gray1 + IX_gray[localX];
                graygray = graygray1 + IX_graygray[localX];
            }
            else if (x <= Ix - 1 - dW)
            {
                pix = pix1 + IX_pix[localX] - IX_pix[x - dW - 1];
                gray = gray1 + IX_gray[localX] - IX_gray[x - dW - 1];
                graygray = graygray1 + IX_graygray[localX] - IX_graygray[x - dW - 1];
            }
            else
            {
                pix = pix1 - IX_pix[x - dW - 1];
                gray = gray1 - IX_gray[x - dW - 1];
                graygray = graygray1 - IX_graygray[x - dW - 1];
            }

            pix1 = pix;
            gray1 = gray;
            graygray1 = graygray;

            m = gray / pix;
            s = Math.sqrt(Math.abs((pix * graygray - gray * gray) / (pix * (pix - 1))));

            TH = (m * (1 - k * (1 - s / R)));
            TH = Math.floor(TH);
            
            IMAGE2[y][x] = (IMAGE[y][x] >= TH) ? 255 : 0;
            
            /* data[4 * x + y * 4 * width] = IMAGE2[y][x];
            data[4 * x + y * 4 * width + 1] = IMAGE2[y][x];
            data[4 * x + y * 4 * width + 2] = IMAGE2[y][x]; */
        }
    }
  
    //Interpolation
   
    for (let y = 0; y < Iy; y++)
    {
      ydW1Ix = y + dW1;
      ydW1_1Ix = y - dW1 - 1;
      if (ydW1Ix >= Iy)
      {
          ydW1Ix = Iy - 1;
          ydW1_1Ix = ydW1Ix - 1;
      }
      if (y == 0)
      {
          for (let x = 0; x < Ix; x++)
          {
              pix = 0;
              gray = 0;
              for (let iy = 0; iy <= dW1; iy++)
              {
                  if (IMAGE2[iy][x] == 255)
                  {
                      pix++;
                      gray += IMAGE[iy][x];
                  }
              }
              IX_pix[x] = pix;
              IX_gray[x] = gray;
              IX_pix1[x] = IX_pix[x];
              IX_gray1[x] = IX_gray[x];
          }
      }
      else if (y <= dW1)
      {
          for (let x = 0; x < Ix; x++)
          {
              if (IMAGE2[ydW1Ix][x] == 255)
              {
                  IX_pix[x] = IX_pix1[x] + 1;
                  IX_gray[x] = IX_gray1[x] + IMAGE[ydW1Ix][x];
              }
              IX_pix1[x] = IX_pix[x];
              IX_gray1[x] = IX_gray[x];
          }
      }
      else if (y <= Iy - 1 - dW1)
      {
          for (let x = 0; x < Ix; x++)
          {
              IX_pix[x] = IX_pix1[x];
              IX_gray[x] = IX_gray1[x];

              if (IMAGE2[ydW1Ix][x] == 255)
              {
                  IX_pix[x]++;
                  IX_gray[x] += IMAGE[ydW1Ix][x];
              }
              if (IMAGE2[ydW1_1Ix][x] == 255)
              {
                  IX_pix[x]--;
                  IX_gray[x] -= IMAGE[ydW1_1Ix][x];
              }

              IX_pix1[x] = IX_pix[x];
              IX_gray1[x] = IX_gray[x];
          }
      }
      else
      {
          for (let x = 0; x < Ix; x++)
          {
              if (IMAGE2[ydW1_1Ix][x] == 255)
              {
                  IX_pix[x] = IX_pix1[x] - 1;
                  IX_gray[x] = IX_gray1[x] - IMAGE[ydW1_1Ix][x];
              }
              IX_pix1[x] = IX_pix[x];
              IX_gray1[x] = IX_gray[x];
          }
      }

      for (let x = 0; x < Ix; x++)
      {
          pix = pix1;
          gray = gray1;
          if (x == 0)
          {
              pix = 0;
              gray = 0;
              for (let ix = 0; ix <= dW1; ix++)
              {
                  pix += IX_pix[ix];
                  gray += IX_gray[ix];
              }
          }
          else if (x <= dW1)
          {
              if ((x + dW1) > Ix) continue;
              pix = pix1 + IX_pix[x + dW1];
              gray = gray1 + IX_gray[x + dW1];
          }
          else if (x <= Ix - 1 - dW1)
          {
              pix = pix1 + IX_pix[x + dW1] - IX_pix[x - dW1 - 1];
              gray = gray1 + IX_gray[x + dW1] - IX_gray[x - dW1 - 1];
          }
          else
          {
              pix = pix1 - IX_pix[x - dW1 - 1];
              gray = gray1 - IX_gray[x - dW1 - 1];
          }

          pix1 = pix;
          gray1 = gray;

          //NEW
          if (pix == 0)
              IMAGE11[y][x] = 255;
          else
              IMAGE11[y][x] = Math.floor(IMAGE2[y][x] == 0 ? gray / pix : IMAGE[y][x]);
       
      }
    }
  
           
  
    //Thresholding
  
    let PixFor = 0;
    let D = 0, D1 = 0, D2 = 0;
    let Hist = new Array(256);
    for (let i = 0; i < 256; i++) Hist[i] = 0;

    for (let y = 0; y < Iy; y++)
    {
        for (let x = 0; x < Ix; x++)
        {
            I = (IMAGE[y][x]);
            I1 = IMAGE11[y][x];
            if (IMAGE2[y][x] == 0 && I1 > I)
            {
                PixFor++;
                D = D + I1 - I;
                D1 = D1 + I;
                D2 = D2 + I1;
                Hist[I]++;
            }
        }
    }
    D = PixFor == 0 ? 0 : D / PixFor;
    D1 = PixFor == 0 ? 0 : D1 / PixFor;
    D2 = PixFor == 0 ? 0 : D2 / PixFor;

    let HistMax = 0;
    let H = 0;

    for (let i = 0; i < 256; i++)
    {
        if (Hist[i] > HistMax)
        {
            HistMax = Hist[i];
            H = i;
        }
    }
    H += 5;

    d = D;
    d2 = D2;

    a = (d * (p2 - 1)) / (d2 * q * (p1 - 1));
    b = (d * (p1 - p2)) / (q * (p1 - 1));
    aa = q * d * (1 - p2);
    bb = -(2 * (1 + p1)) / (1 - p1);
    cc = p2 * d * q;
    dd = -4 / (d2 * (1 - p1));

    TH = (D * 0.4);

    if (upsampling == 1)
    {
        for (let y = 0; y < Iy; y++)
        {
            for (let x = 0; x < Ix; x++)
            {

                if (IMAGE2[y][x] == 0)
                {
                    TH = Math.floor(aa / (1 + Math.exp(dd * IMAGE11[y][x] - bb)) + cc);

                    if (IMAGE11[y][x] - (IMAGE[y][x]) > TH)
                    {
                        IMAGE2[y][x] = 0; 
                    }
                    else
                    {
                        IMAGE2[y][x] = 255; 
                    }
                }
                else
                {
                    IMAGE2[y][x] = 255; 
                }
            }
        }
    }
  
  
     for (let i = 0; i < height; i++)
    {
      for (let k = 0; k < width; k++)
      {
          
        data[4 * k + i * 4 * width] = IMAGE2[i][k];
        data[4 * k + i * 4 * width + 1] = IMAGE2[i][k];
        data[4 * k + i * 4 * width + 2] = IMAGE2[i][k];
          
      }
    }
   
    context.putImageData(imageData, 0, 0);
}
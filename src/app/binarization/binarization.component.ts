import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-binarization',
  templateUrl: './binarization.component.html',
  styleUrls: ['./binarization.component.css']
})
export class BinarizationComponent  {



imageToCrop:any = '';
otsuFilter:boolean = false;
url:any;
ImgUrl:any;
x3:number;
y3:number;
value = 138;
max = 255;
min = 0;
step = 1;
@ViewChild("canvasfilter") fcanvas;
disableImageFilter:boolean = true;
img: HTMLImageElement = new Image;
height:any;
width:number;
maxwidth:number = window.innerWidth;
flag:boolean;
ImageName:string;
showSpinner:boolean = false;
colorotsu:string = "primary";
colorsauvola:string = "primary";
colornegative:string = "primary";

zoomIN(){
  if (this.width < window.innerWidth) {this.width += 30};
}

zoomOUT(){
   if (this.width>window.innerWidth){this.width = window.innerWidth; }
   this.width -= 30;
}

fillscreen(){
  this.width = window.innerWidth;
}

originalSize(){

   this.width = this.x3;
}

fitscreen(){
   var r = this.img.width / this.img.height;
   var w  = window.innerWidth / (window.innerHeight-250);
   if (w > r)
   {
       this.width = this.img.width * (window.innerHeight-250)/this.img.height;
       
   }
   else
   {
       this.width = window.innerWidth;
   }
}

onSelectFile(event:any):void { // called each time file input changes
  var reader = new FileReader();
  
  reader.onload = (event:any) =>{
    
    
    this.flag = true;
    this.url = event.target.result;
    //this.imagedata =  event.target.result;
    this.disableImageFilter = false;
    this.view();
    
    
  };
  
  reader.readAsDataURL(event.target.files[0]);
  this.ImageName = event.target.files[0].name;
  console.log(this.ImageName);
}


view():void{
  this.colorotsu = "primary";
  this.colorsauvola = "primary";
  this.colornegative = "primary"; 
  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  
  
  this.img.onload = () =>{
     if (this.flag){
         this.flag = false;
         this.width = this.img.width;
         this.height = this.img.height;
         this.fitscreen();
     } 
      this.x3 = this.img.width;
      this.y3 = this.img.height;
      var w = this.img.width;
      var h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);
      

      this.ImgUrl = canvas.toDataURL("image/png", 1);
      
  };
  this.img.src = this.url;



  
}

InvertColoursFilter(){

  
  var precolor = this.colornegative;
  if (precolor == "primary"){this.colornegative = "warn";}else{this.colornegative = "primary"}

  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  
  
  this.img.onload = () =>{
   
      this.x3 = this.img.width;
      this.y3 = this.img.height;
      var w = this.img.width;
      var h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);

            this.InvertColours(ctx, w, h);
       
      this.ImgUrl = canvas.toDataURL("image/png", 1);
      
  };
  this.img.src = this.ImgUrl;
}

otsuBinarization(){
  this.colorotsu = "warn";
  this.colorsauvola = "primary";
  this.colornegative = "primary"; 
  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  
  
  this.img.onload = () =>{
     
      this.x3 = this.img.width;
      this.y3 = this.img.height;
      var w = this.img.width;
      var h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);

      var histogram = this.hist(ctx, w, h);
      //console.log("(histogram: ", histogram);

      var threshold = this.otsu(histogram, w*h);
      this.value = threshold;
      console.log("threshold: ", threshold);

      this.binarize(threshold, ctx, w, h); 

      this.ImgUrl = canvas.toDataURL("image/png", 1);
    };
    this.img.src = this.url;
}

sauvolaBinarization(){
  this.colorotsu = "primary";
  this.colorsauvola = "warn";
  this.colornegative = "primary"; 
  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  this.showSpinner = true;
  
  this.img.onload = () =>{
     
      this.x3 = this.img.width;
      this.y3 = this.img.height;
      var w = this.img.width;
      var h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);

      //this.greyscale(ctx, w, h);
      setTimeout(() => {
        this.sauvola(ctx, w, h);
        this.showSpinner = false;
        this.ImgUrl = canvas.toDataURL("image/png", 1);
      }, 1000);
     
      
    };
    this.img.src = this.url;
    
}

manualThresholdBinarization(){
  this.colorotsu = "primary";
  this.colorsauvola = "primary";
  this.colornegative = "primary"; 
  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
  
  
  this.img.onload = () =>{
     
      this.x3 = this.img.width;
      this.y3 = this.img.height;
      var w = this.img.width;
      var h = this.img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(this.img, 0, 0);

      this.binarize(this.value, ctx, w, h);
      this.ImgUrl = canvas.toDataURL("image/png", 1);
    };
    this.img.src = this.url;

}

hist(context, w, h) {
  var RED_INTENCITY_COEF = 0.2126;
  var GREEN_INTENCITY_COEF = 0.7152;
  var BLUE_INTENCITY_COEF = 0.0722;
    var imageData = context.getImageData(0, 0, w, h);
    var data = imageData.data;
    var brightness;
    var brightness256Val;
    var histArray = Array.apply(null, new Array(256)).map(Number.prototype.valueOf,0);
    //console.log(histArray);
    for (var i = 0; i < data.length; i += 4) {
        brightness = RED_INTENCITY_COEF * data[i] + GREEN_INTENCITY_COEF * data[i + 1] + BLUE_INTENCITY_COEF * data[i + 2];
        brightness256Val = Math.floor(brightness);
        histArray[brightness256Val] += 1;
    }
    
    return histArray;
}

 otsu(histogram, total) {
    var sum = 0;
    for (var i = 1; i < 256; ++i)
        sum += i * histogram[i];
    var sumB = 0;
    var wB = 0;
    var wF = 0;
    var mB;
    var mF;
    var max = 0.0;
    var between = 0.0;
    var threshold1 = 0.0;
    var threshold2 = 0.0;
    for (var i = 0; i < 256; ++i) {
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
        if ( between >= max ) {
            threshold1 = i;
            if ( between > max ) {
                threshold2 = i;
            }
            max = between;            
        }
    }
    console.log(threshold1, threshold2);
    return ( threshold1 + threshold2 ) / 2.0;
}


binarize(threshold, context, w, h) {
  var RED_INTENCITY_COEF = 0.2126;
  var GREEN_INTENCITY_COEF = 0.7152;
  var BLUE_INTENCITY_COEF = 0.0722;
    var imageData = context.getImageData(0, 0, w, h);
    var data = imageData.data;
    var val;
    
    for(var i = 0; i < data.length; i += 4) {
        var brightness = RED_INTENCITY_COEF * data[i] + GREEN_INTENCITY_COEF * data[i + 1] + BLUE_INTENCITY_COEF * data[i + 2];
        val = ((brightness > threshold) ? 255 : 0);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
    }
    
    // overwrite original image
    context.putImageData(imageData, 0, 0);
}

InvertColours(context, w, h){
  var imageData = context.getImageData(0, 0, w, h);
  var data = imageData.data;
  for(var i = 0; i < data.length; i += 4) {
        data[i] = 250 - data[i];
        data[i + 1] = 250 - data[i + 1];
        data[i + 2] = 250 - data[i + 2];
  }
  context.putImageData(imageData, 0, 0);
}

greyscale(context, w, h) {
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

sauvola(context, w, h){

  var radius = 3;
  var k = 0.5;
  var r = 128;

  var imageData = context.getImageData(0, 0, w, h);
  var data = imageData.data;

  var size = radius * 2;

  var height = h;
  var width = w*4;
  var z;
  //var flag = true;
  //console.log(data[12308]);

  for (var y = 0; y < height; y+= 1){

    for(var x = 0; x < width; x+= 4){
      
      z = y * width + x;

      //var val = 0;
      var sum = 0;
      var count = 0;

      
      for (var i = 0; i < size; i++){

        var ir = i - radius;
        var ty = y + ir;
        if (ty < 0)
          continue;
        if (ty >= height)
          break;  

        for (var j = 0; j < 4*size; j+=4){
          
          var jr = j - radius;
          var tx = x + jr; 
          if (tx < 0)
            continue;
          if (tx >= width)
            continue;

          count++;
          var p = ty * width + tx;
         // if (flag && count==90) {console.log(data[p], p); flag=false}
          sum += ((data[p] +  data[p + 1] + data[p + 2]) / 3);
        
        }  

      }

      var mean = sum / count;
      var variance = 0;

      for (var i = 0; i < size; i++){

        var ir = i - radius;
        var ty = y + ir;
        if (ty < 0)
          continue;
        if (ty >= height)
          break;  

        for (var j = 0; j < 4*size; j+=4){
          
          var jr = j - radius;
          var tx = x + jr; 
          if (tx < 0)
            continue;
          if (tx >= width)
            continue;

          
          var p = ty * width + tx;
          var n = ((data[p] +  data[p + 1] + data[p + 2]) / 3);
          variance += (n - mean) * (n - mean);
        
        }  

      }

      //var cv = variance;
      //var StandardDeviation = Math.sqrt(cv / ( count - 1));
      variance /= (count - 1);
      
    
      var threshold = mean * (1.0 + k * ((Math.sqrt(variance) / r) - 1.0));
      //var th = mean * (1.0 + k * ((StandardDeviation / r) - 1.0));

      var brightness = (data[z] +  data[z + 1] + data[z + 2]) / 3;
      var val = ((brightness > threshold) ? 255 : 0);
      data[z] = val;
      data[z + 1] = val;
      data[z + 2] = val;
      

    }

  }
  context.putImageData(imageData, 0, 0);
}

save(){
  let canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
  var data = canvas.toDataURL('image/png');
  
  var a  = document.createElement('a');
  a.href = data;
  a.download = 'image.png';

  a.click()
}
  
}

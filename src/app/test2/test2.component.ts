import { Component, OnInit, ViewChild } from '@angular/core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import SauvolaMethod from 'src/app/binarization methods/sauvola/sauvola-method';
import BlobCounter from './BlobCounter';
import Filtering from './Filtering';
import MyARLSA from './MyARLSA';
import * as GPP from "file-loader?name=[name].js!../binarization methods/GPP/gpp-worker";
import ApplyInvert from './ApplyInvert';


interface blobObject{
  Array:boolean[][];
  x:number;
  y:number;
  height:number;
  width:number;
  Right:number;
  Bottom:number;
  Density:number;
  Elongation:number;
}

interface blobObjectImages{
  Array:Uint8ClampedArray;
  x:number;
  y:number;
  height:number;
  width:number;
  Right:number;
  Bottom:number;
  Density:number;
  Elongation:number;
}

@Component({
  selector: 'app-test2',
  templateUrl: './test2.component.html',
  styleUrls: ['./test2.component.css']
})
export class Test2Component implements OnInit {

  img = new Image;
  url:string;
  @ViewChild("canvasfilter") fcanvas: { nativeElement: HTMLCanvasElement; };
  faSpinner = faSpinner;
  testloader:boolean  = false;
  SauvolaImage: SauvolaMethod =  new SauvolaMethod();

  //ARLSA parameters
  ARLSA_a:number = 1;
  ARLSA_c:number = 0.7;
  ARLSA_Th:number = 3.5;

  //sauvola parameters
    masksize:number = 8;
    stathera:number = 25;
    rstathera:number = 512;
    n:number = 1;

    //gpp parameters
    dw:number = 10;
    k:number = 2.0;
    R:number = 128;
    q:number = 1.7;
    p1:number = 0.5;
    p2:number = 0.7;
    upsampling:boolean = true;
    dw1:number = 20;

  ngOnInit(){
    this.url = "../assets/printed.jpg";
    this.view();
  }

  onSelectFile(event:any):void {
    const reader = new FileReader();
    
    reader.onload = (event:any) =>{
      this.url = event.target.result;
      this.view();
      
      
    };
    
    reader.readAsDataURL(event.target.files[0]);
  }

  view():void{
      
      const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
      const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
      
      
      this.img.onload = () =>{

          const w = this.img.width;
          const h = this.img.height;
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(this.img, 0, 0);
      
      };
      this.img.src = this.url;

  }

  restore(){
    this.ARLSA_a= 1;
    this.ARLSA_c = 0.7;
    this.ARLSA_Th = 3.5;
  }

  sauvolaBinarization(){
    this.SauvolaImage.binarize(this.url, this.masksize, this.stathera, this.rstathera, this.n, "myCanvas");
  }

  GppBinarization(){
    const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    const w = this.img.width;
    const h = this.img.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const worker = new Worker(GPP);

    worker.postMessage({imageData, dw:this.dw, k:this.k, R:this.R, q:this.q, p1:this.p1, p2:this.p2, upsampling:this.upsampling, dw1:this.dw1}, [imageData.data.buffer]);

    worker.onmessage = (d: MessageEvent)=>{
      const imageData = d.data;
      ctx.putImageData(imageData, 0, 0);
 
    };
  }

  ConnectedComponents(){
    const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    
        const w = this.img.width;
        const h = this.img.height;

        const imageData = ctx.getImageData(0, 0, w, h);

        const blobLabels:number[][] = this.findblobs(imageData); 

        const BlobsNumber = this.BlobsNumberCount(blobLabels, imageData);
        console.log("blobsCount:", BlobsNumber);

        this.ColorTheBlobs(imageData, blobLabels,[
          [131,15,208,255],
          [220,0,0,255],
          [0,153,0,255],
          [0,0,255,255],
          [174,174,0,255],
          [198,0,198,255],
          [0,208,208,255]
        ]);
        
        
      ctx.putImageData(imageData,0,0);

      this.findblobsCoords(blobLabels, w, h, ctx);
    
  }
  
  findblobs(imageData:ImageData):number[][]{

    const xSize = imageData.width,
          ySize = imageData.height,
          srcPixels = imageData.data;

    // This will hold the indecies of the regions we find
    let blobMap = [];
    let label = 1;

    // The labelTable remembers when blobs of different labels merge
    // so labelTabel[1] = 2; means that label 1 and 2 are the same blob
    let labelTable = [0];

    // Start by labeling every pixel as blob 0
    for(let y=0; y<ySize; y++){
      blobMap.push([]);
      for(let x=0; x<xSize; x++){
        blobMap[y].push(0);
      }
    }
    

    // Temporary variables for neighboring pixels and other stuff
    let  nn:number, nw:number, ne:number, ww:number, ee:number, sw:number, ss:number, se:number, minIndex:number;

    // We're going to run this algorithm 3 times
    // The first time identifies all of the blobs candidates the second and third pass
    // merges any blobs that the first pass failed to merge
    let nIter = 3;
    while( nIter-- ){

      for(let  y=0; y<ySize; y++){
        for(let  x=0; x<xSize; x++){

          const pos = (y*xSize+x)*4;

          if( srcPixels[pos] == 0){

            // Find the nearest pixels     
           /*  let r = [];                       //same as below but slower 
            for(let t=y-1; t<=y+1; t++){
              for(let g=x-1; g<=x+1; g++){
                  if(t==y && g==x) { continue }
                  if (t<imageData.height && t>=0 && g>=0 && g<imageData.width){
                    if (blobMap[t][g] !== 0){
                      r.push(blobMap[t][g])
                    }
                  }
              }        
            } */

            if (y-1>0 && x-1>0)        { nw = blobMap[y-1][x-1] }else{ nw = 0 }
            if (y-1>0)                 { nn = blobMap[y-1][x-0] }else{ nn = 0 }
            if (y-1>0 && x+1<xSize)    { ne = blobMap[y-1][x+1] }else{ ne = 0 }
            if (x-1>0)                 { ww = blobMap[y-0][x-1] }else{ ww = 0 }
            if (x+1<xSize)             { ee = blobMap[y-0][x+1] }else{ ee = 0 }
            if (y+1<ySize && x-1>0)    { sw = blobMap[y+1][x-1] }else{ sw = 0 }
            if (y+1<ySize)             { ss = blobMap[y+1][x-0] }else{ ss = 0 }
            if (y+1<ySize && x+1<xSize){ se = blobMap[y+1][x+1] }else{ se = 0 }
      
            let r = [];
            if (nw>0) { r.push(nw) }
            if (nn>0) { r.push(nn) }
            if (ne>0) { r.push(ne) }
            if (ww>0) { r.push(ww) }
            if (ee>0) { r.push(ee) }
            if (sw>0) { r.push(sw) }
            if (ss>0) { r.push(ss) }
            if (se>0) { r.push(se) }

    
            // This point starts a new blob -- increase the label count and
            // and an entry for it in the label table
            if( r.length === 0 ){
              blobMap[y][x] = label;
              labelTable.push(label);
              label += 1;
    
            // This point is part of an old blob -- update the labels of the
            // neighboring pixels in the label table so that we know a merge
            // should occur and mark this pixel with the label.
            }else{
              // Find the lowest blob index nearest this pixel
              minIndex = Math.min(...r);

              /* for(let t=y-1; t<=y+1; t++){                                            //same as below but slower
                for(let g=x-1; g<=x+1; g++){
                    if(t==y && g==x) { continue }
                    if (t<imageData.height && t>=0 && g>=0 && g<imageData.width){
                      const f = blobMap[t][g]
                      if (labelTable[f] > minIndex){
                        labelTable[f] = minIndex;
                      }
                    }
                }        
              } */

              /* for(let h in r){                    //same as below but a little bit slower
                const f = r[h];
                if (labelTable[f] > minIndex){
                  labelTable[f] = minIndex;
                }
              } */

              if( minIndex < labelTable[nw] ){ labelTable[nw] = minIndex; }
              if( minIndex < labelTable[nn] ){ labelTable[nn] = minIndex; }
              if( minIndex < labelTable[ne] ){ labelTable[ne] = minIndex; }
              if( minIndex < labelTable[ww] ){ labelTable[ww] = minIndex; }
              if( minIndex < labelTable[ee] ){ labelTable[ee] = minIndex; }
              if( minIndex < labelTable[sw] ){ labelTable[sw] = minIndex; }
              if( minIndex < labelTable[ss] ){ labelTable[ss] = minIndex; }
              if( minIndex < labelTable[se] ){ labelTable[se] = minIndex; }

              blobMap[y][x] = minIndex;
            }

        
          }
    
        }
      }
    
    
      // Merge the blobs with multiple labels
      for(let y=0; y<ySize; y++){
        for(let x=0; x<xSize; x++){
          let label = blobMap[y][x];
          if( label === 0 ){ continue; }
          while( label !== labelTable[label] ){
            label = labelTable[label];
          }
          blobMap[y][x] = label;
        }
      }
    }

    

    // The blobs may have unusual labels: [1,38,205,316,etc..]
    // Let's rename them: [1,2,3,4,etc..]
    const uniqueLabels = unique(labelTable);
    let i = 0;
    for(let  label in uniqueLabels ){
      labelTable[label] = i;
      i++
    }

    // convert the blobs to the minimized labels
    for(let y=0; y<ySize; y++){
      for(let x=0; x<xSize; x++){
      let  label = blobMap[y][x];
        blobMap[y][x] = labelTable[label];
      }
    } 
      
  
    // Return the blob data:
    return blobMap;


    function unique(arr:number[]):object{
      /// Returns an object with the counts of unique elements in arr
      /// unique([1,2,1,1,1,2,3,4]) === { 1:4, 2:2, 3:1, 4:1 }
      
          let value:number, counts = {};
          for(let i=0; i<arr.length; i++) {
              value = arr[i];
              if( counts[value] ){
                  counts[value] += 1;
              }else{
                  counts[value] = 1;
              }
          }
      
          return counts;
      }

  }

  ColorTheBlobs(imageData:ImageData,blobs:number[][],colors:number[][]){
    const xSize = imageData.width,
          ySize = imageData.height;

    let  dstPixels = imageData.data;
        

    for(let y=0; y<ySize; y++){
        for(let x=0; x<xSize; x++){
            const pos = (y*xSize+x)*4;

            const label = blobs[y][x];

            if( label !== 0 ){
            const color = colors[ label % colors.length ];
              
                dstPixels[ pos+0 ] = color[0];
                dstPixels[ pos+1 ] = color[1];
                dstPixels[ pos+2 ] = color[2];
                dstPixels[ pos+3 ] = color[3];

            }
        }
    }

  }

  findblobsCoords(blobLabels:number[][], w:number, h:number, ctx:CanvasRenderingContext2D){
    const maxObjects = ((w / 2) + 1) * ((h / 2) + 1) + 1;

    let cordx = [];
    let cordy = [];
    let width = [];
    let height = [];

    for(let i=0; i<maxObjects; i++){
      cordx[i] = w;
      cordy[i] = h;
      width[i] = 0;
      height[i] = 0;
    } 

    for(let y=0; y<h; y++){
      for(let x=0; x<w; x++){

        const t = blobLabels[y][x];
        if (t>0){
          if (x < cordx[t])  { cordx[t] = x }
          if (y < cordy[t])  { cordy[t] = y }
          if (x > width[t])  { width[t] = x }
          if (y > height[t]) { height[t] = y }    
        }
      }
    }
    
    for(let i=0; i<maxObjects; i++){
      if (cordx[i] == w && cordy[i] == h && width[i] == 0 && height[i] == 0) {continue}
      const x1 = cordx[i];
      const y1 = cordy[i];
      const x2 = width[i] -  cordx[i];
      const y2 = height[i] - cordy[i];

      ctx.lineWidth = 1;
      ctx.strokeStyle = "green";
      ctx.rect(x1, y1, x2, y2);
    }
    ctx.stroke();

  }

  BlobsNumberCount(blobLabels:number[][], imageData:ImageData):number{
    let sum = 0;

    let maxCompNum = 0;
    const data = imageData.data;
    for(let i = 0; i < data.length; i += 4) {
      if (data[i] == 0) { maxCompNum++}
    }

    let b = [];
    for(let i=0; i<maxCompNum; i++){
      b[i] = 0
    }

    for(let i=0; i<blobLabels.length; i++){
      for(let j=0; j< blobLabels[0].length; j++){
        const a=blobLabels[i][j];
        b[a] ++;
      }
    }

    for(let i=1; i<b.length; i++){
      if (b[i] !== 0){
          sum++;
      }
    }

    return sum;
  }

  ConnectedComponents2(){
    const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    
    const w = this.img.width;
    const h = this.img.height;

    const imageData = ctx.getImageData(0, 0, w, h);

    const worker = new Worker(GPP);

    worker.postMessage({imageData, dw:this.dw, k:this.k, R:this.R, q:this.q, p1:this.p1, p2:this.p2, upsampling:this.upsampling, dw1:this.dw1}, [imageData.data.buffer]);

    worker.onmessage = (d: MessageEvent)=>{
      const imageData = d.data;
      //ctx.putImageData(imageData, 0, 0);

      const blobCounter:BlobCounter = new BlobCounter();

      //blobCounter.ProcessImage(imageData.data, imageData.width, imageData.height);
      //const rects = blobCounter.GetObjectRectangles(imageData.data, imageData.width, imageData.height);

      //const objects = blobCounter.GetObjectsWithArray(imageData);
      const objects = blobCounter.GetObjectsWithoutArray(imageData);
      //const objects:blobObject[] = blobCounter.GetObjectsWithoutArray(ApplyInvert(new ImageData(imageData.data, imageData.width, imageData.height )));
      //console.log(objects);

      //const objects = blobCounter.GetObjects(imageData.data, imageData.width, imageData.height);
      //console.log(objects);

      const objectsCount = blobCounter.getObjectsCount();
      console.log("objectsCount:", objectsCount);

      const objectLabels = blobCounter.getObjectLabels();

      this.ColorTheBlobs2(imageData, objectLabels, [
        [131,15,208,255],
        [220,0,0,255],
        [0,0,255,255],
        [0,153,0,255],
        [174,174,0,255],
        [198,0,198,255],
        [0,208,208,255],
        [210,153,255,255],
        [51,153,51,255],
        [153,102,51,255]
      ]);

      ctx.putImageData(imageData,0,0);

      this.DrawRects(objects, /* objectsCount, */ ctx);
 
    };
  }

  test(){
    const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, this.img.width, this.img.height);
    this.testloader = true;
    const worker = new Worker(GPP);

    worker.postMessage({imageData, dw:this.dw, k:this.k, R:this.R, q:this.q, p1:this.p1, p2:this.p2, upsampling:this.upsampling, dw1:this.dw1}, [imageData.data.buffer]);

    worker.onmessage = (d: MessageEvent)=>{
      const imageData = d.data;
      //ctx.putImageData(imageData, 0, 0);
      const arlsa:MyARLSA = new MyARLSA(this.ARLSA_a, this.ARLSA_c, this.ARLSA_Th);
      const objects = arlsa.run(imageData);
      //console.log(objects)
        
      this.ColorTheBlobs3(imageData, objects);
      ctx.putImageData(imageData, 0, 0);
      this.DrawRects(objects, ctx);
      this.testloader = false;
    };
    
  }

  DrawRects(rects:blobObject[], /* objectsCount:number, */ ctx:CanvasRenderingContext2D){
     //for(let i = 0; i<objectsCount; i++){
     for(const i in rects){  
      const x1 = rects[i].x;
      const y1 = rects[i].y;
      const x2 = rects[i].width;
      const y2 = rects[i].height;

      ctx.lineWidth = 1;
      ctx.strokeStyle = "green";
      ctx.rect(x1, y1, x2, y2);
     }
     ctx.stroke();
  }

  ColorTheBlobs2(imageData:ImageData, objectLabels:number[], colors:number[][]){

    let  dstPixels = imageData.data;
  
      for (let i=0; i<dstPixels.length; i+=4){
        const label = objectLabels[i/4];
        if( label > 0 ){
          const color = colors[ label % colors.length ];
            
              dstPixels[i+0] = color[0];
              dstPixels[i+1] = color[1];
              dstPixels[i+2] = color[2];
              dstPixels[i+3] = color[3];

          }else{
              dstPixels[i+0] = 255;
              dstPixels[i+1] = 255;
              dstPixels[i+2] = 255;
              dstPixels[i+3] = 255;
          }
      }
  }

  ColorTheBlobs3(imageData:ImageData, objects:blobObject[]){
    const colors:number[][] = [
      [131,15,208,255],
      [220,0,0,255],
      [0,0,255,255],
      [0,153,0,255],
      [174,174,0,255],
      [198,0,198,255],
      [0,208,208,255],
      [210,153,255,255],
      [51,153,51,255],
      [153,102,51,255]
    ];
    const stride = imageData.width * 4;
    for(let b=0; b<objects.length; b++){
        for (let yy = 0; yy < objects[b].height; yy++){
            for (let xx = 0; xx < objects[b].width; xx++){
                const label = b;
                if (objects[b].Array[yy][xx])
                {
                  const color:number[] = colors[ label % colors.length ];
                  imageData.data[4 * (objects[b].x + xx) + (objects[b].y + yy) * stride] = color[0];
                  imageData.data[4 * (objects[b].x + xx) + (objects[b].y + yy) * stride + 1] = color[1];
                  imageData.data[4 * (objects[b].x + xx) + (objects[b].y + yy) * stride + 2] = color[2];
                  imageData.data[4 * (objects[b].x + xx) + (objects[b].y + yy) * stride + 3] = color[3];
                }                
            }
        }
         
    }
  }

  
}

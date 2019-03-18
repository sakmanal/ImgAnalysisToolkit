import { Component, OnInit, ViewChild } from '@angular/core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import SauvolaMethod from 'src/app/binarization methods/sauvola/sauvola-method';
import BlobCounter from './BlobCounter';

@Component({
  selector: 'app-test2',
  templateUrl: './test2.component.html',
  styleUrls: ['./test2.component.css']
})
export class Test2Component implements OnInit {

  img = new Image;
  url:any;
  @ViewChild("canvasfilter") fcanvas: { nativeElement: HTMLCanvasElement; };
  faSpinner = faSpinner;
  public SauvolaImage: SauvolaMethod =  new SauvolaMethod();

  //sauvola parameters
    masksize:number = 8;
    stathera:number = 25;
    rstathera:number = 512;
    n:number = 1;

  ngOnInit(){
    
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


  sauvolaBinarization(){
    this.SauvolaImage.binarize(this.url, this.masksize, this.stathera, this.rstathera, this.n);
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
    for(let i=0; i<imageData.data.length; i+=4){
      if (imageData.data[i] == 0) { imageData.data[i] = 1}
      if (imageData.data[i] == 255) { imageData.data[i] = 0}
    }
    //console.table(imageData.data)

    /* const t = [0,0,0,0,   0,0,0,0,  0,0,0,0,   1,1,1,1,
               0,0,0,0,   1,1,1,1,  0,0,0,0,   1,1,1,1,           
               0,0,0,0,   1,1,1,1,  0,0,0,0,   0,0,0,0,       
               1,1,1,1,   0,0,0,0,  0,0,0,0,   1,1,1,1,
               0,0,0,0,   0,0,0,0,  0,0,0,0,   0,0,0,0,
               1,1,1,1,   0,0,0,0,  1,1,1,1,   1,1,1,1,
               0,0,0,0,   1,1,1,1,  0,0,0,0,   0,0,0,0,
               1,1,1,1,   0,0,0,0,  1,1,1,1,   0,0,0,0,] */


    const blobCounter:BlobCounter = new BlobCounter();
    //blobCounter.ProcessImage(t, 4, 8);
    blobCounter.ProcessImage(imageData.data, imageData.width, imageData.height);
    const objectsCount = blobCounter.getObjectsCount();
    console.log("objectsCount:", objectsCount);

    const objectLabels = blobCounter.getObjectLabels();
    //console.table(objectLabels);


  }

  make2Darray(w:number, h:number){ 
        
    const arr = new Array(h);
    for (let i = 0; i < arr.length; i++){
      arr[i] = new Array(w);
    }
    return arr;
  }

  findblops___(imageData:ImageData){

      let data = imageData.data;
      let label = 1;
      let linked = [];
      let labels = this.make2Darray(imageData.width, imageData.height);
      for(let i=0; i<imageData.height; i++){
        for(let j=0; j<imageData.width; j++){
            labels[i][j] = 0;
            //if (data[4 * j + i * 4 * imageData.width] == 0) { labels[i][j]=1}else{labels[i][j]=0}
        }
      }
      
            //console.table(labels)
    
      function union(a:number[], b:number[]){
            return Array.from(new Set(a.concat(b))); 
      }

        for(let i=0; i<imageData.height; i++){
          for(let j=0; j<imageData.width; j++){

              if (data[4 * j + i * 4 * imageData.width] == 0){
                const neighbors = [];
                for(let x=i-1; x<=i+1; x++){
                  for(let y=j-1; y<=j+1; y++){
                      if (x<imageData.height && x>=0 && x!==y && y>=0 && y<imageData.width){
                        if (labels[x][y] !== 0){
                          neighbors.push(labels[x][y])
                        }
                      }
                  }        
              }
              //console.log(neighbors)

              if (neighbors.length === 0){
                linked[label] = [label];
                labels[i][j] = label;
                label ++;
              }else{
          
                let min = Math.min(...neighbors);
                labels[i][j] = min;
                for (let l in neighbors){
                  linked[l] = union(linked[l] || [], neighbors);
                }
              }
        /*  const nw = labels[i-1][j-1] || 0;
            const nn = labels[i-1][j]   || 0;
            const ne = labels[i-1][j+1] || 0;
            const ww = labels[i][j-1]   || 0;
            const ee = labels[i][j+1]   || 0;
            const sw = labels[i+1][j-1] || 0;
            const ss = labels[i+1][j]   || 0;
            const se = labels[i+1][j+1] || 0; */
  /* 
            if (labels[i-1][j-1] != undefined)
              console.log("exixts")
            else 
              console.log("no")   */

          /*  const neighbors = [];
            if (nw !== 0) { neighbors.push(nw) };
            if (nn !== 0) { neighbors.push(nn) };
            if (ne !== 0) { neighbors.push(ne) };
            if (ww !== 0) { neighbors.push(ww) };
            if (ee !== 0) { neighbors.push(ee) };
            if (sw !== 0) { neighbors.push(sw) };
            if (ss !== 0) { neighbors.push(ss) };
            if (se !== 0) { neighbors.push(se) };
            
            if (neighbors.length == 0){
                  linked[label] = [label];
                  labels[j][i] = label;
                  label ++;
            }else{
            
              let min = Math.min(...neighbors);
              labels[j][i] = min;
              for (let l in neighbors){
                linked[l] = union(linked[l] || [], neighbors);
              }
            } */

          }

        }
      }
      
    /*  for(let i=0; i<imageData.height; i++){
        for(let j=0; j<imageData.width; j++){

          if (data[4 * j + i * 4 * imageData.width] == 0){
            const z = labels[i][j];
            const k = linked[z];
            labels[i][j] = Math.min(...k);
          }

        }
      } */

      return labels 

  }
}

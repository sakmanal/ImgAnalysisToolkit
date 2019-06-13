import { Component, Output, EventEmitter } from '@angular/core';
import { otsu } from '../binarization/otsu.worker';
import { Sauvola } from '../binarization/Sauvola.worker';
import { GPP } from '../binarization/gpp.worker';
import { WebworkerService } from '../worker/webworker.service';
import evaluation from '../SegmentsEvaluation/evaluation';
import { GetSegments } from '../Segmentation/MyARLSA.worker';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { SavejsonService } from '../savejson.service';
import binEvaluation from '../binEvaluation/binEvaluation';


interface imageObject{
   name:string;
   url:string;
   originUrl:string;
   spin:boolean;
   blobs:blobObject;
   IsBinary:boolean;
   pbar:boolean;
   gt:any[];
   gtUrl:string;
   recall:number;
   precision:number;
}

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

interface TextSegments{
  x:number;
  y:number;
  width:number;
  height:number;
  word:string;
}

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent  {

 
  ImageFiles:imageObject[] = [];

  colorotsu:string = "primary";
  colorsauvola:string = "primary";
  colorgpp:string = "primary";

  enableView:boolean = false;
  //Totalimages:number = 0;

  @Output() updateEvent = new EventEmitter<boolean>();

  constructor(private workerService: WebworkerService, private savejsonService: SavejsonService){}
  
    

  selectFiles(event:any):void{
    const files = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = file.name;
      //Only pics
      if (!file.type.match('image')) continue;

      const picReader = new FileReader();
      picReader.onload = (event:any) =>{
    
       const picFile = event.target.result;
       const imageFile = {name:filename, url:picFile, originUrl:picFile, spin:false, blobs:undefined, IsBinary:false, pbar:false, gt:undefined,gtUrl:undefined, recall:0, precision:0};
       this.ImageFiles.push(imageFile);
       //this.Totalimages++;
        
      };   
      picReader.readAsDataURL(file);
    }
    if (files.length != 0){ this.enableView = true; }

    event.target.value = '';  //enable opening the same file
  }


  selectGT(event:any):void{
    const files = event.target.files;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = file.name;
      //only json
      if (file == undefined) return;
      if (!file.type.match('\.json')) return;

      const jsonreader = new FileReader();
      jsonreader.onload = (event:any) =>{ 
          
        const jsonfile = JSON.parse(event.target.result);
        this.readjson(jsonfile, filename);

      };
      jsonreader.readAsText(file)
  
    }

  }

  selectGTimg(event:any){
    const files = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filename = file.name;
      //Only pics
      if (!file.type.match('image')) continue;

      const picReader = new FileReader();
      picReader.onload = (event:any) =>{
    
       const picGTFile = event.target.result;
      this.putGTImgUrl(picGTFile, filename);
       
        
      };   
      picReader.readAsDataURL(file);
    }

  }

  readjson(jsonfile, filename){
     
      if (jsonfile.words){
        this.putRects(filename, jsonfile.words)
        return;
      }

      let pointsArray = [];
      const main = jsonfile.Page.TextRegion;
     
      if (main.length == undefined){
         const TextLine = main.TextLine;       
         for(let j=0; j<TextLine.length; j++){
          const words = TextLine[j].Word
          if (words.length == undefined){
            pointsArray.push(words.Coords);
            continue;      
           }
          for(let k=0; k<words.length; k++){
            const coords = words[k].Coords;   
            pointsArray.push(coords)
          }
        }
      }else{
  
          for(let i=0; i<main.length; i++){
            const TextLine = main[i].TextLine;        
            for(let j=0; j<TextLine.length; j++){
              const words = TextLine[j].Word       
              if (words.length == undefined){
                pointsArray.push(words.Coords);
                continue;
              }
              for(let k=0; k<words.length; k++){
                const coords = words[k].Coords;
                pointsArray.push(coords)
              }
            }
          }
      }
      
      this.makeGTrects(pointsArray, filename);
  }

  makeGTrects(pointsArray, filename){
    let RectsArray = [];
    for(let i=0; i<pointsArray.length; i++){
      const points = pointsArray[i].points;

      const d = points.split(" ");
      const r = []

       for (let i=0; i<d.length; i++){
         const c = d[i];
         const v = c.split(",")
         const x = Number(v[0]) 
         const y = Number(v[1])
         const point = {x:x, y:y}; 
         r.push(point);

       }


       const xArray = r.map(s => s.x)

       const yArray = r.map(s => s.y)

       const maxX = Math.max(...xArray)
       const minX = Math.min(...xArray)

       const maxY = Math.max(...yArray)
       const minY = Math.min(...yArray)

       const rect = {x:minX, y:minY, width:maxX-minX, height:maxY-minY}

       RectsArray.push(rect);
      
    }

    this.putRects(filename, RectsArray);
    

 }

 putRects(filename, RectsArray){
  const JsonNameOnly = filename.replace(/\.[^/.]+$/, "");

  for(let i = 0; i < this.ImageFiles.length; i++){
     const ImgNameOnly = this.ImageFiles[i].name.replace(/\.[^/.]+$/, "");
     if (ImgNameOnly == JsonNameOnly){
       this.ImageFiles[i].gt = RectsArray;
     }
  }
 }

 putGTImgUrl(picGTFile, filename){
  const JsonNameOnly = filename.replace(/\.[^/.]+$/, "");

  for(let i = 0; i < this.ImageFiles.length; i++){
    const ImgNameOnly = this.ImageFiles[i].name.replace(/\.[^/.]+$/, "");
    if (ImgNameOnly == JsonNameOnly){
      this.ImageFiles[i].gtUrl = picGTFile;
      console.log("done", ImgNameOnly)
    }
  }
 }
  

  binarization_otsu(){
    this.colorotsu = "warn";
    this.colorsauvola = "primary";
    this.colorgpp = "primary"; 
  
    const imageDataUrl = this.ImageFiles[0].originUrl;
    this.otsu(imageDataUrl, 0);
    
  }

  binarization_sauvola(){
    this.colorotsu = "primary";
    this.colorsauvola = "warn";
    this.colorgpp = "primary";
    
    const imageDataUrl = this.ImageFiles[0].originUrl;
    this.sauvola(imageDataUrl, 0);
    
  }

  binarization_gpp(){
    this.colorotsu = "primary";
    this.colorsauvola = "primary";
    this.colorgpp = "warn"; 
   
    const imageDataUrl = this.ImageFiles[0].originUrl;
    this.gpp(imageDataUrl, 0);
    
  }

  otsu(imageDataUrl:string, id:number){
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    const img = new Image;
    this.ImageFiles[id].spin = true;

    img.onload = () =>{
          const width = img.width;
          const height = img.height;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, width, height);

          this.workerService.run(otsu, {imageData:imageData})
              .then( (result:any) => {
                      //this.ImageFiles[id].url = result.data;  
                      //console.log(result.data);
                      ctx.putImageData(result, 0, 0);
                      this.ImageFiles[id].url = canvas.toDataURL("image/png", 1);
                      this.ImageFiles[id].spin = false;
                      this.ImageFiles[id].IsBinary = true;
                      if (id+1 < this.ImageFiles.length){
                        this.otsu(this.ImageFiles[id+1].originUrl, id+1);
                      }
                      
                        
                }
              ).catch(console.error);


    }
    img.src = imageDataUrl;
  }


  //gpp parameters
  dw:number = 10;
  k:number = 0.2;
  R:number = 128;
  q:number = 0.6;
  p1:number = 0.5;
  p2:number = 0.7;
  upsampling:boolean = true;
  dw1:number = 20;

  gpp(imageDataUrl:string, id:number){
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    const img = new Image;
    this.ImageFiles[id].spin = true;

    img.onload = () =>{
          const width = img.width;
          const height = img.height;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, width, height);

          this.workerService.run(GPP, {imageData:imageData, dw:this.dw, k:this.k, R:this.R, q:this.q, p1:this.p1, p2:this.p2, upsampling:this.upsampling, dw1:this.dw1})
              .then( (result:any) => {
                      //this.ImageFiles[id].url = result.data;  
                      //console.log(result.data);
                      ctx.putImageData(result, 0, 0);
                      this.ImageFiles[id].url = canvas.toDataURL("image/png", 1);
                      this.ImageFiles[id].spin = false;
                      this.ImageFiles[id].IsBinary = true;
                      if (id+1 < this.ImageFiles.length){
                        this.gpp(this.ImageFiles[id+1].originUrl, id+1);
                      }
                        
                }
              ).catch(console.error);


    }
    img.src = imageDataUrl;
  }
  


  //sauvola parameters
  masksize:number = 4;
  stathera:number = 0.5; 
  rstathera:number = 128; 
  n:number = 3;

  sauvola(imageDataUrl:string, id:number){
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    const img = new Image;
    this.ImageFiles[id].spin = true;

    img.onload = () =>{
          const width = img.width;
          const height = img.height;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, width, height);

          this.workerService.run(Sauvola, {imageData:imageData, masksize:this.masksize, stathera:this.stathera, rstathera:this.rstathera, n:this.n})
              .then( (result:any) => {
                      //this.ImageFiles[id].url = result.data;  
                      //console.log(result.data);
                      ctx.putImageData(result, 0, 0);
                      this.ImageFiles[id].url = canvas.toDataURL("image/png", 1);
                      this.ImageFiles[id].spin = false;
                      this.ImageFiles[id].IsBinary = true;
                      if (id+1 < this.ImageFiles.length){
                        this.sauvola(this.ImageFiles[id+1].originUrl, id+1);
                      }
                        
                }
              ).catch(console.error);


    }
    img.src = imageDataUrl;

  }

  restore(){
    this.colorotsu = "primary";
    this.colorsauvola = "primary";
    this.colorgpp = "primary";
    for(let i = 0; i < this.ImageFiles.length; i++){
      this.ImageFiles[i].url = this.ImageFiles[i].originUrl;
      this.ImageFiles[i].IsBinary = false;
    }
    
  }


  //ARLSA parameters
  ARLSA_a:number = 1;
  ARLSA_c:number = 0.7;
  ARLSA_Th:number = 3.5;
  RemovePunctuationMarks:boolean = true;
  Xrlsa:boolean = true;

  faSpinner = faSpinner;
  Segmloader:boolean  = false;
  WordsSegment(i = 0){
      this.Segmloader = true;
  
      const imageDataUrl = this.ImageFiles[i].url;

      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
      const img = new Image;
      this.ImageFiles[i].pbar = true;

      img.onload = () =>{
        const width = img.width;
        const height = img.height;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0);
        const imagedata = ctx.getImageData(0, 0, width, height);
        
        if (this.ImageFiles[i].IsBinary == true){
             this.Segmentation(imagedata, i);
        }else{
          this.workerService.run(GPP, {imageData:imagedata,  dw:this.dw, k:this.k, R:this.R, q:this.q, p1:this.p1, p2:this.p2, upsampling:this.upsampling, dw1:this.dw1})
              .then( (result:any) => {      
                  this.Segmentation(result, i);
                }
              ).catch(console.error);
        }
        

      }
      img.src = imageDataUrl;  
      
  }


 
 
  counter:number = 0;
  Segmentation(imageData:ImageData, id:number){
 
     this.workerService.run(GetSegments, {imageData:imageData, ARLSA_a:this.ARLSA_a, ARLSA_c:this.ARLSA_c, ARLSA_Th:this.ARLSA_Th, RemovePunctuationMarks:this.RemovePunctuationMarks, Xrlsa:this.Xrlsa})
          .then( (objects:any) => {
   
            this.ImageFiles[id].blobs = objects; 
            this.evaluation(id);
            this.counter++;
            this.ImageFiles[id].pbar = false;
            //if (this.counter == this.Totalimages) { 
            if (this.counter == this.ImageFiles.length) {
              this.Segmloader = false; 
              this.counter = 0;
            }
            if (id+1 < this.ImageFiles.length){
              this.WordsSegment(id+1);
            }

            
          }
        ).catch(console.error);
  }

  
  remove(id:number){
    //console.log(id);

    if (id > -1) {
      this.ImageFiles.splice(id, 1);
      //this.Totalimages = this.ImageFiles.length;
    }

    if (this.ImageFiles.length == 0){ 
      this.enableView = false;
      this.colorotsu = "primary";
      this.colorsauvola = "primary";
      this.colorgpp = "primary";
    }

    
  }

  removeAll(){
    this.ImageFiles = [];
    //this.Totalimages = 0;
    this.enableView = false;
    this.colorotsu = "primary";
    this.colorsauvola = "primary";
    this.colorgpp = "primary";
  }

  @Output() updateImageEvent = new EventEmitter<object>();
  edit(id:number){
    this.updateImageEvent.emit({dataURL:this.ImageFiles[id].url, name:this.ImageFiles[id].name, blobs:this.ImageFiles[id].blobs, gt:this.ImageFiles[id].gt});
  }
  
  Tinter:number = 0.5;
  evaluation(id:number){
    
    const GroundTruthRects = this.ImageFiles[id].gt;
    const MyArlsaRects:any = this.ImageFiles[id].blobs;
    if (this.ImageFiles[id].blobs == undefined || this.ImageFiles[id].gt == undefined){
            return;
    }
    const SegmentsEvaluation = new evaluation();
    SegmentsEvaluation.run(GroundTruthRects, MyArlsaRects, this.Tinter);
   
    this.ImageFiles[id].recall = SegmentsEvaluation.getRecall();
    this.ImageFiles[id].precision = SegmentsEvaluation.getPrecision();
    
  }

  evaluate(){
    for(let i = 0; i < this.ImageFiles.length; i++){
        if (this.ImageFiles[i].blobs == undefined || this.ImageFiles[i].gt == undefined){
             continue;
        }else{
          this.evaluation(i);
        }
        
    }
  }
  
 
  binEvaluate(id = 0){
    
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    
    //load 1st image
    const img1 = new Image;
    img1.onload = () =>{
      const width = img1.width;
      const height = img1.height;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img1, 0, 0);
      const MybinPixels = ctx.getImageData(0, 0, width, height);

      //load 2nd image
      const img2 = new Image;
      img2.onload = () =>{
        const width = img1.width;
        const height = img1.height;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img2, 0, 0);
        const GTbinPixels = ctx.getImageData(0, 0, width, height);

        //run evaluation
        const Evaluation = new binEvaluation();
        Evaluation.run(MybinPixels, GTbinPixels);
        this.ImageFiles[id].recall = Evaluation.getRecall();
        this.ImageFiles[id].precision = Evaluation.getPrecision();

        //next image
        if (id+1 < this.ImageFiles.length){
          this.binEvaluate(id+1);
        }
      }
      img2.src = this.ImageFiles[id].gtUrl; 
    }
    img1.src = this.ImageFiles[id].url; 

  }

  saveSegments(){
    for(let i = 0; i < this.ImageFiles.length; i++){
      const Segments:TextSegments[] = [];
      const name = this.ImageFiles[i].name;
      for(const j in this.ImageFiles[i].blobs){
        const x = this.ImageFiles[i].blobs[j].x;
        const y = this.ImageFiles[i].blobs[j].y;
        const w = this.ImageFiles[i].blobs[j].width;
        const h = this.ImageFiles[i].blobs[j].height;
        const segment:TextSegments = {"x":x, "y":y, "width":w, "height":h, "word":""};
        Segments.push(segment);
      }
      this.savejsonService.saveTextSegments(name, Segments);
    }
    this.updateEvent.emit(true);
  }


  
}

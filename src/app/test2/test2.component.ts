import { Component, OnInit, ViewChild } from '@angular/core';
import { GPP } from '../binarization/gpp.worker';
import { GetSegments } from '../Segmentation/MyARLSA.worker';
import binarize from '../binarization/binarize';
import { WebworkerService } from '../worker/webworker.service';
import evaluation from '../SegmentsEvaluation/evaluation';

@Component({
  selector: 'app-test2',
  templateUrl: './test2.component.html',
  styleUrls: ['./test2.component.css']
})
export class Test2Component implements OnInit {

  constructor (private workerService: WebworkerService) { }

  ngOnInit() {
  }



 /*  url:string;
  onSelectFile(event:any):void { 
    var reader = new FileReader();
    
    reader.onload = (event:any) =>{
      
      this.url = event.target.result;
      //this.imagedata =  event.target.result;
      this.view();
    };


    reader.readAsDataURL(event.target.files[0]);
   
  }

  img: HTMLImageElement = new Image;
  @ViewChild("viewport") fcanvas;
  view(){
    const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    

      this.img.onload = () => {
        var w = this.img.width;
        var h = this.img.height;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(this.img, 0, 0);
      
      };
      this.img.src = this.url;
  }



  jsonFile:any;
  JsonFileName:string;
  loadGT(event:any):void{

    const file = event.target.files[0];
    if (file == undefined) return;
    if (!file.type.match('\.json')) return;

    this.JsonFileName = event.target.files[0].name;
    //console.log(name);

    const reader = new FileReader();
    reader.onload = (event:any) =>{
      
      this.jsonFile = JSON.parse(event.target.result);
      //console.log(this.jsonFile);

      this.readjson();
      
      
    };
    reader.readAsText(event.target.files[0]);
    
  }


  pointsArray = []
  readjson(){
    const main = this.jsonFile.Page.TextRegion;
    //console.log(main.length);
    if (main.length == undefined){
       const TextLine = main.TextLine;
       //console.log(TextLine)
       for(let j=0; j<TextLine.length; j++){
        const words = TextLine[j].Word
        //console.log(words)
        if (words.length == undefined){
          this.pointsArray.push(words.Coords);
          continue;
        }
        for(let k=0; k<words.length; k++){
          const coords = words[k].Coords;
          //console.log(coords.points)
          //const points = coords.points;
          this.pointsArray.push(coords)
        }
      }
    }else{

        for(let i=0; i<main.length; i++){
          const TextLine = main[i].TextLine;
          //console.log(TextLine)
          for(let j=0; j<TextLine.length; j++){
            const words = TextLine[j].Word
            //console.log(words)
            if (words.length == undefined){
              this.pointsArray.push(words.Coords);
              continue;
            }
            for(let k=0; k<words.length; k++){
              const coords = words[k].Coords;
              //console.log(coords.points)
              //const points = coords.points;
              this.pointsArray.push(coords)
            }
          }
        }
  }
    this.makeGTrects();
    //console.log(this.pointsArray)
  }
  

  RectsArray = [];
  makeGTrects(){
     for(let i=0; i<this.pointsArray.length; i++){
       const points = this.pointsArray[i].points;

       const d = points.split(" ");
       const r = []

        for (let i=0; i<d.length; i++){
          const c = d[i];
          const v = c.split(",")
          //console.log(v)
          const x = Number(v[0]) 
          const y = Number(v[1])
          //console.log(x,y)
          const point = {x:x, y:y}; 
          r.push(point);

        }

        //console.log(r)

        const xArray = r.map(s => s.x)

        const yArray = r.map(s => s.y)

        const maxX = Math.max(...xArray)
        const minX = Math.min(...xArray)

        const maxY = Math.max(...yArray)
        const minY = Math.min(...yArray)

        const rect = {x:minX, y:minY, w:maxX-minX, h:maxY-minY}

        this.RectsArray.push(rect);
       
     }

     this.drawGTRects();
  }

  drawGTRects(){
    const canvas:HTMLCanvasElement = this.fcanvas.nativeElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    
    
    
    

      this.img.onload = () => {
        
        const w = this.img.width;
        const h = this.img.height;
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        
        ctx.drawImage(this.img, 0, 0);

        ctx.lineWidth = 6;
        ctx.strokeStyle = "red";
        for(let i=0; i<this.RectsArray.length; i++){
          const rect = this.RectsArray[i];
          ctx.beginPath();
          ctx.rect(rect.x, rect.y, rect.w, rect.h);
          ctx.stroke();
        }
        
      
      };
      this.img.src = this.url;

    
  } */
  
  imgurl:string;
  onSelectFile(event){
    const file = event.target.files[0];
    if (file == undefined) return;
    if (!file.type.match('image')) return;
    console.log('right image file!!');
    const reader = new FileReader();
    reader.onload = (event:any) =>{
      this.imgurl = event.target.result;
      console.log('file readed');
      
    }
     reader.readAsDataURL(event.target.files[0]);
  }


  gridsearch(){
    console.log('start execution');
    
    this.run(this.imgurl);
  }

  run(imgurl){
    const img = new Image;
    const canvas = document.createElement('canvas') as HTMLCanvasElement;     
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    img.onload = () =>{
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imagedata = ctx.getImageData(0, 0, img.width, img.height);
          console.log('image loaded');
          this.binarize(imagedata);
      
    }
    img.src = imgurl;
  }

  binarize(imagedata){
    console.log('gpp started');
    
    this.workerService.run(GPP, {imageData:imagedata,  dw:10, k:0.2, R:60, q:0.4, p1:0.5, p2:0.7, upsampling:true, dw1:20})
    .then( (result:any) => {
         console.log('gpp finished');
         
           this.Segmentation(result);
         
         
        
      }
    ).catch(console.error);
  }

  

  //ARLSA parameters
  ARLSA_a:number = 0.1;
  ARLSA_c:number = 0.6;
  ARLSA_Th:number = 4;
  RemovePunctuationMarks:boolean = true;
  Xrlsa:boolean = true;
  MyArlsaRects = [];
  Segmentation(imageData:ImageData){
    console.log('segment started');
    
    this.workerService.run(GetSegments, {imageData:imageData, ARLSA_a:this.ARLSA_a, ARLSA_c:this.ARLSA_c, ARLSA_Th:this.ARLSA_Th, RemovePunctuationMarks:this.RemovePunctuationMarks, Xrlsa:false})
          .then( (objects:any) => {
                console.log('segment ended');
                this.MyArlsaRects = objects;
                this.evaluate();
                
                  this.ARLSA_Th +=2;
                  //if (this.ARLSA_Th > 9){
                   // console.log('THE END');
                   //return
                  //}
                  //this.Segmentation(imageData);
                
          }
        ).catch(console.error);
  }


  evaluate(){
    const GroundTruthRects = this.RectsArray;
    
    const SegmentsEvaluation = new evaluation();
    SegmentsEvaluation.run(GroundTruthRects, this.MyArlsaRects);
   
    const Recall = SegmentsEvaluation.getRecall();
    const Precision = SegmentsEvaluation.getPrecision();
    console.log('evaluation:'+" recall = "+Recall+" precision = "+Precision+" Th="+this.ARLSA_Th);
    
  }
  
  jsonFile:any;
  loadGT(event:any):void{

    const file = event.target.files[0];
    if (file == undefined) return;
    if (!file.type.match('\.json')) return;

    //this.JsonFileName = event.target.files[0].name;
    //console.log(name);

    const reader = new FileReader();
    reader.onload = (event:any) =>{
      
      this.jsonFile = JSON.parse(event.target.result);
      //console.log(this.jsonFile);
      this.pointsArray = [];
      this.RectsArray = [];
      this.readjson();
      
    };
    reader.readAsText(event.target.files[0]);
    
  }

  pointsArray = []
  readjson(){
    const main = this.jsonFile.Page.TextRegion;
    //console.log(main.length);
    if (main.length == undefined){
       const TextLine = main.TextLine;
       //console.log(TextLine)
       for(let j=0; j<TextLine.length; j++){
        const words = TextLine[j].Word
        //console.log(words)
        if (words.length == undefined){
          this.pointsArray.push(words.Coords);
          continue;
        }
        for(let k=0; k<words.length; k++){
          const coords = words[k].Coords;
          //console.log(coords.points)
          //const points = coords.points;
          this.pointsArray.push(coords)
        }
      }
    }else{

        for(let i=0; i<main.length; i++){
          const TextLine = main[i].TextLine;
          //console.log(TextLine)
          for(let j=0; j<TextLine.length; j++){
            const words = TextLine[j].Word
            //console.log(words)
            if (words.length == undefined){
              this.pointsArray.push(words.Coords);
              continue;
            }
            for(let k=0; k<words.length; k++){
              const coords = words[k].Coords;
              //console.log(coords.points)
              //const points = coords.points;
              this.pointsArray.push(coords)
            }
          }
        }
    }
    //console.log(this.pointsArray)
    this.makeGTrects();
  }

  RectsArray = [];
  makeGTrects(){
     for(let i=0; i<this.pointsArray.length; i++){
       const points = this.pointsArray[i].points;

       const d = points.split(" ");
       const r = []

        for (let i=0; i<d.length; i++){
          const c = d[i];
          const v = c.split(",")
          //console.log(v)
          const x = Number(v[0]) 
          const y = Number(v[1])
          //console.log(x,y)
          const point = {x:x, y:y}; 
          r.push(point);

        }

        //console.log(r)

        const xArray = r.map(s => s.x)

        const yArray = r.map(s => s.y)

        const maxX = Math.max(...xArray)
        const minX = Math.min(...xArray)

        const maxY = Math.max(...yArray)
        const minY = Math.min(...yArray)

        const rect = {x:minX, y:minY, width:maxX-minX, height:maxY-minY}

        this.RectsArray.push(rect);
       
     }

    //console.log(this.RectsArray)
  }

}

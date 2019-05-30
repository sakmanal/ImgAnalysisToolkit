import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-test2',
  templateUrl: './test2.component.html',
  styleUrls: ['./test2.component.css']
})
export class Test2Component implements OnInit {

  constructor() { }

  ngOnInit() {
  }



  url:string;
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

    
  }

}

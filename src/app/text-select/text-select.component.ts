import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {hello} from 'src/jcrop.js';
import { MatDialog } from '@angular/material';
import { TextSelectPopUpComponent } from '../text-select-pop-up/text-select-pop-up.component';
import { SavejsonService } from '../savejson.service';


@Component({
  selector: 'app-text-select',
  templateUrl: './text-select.component.html',
  styleUrls: ['./text-select.component.css']
})
export class TextSelectComponent implements OnInit {


  constructor(public dialog: MatDialog, private savejsonService: SavejsonService) {}
 


  @Input() imageUrl: any;
  @Input() imageName:string;
  Jcrop:any = hello();
  jcp:any;
  width:number;
  maxwidth:number = window.innerWidth;
  originalWidth:number;
  cropImg:any;
  opc:boolean = false;
  word:string;
  showScroll: boolean;
  position = 'left';
  @Output() updateEvent = new EventEmitter<boolean>();

  ngOnInit() {
    
    if (this.imageUrl){
      this.Jcrop.load('target').then(img => {
        this.jcp = this.Jcrop.attach(img,{multi:true});
        this.jcp.focus();
        this.jcp.setOptions({shade: false});
        this.jcp.setOptions({shadeOpacity:0.2});
      });

      let img = new Image;
      img.onload = () =>{
         this.originalWidth = img.width;
         if (img.width >= this.maxwidth){
           this.width = this.maxwidth;
         }else{
           this.width = this.originalWidth;
         }
      
      };
       img.src = this.imageUrl;
      
     
    } 
  }
 

  openDialog(): void {

    if (this.jcp.active){
      this.cropImage();
      const dialogRef = this.dialog.open(TextSelectPopUpComponent, {
        width: '500px',
        data: { CroppedImage: this.cropImg}
      });
  
      dialogRef.afterClosed().subscribe(result => {
        //console.log('The dialog was closed');
        this.word = result;
        if (this.word) {
           //console.log(this.word);
           //this.word='';
           this.savejsonService.addword(this.imageName, this.word);
           this.updateEvent.emit(true);
        }
      });
  }
  }

  cropImage(){
         const displayedImage = document.getElementById('target');       
         const ratio = this.originalWidth / displayedImage.offsetWidth;
     
         var pos = this.jcp.active.pos;
         const x = Math.round(pos.x * ratio);
         const y = Math.round(pos.y * ratio);
     
         const w = Math.round(pos.w * ratio);
         const h = Math.round(pos.h * ratio);
     
     
        
         const canvas = document.createElement('canvas') as HTMLCanvasElement;     
     
         let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
     
         let img = new Image;           
         img.src = this.imageUrl;
        
           canvas.width = w;
           canvas.height = h;
           ctx.drawImage(img, -x, -y); 
           this.cropImg = canvas.toDataURL("image/png", 1);
  }

  mergeSelection(){

    if (this.jcp.active){
      this.cropImage();
      if (this.cropImg){

        const img = new Image;
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
        let yTop:number = 0;
        let yBottom:number = 0;
        let flag_yTop:boolean = true;
        let xRight:number = 0;
        let xLeft:number = 0;
        let flag_xLeft:boolean = true;

        img.onload = () =>{

          const width = img.width;
          const height = img.height;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;


          for (let i = 0; i < height; i++)
          {
            for (let k = 0; k < width; k++)
            {
                
              if ( data[4 * k + i * 4 * width] == 0 ){
                    if ( flag_yTop == true){
                      yTop= i;
                      flag_yTop = false;
                    } 
                    yBottom = height - i; 
              }
              
                
            }
          }

          for (let k = 0; k < width; k++)
          {
            for (let i = 0; i < height; i++)
            {
                
              if ( data[4 * k + i * 4 * width] == 0 ){
                    if ( flag_xLeft == true){
                      xLeft= k;
                      flag_xLeft = false;
                    } 
                    xRight = width - k; 
              }
              
                
            }
          }

          let pos = this.jcp.active.pos;
          const displayedImage = document.getElementById('target');       
          const ratio = this.originalWidth / displayedImage.offsetWidth;
          const x = Math.round(pos.x * ratio) + xLeft;
          const y = Math.round(pos.y * ratio) + yTop;
          const w = Math.round(pos.w * ratio) - xLeft - xRight + 1;
          const h = Math.round(pos.h * ratio) - yTop - yBottom + 1;
  
  
          this.jcp.removeWidget(this.jcp.active);
          const rect = this.Jcrop.Rect.create(x, y, w, h);
          console.log(x, y, w, h )
          const options = {};
          this.jcp.newWidget(rect,options);

        }
        img.src = this.cropImg;

       
      }
    }
    
  }



   opacity(value:boolean){
    if (this.jcp){
    this.jcp.setOptions({shade: value});
   }
  }

  
  rect(){
    if (this.jcp){
        const rect = this.Jcrop.Rect.create(5,5,50,50);
         const options = {};
         this.jcp.newWidget(rect,options);}
   }

   remove(){
     if (this.jcp.active){
        this.jcp.removeWidget(this.jcp.active);}

      /*  if (this.jcp.active){console.log("ok")}else{console.log("error")}; */
   }


   mouseWheelUpFunc() {
    //console.log('mouse wheel up');
    if (this.width <= window.innerWidth) 
        this.width = this.width + 100;   
  }

  mouseWheelDownFunc() {
    //console.log('mouse wheel down');
    
     if (this.width >= 400)
         this.width = this.width - 100;
        
  }



}

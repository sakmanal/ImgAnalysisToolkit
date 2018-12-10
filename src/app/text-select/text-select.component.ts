import { Component, OnInit, Input } from '@angular/core';
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
    
     if (this.width >= 300)
         this.width = this.width - 100;
        
  }



}

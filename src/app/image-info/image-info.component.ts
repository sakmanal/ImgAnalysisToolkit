import { Component, OnInit } from '@angular/core';
import {  GetjsonService } from '../getjson.service';



@Component({
  selector: 'app-image-info',
  templateUrl: './image-info.component.html',
  styleUrls: ['./image-info.component.css']
})


export class ImageInfoComponent implements OnInit {

  constructor( private getjsonService: GetjsonService ) {}

  
  ImageJson:any;
  ImageNames:object;
  selectedImage:string;

 
  
  ngOnInit() {
    /*var imagename = "document1.jpg";
    //var imagename = "sasa";
    this.ImageJson = this.getjsonService.getJson(imagename);
    //this.getjsonService.getJson(imagename).subscribe(ImageJson => this.ImageJson = ImageJson);
     if (this.ImageJson != undefined){ 
       console.log(this.ImageJson.words);
      }else{
        console.log("Error: no such ImageFile in local storage");
      }*/

    //this.ImageNames = this.getjsonService.getImagekeys();
    //console.log(this.ImageNames);  

     

  }

  getImageNames(){
    this.ImageNames = this.getjsonService.getImagekeys();
    console.log(this.ImageNames); 
  }

  getImageJson(){
    this.ImageJson = this.getjsonService.getJson(this.selectedImage);
    if (this.ImageJson != undefined){ 
      console.log(this.ImageJson.words);
     }else{
       console.log("Error: no such ImageFile in local storage");
     }
  }

  showImageInfo(){
     console.log(this.selectedImage);
     this.getImageJson();

  }






   




  



}

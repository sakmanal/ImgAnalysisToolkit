import { Component, OnInit, ViewChild } from '@angular/core';
import {  GetjsonService } from '../getjson.service';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

export interface PeriodicElement {
  word: string;
  x:number;
  y:number;
  width:number;
  height:number;
}



@Component({
  selector: 'app-image-info',
  templateUrl: './image-info.component.html',
  styleUrls: ['./image-info.component.css']
})


export class ImageInfoComponent implements OnInit {

  displayedColumns: string[] = ['x','y','width','height','word'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor( private getjsonService: GetjsonService ) {}

  
  ImageJson:any;
  ImageNames:object;
  selectedImage:string;

 
  
  ngOnInit() {
  

  }


  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getImageNames(){
    this.ImageNames = this.getjsonService.getImagekeys();
    //console.log(this.ImageNames); 
  }

  getImageJson(){
    this.ImageJson = this.getjsonService.getJson(this.selectedImage);
    if (this.ImageJson != undefined){ 
      //console.log(this.ImageJson.words);
     }else{
       console.log("Error: no such ImageFile in local storage");
     }
  }

  makeTableDataSourse(){
    let ELEMENT_DATA: PeriodicElement[] = [];
     for (let i=0; i<this.ImageJson.words.length; i++){
      const v =  {  word: this.ImageJson.words[i].word,
                    x: this.ImageJson.words[i].x,
                    y: this.ImageJson.words[i].y,
                    width: this.ImageJson.words[i].width,
                    height: this.ImageJson.words[i].height  }
       ELEMENT_DATA.push(v)
     }
     
     //console.log(ELEMENT_DATA)
     this.dataSource = new MatTableDataSource(ELEMENT_DATA);
     //this.dataSource.paginator = this.paginator;
     setTimeout(() => this.dataSource.paginator = this.paginator);
     this.dataSource.sort = this.sort;
  }

  public showImageInfo(){
     //console.log(this.selectedImage);
     if (this.selectedImage){
       this.getImageJson();
       this.makeTableDataSourse();
     }
  }


  saveJson(text:string, filename:string){
      const a = document.createElement('a');
      a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      a.remove();
  }

 downloadJson(){
   if (this.ImageJson){
     this.saveJson( JSON.stringify(this.ImageJson), this.selectedImage +".json" );
   }
  
 }

}

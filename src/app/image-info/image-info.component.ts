import { Component, OnInit, ViewChild } from '@angular/core';
import {  GetjsonService } from '../getjson.service';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

export interface PeriodicElement {
  name: string;
 
}



@Component({
  selector: 'app-image-info',
  templateUrl: './image-info.component.html',
  styleUrls: ['./image-info.component.css']
})


export class ImageInfoComponent implements OnInit {

  displayedColumns: string[] = ['name'];
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
      const v =  { name: this.ImageJson.words[i]  }
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





}

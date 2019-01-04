import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SavejsonService {

  constructor() { }

  

  addword(imageName:string, word:string):void{
    console.log(imageName, word);
    if (this.ImageJson(imageName)) {
       this.saveWord(imageName, word);
    }else{
      this.makeImageJson(imageName);
      this.saveWord(imageName, word);
    }
  }

  ImageJson(imageName:string):boolean{
    for (let i = 0; i < localStorage.length; i++){
      let key = localStorage.key(i);
      if (key == imageName){return true;}
      
    }
    return false;
  }

  saveWord(imagename:string, word:string):void{
    const JsonImageObject = JSON.parse(localStorage.getItem(imagename));
    JsonImageObject.words.push(word);
    localStorage.setItem(imagename, JSON.stringify(JsonImageObject));
     
  }

  makeImageJson(imagename: string):void{
    const JsonImageObject = { "words": [] };
    localStorage.setItem(imagename, JSON.stringify(JsonImageObject));


  }
}

import { Injectable } from '@angular/core';

interface TextSegments{
  x:number;
  y:number;
  width:number;
  height:number;
  word:string;
}

@Injectable({
  providedIn: 'root'
})
export class SavejsonService {

  constructor() { }

  

  /*addword(imageName:string, word:string):void{
    //console.log(imageName, word);
    if (this.ImageJson(imageName)) {
       this.saveWord(imageName, word);
    }else{
      this.makeImageJson(imageName);
      this.saveWord(imageName, word);
    }
  }

  ImageJson(imageName:string):boolean{
    for (let i = 0; i < localStorage.length; i++){
      const key = localStorage.key(i);
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

   deleteImageJson(imageName:string){
    localStorage.removeItem(imageName);
  } 

  saveWords(imageName:string, words:string[]){
    const JsonTextWords = { "words": [] };
    for(const i in words){
      if (words[i] != "undefined"){
        JsonTextWords.words.push(words[i]);
      }
    }
    localStorage.setItem(imageName, JSON.stringify(JsonTextWords));  
  }*/

  saveTextSegments(imageName:string, Segments:TextSegments[]){
   const JsonTextSegments = {"words": []}
   for(const i in Segments){
    JsonTextSegments.words.push(Segments[i]);
   }
   localStorage.setItem(imageName/* +".Segments" */, JSON.stringify(JsonTextSegments));  
  }

  

}

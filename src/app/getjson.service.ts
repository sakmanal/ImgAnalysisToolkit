import { Injectable } from '@angular/core';
//import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GetjsonService {

  constructor() { }
  
//getJson(imageName:string):Observable<object>{
getJson(imageName:string):object{     
  for (let i = 0; i < localStorage.length; i++){
    let key = localStorage.key(i);
    if (key == imageName)
    {  
      var JsonImageObject = JSON.parse(localStorage.getItem(imageName));
      //return of(JsonImageObject);
      return JsonImageObject;
      
    }
    
  }
  //console.log("no such Image");
  return ;
}


}

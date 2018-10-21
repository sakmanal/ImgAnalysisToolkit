import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-image-info',
  templateUrl: './image-info.component.html',
  styleUrls: ['./image-info.component.css']
})
export class ImageInfoComponent implements OnInit {

  constructor() { }

  object: Object = {foo: 'bar', baz: 'qux', nested: {xyz: 3, numbers: [1, 2, 3, 4, 5]}};
  word:string = "Superman";

  ngOnInit() {




    /*var obj = { "image name": "doc1.jpg", "words": ["Test", "iron man"] };
    obj.words.push("Hulk", "Batman");
    obj.words.push(this.word);

    var image = { "image name": "doc2.jpg", "words": ["Sakis", "Nikos", "Stavros"] };
    

    localStorage.setItem('myStorage', JSON.stringify(obj));

    var ImageName = "doc2";
    var imageJson =  JSON.stringify(image);
    localStorage.setItem(ImageName, imageJson);

   

    //And to retrieve the object later

     var test = JSON.parse(localStorage.getItem(ImageName));
     console.log(test.words);

     for (let i = 0; i < localStorage.length; i++){
      let key = localStorage.key(i);
      let value = localStorage.getItem(key);
      console.log(key, value);}
      

    for (let i = 0; i < localStorage.length; i++){
      let key = localStorage.key(i);
      if (key == ImageName)
      {
        console.log(key);}

      
       }*/
  

  }

  json(){

    var json = '[{"a": 1}]';
    var obj = JSON.parse(json);
    var new_json = JSON.stringify(obj.push({b: 2}));


    var dict = {"one" : [15, 4.5],
                "two" : [34, 3.3],
                "three" : [67, 5.0],
                "four" : [32, 4.1]};

    var dictstring = JSON.stringify(dict);        

 
  }


  testArray(){
    var fruits = ["Banana", "Orange", "Apple", "Mango"];
    fruits.push("Kiwi", "pineapple");
    fruits.unshift("peponi");

    var arr = new Array();
    // or var arr = [];
    arr.push('value1');
    arr.push('value2');

    var obj = new Object();
    Array.prototype.push.call(obj, 'value');
  }

  



}

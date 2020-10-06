import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GetjsonService {
  constructor() {}

  getJson(imageName: string): object {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === imageName) {
        const JsonImageObject = JSON.parse(localStorage.getItem(imageName));
        return JsonImageObject;
      }
    }
    return;
  }

  getImagekeys(): object {
    const imageNames = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      imageNames.push(key);
    }
    return imageNames;
  }
}

import { Injectable } from '@angular/core';

interface TextSegments {
  x: number;
  y: number;
  width: number;
  height: number;
  word: string;
}

@Injectable({
  providedIn: 'root',
})
export class SavejsonService {
  constructor() {}

  saveTextSegments(imageName: string, Segments: TextSegments[]) {
    const JsonTextSegments = { words: [] };
    for (const i in Segments) {
      JsonTextSegments.words.push(Segments[i]);
    }
    localStorage.setItem(
      imageName,
      JSON.stringify(JsonTextSegments)
    );
  }
}

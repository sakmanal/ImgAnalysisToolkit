# ImgAnalysisToolkit

This project is a client side Image Analysis Toolkit for text document Binarization & Segmentation written in TypeScript. 

Demo: (https://imganalysis.netlify.app)

> ### Binarization

Implements Otsu [1], Sauvola [2] and GPP [3] Binarization methods for modern/degraded documents.

> ### Segmentation

Implements Text Segmentation method for modern/historical machine-printed documents based on ARLSA [4]. 

### Features
- Open and read Image Files
- Image histogram chart 
- Pixel manipulation with canvas
- Image Processing with Web Workers
- Load and process multiple images together
- Load Ground Truth files and evaluate the implemented processing algorithms 
- Custom made Tool that: 
  - Displays the word segments inside the image (Selects Multiple rectangular areas of the image)
  - Allows to add, delete, move, resize the selections with mouse
  - Drag and move image inside Canvas
  - Zoom image with mouse wheel
  - Keyboard support for above operations
  - Auto-selects the word-boundaries(background pixels, works only on binary images)
  - Opens text input field above each selection for typing the retrieved word
  - Saves selections to local Storage and auto-loads them on start-up
  - Keeps aspect ratio of the selections on window resize
  - Fully Responsive
- Table for viewing the extracted word segments
- Save and Download the extracted word segments to JSON file
- Responsive UI with Angular Material
___
## Demo Preview:
![clip11](https://user-images.githubusercontent.com/32598290/95339033-420db300-08bc-11eb-9237-a9d29d34597b.gif)

![clip2](https://user-images.githubusercontent.com/32598290/95340440-d75d7700-08bd-11eb-98e8-3c268c459f1a.gif)

![clip33](https://user-images.githubusercontent.com/32598290/95338193-5ac99900-08bb-11eb-99d8-84e1ca26afc9.gif)

> ### Reference

1. N. Otsu, "A threshold selection method from gray-level histograms," IEEE Trans. Systems, Man, and Cybernetics, vol. 9, pp. 62-66,           1979.

2. J. Sauvola and M. Pietikainen, "Adaptive document image binarization," Pattern Recognition, vol. 33, no. 2, pp. 225-236, February           2000.

3. B. Gatos, I. Pratikakis and S. J. Perantonis, "Adaptive degraded document image binarization," Pattern Recognition, vol. 39, no. 3,         pp. 317-327, March 2006.

4. N. Nikolaou, M. Makridis, B. Gatos, N. Stamatopoulos and N. Papamarkos, "Segmentation of historical machine-printed documents using         Adaptive Run Length Smoothing and skeleton segmentation paths," Image and Vision Computing, vol. 28, no. 4, pp. 590-604, April 2010.


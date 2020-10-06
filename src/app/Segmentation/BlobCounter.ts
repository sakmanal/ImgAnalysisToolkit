interface rect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface blobObject {
  Array: boolean[][];
  x: number;
  y: number;
  height: number;
  width: number;
  Right: number;
  Bottom: number;
  Density: number;
  Elongation: number;
}

interface blobObjectImages {
  Array: Uint8ClampedArray;
  x: number;
  y: number;
  height: number;
  width: number;
  Right: number;
  Bottom: number;
  Density: number;
  Elongation: number;
}

export default class BlobCounter {
  constructor() {}

  private objectsCount: number;
  private objectLabels: number[];

  public getObjectsCount(): number {
    return this.objectsCount;
  }

  public getObjectLabels(): number[] {
    return this.objectLabels;
  }

  // ProcessImage is only builds object labels map and count objects
  public ProcessImage(
    src1: Uint8ClampedArray,
    width: number,
    height: number
  ): void {
    // no-no-no, we don't want one pixel width images
    if (width == 1) throw "Too small image";

    // allocate labels array
    this.objectLabels = [];
    for (let i = 0; i < width * height; i++) {
      this.objectLabels[i] = 0;
    }
    // initial labels count
    let labelsCount = 0;

    // create map
    const maxObjects = (width / 2 + 1) * (height / 2 + 1) + 1;
    let map: number[] = [];

    // initially map all labels to themself
    for (let i = 0; i < maxObjects; i++) {
      map[i] = i;
    }
    let p = 0,
      src = 0;
    const srcStride = 4 * width;

    // 1 - for pixels of the first row
    if (src1[src] != 0) {
      this.objectLabels[p] = ++labelsCount;
    }
    src += 4;
    ++p;

    for (let x = 1; x < width; x++, src += 4, p++) {
      // check if we need to label current pixel
      if (src1[src] != 0) {
        // check if the previous pixel already labeled
        if (src1[src - 4] != 0) {
          // label current pixel, as the previous
          this.objectLabels[p] = this.objectLabels[p - 1];
        } else {
          // create new label
          this.objectLabels[p] = ++labelsCount;
        }
      }
    }

    // 2 - for other rows
    // for each row
    for (let y = 1; y < height; y++) {
      // for the first pixel of the row, we need to check
      // only upper and upper-right pixels
      if (src1[src] != 0) {
        // check surrounding pixels
        if (src1[src - srcStride] != 0) {
          // label current pixel, as the above
          this.objectLabels[p] = this.objectLabels[p - width];
        } else if (src1[src + 4 - srcStride] != 0) {
          // label current pixel, as the above right
          this.objectLabels[p] = this.objectLabels[p + 1 - width];
        } else {
          // create new label
          this.objectLabels[p] = ++labelsCount;
        }
      }
      src += 4;
      ++p;

      // check left pixel and three upper pixels
      for (let x = 1; x < width - 1; x++, src += 4, p++) {
        if (src1[src] != 0) {
          // check surrounding pixels
          if (src1[src - 4] != 0) {
            // label current pixel, as the left
            this.objectLabels[p] = this.objectLabels[p - 1];
          } else if (src1[src - 4 - srcStride] != 0) {
            // label current pixel, as the above left
            this.objectLabels[p] = this.objectLabels[p - 1 - width];
          } else if (src1[src - srcStride] != 0) {
            // label current pixel, as the above
            this.objectLabels[p] = this.objectLabels[p - width];
          }

          if (src1[src + 4 - srcStride] != 0) {
            if (this.objectLabels[p] == 0) {
              // label current pixel, as the above right
              this.objectLabels[p] = this.objectLabels[p + 1 - width];
            } else {
              const l1 = this.objectLabels[p];
              const l2 = this.objectLabels[p + 1 - width];

              if (l1 != l2 && map[l1] != map[l2]) {
                // merge
                if (map[l1] == l1) {
                  // map left value to the right
                  map[l1] = map[l2];
                } else if (map[l2] == l2) {
                  // map right value to the left
                  map[l2] = map[l1];
                } else {
                  // both values already mapped
                  map[map[l1]] = map[l2];
                  map[l1] = map[l2];
                }

                // reindex
                for (let i = 1; i <= labelsCount; i++) {
                  if (map[i] != i) {
                    // reindex
                    let j = map[i];
                    while (j != map[j]) {
                      j = map[j];
                    }
                    map[i] = j;
                  }
                }
              }
            }
          }

          if (this.objectLabels[p] == 0) {
            // create new label
            this.objectLabels[p] = ++labelsCount;
          }
        }
      }

      // for the last pixel of the row, we need to check
      // only upper and upper-left pixels
      if (src1[src] != 0) {
        // check surrounding pixels
        if (src1[src - 4] != 0) {
          // label current pixel, as the left
          this.objectLabels[p] = this.objectLabels[p - 1];
        } else if (src1[src - 4 - srcStride] != 0) {
          // label current pixel, as the above left
          this.objectLabels[p] = this.objectLabels[p - 1 - width];
        } else if (src1[src - srcStride] != 0) {
          // label current pixel, as the above
          this.objectLabels[p] = this.objectLabels[p - width];
        } else {
          // create new label
          this.objectLabels[p] = ++labelsCount;
        }
      }
      src += 4;
      ++p;
    }

    // allocate remapping array
    let reMap: number[] = new Array(map.length);

    // count objects and prepare remapping array
    this.objectsCount = 0;
    for (let i = 1; i <= labelsCount; i++) {
      if (map[i] == i) {
        // increase objects count
        reMap[i] = ++this.objectsCount;
      }
    }
    // second pass to compete remapping
    for (let i = 1; i <= labelsCount; i++) {
      if (map[i] != i) {
        reMap[i] = reMap[map[i]];
      }
    }

    // repair object labels
    for (let i = 0, n = this.objectLabels.length; i < n; i++) {
      if (this.objectLabels[i]) {
        this.objectLabels[i] = reMap[this.objectLabels[i]];
      }
    }
  }

  // Get array of objects rectangles
  public GetObjectRectangles(
    src: Uint8ClampedArray,
    width: number,
    height: number
  ): object {
    //convert black pixels(0) to 1
    //and white pixels(255) to 0
    for (let i = 0; i < src.length; i += 4) {
      if (src[i] == 0) {
        src[i] = 1;
      }
      if (src[i] == 255) {
        src[i] = 0;
      }
    }

    // process the image
    this.ProcessImage(src, width, height);

    const labels: number[] = this.objectLabels;
    const count: number = this.objectsCount;

    let i: number = 0,
      label: number;

    // create object coordinates arrays
    const x1: number[] = [];
    const y1: number[] = [];
    const x2: number[] = [];
    const y2: number[] = [];

    for (let j = 1; j <= count; j++) {
      x1[j] = width;
      y1[j] = height;
      x2[j] = 0;
      y2[j] = 0;
    }

    // walk through labels array
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++, i++) {
        // get current label
        label = labels[i];

        // skip unlabeled pixels
        if (label == 0) continue;

        // check and update all coordinates

        if (x < x1[label]) {
          x1[label] = x;
        }
        if (x > x2[label]) {
          x2[label] = x;
        }
        if (y < y1[label]) {
          y1[label] = y;
        }
        if (y > y2[label]) {
          y2[label] = y;
        }
      }
    }

    // create rectangles
    const rects: object = {};
    for (let j = 1; j <= count; j++) {
      const Rectangle: rect = {
        x1: x1[j],
        y1: y1[j],
        x2: x2[j] - x1[j] + 1,
        y2: y2[j] - y1[j] + 1,
      };
      rects[j - 1] = Rectangle;
    }

    return rects;
  }

  public GetObjectsWithoutArray(SourceImage: ImageData): blobObject[] {
    const src: Uint8ClampedArray = new Uint8ClampedArray(SourceImage.data);
    const width: number = SourceImage.width;
    const height: number = SourceImage.height;

    //convert black pixels(0) to 1
    //and white pixels(255) to 0
    for (let i = 0; i < src.length; i += 4) {
      if (src[i] == 0) {
        src[i] = 1;
      }
      if (src[i] == 255) {
        src[i] = 0;
      }
    }

    // process the image
    this.ProcessImage(src, width, height);

    const labels: number[] = this.objectLabels;
    const count = this.objectsCount;

    // image size
    let i: number = 0,
      label: number;

    // --- STEP 1 - find each objects coordinates

    // create object coordinates arrays
    const x1: number[] = [];
    const y1: number[] = [];
    const x2: number[] = [];
    const y2: number[] = [];

    for (let k = 1; k <= count; k++) {
      x1[k] = width;
      y1[k] = height;
      x2[k] = 0;
      y2[k] = 0;
    }

    // walk through labels array
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++, i++) {
        // get current label
        label = labels[i];

        // skip unlabeled pixels
        if (label == 0) continue;

        // check and update all coordinates

        if (x < x1[label]) {
          x1[label] = x;
        }
        if (x > x2[label]) {
          x2[label] = x;
        }
        if (y < y1[label]) {
          y1[label] = y;
        }
        if (y > y2[label]) {
          y2[label] = y;
        }
      }
    }

    // --- STEP 2 - get each object
    const objects: blobObject[] = [];

    // create each array
    for (let k = 1; k <= count; k++) {
      const xmin = x1[k];
      const xmax = x2[k];
      const ymin = y1[k];
      const ymax = y2[k];
      const objectWidth = xmax - xmin + 1;
      const objectHeight = ymax - ymin + 1;

      objects[k - 1] = {
        Array: null,
        x: xmin,
        y: ymin,
        height: objectHeight,
        width: objectWidth,
        Right: xmax,
        Bottom: ymax,
        Density: null,
        Elongation: null,
      };
    }

    return objects;
  }

  // Get array of objects images
  public GetObjectsWithArray(SourceImage: ImageData): blobObject[] {
    const src: Uint8ClampedArray = new Uint8ClampedArray(SourceImage.data);
    const width: number = SourceImage.width;
    const height: number = SourceImage.height;

    //convert black pixels(0) to 1
    //and white pixels(255) to 0
    for (let i = 0; i < src.length; i += 4) {
      if (src[i] == 0) {
        src[i] = 1;
      }
      if (src[i] == 255) {
        src[i] = 0;
      }
    }

    // process the image
    this.ProcessImage(src, width, height);

    const labels: number[] = this.objectLabels;
    const count = this.objectsCount;

    // image size
    let i: number = 0,
      label: number;

    // --- STEP 1 - find each objects coordinates

    // create object coordinates arrays
    const x1: number[] = [];
    const y1: number[] = [];
    const x2: number[] = [];
    const y2: number[] = [];

    for (let k = 1; k <= count; k++) {
      x1[k] = width;
      y1[k] = height;
      x2[k] = 0;
      y2[k] = 0;
    }

    // walk through labels array
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++, i++) {
        // get current label
        label = labels[i];

        // skip unlabeled pixels
        if (label == 0) continue;

        // check and update all coordinates

        if (x < x1[label]) {
          x1[label] = x;
        }
        if (x > x2[label]) {
          x2[label] = x;
        }
        if (y < y1[label]) {
          y1[label] = y;
        }
        if (y > y2[label]) {
          y2[label] = y;
        }
      }
    }

    // --- STEP 2 - get each object
    const objects: blobObject[] = [];

    // create each array
    for (let k = 1; k <= count; k++) {
      const xmin = x1[k];
      const xmax = x2[k];
      const ymin = y1[k];
      const ymax = y2[k];
      const objectWidth = xmax - xmin + 1;
      const objectHeight = ymax - ymin + 1;

      const array = [];
      for (let i = 0; i < objectHeight; i++) {
        array[i] = [];
      }

      /* for(let y=0; y<objectHeight; y++){
                array.push([]);
                for(let x=0; x<objectWidth; x++){
                  array[y].push(false);
                }
            } */

      let p = ymin * width + xmin;

      const labelsOffset = width - objectWidth;

      // for each line
      for (let y = ymin; y <= ymax; y++) {
        // copy each pixel
        for (let x = xmin; x <= xmax; x++, p++) {
          if (labels[p] == k) {
            array[y - ymin][x - xmin] = true;
          } else {
            array[y - ymin][x - xmin] = false;
          }
        }
        p += labelsOffset;
      }

      objects[k - 1] = {
        Array: array,
        x: xmin,
        y: ymin,
        height: objectHeight,
        width: objectWidth,
        Right: xmax,
        Bottom: ymax,
        Density: null,
        Elongation: null,
      };
    }

    return objects;
  }

  // Get array of objects images
  public GetObjects(
    src: Uint8ClampedArray,
    width: number,
    height: number
  ): blobObjectImages[] {
    //convert black pixels(0) to 1
    //and white pixels(255) to 0
    for (let i = 0; i < src.length; i += 4) {
      if (src[i] == 0) {
        src[i] = 1;
      }
      if (src[i] == 255) {
        src[i] = 0;
      }
    }

    // process the image
    this.ProcessImage(src, width, height);

    const labels: number[] = this.objectLabels;
    const count = this.objectsCount;

    // image size
    let i: number = 0,
      label: number;

    // --- STEP 1 - find each objects coordinates

    // create object coordinates arrays
    const x1: number[] = [];
    const y1: number[] = [];
    const x2: number[] = [];
    const y2: number[] = [];

    for (let k = 1; k <= count; k++) {
      x1[k] = width;
      y1[k] = height;
      x2[k] = 0;
      y2[k] = 0;
    }

    // walk through labels array
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++, i++) {
        // get current label
        label = labels[i];

        // skip unlabeled pixels
        if (label == 0) continue;

        // check and update all coordinates

        if (x < x1[label]) {
          x1[label] = x;
        }
        if (x > x2[label]) {
          x2[label] = x;
        }
        if (y < y1[label]) {
          y1[label] = y;
        }
        if (y > y2[label]) {
          y2[label] = y;
        }
      }
    }

    // --- STEP 2 - get each object
    const srcStride = 4 * width;
    const objects: blobObjectImages[] = [];

    // create each array
    for (let k = 1; k <= count; k++) {
      const xmin = x1[k];
      const xmax = x2[k];
      const ymin = y1[k];
      const ymax = y2[k];
      const objectWidth = xmax - xmin + 1;
      const objectHeight = ymax - ymin + 1;
      const dstStride = 4 * objectWidth;
      const dst = new Uint8ClampedArray(dstStride * objectHeight);

      let p = ymin * width + xmin;

      const labelsOffset = width - objectWidth;
      let s = 0;
      // for each line
      for (let y = ymin; y <= ymax; y++) {
        // copy each pixel
        for (let x = xmin; x <= xmax; x++, p++) {
          if (labels[p] == k) {
            dst[s] = src[4 * x + y * srcStride];
            dst[s + 1] = src[4 * x + y * srcStride + 1];
            dst[s + 2] = src[4 * x + y * srcStride + 2];
            //dst[4 * x + y * dstStride] = src[4 * (x + xmin) + (ymin + y) * srcStride]; //src correct when use: for(let x=0; x<objectWidth; x++)
            //dst[4 * x + y * dstStride + 1] = src[4 * (x + xmin) + (ymin + y) * srcStride + 1];                    for(let y=0; x<objectHeight; y++)
            //dst[4 * x + y * dstStride + 2] = src[4 * (x + xmin) + (ymin + y) * srcStride + 2];
          }
          s += 4;
        }
        p += labelsOffset;
      }

      objects[k - 1] = {
        Array: dst,
        x: xmin,
        y: ymin,
        height: objectHeight,
        width: objectWidth,
        Right: xmax,
        Bottom: ymax,
        Density: null,
        Elongation: null,
      };
    }

    return objects;
  }
}

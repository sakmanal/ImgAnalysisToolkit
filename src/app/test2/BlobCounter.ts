interface rect{
    x1:number;
    y1:number;
    x2:number;
    y2:number;
  }

export default class BlobCounter {

    constructor() {}

    private objectsCount:number;
    private objectLabels:number[];

    public getObjectsCount():number{
        return this.objectsCount;
    }

    public getObjectLabels():number[]{
        return this.objectLabels;
    }

    // ProcessImage is only builds object labels map and count objects
    public ProcessImage(src1:Uint8ClampedArray, width:number, height:number):void{

        // no-no-no, we don't want one pixel width images
        if (width == 1)
            throw "Too small image";

        // allocate labels array
        this.objectLabels = [];
        for (let i = 0; i < width*height; i++)
        {
            this.objectLabels[i] = 0 ;
        }
        // initial labels count
        let labelsCount = 0;
        
        // create map
        const maxObjects = ((width / 2) + 1) * ((height / 2) + 1) + 1;
        let map:number[] = [];

        // initially map all labels to themself
        for (let i = 0; i < maxObjects; i++)
        {
            map[i] = i;
        }
        let p = 0, src = 0;
        const srcStride = 4 * width;

        // 1 - for pixels of the first row
        if (src1[src] != 0)
        {
            this.objectLabels[p] = ++labelsCount;
        }
        src += 4;
        ++p;

        for (let x = 1; x < width; x++, src += 4, p++)
        {
            // check if we need to label current pixel
            if (src1[src] != 0)
            {
                // check if the previous pixel already labeled
                if (src1[src - 4] != 0)
                {
                    // label current pixel, as the previous
                    this.objectLabels[p] = this.objectLabels[p - 1];
                }
                else
                {
                    // create new label
                    this.objectLabels[p] = ++labelsCount;
                }
            }
        }

        // 2 - for other rows
        // for each row
        for (let y = 1; y < height; y++)
            {
                // for the first pixel of the row, we need to check
                // only upper and upper-right pixels
                if (src1[src] != 0)
                {
                    // check surrounding pixels
                    if (src1[src - srcStride] != 0)
                    {
                        // label current pixel, as the above
                        this.objectLabels[p] = this.objectLabels[p - width];
                    }
                    else if (src1[src + 4 - srcStride] != 0)
                    {
                        // label current pixel, as the above right
                        this.objectLabels[p] = this.objectLabels[p + 1 - width];
                    }
                    else
                    {
                        // create new label
                        this.objectLabels[p] = ++labelsCount;
                    }
                }
                src += 4;
                ++p;

                // check left pixel and three upper pixels
                for (let x = 1; x < width - 1; x++, src += 4, p++)
                {
                    if (src1[src] != 0)
                    {
                        // check surrounding pixels
                        if (src1[src - 4] != 0)
                        {
                            // label current pixel, as the left
                            this.objectLabels[p] = this.objectLabels[p - 1];
                        }
                        else if (src1[src - 4 - srcStride] != 0)
                        {
                            // label current pixel, as the above left
                            this.objectLabels[p] = this.objectLabels[p - 1 - width];
                        }
                        else if (src1[src - srcStride] != 0)
                        {
                            // label current pixel, as the above
                            this.objectLabels[p] = this.objectLabels[p - width];
                        }

                        if (src1[src + 4 - srcStride] != 0)
                        {
                            if (this.objectLabels[p] == 0)
                            {
                                // label current pixel, as the above right
                                this.objectLabels[p] = this.objectLabels[p + 1 - width];
                            }
                            else
                            {
                                const l1 = this.objectLabels[p];
                                const l2 = this.objectLabels[p + 1 - width];

                                if ((l1 != l2) && (map[l1] != map[l2]))
                                {
                                    // merge
                                    if (map[l1] == l1)
                                    {
                                        // map left value to the right
                                        map[l1] = map[l2];
                                    }
                                    else if (map[l2] == l2)
                                    {
                                        // map right value to the left
                                        map[l2] = map[l1];
                                    }
                                    else
                                    {
                                        // both values already mapped
                                        map[map[l1]] = map[l2];
                                        map[l1] = map[l2];
                                    }

                                    // reindex
                                    for (let i = 1; i <= labelsCount; i++)
                                    {
                                        if (map[i] != i)
                                        {
                                            // reindex
                                            let j = map[i];
                                            while (j != map[j])
                                            {
                                                j = map[j];
                                            }
                                            map[i] = j;
                                        }
                                    }
                                }
                            }
                        }

                        if (this.objectLabels[p] == 0)
                        {
                            // create new label
                            this.objectLabels[p] = ++labelsCount;
                        }
                    }
                }

                // for the last pixel of the row, we need to check
                // only upper and upper-left pixels
                if (src1[src] != 0)
                {
                    // check surrounding pixels
                    if (src1[src - 4] != 0)
                    {
                        // label current pixel, as the left
                        this.objectLabels[p] = this.objectLabels[p - 1];
                    }
                    else if (src1[src - 4 - srcStride] != 0)
                    {
                        // label current pixel, as the above left
                        this.objectLabels[p] = this.objectLabels[p - 1 - width];
                    }
                    else if (src1[src - srcStride] != 0)
                    {
                        // label current pixel, as the above
                        this.objectLabels[p] = this.objectLabels[p - width];
                    }
                    else
                    {
                        // create new label
                        this.objectLabels[p] = ++labelsCount;
                    }
                }
                src += 4;
                ++p;

            }

            // allocate remapping array
            let reMap:number[] = new Array(map.length);

            // count objects and prepare remapping array
            this.objectsCount = 0;
            for (let i = 1; i <= labelsCount; i++)
            {
                if (map[i] == i)
                {
                    // increase objects count
                    reMap[i] = ++this.objectsCount;
                }
            }
            // second pass to compete remapping
            for (let i = 1; i <= labelsCount; i++)
            {
                if (map[i] != i)
                {
                    reMap[i] = reMap[map[i]];
                }
            }

            // repair object labels
            for (let i = 0, n = this.objectLabels.length; i < n; i++)
            {
                this.objectLabels[i] = reMap[this.objectLabels[i]];
            }
   

    }

    // Get array of objects rectangles
    public  GetObjectRectangles(src:Uint8ClampedArray, width:number, height:number):object{

        

        // process the image
        this.ProcessImage(src, width, height);

        const labels:number[] = this.objectLabels;
        const count:number = this.objectsCount;

        let i:number = 0, label:number;

        // create object coordinates arrays
        const x1:number[] = [];
        const y1:number[] = [];
        const x2:number[] = [];
        const y2:number[] = [];

        for (let j = 1; j <= count; j++)
        {
            x1[j] = width;
            y1[j] = height;
            x2[j] = 0;
            y2[j] = 0;
        }

         // walk through labels array
         for (let y = 0; y < height; y++)
         {
             for (let x = 0; x < width; x++, i++)
             {
                 // get current label
                 label = labels[i];

                 // skip unlabeled pixels
                 if (label == 0)
                     continue;

                 // check and update all coordinates

                 if (x < x1[label])
                 {
                     x1[label] = x;
                 }
                 if (x > x2[label])
                 {
                     x2[label] = x;
                 }
                 if (y < y1[label])
                 {
                     y1[label] = y;
                 }
                 if (y > y2[label])
                 {
                     y2[label] = y;
                 }
             }
         }

         // create rectangles
         const rects:object = {};
         for (let j = 1; j <= count; j++)
         {
            const Rectangle:rect = {x1:x1[j], y1:y1[j], x2:x2[j] - x1[j] + 1, y2:y2[j] - y1[j] + 1};
            rects[j - 1] = Rectangle;
         }

        return rects;

    }


}


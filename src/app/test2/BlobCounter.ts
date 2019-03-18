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


}
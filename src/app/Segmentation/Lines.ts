interface blobObject{
    Array:boolean[][];
    x:number;
    y:number;
    height:number;
    width:number;
    Right:number;
    Bottom:number;
    Density:number;
    Elongation:number;
}

interface LineSegment2D{

}

export default class Lines{

    public RemoveLines(Image:ImageData, Threshold:number, MinLineWidth:number,Blobs:blobObject[]):ImageData{
        
        const myimg = new ImageData(Image.data, Image.width, Image.height);
        
        const WidthArray:number[] = Blobs.map(v => v.width)
        MinLineWidth = WidthArray.reduce((sum, v) => sum + v) / WidthArray.length;

       for(const b in Blobs){
        //myimg.ROI = new System.Drawing.Rectangle(b.X, b.Y, b.width, b.height);
        const myLines:LineSegment2D[][] = this.Detect(myimg, Threshold, MinLineWidth);
        this.DrawLineSegments(myLines, myimg);
       }
        // myimg.ROI = System.Drawing.Rectangle.Empty;
        return myimg;
    }

    private Detect(myimg:ImageData, Threshold:number, MinLineWidth:number):LineSegment2D[][]{

        //LineSegment2D[][] mylines = myimg.Convert<Gray, Byte>().Not().HoughLinesBinary(1, Math.PI / 180, Threshold, MinLineWidth, 0);
        const mylines:LineSegment2D[][] = this.HoughLinesBinary(myimg, 1, Math.PI / 180, Threshold, MinLineWidth, 0);
        return mylines;
    }

    private DrawLineSegments(lines:LineSegment2D[][], Image:ImageData){

    }
    
    private HoughLinesBinary
}
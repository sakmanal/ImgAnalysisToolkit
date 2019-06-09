interface Rectangles{
    x:number;
    y:number;
    width:number;
    height:number;
}

export default class evaluation{

    private Recall:number;
    private Precision:number;

    public getRecall(){
        return this.Recall;
    }

    public getPrecision(){
        return this.Precision;
    }

    public run(GroundTruthRects:Rectangles[], MyArlsaRects:Rectangles[]){
        
        let overlaps = 0;

        for(const i in GroundTruthRects){

            const tl1 = { x: GroundTruthRects[i].x, y: GroundTruthRects[i].y };
            const br1 = { x: GroundTruthRects[i].x + GroundTruthRects[i].width - 1, y: GroundTruthRects[i].y + GroundTruthRects[i].height - 1};

            for(const j in MyArlsaRects){

                const tl2 = { x: MyArlsaRects[j].x, y: MyArlsaRects[j].y };
                const br2 = { x: MyArlsaRects[j].x + MyArlsaRects[j].width - 1, y: MyArlsaRects[j].y + MyArlsaRects[j].height - 1};

                const left = Math.max(tl1.x, tl2.x);
                const right = Math.min(br1.x, br2.x);
                const top = Math.max(tl1.y, tl2.y);
                const bottom = Math.min(br1.y, br2.y);

                if (left < right && top < bottom){

                    const area1 = GroundTruthRects[i].width * GroundTruthRects[i].height;
                    const area2 = MyArlsaRects[j].width * MyArlsaRects[j].height;

                    const interSection = (right - left) * (bottom - top);
                    const union = area1 + area2 - interSection;

                    const Threshold = interSection / union;

                    if (Threshold >= 0.3){
                         overlaps++;
                    }
                }

            }
        }
        
        this.Recall = overlaps / GroundTruthRects.length;
        this.Precision = overlaps / MyArlsaRects.length;
    }
}
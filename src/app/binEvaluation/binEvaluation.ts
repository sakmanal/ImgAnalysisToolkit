export default class binEvaluation {
  private Recall: number;
  private Precision: number;
  private Fmeasure: number;

  public getRecall() {
    return this.Recall;
  }

  public getPrecision() {
    return this.Precision;
  }

  public getFmeasure() {
    return this.Fmeasure;
  }

  public run(MybinImg: ImageData, gtImg: ImageData) {
    const MybinData = MybinImg.data;
    const gtData = gtImg.data;
    let TP = 0;
    let FP = 0;
    let FN = 0;

    for (let i = 0; i < MybinData.length; i += 4) {
      if (MybinData[i] == 0 && gtData[i] == 0) {
        TP++;
      } else if (MybinData[i] == 0 && gtImg[i] != 0) {
        FP++;
      } else if (MybinData[i] != 0 && gtData[i] == 0) {
        FN++;
      }
    }

    this.Recall = TP / (FN + TP);
    this.Precision = TP / (FP + TP);
    this.Fmeasure =
      (2 * this.Recall * this.Precision) / (this.Recall + this.Precision);
  }
}

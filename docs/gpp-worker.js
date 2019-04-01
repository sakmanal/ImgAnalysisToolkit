onmessage = GPP;
function GPP(d) {
    var imageData = d.data.imageData;
    var w = imageData.width;
    var h = imageData.height;
    var data = imageData.data;
    var gppMethod = new GppBinarization(data);
    data = gppMethod.binarize(w, h, d.data.dw, d.data.k, d.data.R, d.data.q, d.data.p1, d.data.p2, d.data.upsampling, d.data.dw1);
    var x = [imageData.data.buffer];
    postMessage(imageData, x);
}
var GppBinarization = /** @class */ /*@__PURE__*/ (function () {
    function GppBinarization(d) {
        this.data = d;
    }
    GppBinarization.prototype.binarize = function (width, height, dw, k, R, q, p1, p2, upsampling, dw1) {
        this.greyscale();
        this.gpp(width, height, dw, k, R, q, p1, p2, upsampling, dw1);
        return this.data;
    };
    GppBinarization.prototype.greyscale = function () {
        var RED_INTENCITY_COEF = 0.2126;
        var GREEN_INTENCITY_COEF = 0.7152;
        var BLUE_INTENCITY_COEF = 0.0722;
        for (var i = 0; i < this.data.length; i += 4) {
            var brightness = RED_INTENCITY_COEF * this.data[i] + GREEN_INTENCITY_COEF * this.data[i + 1] + BLUE_INTENCITY_COEF * this.data[i + 2];
            this.data[i] = brightness;
            this.data[i + 1] = brightness;
            this.data[i + 2] = brightness;
        }
    };
    GppBinarization.prototype.gpp = function (width, height, _dw, _k, _R, _q, _p1, _p2, _upsampling, _dw1) {
        //Previous Global Parameters
        var Ix = width;
        var Iy = height;
        //params
        var dW = Math.min(Ix - 2, Math.min(_dw, Iy - 2));
        var k = _k;
        k = k / 10;
        var R = _R;
        var q = 1 / _q;
        var p1 = _p1;
        var p2 = _p2;
        var upsampling = _upsampling;
        var dW1 = Math.min(Ix - 1, Math.min(_dw1, Iy - 1));
        var I, I1;
        var pix, gray, gray2, TH, graygray, pix1 = 0, gray1 = 0;
        var ydWIx, ydW_1Ix, ydW1Ix, ydW1_1Ix;
        var m, s;
        var d;
        var d2;
        var aa, bb, cc, dd;
        function make2Darray(w, h) {
            var arr = new Array(h);
            for (var i = 0; i < arr.length; i++) {
                arr[i] = new Array(w);
            }
            return arr;
        }
        var IMAGE = make2Darray(width, height);
        var IMAGE11 = make2Darray(width, height);
        var IMAGE2 = make2Darray(Ix, Iy);
        for (var i = 0; i < height; i++) {
            for (var k_1 = 0; k_1 < width; k_1++) {
                IMAGE[i][k_1] = this.data[4 * k_1 + i * 4 * width];
                IMAGE11[i][k_1] = this.data[4 * k_1 + i * 4 * width];
            }
        }
        var IX_pix = new Array(Ix + 1);
        var IX_gray = new Array(Ix + 1);
        var IX_graygray = new Array(Ix + 1);
        var IX_pix1 = new Array(Ix + 1);
        var IX_gray1 = new Array(Ix + 1);
        var IX_graygray1 = new Array(Ix + 1);
        //1st step
        for (var y = 0; y < Iy; y++) {
            ydWIx = y + dW;
            ydW_1Ix = y - dW - 1;
            if (ydWIx >= Iy) {
                ydWIx = Iy - 1;
                ydW_1Ix = ydWIx - 1;
            }
            if (y == 0) {
                for (var x = 0; x < Ix; x++) {
                    pix = 0;
                    gray = 0;
                    gray2 = 0;
                    for (var iy = 0; iy <= dW; iy++) {
                        I = IMAGE[iy][x];
                        gray += I;
                        gray2 += I * I;
                    }
                    pix += dW + 1;
                    IX_pix[x] = pix;
                    IX_gray[x] = gray;
                    IX_graygray[x] = gray2;
                    IX_pix1[x] = IX_pix[x];
                    IX_gray1[x] = IX_gray[x];
                    IX_graygray1[x] = IX_graygray[x];
                }
            }
            else if (y <= dW) {
                for (var x = 0; x < Ix; x++) {
                    I = IMAGE[ydWIx][x];
                    IX_pix[x] = IX_pix1[x] + 1;
                    IX_gray[x] = IX_gray1[x] + I;
                    IX_graygray[x] = IX_graygray1[x] + I * I;
                    IX_pix1[x] = IX_pix[x];
                    IX_gray1[x] = IX_gray[x];
                    IX_graygray1[x] = IX_graygray[x];
                }
            }
            else if (y <= Iy - 1 - dW) {
                for (var x = 0; x < Ix; x++) {
                    I = IMAGE[ydWIx][x];
                    I1 = IMAGE[ydW_1Ix][x];
                    IX_pix[x] = IX_pix1[x];
                    IX_gray[x] = IX_gray1[x] + I - I1;
                    ;
                    IX_graygray[x] = IX_graygray1[x] + I * I - I1 * I1;
                    IX_pix1[x] = IX_pix[x];
                    IX_gray1[x] = IX_gray[x];
                    IX_graygray1[x] = IX_graygray[x];
                }
            }
            else {
                for (var x = 0; x < Ix; x++) {
                    I = IMAGE[ydW_1Ix][x];
                    IX_pix[x] = IX_pix1[x] - 1;
                    IX_gray[x] = IX_gray1[x] - I;
                    IX_graygray[x] = IX_graygray1[x] - I * I;
                    IX_pix1[x] = IX_pix[x];
                    IX_gray1[x] = IX_gray[x];
                    IX_graygray1[x] = IX_graygray[x];
                }
            }
            pix1 = 0;
            gray1 = 0;
            var graygray1 = 0;
            for (var x = 0; x < Ix; x++) {
                var localX = x + dW;
                if (localX >= Ix)
                    localX = Ix - 1;
                if (x == 0) {
                    pix = 0;
                    gray = 0;
                    graygray = 0;
                    for (var ix = 0; ix <= dW; ix++) {
                        pix += IX_pix[ix];
                        gray += IX_gray[ix];
                        graygray += IX_graygray[ix];
                    }
                }
                else if (x <= dW) {
                    pix = pix1 + IX_pix[localX];
                    gray = gray1 + IX_gray[localX];
                    graygray = graygray1 + IX_graygray[localX];
                }
                else if (x <= Ix - 1 - dW) {
                    pix = pix1 + IX_pix[localX] - IX_pix[x - dW - 1];
                    gray = gray1 + IX_gray[localX] - IX_gray[x - dW - 1];
                    graygray = graygray1 + IX_graygray[localX] - IX_graygray[x - dW - 1];
                }
                else {
                    pix = pix1 - IX_pix[x - dW - 1];
                    gray = gray1 - IX_gray[x - dW - 1];
                    graygray = graygray1 - IX_graygray[x - dW - 1];
                }
                pix1 = pix;
                gray1 = gray;
                graygray1 = graygray;
                m = gray / pix;
                s = Math.sqrt(Math.abs((pix * graygray - gray * gray) / (pix * (pix - 1))));
                TH = (m * (1 - k * (1 - s / R)));
                TH = Math.floor(TH);
                IMAGE2[y][x] = (IMAGE[y][x] >= TH) ? 255 : 0;
            }
        }
        //Interpolation
        for (var y = 0; y < Iy; y++) {
            ydW1Ix = y + dW1;
            ydW1_1Ix = y - dW1 - 1;
            if (ydW1Ix >= Iy) {
                ydW1Ix = Iy - 1;
                ydW1_1Ix = ydW1Ix - 1;
            }
            if (y == 0) {
                for (var x = 0; x < Ix; x++) {
                    pix = 0;
                    gray = 0;
                    for (var iy = 0; iy <= dW1; iy++) {
                        if (IMAGE2[iy][x] == 255) {
                            pix++;
                            gray += IMAGE[iy][x];
                        }
                    }
                    IX_pix[x] = pix;
                    IX_gray[x] = gray;
                    IX_pix1[x] = IX_pix[x];
                    IX_gray1[x] = IX_gray[x];
                }
            }
            else if (y <= dW1) {
                for (var x = 0; x < Ix; x++) {
                    if (IMAGE2[ydW1Ix][x] == 255) {
                        IX_pix[x] = IX_pix1[x] + 1;
                        IX_gray[x] = IX_gray1[x] + IMAGE[ydW1Ix][x];
                    }
                    IX_pix1[x] = IX_pix[x];
                    IX_gray1[x] = IX_gray[x];
                }
            }
            else if (y <= Iy - 1 - dW1) {
                for (var x = 0; x < Ix; x++) {
                    IX_pix[x] = IX_pix1[x];
                    IX_gray[x] = IX_gray1[x];
                    if (IMAGE2[ydW1Ix][x] == 255) {
                        IX_pix[x]++;
                        IX_gray[x] += IMAGE[ydW1Ix][x];
                    }
                    if (IMAGE2[ydW1_1Ix][x] == 255) {
                        IX_pix[x]--;
                        IX_gray[x] -= IMAGE[ydW1_1Ix][x];
                    }
                    IX_pix1[x] = IX_pix[x];
                    IX_gray1[x] = IX_gray[x];
                }
            }
            else {
                for (var x = 0; x < Ix; x++) {
                    if (IMAGE2[ydW1_1Ix][x] == 255) {
                        IX_pix[x] = IX_pix1[x] - 1;
                        IX_gray[x] = IX_gray1[x] - IMAGE[ydW1_1Ix][x];
                    }
                    IX_pix1[x] = IX_pix[x];
                    IX_gray1[x] = IX_gray[x];
                }
            }
            for (var x = 0; x < Ix; x++) {
                pix = pix1;
                gray = gray1;
                if (x == 0) {
                    pix = 0;
                    gray = 0;
                    for (var ix = 0; ix <= dW1; ix++) {
                        pix += IX_pix[ix];
                        gray += IX_gray[ix];
                    }
                }
                else if (x <= dW1) {
                    if ((x + dW1) > Ix)
                        continue;
                    pix = pix1 + IX_pix[x + dW1];
                    gray = gray1 + IX_gray[x + dW1];
                }
                else if (x <= Ix - 1 - dW1) {
                    pix = pix1 + IX_pix[x + dW1] - IX_pix[x - dW1 - 1];
                    gray = gray1 + IX_gray[x + dW1] - IX_gray[x - dW1 - 1];
                }
                else {
                    pix = pix1 - IX_pix[x - dW1 - 1];
                    gray = gray1 - IX_gray[x - dW1 - 1];
                }
                pix1 = pix;
                gray1 = gray;
                //NEW
                if (pix == 0)
                    IMAGE11[y][x] = 255;
                else
                    IMAGE11[y][x] = Math.floor(IMAGE2[y][x] == 0 ? gray / pix : IMAGE[y][x]);
            }
        }
        //Thresholding
        var PixFor = 0;
        //let D1 = 0;
        var D = 0, D2 = 0;
        //let Hist = new Array(256);
        //for (let i = 0; i < 256; i++) Hist[i] = 0;
        for (var y = 0; y < Iy; y++) {
            for (var x = 0; x < Ix; x++) {
                I = (IMAGE[y][x]);
                I1 = IMAGE11[y][x];
                if (IMAGE2[y][x] == 0 && I1 > I) {
                    PixFor++;
                    D = D + I1 - I;
                    //D1 = D1 + I;
                    D2 = D2 + I1;
                    //Hist[I]++;
                }
            }
        }
        D = PixFor == 0 ? 0 : D / PixFor;
        //D1 = PixFor == 0 ? 0 : D1 / PixFor;
        D2 = PixFor == 0 ? 0 : D2 / PixFor;
        /*let HistMax = 0;
          let H = 0;
    
        for (let i = 0; i < 256; i++)
        {
            if (Hist[i] > HistMax)
            {
                HistMax = Hist[i];
                H = i;
            }
        }
        H += 5; */
        d = D;
        d2 = D2;
        //let a = (d * (p2 - 1)) / (d2 * q * (p1 - 1));
        //let b = (d * (p1 - p2)) / (q * (p1 - 1));
        aa = q * d * (1 - p2);
        bb = -(2 * (1 + p1)) / (1 - p1);
        cc = p2 * d * q;
        dd = -4 / (d2 * (1 - p1));
        TH = (D * 0.4);
        if (upsampling == true) {
            for (var y = 0; y < Iy; y++) {
                for (var x = 0; x < Ix; x++) {
                    if (IMAGE2[y][x] == 0) {
                        TH = Math.floor(aa / (1 + Math.exp(dd * IMAGE11[y][x] - bb)) + cc);
                        if (IMAGE11[y][x] - (IMAGE[y][x]) > TH) {
                            IMAGE2[y][x] = 0;
                        }
                        else {
                            IMAGE2[y][x] = 255;
                        }
                    }
                    else {
                        IMAGE2[y][x] = 255;
                    }
                }
            }
        }
        for (var i = 0; i < height; i++) {
            for (var k_2 = 0; k_2 < width; k_2++) {
                this.data[4 * k_2 + i * 4 * width] = IMAGE2[i][k_2];
                this.data[4 * k_2 + i * 4 * width + 1] = IMAGE2[i][k_2];
                this.data[4 * k_2 + i * 4 * width + 2] = IMAGE2[i][k_2];
            }
        }
    };
    return GppBinarization;
}());

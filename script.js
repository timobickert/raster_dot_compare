/**
 * Berechnet den Rasterberg für verschiedene Rasterstukturen
 * Fogra
 * Circle (Rund)
 * Ellipse
 * CircleINV
 * Kreiskegel
 * Freaky (ich habe keine Bezeichnung für den Punkt gefunden ;))
 */
class ScreenCreator {

    constructor(grayLevels) {
        this.grayLevels = grayLevels;
        this.steps = parseInt(Math.sqrt(grayLevels));
        this.stepDivider = 2 / (this.steps - 1);
    }

    createScreen(screen_type) {
        this.screenType = screen_type;
        var screen = [];
        for(var y = -1; y <= 1; y += this.stepDivider) {
            var screenRow = [];
            for(var x = -1; x <= 1; x += this.stepDivider) {
                
                switch(String(screen_type)) {
                    case "Fogra":
                        screenRow.push(this.fogra_calc(x,y));
                        break;
                    case "Circle":
                        screenRow.push(this.circle_calc(x,y));
                        break;
                    case "Ellipse":
                        screenRow.push(this.ellipse_calc(x,y));
                        break;
                    case "CircleINV":
                        screenRow.push(this.circleINV_calc(x,y));
                        break;
                    case "Kreiskegel":
                        screenRow.push(this.kreiskegel_calc(x,y));
                        break;
                    case "Freaky":
                        screenRow.push(this.freaky_calc(x,y));
                        break;
                    default:
                        screenRow.push(this.circle_calc(x,y));
                        break;
                }
            }
            screen.push(screenRow);
        }

        this.screen = screen;
    }

    // normalisieren der Werte zwischen 0 und maxmum Graustufe
    normalizedScreen() {
        for(var y = 0; y < this.screen.length; y++) {
            for(var x = 0; x < this.screen[y].length; x++) {
                this.screen[x][y] = (this.screen[x][y] + 1) * (this.getSteps() * this.getSteps()) / 2
            }
        }
    }

    fogra_calc(x,y) {
        x = round(x, 3);
        y = round(y, 3);
        // return 1-Math.sqrt((x*x + y*y) / 2);
        return (Math.cos(PI * x) + Math.cos(PI * y)) / 2;
    }

    ellipse_calc(x,y) {
        x = round(x, 3);
        y = round(y, 3);
        var b = 0.8;
        return (y*y + ((b*x) * (b*x)) - 1) * -1;
    }

    circle_calc(x,y) {
        x = round(x, 3);
        y = round(y, 3);
        return (1 - (x*x + y*y));
    }

    circleINV_calc(x,y) {
        x = round(x, 3);
        y = round(y, 3);
        return -(x*x + y*y - 1);
    }

    kreiskegel_calc(x,y) {
        x = round(x, 3);
        y = round(y, 3);
        return 1 - Math.sqrt((x*x + y*y) / 2);
    }

    freaky_calc(x,y) {
        x = round(x, 3);
        y = round(y, 3);
        return (1-x*x) * (1-y*y);
    }

    getSteps() {
        return this.steps;
    }

    getScreen() {
        return this.screen;
    }

    createScreenPrintOutput(dotsPerType) {
        var scanner = this.getSteps() * this.getSteps();
        var counter = 0;
        this.dotsPerType = dotsPerType;
        
        var raster_dot = [];
        for(var y = 0; y < this.getSteps(); y++) {
            var raster_dot_row = [];
            for(var x = 0; x < this.getSteps(); x++) {
                raster_dot_row.push(0);
            }
            raster_dot.push(raster_dot_row);
        }
    
        var output_raster_dot = [];
        for(var y = 0; y < this.getSteps() * dotsPerType; y++) {
            var output_raster_dot_row = [];
            for(var x = 0; x < this.getSteps() * dotsPerType; x++) {
                output_raster_dot_row.push(0);
            }
            output_raster_dot.push(output_raster_dot_row);
        }

        this.output_raster = output_raster_dot;

        while(scanner >= 0) {
            for(var y = 0; y < this.screen.length; y++) {
                for(var x = 0; x < this.screen[y].length; x++) {
                    if(this.screen[x][y] > scanner - 0.5 && this.screen[x][y] <= scanner) {
                        raster_dot[x][y] = counter;
                        counter++;
                    }
                }
            }
            scanner -= 0.5;
        }

        this.print_raster_dot = raster_dot;
    }

    getPrintRasterDot() {
        return this.print_raster_dot;
    }

    getOutput(grayLevels, pix_w, pix_h) {

        for(var y = 0; y < this.print_raster_dot.length; y++) {
            for(var x = 0; x < this.print_raster_dot[y].length;x++) {
                for(let i = 0; i < dotsPerType; i++) {
                    for(let j = 0; j < dotsPerType; j++) {
                        var offset_x = x + i * this.steps;
                        var offset_y = y + j * this.steps;
                        
                        if(this.print_raster_dot[x][y] < grayLevels) {
                            this.output_raster[offset_x][offset_y] = new RasterDot(pix_w,pix_h,1);
                        } else {
                            this.output_raster[offset_x][offset_y] = new RasterDot(pix_w,pix_h,0);
                        }
                    }
                }
            }
        }

        return this.output_raster;
    }

    getOutputSharp(grayLevels, pix_w, pix_h) {
        var output = this.getOutput(grayLevels, pix_w, pix_h);

        for(var y = 0; y < output.length; y++) {
            for(var x = 0; x < output[y].length;x++) {
                if(y % 2 == 0) {
                    if(x % 2 == 0) {
                        output[x][y].filled = 0;
                    }
                } else {
                    if(x % 2 != 0) {
                        output[x][y].filled = 0;
                    }
                }
            }
        }

        return output;
    }

    getOutputWSI(grayLevels, pix_w, pix_h) {

        var output = this.getOutput(grayLevels, pix_w, pix_h);
        for(var y = 0; y < output.length; y++) {
            for(var x = 0; x < output[y].length;x++) {
                // in jeder zweiten Zeile sind keine Pixel eingefärbt
                // setze diese auf 0
                if(y % 2 > 0) {
                    output[x][y].filled = 0;
                }
                if(y % 2 == 0 && x % 4 > 0) {
                    output[x][y].filled = 0;
                }

            }

        }


        return output
    }



}

/**
 * Ausgabe für einen einzelnen Rasterpunkt 
 * width - Punktbreite in Pixel
 * height - Punkthöhe in Pixel
 * filled - Punkt wird gezeichnet (1 / true) oder nicht (0 / false)
 */
class RasterDot {
    constructor(width, height, filled) {
        this.width = width;
        this.height = height;
        this.filled = filled;
        this.dotDiameter = Math.sqrt((this.width * this.width) + (this.height * this.height));
    }

    draw(offset_x, offset_y, type) {
        fill(255,255,255,0);
        noStroke();
        if(this.filled) {
            fill(50,50,50,255);
        }
        
        switch(String(type)) {
            case "std":
                ellipse(offset_x, offset_y, this.dotDiameter, this.dotDiameter);
                break;
            case "nano":
                ellipse(offset_x, offset_y, this.dotDiameter * 0.65, this.dotDiameter * 0.65);
                break;
            case "sharp":
                ellipse(offset_x, offset_y, this.dotDiameter * 0.9, this.dotDiameter * 0.9);
                break;
            case "mcwsi":
                ellipse(offset_x, offset_y, this.dotDiameter * 1, this.dotDiameter * 1);
                break;
            default:
                ellipse(offset_x, offset_y, this.dotDiameter, this.dotDiameter);
                break;
        }        
    }
}



var raster_dot = [];
var output_raster_dot = [];
var slider;
var sc;
var dotsPerType = 3;
var fontsize = 30;

var sc_normal;  // Raster ohne Anpassung
var sc_nano; // Nano Raster
var sc_sharp; // Sharp Raster (W06)
var sc_wsi; // WSI Raster (ESKO MCWSI)

function preload() {
    // Ensure the .ttf or .otf font stored in the assets directory
    // is loaded before setup() and draw() are called
    font = loadFont('assets/Roboto-Regular.ttf');
  }

function setup() {
  
    // Create Screen
    // Cicle, Ellipse, Fogra, CircleINV

    // 256 Graustufen entsprechen einer Rasterzelle von 16x16 Pixel 
    // bei 2400 dpi. Dies ergibt eine Rasterweite von 150 LPI

    // Standardraster 2540 DPI
    sc_normal = new ScreenCreator(289);
    sc_normal.createScreen("Circle");
    sc_normal.normalizedScreen();
    sc_normal.createScreenPrintOutput(3)

    // Nano 2400 DPI 
    sc_nano = new ScreenCreator(256);
    sc_nano.createScreen("Circle");
    sc_nano.normalizedScreen();
    sc_nano.createScreenPrintOutput(3)

    // Sharp 2540 DPI
    sc_sharp = new ScreenCreator(289);
    sc_sharp.createScreen("Circle");
    sc_sharp.normalizedScreen();
    sc_sharp.createScreenPrintOutput(3)

    // MC WSI 4000 DPI
    sc_wsi = new ScreenCreator(729);
    sc_wsi.createScreen("Circle");
    sc_wsi.normalizedScreen();
    sc_wsi.createScreenPrintOutput(3);

    createCanvas(2100,1000);
    textFont(font);

    slider = createSlider(0,1000, 1000);
    slider.position( 10, 700);
    slider.style('width', '200px');
    
}

function draw() {
    background(255);
    var slider_value = slider.value();

    var normal_gray_levels = sc_normal.grayLevels / 1000 * slider_value;
    var screen_output_normal = sc_normal.getOutput(normal_gray_levels, 10, 10);
    offset_y = 0;
    for(y = 0; y < screen_output_normal.length; y++) {
        for(x = 0; x < screen_output_normal[0].length; x++) {
            screen_output_normal[x][y].draw(x * screen_output_normal[x][y].width + offset_y, y * screen_output_normal[x][y].height + 100, "std");
        }
    }

    offset_y = 520;
    var nano_gray_levels = sc_nano.grayLevels / 1000 * slider_value;
    var screen_output_nano = sc_nano.getOutput(nano_gray_levels, 10.7, 10.7);

    for(y = 0; y < screen_output_nano.length; y++) {
        for(x = 0; x < screen_output_nano[0].length; x++) {
            screen_output_nano[x][y].draw((x * screen_output_nano[x][y].width + offset_y), 
                                          y * screen_output_nano[x][y].height + 100, 
                                          "nano");
        }
    }

    offset_y = 1040;
    var sharp_gray_levels = sc_sharp.grayLevels / 1000 * slider_value;
    var screen_output_sharp = sc_sharp.getOutputSharp(sharp_gray_levels, 10, 10);

    for(y = 0; y < screen_output_sharp.length; y++) {
        for(x = 0; x < screen_output_sharp[0].length; x++) {
            screen_output_sharp[x][y].draw((x * screen_output_sharp[x][y].width + offset_y), 
                                          y * screen_output_sharp[x][y].height + 100, 
                                          "sharp");
        }
    }

    offset_y = 1560;
    var wsi_gray_levels = sc_wsi.grayLevels / 1000 * slider_value;
    var screen_output_wsi = sc_wsi.getOutputWSI(wsi_gray_levels, 6.2, 6.2);

    for(y = 0; y < screen_output_wsi.length; y++) {
        for(x = 0; x < screen_output_wsi[0].length; x++) {
            screen_output_wsi[x][y].draw((x * screen_output_wsi[x][y].width + offset_y), 
                                          y * screen_output_wsi[x][y].height + 100, 
                                          "mcwsi");
        }
    }

    fill(0);
    stroke(0);
    textSize(fontsize);
    text(slider_value / 10 + "%", 240, 700);
    // text( wsi_gray_levels , 250, 25);
    text("Regular", 80,55);
    text("Nano", 560,55);
    text("Sharp W06", 1040,55);
    text("Esko MCWSI", 1560,55);
}
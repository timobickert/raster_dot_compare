/**
 *  Setup
 */

const cell_size_2540 = 10;
const cell_size_2400 = 10.7;
const cell_size_4000 = 6.2;

var raster_dot = [];
var output_raster_dot = [];
var slider;
var sc;
var dotsPerType = 3;
var fontsize = 30;

var sc_normal;  // Raster ohne Anpassung
var sc_nano;    // Nano Raster
var sc_sharp;   // Sharp Raster (W06)
var sc_wsi;     // WSI Raster (ESKO MCWSI)

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
        var shift = 0;
        var row_is_empty = 0;
        for(var y = 0; y < output.length; y++) {
            // shift Row by 2
            if(y % 4 == 0) {
                   shift = 1;     
            }
            var pixelCounter = 0;
            if(shift) {
                pixelCounter = 2;
            }

            for(var x = 0; x < output[y].length;x++) {
                // in jeder zweiten Zeile sind keine Pixel eingefärbt
                // setze diese auf 0
                

                if(y % 2 > 0) {
                    output[x][y].filled = 0;
                } else {
                    
                    if(pixelCounter % 4 != 0) {
                        output[x][y].filled = 0;
                    }
                    row_is_empty = 0;
                }
            
                pixelCounter++;
            }
            shift = 0;
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

    draw(offset_x, offset_y, type, boost) {
        var boost = boost / 100;
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
                ellipse(offset_x, offset_y, this.dotDiameter * 0.65 * boost, this.dotDiameter * 0.65 * boost);
                break;
            case "sharp":
                ellipse(offset_x, offset_y, this.dotDiameter * 0.9 * boost, this.dotDiameter * 0.9 * boost);
                break;
            case "mcwsi":
                ellipse(offset_x, offset_y, this.dotDiameter * 1.2 * boost, this.dotDiameter * 0.8 * boost);
                break;
            default:
                ellipse(offset_x, offset_y, this.dotDiameter, this.dotDiameter);
                break;
        }        
    }
}

function setup() {
  
    // Create Screen
    // Cicle, Ellipse, Fogra, CircleINV

    // 256 Graustufen entsprechen einer Rasterzelle von 16x16 Pixel 
    // bei 2400 dpi. Dies ergibt eine Rasterweite von 150 LPI

    // Standardraster 2540 DPI
    sc_normal = new ScreenCreator(289);
    sc_normal.createScreen("Fogra");
    sc_normal.normalizedScreen();
    sc_normal.createScreenPrintOutput(dotsPerType)

    // Nano 2400 DPI 
    sc_nano = new ScreenCreator(256);
    sc_nano.createScreen("Circle");
    sc_nano.normalizedScreen();
    sc_nano.createScreenPrintOutput(dotsPerType)

    // Sharp 2540 DPI
    sc_sharp = new ScreenCreator(289);
    sc_sharp.createScreen("Circle");
    sc_sharp.normalizedScreen();
    sc_sharp.createScreenPrintOutput(dotsPerType)

    // MC WSI 4000 DPI
    sc_wsi = new ScreenCreator(729);
    sc_wsi.createScreen("Circle");
    sc_wsi.normalizedScreen();
    sc_wsi.createScreenPrintOutput(dotsPerType);

    createCanvas(2100,1000);
    // textFont(font);

    slider = createSlider(0,1000, 1000);
    slider.position( 10, 700);
    slider.style('width', '200px');

    nano_boost_slider = createSlider(80, 120, 100);
    nano_boost_slider.position(520,700);
    nano_boost_slider.style('width', '200px');

    sharp_boost_slider = createSlider(80, 120, 100);
    sharp_boost_slider.position(1040,700);
    sharp_boost_slider.style('width', '200px');

    wsi_boost_slider = createSlider(100, 250, 200);
    wsi_boost_slider.position(1560,700);
    wsi_boost_slider.style('width', '200px');
}



function draw() {
    background(255);
    var slider_value = slider.value();
    var nano_boost = nano_boost_slider.value();
    var sharp_boost = sharp_boost_slider.value();
    var wsi_boost = wsi_boost_slider.value();

    var normal_gray_levels = sc_normal.grayLevels / 1000 * slider_value;
    var screen_output_normal = sc_normal.getOutput(normal_gray_levels, cell_size_2540, cell_size_2540);
    offset_y = 0;
    for(y = 0; y < screen_output_normal.length; y++) {
        for(x = 0; x < screen_output_normal[0].length; x++) {
            screen_output_normal[x][y].draw(x * screen_output_normal[x][y].width + offset_y, y * screen_output_normal[x][y].height + 100, "std", 100);
        }
    }

    offset_y = 520;
    var nano_gray_levels = sc_nano.grayLevels / 1000 * slider_value;
    var screen_output_nano = sc_nano.getOutput(nano_gray_levels, cell_size_2400, cell_size_2400);

    for(y = 0; y < screen_output_nano.length; y++) {
        for(x = 0; x < screen_output_nano[0].length; x++) {
            screen_output_nano[x][y].draw((x * screen_output_nano[x][y].width + offset_y), 
                                          y * screen_output_nano[x][y].height + 100, 
                                          "nano", nano_boost);
        }
    }

    offset_y = 1040;
    var sharp_gray_levels = sc_sharp.grayLevels / 1000 * slider_value;
    var screen_output_sharp = sc_sharp.getOutputSharp(sharp_gray_levels, cell_size_2540, cell_size_2540);

    for(y = 0; y < screen_output_sharp.length; y++) {
        for(x = 0; x < screen_output_sharp[0].length; x++) {
            screen_output_sharp[x][y].draw((x * screen_output_sharp[x][y].width + offset_y), 
                                          y * screen_output_sharp[x][y].height + 100, 
                                          "sharp", sharp_boost);
        }
    }

    offset_y = 1560;
    var wsi_gray_levels = sc_wsi.grayLevels / 1000 * slider_value;
    var screen_output_wsi = sc_wsi.getOutputWSI(wsi_gray_levels, cell_size_4000, cell_size_4000);

    for(y = 0; y < screen_output_wsi.length; y++) {
        for(x = 0; x < screen_output_wsi[0].length; x++) {
            screen_output_wsi[x][y].draw((x * screen_output_wsi[x][y].width + offset_y), 
                                          y * screen_output_wsi[x][y].height + 100, 
                                          "mcwsi", wsi_boost);
        }
    }

    fill(0);
    stroke(0);
    textSize(fontsize);
    text(slider_value / 10 + "%", 60, 670);
    text(nano_boost + "%", 570, 670);
    text(sharp_boost + "%", 1090, 670);
    text(wsi_boost, 1610, 670);

    text("Regular", 80,55);
    text("Nano", 560,55);
    text("Sharp W06", 1040,55);
    text("Esko MCWSI", 1560,55);
 
}
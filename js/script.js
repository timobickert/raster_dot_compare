class ScreenCreator {

    constructor(grayLevels) {
        this.grayLevels = grayLevels;
        this.steps = parseInt(Math.sqrt(grayLevels));
        this.stepDivider = 2 / (this.steps - 1);
    }

    Fogra() {
        var screen = [];
        for(var y = -1; y <= 1; y += this.stepDivider) {
            var screenRow = [];
            for(var x = -1; x <= 1; x += this.stepDivider) {
    
                screenRow.push(this.fogra_calc(x,y));
            }
            screen.push(screenRow);
        }

        return screen;

    }

    fogra_calc(x,y) {
        x = round(x, 3);
        y = round(y, 3);
        // return 1-Math.sqrt((x*x + y*y) / 2);
        return (Math.cos(PI * x) + Math.cos(PI * y)) / 2;
    }

    getSteps() {
        return this.steps;
    }

}

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
        
        if(type == "std") {
            ellipse(offset_x, offset_y, this.dotDiameter, this.dotDiameter);
        }

        if(type == "nano") {
            ellipse(offset_x, offset_y, this.dotDiameter * 0.65, this.dotDiameter * 0.65);
        }

        if(type == "sharp") {
            ellipse(offset_x, offset_y, this.dotDiameter * 0.9, this.dotDiameter * 0.9);
        }
        
    }
}



var raster_dot = [];
var output_raster_dot = [];
var slider;
var sc;
var dotsPerType = 3;
var fontsize = 30;

function preload() {
    // Ensure the .ttf or .otf font stored in the assets directory
    // is loaded before setup() and draw() are called
    font = loadFont('assets/Roboto-Regular.ttf');
  }

function setup() {

    slider = createSlider(0,256, 100);
    slider.position( 10, 600);
    slider.style('width', '200px');

    sc = new ScreenCreator(256);
    var screen = sc.Fogra();

    // normalisieren der Werte zwischen 0 und 256
    for(var y = 0; y < screen.length; y++) {
        for(var x = 0; x < screen[y].length; x++) {
            screen[x][y] = (screen[x][y] + 1) * 256 / 2
        }
    }
   

    var scanner = 256;
    var counter = 0;
    
    for(var y = 0; y < sc.getSteps(); y++) {
        var raster_dot_row = [];
        for(var x = 0; x < sc.getSteps(); x++) {
            raster_dot_row.push(0);
        }
        raster_dot.push(raster_dot_row);
    }

    for(var y = 0; y < sc.getSteps() * dotsPerType; y++) {
        var output_raster_dot_row = [];
        for(var x = 0; x < sc.getSteps() * dotsPerType; x++) {
            output_raster_dot_row.push(0);
        }
        output_raster_dot.push(output_raster_dot_row);
    }


    
    while(scanner >= 0) {
        for(var y = 0; y < screen.length; y++) {
            for(var x = 0; x < screen[y].length; x++) {
                if(screen[x][y] > scanner - 0.5 && screen[x][y] <= scanner) {
                    raster_dot[x][y] = counter;
                    counter++;
                }
            }
        }
        scanner -= 0.5;
    }

    createCanvas(1920,600);
    textFont(font);
    
}

function draw() {
    background(255);
    var slider_value = slider.value();
    

    // Create Dot Shape
    var draw_raster_dot = [];
    for(var y = 0; y < raster_dot.length; y++) {
        for(var x = 0; x < raster_dot[y].length; x++) {
            if(raster_dot[x][y] < 256 -slider_value) {
               
                for(var i = 0; i < dotsPerType; i++) {
                    for(var j = 0; j < dotsPerType; j++) {
                        output_raster_dot[x + j * sc.getSteps()][y + i * sc.getSteps()] = new RasterDot(10,10, 1);
                    }
                } 
               
           } else {
               
                for(var i = 0; i < dotsPerType; i++) {
                    for(var j = 0; j < dotsPerType; j++) {
                        output_raster_dot[x + j * sc.getSteps()][y + i * sc.getSteps()] = new RasterDot(10,10, 0);
                    }
                } 

           }
        }
    }
    
    for(var y = 0; y < output_raster_dot.length; y++) {
        for(var x = 0; x < output_raster_dot[y].length; x++) {
            output_raster_dot[x][y].draw(80 + output_raster_dot[x][y].width * x, 80 + output_raster_dot[x][y].height * y, 'std');
        }
    }

    for(var y = 0; y < output_raster_dot.length; y++) {
        for(var x = 0; x < output_raster_dot[y].length; x++) {
            output_raster_dot[x][y].draw(560 + output_raster_dot[x][y].width * x, 80 + output_raster_dot[x][y].height * y, 'nano');
        }
    }


    // create a chessboard from dot
    var output_raster_dot_copy = [...output_raster_dot];

    for(var y = 0; y < output_raster_dot_copy.length; y++) {
        for(var x = 0; x < output_raster_dot_copy[y].length; x++) {
            if(y % 2 == 0) {
                if(x % 2 == 0) {
                    output_raster_dot_copy[x][y].filled = 0;
                }
            } else {
                if(x % 2 != 0) {
                    output_raster_dot_copy[x][y].filled = 0;
                }
            }
        }
    }

    for(var y = 0; y < output_raster_dot_copy.length; y++) {
        for(var x = 0; x < output_raster_dot_copy[y].length; x++) {
            output_raster_dot_copy[x][y].draw(1040 + output_raster_dot_copy[x][y].width * x, 80 + output_raster_dot_copy[x][y].height * y, 'sharp');
        }
    }



    fill(0);
    stroke(0);
    textSize(fontsize);
    text(slider_value, 80, 25);
    text( round(100-100 / 256 * slider_value, 1) +  " %" , 250, 25);
    text("Regular", 80,55);
    text("Nano", 560,55);
    text("Sharp W06", 1040,55);
}
// Converting to Instance Mode
/*
Somethings to run down in the code
what is the variable length1 all about? Why isn't it properly instanciated.
*/

/*global p5, dat, window, console, genPop, nextGen, perms, calcFitness, normFitness, */

'use strict';

const s = (sketch) => {
    sketch.PHI = (1 + Math.sqrt(5)) / 2;

    sketch.play = true;
    sketch.reset = false;

    // Variables Common to All Algoritmic Approaches
    sketch.totalCities = 29;
    sketch.cities = []; // array to hold p5.vector objects for city locations
    sketch.order = []; // array matched with cities[] to identify the different cities and help with reordering
    sketch.totalPerms = perms[sketch.totalCities - 1]; // look up the number of different permutations from perms[]
    sketch.lDims = {}; // layout Dimensions. An object to hold vars used for onscreen layout
    sketch.distLookup = new Map(); // Map object to hold precalculated distances between cities.
    sketch.maxDist = 0;
    sketch.shortestDist = Infinity;
    sketch.shortestDistOrder = []; // Genetic Algorithm
    sketch.currGenShortestDistOrder = []; // Genetic Algorithm
    sketch.shortestDistScores = []; // list of the best route distances found
    sketch.routeCount = 0; // number of new 'best' routes found;
    sketch.permCount = 0; // counter to track permutations since beginning
    sketch.routesPerSec = 0; // variable to track routes per second. used in the titles
    sketch.numPanesPerRow = 3; // initial # of solution panes per row. This changes as more solutions are found.

    sketch.bestRoutes = {
        routes: []
        // Holds information about the best routes found to date...
        // [{
        //     permCount: 0,
        //     dist: 1000,
        //     order: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        //     solNum: 0
        // }]
    };

    // Brute Force Specific Variables
    sketch.searching = true; // true if there are more permutations to check

    // Genetic Algorithm Specific Variables
    sketch.population = [];
    sketch.fitness = []; // make pop and fitness arrays into an object later with {pops:[{order: [0,1,2,3,4], fitness: 0.47}]
    sketch.popSize = 4000;
    sketch.mSwapRate = 0.0125; // 0 = zero swaps, 1 = totalCities number of swaps



    ////////////////////////////////////////////////////////////////////////////////
    sketch.setup = () => {
        // createCanvas(810, 810);
        // createCanvas(1650, 1000);
        // createCanvas(1200, 800);
        sketch.createCanvas(1400, 900);
        // createCanvas(540, 540);

        // Set "lDims", layout dimensions
        // Top and bottom of the current best solution area
        sketch.lDims.currBestY1 = 100;
        sketch.lDims.currBestY2 = sketch.height - (sketch.height / sketch.PHI);
        // The top and bottom of the screen area where previous best routes are shown
        sketch.lDims.panesY1 = sketch.height / sketch.PHI;
        sketch.lDims.panesY2 = sketch.height;
        // Top and bottom of the best routes graph area
        sketch.lDims.solGraphY2 = sketch.lDims.panesY1;
        sketch.lDims.solGraphY1 = sketch.lDims.currBestY2;

        // Object holding dimensions for the cities to be located within.
        sketch.cBox = {};
        sketch.cBox.x1 = 11;
        sketch.cBox.y1 = sketch.lDims.currBestY1;
        sketch.cBox.x2 = sketch.width - sketch.cBox.x1;
        sketch.cBox.y2 = sketch.lDims.currBestY2;

        // Create city p5.vectors and set their locations
        for (let i = 0; i < sketch.totalCities; i++) {
            // let v = createVector(Math.random() * (width * .9) + (width * 0.05), map(Math.random(), 0, 1, 100, height / 3 - 11));
            let v = sketch.createVector(sketch.map(Math.random(), 0, 1, sketch.cBox.x1, sketch.cBox.x2), sketch.map(Math.random(), 0, 1, sketch.cBox.y1, sketch.cBox.y2));
            sketch.cities[i] = v;
            sketch.order[i] = i;
        }

        // Calculate all the distances between each city
        sketch.distLookup = precalcCityDistances(sketch.cities);

        // First route
        let firstRoute = {};
        firstRoute.dist = calcDist(sketch.cities);
        firstRoute.order = sketch.cities;
        firstRoute.perm = sketch.permCount;
        setNewBestRoute(firstRoute);
        sketch.shortestDist = firstRoute.dist;

        // Genetic Algorithm
        // Generate Populations
        genPop();

    }; // sketch.setup()

    ////////////////////////////////////////////////////////////////////////////////
    sketch.draw = () => {
        sketch.background(0, 18, 29);

        if (sketch.play) {
            // Genetic Algorithm
            // there's going to be a lot of refactoring going on here.
            // Calculate Fitness
            calcFitness();
            // Normalize Fitness
            normFitness();
            nextGen();
            sketch.permCount++;
        }

        //Create a new array of cities in the current order for this permutation
        // Brute Force
        // let newCityOrder = reOrderCities(order, cities);

        // Random Checking
        // let newCityOrder = randomizeArray(cities);

        // Random and Brute Force
        // let currDist = Math.floor(calcDist(newCityOrder));

        // Random and Brute Force
        // Test to see if new path is longer than the current longest path
        // if (currDist > maxDist) {
        //     maxDist = currDist;
        // }

        // Random and Brute Force
        // Test to see if new path is shorter than the current shortest path
        // if (currDist < shortestDist) {
        //     shortestDist = currDist;
        //     // Create a new entry in the bestRoutes object
        //     let newBest = {};
        //     newBest.dist = shortestDist;
        //     newBest.order = newCityOrder.slice();
        //     newBest.perm = permCount;
        //     setNewBestRoute(newBest)
        // }

        // renderCurrShortestRoute(shortestDistOrder);
        // Random and Brute Force
        renderCurrShortestRoute(sketch.bestRoutes.routes[sketch.bestRoutes.routes.length - 1].order);
        renderNewRouteAttempt(sketch.currGenShortestDistOrder);

        renderBestRoutePanes();
        renderBestRouteChart();

        renderCities(sketch.cities);
        renderTitles();

        // Brute Force
        // if (searching) {
        //     nextLexOrder(); // updates order[] to next Lexicographic Order for the cities
        // } else {
        //     noLoop();
        // }
    }; // sketch.draw()


}; // const s 

let p = new p5(s);


////////////////////////////////////////////////////////////////////////////////
let renderTitles = function () {
    //Title
    p.noStroke();
    p.fill(199);
    p.textSize(18);
    p.text("The Travelling Salesperson Problem", 11, 29);
    p.textSize(14);
    p.text("What is the shortest possible route that visits each city?", 11, 47);

    let txtY = p.height / 3 * 2;
    p.fill(199, 199);

    // Brute Force
    // let pctComplete = permCount / totalPerms * 100;
    // let s = pctComplete < 0.001 ? "> 0.01" : pctComplete.toFixed(2);
    // Brute Force
    // text("Checking " + totalPerms + " different combinations using brute force lexicographic ordering.\n" + s + "% complete.\n" + Math.floor(permCount / (millis() / 1000)) + " routes per second.", 11, lDims.currBestY1 - (textAscent() * 2) - 1);
    if(p.play){ // adding this condition so that the routes per second calculation stops based on play/pause variable.
        p.routesPerSec = Math.floor(p.permCount / (p.millis() / 1000));
    } // if p.play
    p.text(numberWithCommas(p.permCount) + " combinations tested at " + p.routesPerSec + " routes/second.\nMutation Rate of 0.0125% on a Generational Population Size of 2000.", 11, p.lDims.currBestY1 - (p.textAscent() * 2) - 1);
    // text("Mutation Rate: 0.0125%. \nGenerational Population Size: 2000.", 11, lDims.currBestY1 - (textAscent() * 1) + 3);
};


let renderCurrShortestRoute = function (csrArr) {
    // Draw the current shortest path
    p.beginShape();
    p.stroke(199, 0, 199);
    p.strokeWeight(2);
    p.noFill();
    for (let i = 0, length1 = csrArr.length; i < length1; i++) {
        p.vertex(csrArr[i].x, csrArr[i].y);
    }
    p.endShape();
};


let renderNewRouteAttempt = function (ncoArr) {
    // draw new path attempts
    p.noFill();
    p.stroke(255, 123);
    p.strokeWeight(0.5);
    p.beginShape();
    for (let i = 0, length1 = ncoArr.length; i < length1; i++) {
        p.vertex(ncoArr[i].x, ncoArr[i].y);
    }
    p.endShape();
};


let renderBestRoutePanes = function () {
    let solPaneW = p.width / p.numPanesPerRow;
    let solPaneH = (p.lDims.panesY2 - p.lDims.panesY1) / p.numPanesPerRow;

    if (((p.bestRoutes.routes.length - 1) / p.numPanesPerRow * solPaneH) > (p.lDims.panesY2 - p.lDims.panesY1)) {
        p.numPanesPerRow++;
    }
    // solPaneH = (height / width) * solPaneW / numPanesPerRow; // Why "3"?
    let solPaneScaleX = solPaneW / p.width;
    let solPaneScaleY = solPaneH / (p.lDims.currBestY2 - p.lDims.currBestY1);
    let solPaneScale = (solPaneScaleX < solPaneScaleY) ? solPaneScaleX : solPaneScaleY;

    for (let i = 0; i < p.bestRoutes.routes.length - 1; i++) {
        let currSol = p.bestRoutes.routes[i];
        let currOrder = currSol.order;
        let currDist = currSol.dist;

        let x = (i % p.numPanesPerRow) * solPaneW;
        let y = p.lDims.panesY1 + (Math.floor(i / p.numPanesPerRow) * solPaneH);
        // let y = lDims.panesY2 - (Math.floor(i / numPanesPerRow) * solPaneH) - solPaneH;

        p.push();
        p.translate(x, y);
        p.scale(solPaneScale);
        // scale(solPaneScaleX, solPaneScaleY);
        p.beginShape();
        p.stroke(76, 199, 199, 123);
        p.strokeWeight(3);
        p.noFill();
        for (let i = 0, length1 = currOrder.length; i < length1; i++) {
            p.vertex(currOrder[i].x, currOrder[i].y - p.lDims.currBestY1);
        }
        p.endShape();


        p.fill(199, 199);
        p.textSize(47);
        p.noStroke();
        p.text(Math.floor(currDist), 11, p.lDims.currBestY1);
        // text(currDist, 7, lDims.currBestY2 - lDims.currBestY1 - 7);
        // Draw cities
        p.noFill();
        p.stroke(47, 123, 199, 199);
        p.strokeWeight(0.5);
        // rectMode(CORNER);
        // rect(0, 0, width, lDims.currBestY2 - lDims.currBestY1);
        p.rect(1, 1, p.width - 2, (p.lDims.currBestY2 - p.lDims.currBestY1) - 2);
        p.fill(199, 199);
        currOrder.forEach(function (elt) {
            p.ellipse(elt.x, elt.y - p.lDims.currBestY1, 11, 11);
        });
        p.pop();
    }
};


// Show graph of the best solutions found over time.
// maximum x-axis is the current permutation number.
let renderBestRouteChart = function () {
    let maxDist = p.bestRoutes.routes[0].dist; // poor form, but overriding the global maxDist here
    p.beginShape();
    p.noFill();
    p.strokeWeight(1);

    //    let initScalePermCount = bestRoutes.routes[0].perm;
    p.bestRoutes.routes.forEach(function (elt, index) {
        let currDist = elt.dist;
        let currPermCount = elt.perm;
        // Random Checking
        // let cx = map(currPermCount, 0, totalPerms, 1, width);
        // Brute Force
        // let cx = map(currPermCount, 0, permCount, 1, width); // linear
        //        let cx = powMap(currPermCount, 1 / Math.E, initScalePermCount, permCount, 1, width); // exponential
        let cx = powMap(currPermCount, 1 / Math.E, 0, p.permCount, 1, p.width); // exponential

        // let cy = map(currDist, 0, maxDist, 0, height / 4);
        let cy = p.map(currDist, 0, maxDist, p.lDims.solGraphY2 - p.textAscent(), p.lDims.solGraphY1);
        if (currDist === p.shortestDist) {
            p.fill(199, 0, 199, 199);
            p.textSize(14);
            p.noStroke();
            let tcx;
            if (cx > p.width - p.textWidth(Math.floor(currDist)) - 11 - 11) {
                tcx = cx - p.textWidth(Math.floor(currDist)) - 11;
            } else {
                tcx = cx + 11;
            }
            p.text(Math.floor(currDist), tcx, cy + p.textAscent());
            // text(currDist, tcx, height - (height / 3) - cy + textAscent());
        }
        let sClr = (currDist === p.shortestDist ? p.color(199, 0, 199) : p.color(123, 199, 199));
        let sWgt = (currDist === p.shortestDist ? 2.5 : 0.5);
        p.stroke(sClr);
        p.strokeWeight(sWgt);
        p.line(cx, p.lDims.solGraphY2 - p.textAscent(), cx, cy);
        // line(cx, height - (height / 3), cx, height - (height / 3) - cy);

        p.strokeWeight(1);
        p.noFill();
        p.stroke(123, 199, 199);
        p.vertex(cx, cy);
        // vertex(cx, height - (height / 3) - cy);
    });
    p.endShape();


    let xScaleVal = p.permCount;
    while (xScaleVal > 1) {
        xScaleVal = getNextOrdMagVal(xScaleVal);
        let scaleX = powMap(xScaleVal, 1 / Math.E, 0, p.permCount, 1, p.width); // exponential
        let scaleY = p.lDims.solGraphY2 - p.textAscent();
        p.stroke(199, 199);
        p.strokeWeight(1);
        p.point(scaleX, scaleY);
        p.fill(123);
        p.noStroke();
        p.text(numberWithCommas(xScaleVal), scaleX, scaleY);

        xScaleVal = xScaleVal - 1;
    }




    // render (linear) scale
    // Brute Force - these next two loops
    let totalPermsDist = (p.width / p.permCount) * p.totalPerms; // why is this here?? max length of the scale (even beyond edge of canvas)
    // for (let i = 0; i < 100; i += 1) {
    //     let scaleX = map(i, 0, 100, 0, totalPermsDist);

    //     let scaleY = lDims.solGraphY2 - textAscent();
    //     stroke(199, 199);
    //     strokeWeight(1);
    //     point(scaleX, scaleY);
    // }
    for (let i = 0; i < 100; i += 5) {
        p.textSize(11);
        let scaleX = p.map(i, 0, 100, 0, totalPermsDist);
        let scaleY = p.lDims.solGraphY2;
        // let scaleY = lDims.solGraphY2 + textAscent() + 3;
        p.fill(199, 199);
        p.noStroke();
        // text("" + i + "%", scaleX, scaleY);
    }
};


let renderCities = function (cArr) {
    // Render the 'city' locations
    cArr.forEach(function (c, index) {
        p.strokeWeight(3);
        p.stroke(199, 199);
        p.noFill();
        p.ellipse(c.x, c.y, 11, 11);
    });
};


////////////////////////////////////////////////////////////////////////////////
// Genetic Algorithm
/**
 * Fisher–Yates Shuffle Algorithm
 * From https://stackoverflow.com/a/6274381/610406
 * Shuffles array in place
 */
let fyShuffle = function (arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};


////////////////////////////////////////////////////////////////////////////////
// Random Checking
let randomizeArray = function (arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
};


let setNewBestRoute = function (nbrObj) { // new best route Object
    nbrObj.routeIdx = ++p.routeCount; //
    p.bestRoutes.routes.push(nbrObj);
};


let swap = function (arr, i, j) {
    let tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    return arr;
};


let calcDist = function (arr) {
    let d = 0;
    for (let i = 0; i < arr.length - 1; i++) {
        // d += arr[i].dist(arr[i + 1]);
        // let distKey = "" + Math.floor(arr[i].x).toString() + Math.floor(arr[i].y).toString() + Math.floor(arr[i + 1].x).toString() + Math.floor(arr[i + 1].y).toString();
        let distKey = getDistKey(arr[i], arr[i + 1]);
        // console.log("distLookup has this key? " + distKey + ": " + distLookup.has(distKey));
        d += p.distLookup.get(getDistKey(arr[i], arr[i + 1]));
    }
    return d;
};

let getDistKey = function (a, b) {
    a = Math.floor(a.x).toString() + Math.floor(a.y).toString();
    b = Math.floor(b.x).toString() + Math.floor(b.y).toString();

    let dKey = p.distLookup.has(a + "-" + b) ? (a + "-" + b) : (b + "-" + a);
    return dKey;
};



// Brute Force
// lexical ordering algorithm
let nextLexOrder = function () {
    let largestI = -1;
    for (let i = 0; i < p.order.length - 1; i++) {
        if (p.order[i] < p.order[i + 1]) {
            largestI = i;
        }
    }

    if (largestI === -1) {
        //   noLoop();
        console.log('finished');
        p.searching = false;
    }

    // Lex ordering Step 2
    let largestJ = -1;
    for (let j = 0; j < p.order.length; j++) {
        if (p.order[largestI] < p.order[j]) {
            largestJ = j;
        }
    }

    // Lex ordering Step 3
    swap(p.order, largestI, largestJ);

    let endArray = p.order.splice(largestI + 1);
    endArray.reverse();
    p.order = p.order.concat(endArray);
};


let reOrderCities = function (oArr, cArr) {
    let newOrderArr = [];
    for (let i = 0; i < oArr.length; i++) {
        let nextCity = cArr[oArr[i]];
        newOrderArr.push(nextCity);
    }
    return newOrderArr;
};


let precalcCityDistances = function (citiesArr) {
    // Precalculate the distances between all the cities
    // Store the distances in a Map() object
    // format of key : value is as follows
    // if the x, y vals are 47.76 and 123.199 for the first city and 11.18 and 29.47 for the second city then the key is a string of "47123-1129"
    // the distance is just a number representing the cartesian distance between the two cities.
    // "47123-1129" : 134.7
    let distLookupTable = new Map();
    for (let i = 0; i < citiesArr.length; i++) {
        let c1 = citiesArr[i];
        for (let j = i + 1; j < citiesArr.length; j++) {

            let c2 = citiesArr[j];
            let d = c1.dist(c2);
            let keyLabel = getDistKey(c1, c2); // returns the distance key for these two strings
            // ??????????????? why not using keyLabel var here?
            // distLookup.set(Math.floor(c1.x).toString() + Math.floor(c1.y).toString() + "-" + Math.floor(c2.x).toString() + Math.floor(c2.y).toString(), d);
            distLookupTable.set(keyLabel, d);
        }
    }
    return distLookupTable;
};

// Add comma's to large numbers
// From: https://stackoverflow.com/a/2901298/610406
const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};



let getNextOrdMagVal = function (n) {
    // function from https://stackoverflow.com/a/23917134/610406
    let magOrd = Math.floor(Math.log(n) / Math.LN10 + 0.000000001); // because float math sucks like that
    return Math.pow(10, magOrd);
};



// Exponential horizontal scale
let powMap = function (incr, base, start1, stop1, start2, stop2) {
    // base should be an inverse (eg 1/2), start1/stop1 are the value range, start2/stop2 are the output range
    let normX = p.map(incr, start1, stop1, 0, 1);
    let newX = p.pow(normX, base);
    return p.map(newX, 0, 1, start2, stop2);



    // float mapCubed(float value, float start1, float stop1, float start2, float stop2) {
    //   float inT = map(value, start1, stop1, 0, 1);
    //   float outT = inT * inT * inT;
    //   return map(outT, 0, 1, start2, stop2);
    // }

    //     return x;
};

// factorial calcuator function
let fact = function (num) {
    let f = 1;
    for (let i = 2; i <= num; i++) {
        f = f * i;
    }
    return f;
};



p.keyTyped = function () {
    if (p.key === 'p') {
        if (p.play) {
            p.play = false;
            // p.noLoop();

        } else {
            p.play = true;
            // p.loop();
        }
        console.log("play is now " + p.play);
    } else if (p.key === 'b') {
        //   value = 0;
    }
    // uncomment to prevent any default behavior
    // return false;
};



// UI Component
window.onload = function () {
    let gui = new dat.GUI();
    gui.add(p, "totalCities", 0, 199);
    gui.add(p, "popSize", 0, 10000, 500);
    gui.add(p, "mSwapRate", 0, 1, 2.0 / 47.0);
    let playPause = gui.add(p, "play").listen();
    playPause.onFinishChange(function (v) {
        p.play = (v) ? true : false;
    });
};
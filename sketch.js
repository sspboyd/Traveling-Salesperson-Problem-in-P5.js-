'use strict';

const PHI = 1.618033988749894848204586834;

// Variables Common to All Algoritmic Approaches
const totalCities = 11;
const cities = []; // array to hold p5.vector objects for city locations
let order = []; // array matched with cities[] to identify the different cities and help with reordering
const totalPerms = perms[totalCities - 1]; // look up the number of different permutations from perms[]
const lDims = {}; // layout Dimensions. An object to hold vars used for onscreen layout
let distLookup = new Map(); // Map object to hold precalculated distances between cities.
let maxDist = 0;
let shortestDist = Infinity;
let shortestDistOrder = []; // Genetic Algorithm
let shortestDistScores = []; // list of the best route distances found
let routeCount = 0; // number of new 'best' routes found;
let permCount = 100; // counter to track permutations since beginning

let bestRoutes = {
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
let searching = true; // true if there are more permutations to check

// Genetic Algorithm Specific Variables
let population = [];
let fitness = []; // make pop and fitness arrays into an object later with {pops:[{order: [0,1,2,3,4], fitness: 0.47}]
let popSize = 1000000;


////////////////////////////////////////////////////////////////////////////////
function setup() {
    // createCanvas(810, 810);
    createCanvas(900, 650);

    // Set "lDims", layout dimensions
    // Top and bottom of the current best solution area
    lDims.currBestY1 = 100;
    lDims.currBestY2 = height - (height / PHI);
    // The top and bottom of the screen area where previous best routes are shown
    lDims.panesY1 = height / PHI;
    lDims.panesY2 = height;
    // Top and bottom of the best routes graph area
    lDims.solGraphY2 = lDims.panesY1;
    lDims.solGraphY1 = lDims.currBestY2;

    // Object holding dimensions for the cities to be located within.
    const cBox = {};
    cBox.x1 = 11;
    cBox.y1 = lDims.currBestY1;
    cBox.x2 = width - cBox.x1;
    cBox.y2 = lDims.currBestY2;

    // Create city p5.vectors and set their locations
    for (let i = 0; i < totalCities; i++) {
        // let v = createVector(Math.random() * (width * .9) + (width * 0.05), map(Math.random(), 0, 1, 100, height / 3 - 11));
        let v = createVector(map(Math.random(), 0, 1, cBox.x1, cBox.x2), map(Math.random(), 0, 1, cBox.y1, cBox.y2));
        cities[i] = v;
        order[i] = i;
    }

    // Calculate all the distances between each city
    distLookup = precalcCityDistances(cities);


    // Genetic Algorithm
    // there's going to be a lot of refactoring going on here.
    for (let i = 0; i < popSize; i++) {
        population[i] = cities.slice();
        population[i] = fyShuffle(population[i]);
    }
    for (let i = 0; i < population.length; i++) {
        let d = calcDist(population[i]);
        if (d < shortestDist) {
            shortestDist = d;
            shortestDistOrder = population[i];
        }
        fitness[i] = d;
    }

}


////////////////////////////////////////////////////////////////////////////////
function draw() {
    background(0, 18, 29);

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
    //     newBest.routeIdx = ++routeCount;
    //     bestRoutes.routes.push(newBest);
    // }

    renderCurrShortestRoute(shortestDistOrder);
    // Random and Brute Force
    // renderCurrShortestRoute(bestRoutes.routes[bestRoutes.routes.length - 1].order);
    // renderNewRouteAttempt(newCityOrder);

    // renderBestRoutePanes();
    // renderBestRouteChart();

    renderCities(cities);
    renderTitles();

    // Brute Force
    // if (searching) {
    //     nextLexOrder(); // updates order[] to next Lexicographic Order for the cities
    // } else {
    //     noLoop();
    // }
    // permCount++;
}


////////////////////////////////////////////////////////////////////////////////
function renderTitles() {
    //Title
    noStroke();
    fill(199);
    textSize(18);
    text("The Travelling Salesperson Problem", 11, 29);
    textSize(14);
    text("What is the shortest possible route that visits each city?", 11, 47);

    let txtY = height / 3 * 2;
    fill(199, 199);

    // Brute Force
    // let pctComplete = permCount / totalPerms * 100;
    // let s = pctComplete < 0.001 ? "> 0.01" : pctComplete.toFixed(2);
    // Brute Force
    // text("Checking " + totalPerms + " different combinations using brute force lexicographic ordering.\n" + s + "% complete.\n" + Math.floor(permCount / (millis() / 1000)) + " routes per second.", 11, lDims.currBestY1 - (textAscent() * 2) - 1);
}


function renderCurrShortestRoute(csrArr) {
    // Draw the current shortest path
    beginShape();
    stroke(199, 0, 199);
    strokeWeight(2);
    noFill();
    for (let i = 0, length1 = csrArr.length; i < length1; i++) {
        vertex(csrArr[i].x, csrArr[i].y);
    }
    endShape();
}


function renderNewRouteAttempt(ncoArr) {
    // draw new path attempts
    noFill();
    stroke(255, 123);
    strokeWeight(.5);
    beginShape();
    for (let i = 0, length1 = ncoArr.length; i < length1; i++) {
        vertex(ncoArr[i].x, ncoArr[i].y);
    }
    endShape();
}


function renderBestRoutePanes() {
    let numPanesPerRow = 3; // initial # of solution panes per row. This changes as more solutions are found.

    let solPaneW = width / numPanesPerRow;
    let solPaneH = (lDims.panesY2 - lDims.panesY1) / numPanesPerRow;

    if (((bestRoutes.routes.length - 1) / numPanesPerRow * solPaneH) > (lDims.panesY2 - lDims.panesY1)) {
        numPanesPerRow++;
    }
    // solPaneH = (height / width) * solPaneW / numPanesPerRow; // Why "3"?
    let solPaneScaleX = solPaneW / width;
    let solPaneScaleY = solPaneH / (lDims.currBestY2 - lDims.currBestY1);
    let solPaneScale = (solPaneScaleX < solPaneScaleY) ? solPaneScaleX : solPaneScaleY;

    for (let i = 0; i < bestRoutes.routes.length - 1; i++) {
        let currSol = bestRoutes.routes[i];
        let currOrder = currSol.order;
        let currDist = currSol.dist;

        let x = (i % numPanesPerRow) * solPaneW;
        let y = lDims.panesY1 + (Math.floor(i / numPanesPerRow) * solPaneH);
        // let y = lDims.panesY2 - (Math.floor(i / numPanesPerRow) * solPaneH) - solPaneH;

        push();
        translate(x, y);
        scale(solPaneScale);
        // scale(solPaneScaleX, solPaneScaleY);
        beginShape();
        stroke(76, 199, 199, 123);
        strokeWeight(3);
        noFill();
        for (let i = 0, length1 = currOrder.length; i < length1; i++) {
            vertex(currOrder[i].x, currOrder[i].y - lDims.currBestY1);
        }
        endShape();


        fill(199, 199);
        textSize(47);
        noStroke();
        text(Math.floor(currDist), 11, lDims.currBestY1);
        // text(currDist, 7, lDims.currBestY2 - lDims.currBestY1 - 7);
        // Draw cities
        noFill();
        stroke(47, 123, 199, 199);
        strokeWeight(.5);
        // rectMode(CORNER);
        // rect(0, 0, width, lDims.currBestY2 - lDims.currBestY1);
        rect(1, 1, width - 2, (lDims.currBestY2 - lDims.currBestY1) - 2);
        fill(199, 199);
        currOrder.forEach(function(elt) {
            ellipse(elt.x, elt.y - lDims.currBestY1, 11, 11);
        });
        pop();
    }
}


// Show graph of the best solutions found overtime.
// maximum x-axis is the current permutation number.
function renderBestRouteChart() {
    let maxDist = bestRoutes.routes[0].dist; // poor form, but overriding the global maxDist here
    beginShape();
    noFill();
    strokeWeight(1);

    bestRoutes.routes.forEach(function(elt, index) {
        let currDist = elt.dist;
        let currPermCount = elt.perm;
        // Random Checking
        // let cx = map(currPermCount, 0, totalPerms, 1, width);
        // Brute Force
        let cx = map(currPermCount, 0, permCount, 1, width);
        // let cy = map(currDist, 0, maxDist, 0, height / 4);
        let cy = map(currDist, 0, maxDist, lDims.solGraphY2 - textAscent(), lDims.solGraphY1);
        if (currDist === shortestDist) {
            fill(199, 0, 199, 199);
            textSize(14);
            noStroke();
            let tcx;
            if (cx > width - textWidth(Math.floor(currDist)) - 11 - 11) {
                tcx = cx - textWidth(Math.floor(currDist)) - 11;
            } else {
                tcx = cx + 11;
            }
            text(Math.floor(currDist), tcx, cy + textAscent());
            // text(currDist, tcx, height - (height / 3) - cy + textAscent());
        }
        let sClr = (currDist === shortestDist ? color(199, 0, 199) : color(123, 199, 199));
        let sWgt = (currDist === shortestDist ? 2.5 : .5);
        stroke(sClr);
        strokeWeight(sWgt);
        line(cx, lDims.solGraphY2 - textAscent(), cx, cy);
        // line(cx, height - (height / 3), cx, height - (height / 3) - cy);

        strokeWeight(1);
        noFill();
        stroke(123, 199, 199);
        vertex(cx, cy);
        // vertex(cx, height - (height / 3) - cy);
    });
    endShape();

    // render scale
    // Brute Force - these next two loops
    let totalPermsDist = (width / permCount) * totalPerms;
    for (let i = 0; i < 100; i += 1) {
        let scaleX = map(i, 0, 100, 0, totalPermsDist);
        let scaleY = lDims.solGraphY2 - textAscent();
        stroke(199, 199);
        strokeWeight(1);
        point(scaleX, scaleY);
    }
    for (let i = 0; i < 100; i += 5) {
        textSize(11);
        let scaleX = map(i, 0, 100, 0, totalPermsDist);
        let scaleY = lDims.solGraphY2;
        // let scaleY = lDims.solGraphY2 + textAscent() + 3;
        fill(199, 199);
        noStroke();
        text("" + i + "%", scaleX, scaleY);
    }
}


function renderCities(cArr) {
    // Render the 'city' locations
    cArr.forEach(function(c, index) {
        strokeWeight(3);
        stroke(199, 199);
        noFill();
        ellipse(c.x, c.y, 11, 11);
    });
}


////////////////////////////////////////////////////////////////////////////////
// Genetic Algorithm
/**
 * Fisher–Yates Shuffle Algorithm
 * From https://stackoverflow.com/a/6274381/610406
 * Shuffles array in place
 */
function fyShuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}


////////////////////////////////////////////////////////////////////////////////
// Random Checking
function randomizeArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}


function swap(arr, i, j) {
    let tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
    return arr;
}


function calcDist(arr) {
    let d = 0;
    for (let i = 0; i < arr.length - 1; i++) {
        // d += arr[i].dist(arr[i + 1]);
        // let distKey = "" + Math.floor(arr[i].x).toString() + Math.floor(arr[i].y).toString() + Math.floor(arr[i + 1].x).toString() + Math.floor(arr[i + 1].y).toString();
        let distKey = getDistKey(arr[i], arr[i + 1]);
        // console.log("distLookup has this key? " + distKey + ": " + distLookup.has(distKey));
        d += distLookup.get(getDistKey(arr[i], arr[i + 1]));
    }
    return d;
}


function getDistKey(a, b) {
    a = Math.floor(a.x).toString() + Math.floor(a.y).toString();
    b = Math.floor(b.x).toString() + Math.floor(b.y).toString();

    let dKey = distLookup.has(a + "-" + b) ? (a + "-" + b) : (b + "-" + a);
    return dKey;
}




// Brute Force
// lexical ordering algorithm
function nextLexOrder() {
    let largestI = -1;
    for (let i = 0; i < order.length - 1; i++) {
        if (order[i] < order[i + 1]) {
            largestI = i;
        }
    }

    if (largestI === -1) {
        //   noLoop();
        console.log('finished');
        searching = false;
    }

    // Lex ordering Step 2
    let largestJ = -1;
    for (let j = 0; j < order.length; j++) {
        if (order[largestI] < order[j]) {
            largestJ = j;
        }
    }

    // Lex ordering Step 3
    swap(order, largestI, largestJ);

    let endArray = order.splice(largestI + 1);
    endArray.reverse();
    order = order.concat(endArray);
}


function reOrderCities(oArr, cArr) {
    let newOrderArr = [];
    for (let i = 0; i < oArr.length; i++) {
        let nextCity = cArr[oArr[i]];
        newOrderArr.push(nextCity);
    }
    return newOrderArr;
}


function precalcCityDistances(citiesArr) {
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
}


// factorial calcuator function
function fact(num) {
    let f = 1;
    for (let i = 2; i <= num; i++) {
        f = f * i;
    }
    return f;
}

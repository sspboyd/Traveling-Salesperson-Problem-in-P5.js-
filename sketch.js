let order = [];



let cities = [];
let totalCities = 7;
let shortestDistOrder = [];
let shortestDist = Infinity;
let shortestDistScores = [];
let totalPerms = fact(totalCities);
let permCount=1;

function setup() {
    createCanvas(400, 800);
    for (i = 0; i < totalCities; i++) {
        let v = createVector(Math.random() * width, Math.random() * height);
        cities[i] = v;
        order[i] = i;
    }
    console.log("order: " + order);
}

function draw() {
    background(0);

    cities.forEach(function(c, index) {
        noStroke();
        fill(123);
        ellipse(c.x, c.y, 10, 10);
    });

    beginShape();
    stroke(199);
    strokeWeight(.5);
    fill(199,18);
    for (let i = 0, length1 = cities.length; i < length1; i++) {
        vertex(cities[i].x, cities[i].y);
    }
    endShape();

    beginShape();
    stroke(199, 0, 199);
    strokeWeight(2);
    noFill();
    for (let i = 0, length1 = shortestDistOrder.length; i < length1; i++) {
        vertex(shortestDistOrder[i].x, shortestDistOrder[i].y);
    }
    endShape();


    let currDist = calcDist(cities);
    if (currDist < shortestDist) {
        shortestDist = currDist;
        shortestDistScores.push(currDist);
        shortestDistOrder = cities.slice();
    }

    fill(123);
    noStroke();
    text("Current Shortest Distance: " + shortestDist, 10, 10);
    text("Prev Best Scores: " + shortestDistScores, 10, 25, width - 10, height - 35);

    // cities = randomizeArray(cities);
    for (let i = 0, length1 = order.length; i < length1; i++) {
        swap(cities, i, order[i]);
    }

    let s = "order: ";
    for (let i = 0; i < order.length; i++) {
        s += order[i];
    }
    fill(199);
    // console.log("s: "+s);
    // let percentComplete =
    text((permCount/totalPerms*100).toFixed(3) + "% complete", 10, height - 50);

    permCount++;
    nextOrder();
}


function randomizeArray(arr) {
    for (i = arr.length - 1; i > 0; i--) {
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
        d += Math.floor(arr[i].dist(arr[i + 1]));
    }
    return d;
}


// lexical ordering algorithm
function nextOrder() {
    let largestI = -1;
    for (var i = 0; i < order.length - 1; i++) {
        if (order[i] < order[i + 1]) {
            largestI = i;
        }
    }

    if (largestI === -1) {
        noLoop();
        console.log('finished');
    }

    // Lex ordering Step 2
    let largestJ = -1;
    for (var j = 0; j < order.length; j++) {
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



function fact(num) {
    let f = 1;
    for (var i = 2; i <= num; i++) {
        f = f * i;
    }
    return f;
}

let cities = [];
let totalCities = 7;
let shortestDistOrder = [];
let shortestDist = Infinity;
let shortestDistScores = [];


function setup() {
    createCanvas(400, 300);
    for (i = 0; i < totalCities; i++) {
        let v = createVector(Math.random() * width, Math.random() * height);
        cities[i] = v;
    }
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
    noFill();
    for (let i = 0, length1 = cities.length; i < length1; i++) {
        vertex(cities[i].x, cities[i].y);
    }
    endShape();

    beginShape();
    stroke(199,0,199);
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
    text("Prev Best Scores: " + shortestDistScores, 10, 25);

    cities = randomizeArray(cities);
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

function calcDist(arr) {
    let d = 0;
    for (let i = 0; i < arr.length - 1; i++) {
        d += Math.floor(arr[i].dist(arr[i + 1]));
    }
    return d;
}

// Generate Initial Population using shuffle
function genPop() {
    for (let i = 0; i < p.popSize; i++) {
        p.population[i] = p.cities.slice();
        p.population[i] = fyShuffle(p.population[i]);
    }
}



// Calculate Fitness
function calcFitness() {
    let currGenBestRoute = {};
    currGenBestRoute.dist = Infinity;
    for (let i = 0; i < p.population.length; i++) {
        let d = calcDist(p.population[i]);
        p.fitness[i] = 1 / (p.pow(d, 3) + 1);

        if (d < currGenBestRoute.dist) {
            currGenBestRoute.dist = d;
            currGenBestRoute.order = p.population[i];
            currGenBestRoute.perm = p.permCount; // number of permutations to date to get to this
            currGenShortestDistOrder = currGenBestRoute.order;
        }
        p.permCount++;
    }
    if (currGenBestRoute.dist < p.shortestDist) {
        setNewBestRoute(currGenBestRoute);
        p.shortestDist = currGenBestRoute.dist;
    }
}


function normFitness() {
    let sum = 0;
    p.fitness.forEach(function(elt) {
        sum += elt;
    });
    for (let i = 0; i < p.fitness.length; i++) {
        p.fitness[i] = p.fitness[i] / sum;
    }
}


function nextGen() {
    let newPop = [];
    for (let i = 0; i < p.population.length; i++) {
        let order = pickOne(p.population, p.fitness); // order is a p5.vector array
        mutateSwap(order, p.mSwapRate);
        newPop[i] = order;
    }
    p.population = newPop;
}


function pickOne(popArr, probs) {
    let index = 0;
    let r = Math.random();

    while (r > 0) {
        r = r - probs[index];
        index++;
    }
    index--;
    return popArr[index].slice();
}


function mutateSwap(cArr, mRate) {
    let numSwaps = Math.ceil(mRate * cArr.length);

    for (let i = 0; i < numSwaps; i++) {
        let indexA = Math.floor(p.random(cArr.length));
        let indexB = Math.floor(p.random(cArr.length));
        swap(cArr, indexA, indexB);
    }
    return cArr;
}

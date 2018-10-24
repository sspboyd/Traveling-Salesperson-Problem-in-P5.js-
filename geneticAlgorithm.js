// Generate Initial Population using shuffle
function genPop() {
    for (let i = 0; i < popSize; i++) {
        population[i] = cities.slice();
        population[i] = fyShuffle(population[i]);
    }
}



// Calculate Fitness
function calcFitness() {
    let currGenBestRoute = {};
    currGenBestRoute.dist = Infinity;
    for (let i = 0; i < population.length; i++) {
        let d = calcDist(population[i]);
        fitness[i] = 1 / (pow(d, 3) + 1);

        if (d < currGenBestRoute.dist) {
            currGenBestRoute.dist = d;
            currGenBestRoute.order = population[i];
            currGenBestRoute.perm = permCount; // number of permutations to date to get to this
            currGenShortestDistOrder = currGenBestRoute.order;
        }
        permCount++;
    }
    if (currGenBestRoute.dist < shortestDist) {
        setNewBestRoute(currGenBestRoute);
        shortestDist = currGenBestRoute.dist;

    }

}


function normFitness() {
    let sum = 0;
    fitness.forEach(function(elt) {
        sum += elt;
    });
    for (let i = 0; i < fitness.length; i++) {
        fitness[i] = fitness[i] / sum;
    }
}


function nextGen() {
    let newPop = [];
    for (let i = 0; i < population.length; i++) {
        let order = pickOne(population, fitness); // order is a p5.vector array
        mutateSwap(order, mSwapRate);
        newPop[i] = order;
    }
    population = newPop;
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
        let indexA = Math.floor(random(cArr.length));
        let indexB = Math.floor(random(cArr.length));
        swap(cArr, indexA, indexB);
    }
    return cArr;
}

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
    for (let i = 0; i < p.population.length; i++) { // using a for loop here bc need an index to match with fitness[]
        let d = calcDist(p.population[i]);
        p.fitness[i] = 1 / (p.pow(d, 3) + 1);

        if (d < currGenBestRoute.dist) {
            currGenBestRoute.dist = d; // change these variable declarations to an object property assignment thing.
            currGenBestRoute.order = p.population[i];
            currGenBestRoute.perm = p.permCount; // number of permutations to date to get to this
            p.currGenShortestDistOrder = currGenBestRoute.order;
        }
        p.permCount++; // possible optimization here of moving this line outside of for loop and doing permCount += p.population.length
    }
    if (currGenBestRoute.dist < p.shortestDist) {
        setNewBestRoute(currGenBestRoute);
        p.shortestDist = currGenBestRoute.dist;
    }
}


function normFitness() {
    let sum = 0;
    p.fitness.forEach(function(elt) { // keeping forEach instead of map() bc forEach is faster.
        sum += elt;
    });
    for (let i = 0; i < p.fitness.length; i++) {
        p.fitness[i] = p.fitness[i] / sum;
    }
}


function nextGen() {
    let newPop = [];
    for (let i = 0; i < p.population.length; i++) {
        let newOrder = pickOne(p.population, p.fitness); // order is a p5.vector array. What's relationship between population and fitness array again?()
        mutateSwap(newOrder, p.mSwapRate);
        newPop[i] = newOrder;
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
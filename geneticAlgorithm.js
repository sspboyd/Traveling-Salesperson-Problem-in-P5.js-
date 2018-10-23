// Generate Populations
function genPop() {
    for (let i = 0; i < popSize; i++) {
        population[i] = cities.slice();
        population[i] = fyShuffle(population[i]);
    }
}
// Calculate Fitness
function calcFitness() {
    for (let i = 0; i < population.length; i++) {
        let d = calcDist(population[i]);
        if (d < shortestDist) {
            shortestDist = d;
            shortestDistOrder = population[i];
        }
        fitness[i] = 1 / (pow(d,4) + 1);
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
        mutate(order);
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


function mutate(cArr, mRate) {
    let indexA = Math.floor(random(cArr.length));
    let indexB = Math.floor(random(cArr.length));
    swap(cArr, indexA, indexB);
    return cArr;
}

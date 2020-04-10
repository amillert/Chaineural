"use strict";
var cos3 = {
    docType: 'minibatchPrivateInfo',
    minibatchNumber: 15,
    epochName: 'epoch1',
    learningTime: '"1.23"',
    loss: '"0.12"'
};
console.log(parseFloat(cos3.loss.toString().replace('"', '')));
var cos4 = parseFloat(cos3.loss.toString().replace('"', '')) + 1;
console.log(cos4);
// const sumLearningTime = allResults.map(a => (a.learningTime as number)).reduce((a, b) => a + b, 0);
// const avgLearningTime = (sumLearningTime / allResults.length) || 0;
// const sumLoss = allResults.map(a => (a.loss)).reduce((a, b) => (a as number) + (b as number), 0);
// const avgLoss = (sumLoss as number / allResults.length) || 0;
// let result = {
//     'avgLearningTime': avgLearningTime,
//     'avgLoss': avgLoss
// }
// console.log(result);
//# sourceMappingURL=test.js.map
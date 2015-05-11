var synaptic = require('synaptic');
var Layer = synaptic.Layer, Network = synaptic.Network, Trainer = synaptic.Trainer;

//var inputLayer = new Layer(2);
//var outputLayer = new Layer(1);
//
//inputLayer.project(outputLayer);
//
//var network = new Network({
//  input: inputLayer,
//  output: outputLayer
//});
//
//var trainer = new Trainer(network);
//
//var trainingSet = [{
//  input: [1, 2, 3],
//  output: [1]
//}, {
//  input: [2, 3, 4],
//  output: [2]
//}, {
//  input: [4, 5, 6],
//  output: [4]
//}];
//
//trainer.train(trainingSet, {
//  iterations: 1000,
//  error: .001
//});
//
//var r = network.activate([3, 4, 5]);
//console.log(r);

var dictionary = "0123456789qwertyuiopasdfghjklzxcvbnm,.()'- ".split("");
var keys = {};
for (var i in dictionary) keys[dictionary[i]] = +i;

var Net = new Architect.LSTM(dictionary.length, 50, dictionary.length); // # Memory Blocks, 50
var worker = Net.worker();
// Unit tests for reactive-property.
const assert = require("assert");

// If using from the NPM package, this line would be
// var Graph = require("graph-data-structure");
const Graph = require("./index.js");

const outputGraph = require("graph-diagrams")({
	// If true, writes graph files to ../graph-diagrams for visualization.
	outputGraphs: false,
	project: "graph-data-structure",
});

const output = (graph, name) => {
	outputGraph(graph.serialize(), name);
};

describe("Graph", () => {
	describe("Data structure", () => {
		it("Should add nodes and list them.", () => {
			const graph = Graph();
			graph.addNode({id: "a", name: "I'm node a"});
			graph.addNode({id: "b", name: "I'm node b"});
			assert.equal(graph.nodes().length, 2);
			assert(contains(graph.nodes(), "a"));
			assert(contains(graph.nodes(), "b"));
			output(graph, "ab-nodes");
		});

		it("Should chain addNode.", function () {
			var graph = Graph()
				.addNode({id: "a", name: "I'm node a"})
				.addNode({id: "b", name: "I'm node b"});
			assert.equal(graph.nodes().length, 2);
			assert(contains(graph.nodes(), "a"));
			assert(contains(graph.nodes(), "b"));
		});
	});
});

// TODO: Check params name
const contains = (arr, id) => {
	return (
		arr.filter(function (d) {
			return d === id;
		}).length > 0
	);
};

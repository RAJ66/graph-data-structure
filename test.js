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

		it("Should chain addNode.", () => {
			const graph = Graph()
				.addNode({id: "a", name: "I'm node a"})
				.addNode({id: "b", name: "I'm node b"});
			assert.equal(graph.nodes().length, 2);
			assert(contains(graph.nodes(), "a"));
			assert(contains(graph.nodes(), "b"));
		});

		it("Should remove nodes.", () => {
			const graph = Graph();
			graph.addNode({id: "a", name: "I'm node a"});
			graph.addNode({id: "b", name: "I'm node b"});
			graph.removeNode("a");
			graph.removeNode("b");
			assert.equal(graph.nodes().length, 0);
		});

		it("Should chain removeNode.", () => {
			const graph = Graph()
				.addNode({id: "a", name: "I'm node a"})
				.addNode({id: "b", name: "I'm node b"})
				.removeNode("a")
				.removeNode("b");
			assert.equal(graph.nodes().length, 0);
		});

		it("Should add edges and query for adjacent nodes.", () => {
			const graph = Graph();
			graph.addNode({id: "a", name: "I'm node a"});
			graph.addNode({id: "b", name: "I'm node b"});
			graph.addEdge(
				{id: "a", name: "I'm node a"},
				{id: "b", name: "I'm node b"}
			);
			assert.equal(graph.adjacent({id: "a"}).length, 1);
			assert.equal(graph.adjacent({id: "a"})[0], "b");
			output(graph, "ab");
		});

		it("Should implicitly add nodes when edges are added.", () => {
			const graph = Graph();
			graph.addEdge(
				{id: "a", name: "I'm node a"},
				{id: "b", name: "I'm node b"}
			);
			assert.equal(graph.adjacent({id: "a"}).length, 1);
			assert.equal(graph.adjacent({id: "a"})[0], "b");
			assert.equal(graph.nodes().length, 2);
			assert(contains(graph.nodes(), "a"));
			assert(contains(graph.nodes(), "b"));
		});

		it("Should chain addEdge.", () => {
			const graph = Graph().addEdge(
				{id: "a", name: "I'm node a"},
				{id: "b", name: "I'm node b"}
			);
			assert.equal(graph.adjacent({id: "a"}).length, 1);
			assert.equal(graph.adjacent({id: "a"})[0], "b");
		});

		it("Should remove edges.", () => {
			const graph = Graph();
			graph.addEdge(
				{id: "a", name: "I'm node a"},
				{id: "b", name: "I'm node b"}
			);
			graph.removeEdge({id: "a"}, {id: "b"});
			assert.equal(graph.adjacent({id: "a"}).length, 0);
		});

		it("Should chain removeEdge.", function () {
			var graph = Graph()
				.addEdge({id: "a", name: "I'm node a"}, {id: "b", name: "I'm node b"})
				.removeEdge(
					{id: "a", name: "I'm node a"},
					{id: "b", name: "I'm node b"}
				);
			assert.equal(graph.adjacent({id: "a"}).length, 0);
		});
	});
});

// TODO: Check params name
// TODO: Remove node by node object id
const contains = (arr, id) => {
	return (
		arr.filter((d) => {
			return d === id;
		}).length > 0
	);
};

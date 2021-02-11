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

		it("Should chain removeEdge.", () => {
			const graph = Graph()
				.addEdge({id: "a", name: "I'm node a"}, {id: "b", name: "I'm node b"})
				.removeEdge(
					{id: "a", name: "I'm node a"},
					{id: "b", name: "I'm node b"}
				);
			assert.equal(graph.adjacent({id: "a"}).length, 0);
		});

		it("Should not remove nodes when edges are removed.", () => {
			const graph = Graph();
			graph.addEdge(
				{id: "a", name: "I'm node a"},
				{id: "b", name: "I'm node b"}
			);
			graph.removeEdge({id: "a"}, {id: "b"});
			assert.equal(graph.nodes().length, 2);
			assert(contains(graph.nodes(), "a"));
			assert(contains(graph.nodes(), "b"));
		});

		it("Should remove outgoing edges when a node is removed.", () => {
			const graph = Graph();
			graph.addEdge(
				{id: "a", name: "I'm node a"},
				{id: "b", name: "I'm node b"}
			);
			graph.removeNode("a");
			assert.equal(graph.adjacent({id: "a"}).length, 0);
		});

		it("Should remove incoming edges when a node is removed.", () => {
			const graph = Graph();
			graph.addEdge(
				{id: "a", name: "I'm node a"},
				{id: "b", name: "I'm node b"}
			);
			graph.removeNode("b");
			assert.equal(graph.adjacent({id: "a"}).length, 0);
		});

		it("Should compute indegree.", () => {
			const graph = Graph();
			graph.addEdge(
				{id: "a", name: "I'm node a"},
				{id: "b", name: "I'm node b"}
			);
			assert.equal(graph.indegree("a"), 0);
			assert.equal(graph.indegree("b"), 1);

			graph.addEdge(
				{id: "c", name: "I'm node c"},
				{id: "b", name: "I'm node b"}
			);
			assert.equal(graph.indegree("b"), 2);
		});

		it("Should compute outdegree.", () => {
			const graph = Graph();
			graph.addEdge(
				{id: "a", name: "I'm node a"},
				{id: "b", name: "I'm node b"}
			);
			assert.equal(graph.outdegree("a"), 1);
			assert.equal(graph.outdegree("b"), 0);

			graph.addEdge(
				{id: "a", name: "I'm node a"},
				{id: "c", name: "I'm node c"}
			);
			assert.equal(graph.outdegree("a"), 2);
		});
	});

	describe("Algorithms", () => {
		// This example is from Cormen et al. "Introduction to Algorithms" page 550
		it("Should compute topological sort.", () => {
			const graph = Graph();

			// Shoes depend on socks.
			// Socks need to be put on before shoes.
			graph.addEdge(
				{id: "socks", name: "I'm socks", size: 1},
				{id: "shoes", name: "I'm shoes", size: 10}
			);
			graph.addEdge(
				{id: "shirt", name: "I'm shirt", size: 2},
				{id: "belt", name: "I'm belt"}
			);
			graph.addEdge(
				{id: "shirt", name: "I'm shirt", size: 1},
				{id: "tie", name: "I'm tie"}
			);
			graph.addEdge(
				{id: "tie", name: "I'm tie"},
				{id: "jacket", name: "I'm jacket", size: 4}
			);
			graph.addEdge(
				{id: "belt", name: "I'm belt"},
				{id: "jacket", name: "I'm jacket", size: 4}
			);
			graph.addEdge(
				{id: "pants", name: "I'm pants"},
				{id: "shoes", name: "I'm shoes", size: 10}
			);
			graph.addEdge(
				{id: "underpants", name: "I'm underpants"},
				{id: "pants", name: "I'm pants"}
			);
			graph.addEdge(
				{id: "pants", name: "I'm pants"},
				{id: "belt", name: "I'm belt"}
			);

			const sorted = graph.topologicalSort();
			console.log("...", sorted);
			assert(comesBefore(sorted, "pants", "shoes"));
			assert(comesBefore(sorted, "underpants", "pants"));
			assert(comesBefore(sorted, "underpants", "shoes"));
			assert(comesBefore(sorted, "shirt", "jacket"));
			assert(comesBefore(sorted, "shirt", "belt"));
			assert(comesBefore(sorted, "belt", "jacket"));

			assert.equal(sorted.length, 8);

			output(graph, "getting-dressed");
		});
	});
});

// TODO: Check params name
// TODO: Remove node by node object id
// TODO: Check method indegree, outdegree
const contains = (arr, id) => {
	return (
		arr.filter((d) => {
			return d === id;
		}).length > 0
	);
};

function comesBefore(arr, a, b) {
	var aIndex, bIndex;
	arr.forEach(function (d, i) {
		if (d === a) {
			aIndex = i;
		}
		if (d === b) {
			bIndex = i;
		}
	});
	return aIndex < bIndex;
}

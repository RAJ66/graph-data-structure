// Unit tests for reactive-property.
const assert = require("assert");
const {serialize} = require("v8");

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
			assert(comesBefore(sorted, "pants", "shoes"));
			assert(comesBefore(sorted, "underpants", "pants"));
			assert(comesBefore(sorted, "underpants", "shoes"));
			assert(comesBefore(sorted, "shirt", "jacket"));
			assert(comesBefore(sorted, "shirt", "belt"));
			assert(comesBefore(sorted, "belt", "jacket"));

			assert.equal(sorted.length, 8);

			output(graph, "getting-dressed");
		});

		it("Should compute topological sort, excluding source nodes.", () => {
			const graph = Graph();
			graph.addEdge(
				{id: "a", name: "I'm node a"},
				{id: "b", name: "I'm node b"}
			);
			graph.addEdge(
				{id: "b", name: "I'm node b"},
				{id: "c", name: "I'm node c"}
			);
			const sorted = graph.topologicalSort(["a"], false);
			assert.equal(sorted.length, 2);
			assert.equal(sorted[0], "b");
			assert.equal(sorted[1], "c");
			output(graph, "abc");
		});

		it("Should compute topological sort tricky case.", () => {
			const graph = Graph();
			graph.addEdge(
				{id: "a", name: "I'm node a"},
				{id: "b", name: "I'm node b"}
			);
			graph.addEdge(
				{id: "a", name: "I'm node a"},
				{id: "d", name: "I'm node d"}
			);
			graph.addEdge(
				{id: "b", name: "I'm node b"},
				{id: "c", name: "I'm node c"}
			);
			graph.addEdge(
				{id: "d", name: "I'm node d"},
				{id: "e", name: "I'm node e"}
			);
			graph.addEdge(
				{id: "c", name: "I'm node c"},
				{id: "e", name: "I'm node e"}
			);

			const sorted = graph.topologicalSort(["a"], false);
			assert.equal(sorted.length, 4);
			assert(contains(sorted, "b"));
			assert(contains(sorted, "c"));
			assert(contains(sorted, "d"));
			assert.equal(sorted[sorted.length - 1], "e");

			assert(comesBefore(sorted, "b", "c"));
			assert(comesBefore(sorted, "b", "e"));
			assert(comesBefore(sorted, "c", "e"));
			assert(comesBefore(sorted, "d", "e"));

			output(graph, "tricky-case");
		});

		it("Should exclude source nodes with a cycle.", () => {
			const graph = Graph()
				.addEdge({id: "a", name: "I'm node a"}, {id: "b", name: "I'm node b"})
				.addEdge({id: "b", name: "I'm node b"}, {id: "c", name: "I'm node c"})
				.addEdge({id: "c", name: "I'm node c"}, {id: "a", name: "I'm node a"});
			const sorted = graph.topologicalSort(["a"], false);
			assert.equal(sorted.length, 2);
			assert.equal(sorted[0], "b");
			assert.equal(sorted[1], "c");

			output(graph, "cycle");
		});

		it("Should exclude source nodes with multiple cycles.", () => {
			const graph = Graph()
				.addEdge({id: "a", name: "I'm node a"}, {id: "b", name: "I'm node b"})
				.addEdge({id: "b", name: "I'm node b"}, {id: "a", name: "I'm node a"})
				.addEdge({id: "b", name: "I'm node b"}, {id: "c", name: "I'm node c"})
				.addEdge({id: "c", name: "I'm node c"}, {id: "b", name: "I'm node b"})
				.addEdge({id: "a", name: "I'm node a"}, {id: "c", name: "I'm node c"})
				.addEdge({id: "c", name: "I'm node c"}, {id: "a", name: "I'm node a"});

			const sorted = graph.topologicalSort(["a", "b"], false);
			assert(!contains(sorted, "b"));

			output(graph, "cycles");
		});

		it("Should compute lowest common ancestors.", () => {
			const graph = Graph()
				.addEdge({id: "a", name: "I'm node a"}, {id: "b", name: "I'm node b"})
				.addEdge({id: "b", name: "I'm node b"}, {id: "d", name: "I'm node d"})
				.addEdge({id: "c", name: "I'm node c"}, {id: "d", name: "I'm node d"})
				.addEdge({id: "b", name: "I'm node b"}, {id: "e", name: "I'm node e"})
				.addEdge({id: "c", name: "I'm node c"}, {id: "e", name: "I'm node e"})
				.addEdge({id: "d", name: "I'm node d"}, {id: "g", name: "I'm node g"})
				.addEdge({id: "e", name: "I'm node e"}, {id: "g", name: "I'm node g"})
				.addNode({id: "f", name: "I'm node f"});

			assert.deepStrictEqual(graph.lowestCommonAncestors("a", "a"), ["a"]);
			assert.deepStrictEqual(graph.lowestCommonAncestors("a", "b"), ["b"]);
			assert.deepStrictEqual(graph.lowestCommonAncestors("a", "c"), ["d", "e"]);
			assert.deepStrictEqual(graph.lowestCommonAncestors("a", "f"), []);
		});
	});

	describe("Edge cases and error handling", () => {
		it("Should return empty array of adjacent nodes for unknown nodes.", () => {
			const graph = Graph();
			assert.equal(graph.adjacent({id: "a"}).length, 0);
			assert.equal(graph.nodes(), 0);
		});

		it("Should do nothing if removing an edge that does not exist.", () => {
			assert.doesNotThrow(function () {
				const graph = Graph();
				graph.removeEdge({id: "a"}, {id: "b"});
			});
		});

		it("Should return indegree of 0 for unknown nodes.", () => {
			const graph = Graph();
			assert.equal(graph.indegree("z"), 0);
		});

		it("Should return outdegree of 0 for unknown nodes.", () => {
			const graph = Graph();
			assert.equal(graph.outdegree("z"), 0);
		});
	});

	describe("Serialization", () => {
		let serialized;

		const checkSerialized = (graph) => {
			assert.equal(graph.nodes.length, 3);
			assert.equal(graph.links.length, 2);

			assert.equal(graph.nodes[0].id, "a");
			assert.equal(graph.nodes[1].id, "b");
			assert.equal(graph.nodes[2].id, "c");

			assert.equal(graph.links[0].source, "a");
			assert.equal(graph.links[0].target, "b");
			assert.equal(graph.links[1].source, "b");
			assert.equal(graph.links[1].target, "c");
		};

		it("Should serialize a graph.", () => {
			const graph = Graph()
				.addEdge({id: "a", name: "I'm node a"}, {id: "b", name: "I'm node b"})
				.addEdge({id: "b", name: "I'm node b"}, {id: "c", name: "I'm node c"});
			serialized = graph.serialize();
			checkSerialized(serialized);
		});

		it("Should deserialize a graph.", () => {
			const graph = Graph();
			graph.deserialize(serialized);
			checkSerialized(graph.serialize());
		});

		it("Should chain deserialize a graph.", () => {
			const graph = Graph().deserialize(serialized);
			checkSerialized(graph.serialize());
		});

		it("Should deserialize a graph passed to constructor.", () => {
			const graph = Graph(serialized);
			checkSerialized(graph.serialize());
		});
	});

	describe("Edge Weights", () => {
		it("Should set and get an edge weight.", () => {
			const graph = Graph().addEdge(
				{id: "a", name: "A"},
				{id: "b", name: "B"},
				5
			);
			assert.equal(graph.getEdgeWeight("a", "b"), 5);
		});

		it("Should set edge weight via setEdgeWeight.", () => {
			const graph = Graph()
				.addEdge({id: "a", name: "A"}, {id: "b", name: "B"})
				.setEdgeWeight("a", "b", 5);
			assert.equal(graph.getEdgeWeight("a", "b"), 5);
		});

		it("Should return weight of 1 if no weight set.", () => {
			const graph = Graph().addEdge({id: "a", name: "A"}, {id: "b", name: "B"});
			assert.equal(graph.getEdgeWeight("a", "b"), 1);
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

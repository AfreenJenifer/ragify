// src/pages/ConceptGraph.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";

const nodeWidth = 180;
const nodeHeight = 60;

/* ---------------- DAGRE LAYOUT ---------------- */
const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const pos = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: pos.x - nodeWidth / 2,
          y: pos.y - nodeHeight / 2,
        },
      };
    }),
    edges,
  };
};

export default function ConceptGraph() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- LOAD FROM LOCAL STORAGE ---------------- */
  useEffect(() => {
    const savedNodes = localStorage.getItem("currentConceptNodes");
    const savedEdges = localStorage.getItem("currentConceptEdges");

    if (savedNodes && savedEdges) {
      setNodes(JSON.parse(savedNodes));
      setEdges(JSON.parse(savedEdges));
    }

    setHydrated(true);
  }, []);

  /* ---------------- SAVE TO LOCAL STORAGE ---------------- */
  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      "currentConceptNodes",
      JSON.stringify(nodes)
    );
    localStorage.setItem(
      "currentConceptEdges",
      JSON.stringify(edges)
    );
  }, [nodes, edges, hydrated]);

  /* ---------------- GENERATE GRAPH ---------------- */
  const generateGraph = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/concept-graph",
        { depth: 5 }
      );

      const raw = res.data.graph_raw;
      const match = raw.match(/\[.*\]/s);
      if (!match) throw new Error("Invalid graph JSON");

      const graphData = JSON.parse(match[0]);

      const tempNodes = [];
      const tempEdges = [];

      graphData.forEach((item) => {
        const nodeId = item.concept.replace(/\s+/g, "_");

        tempNodes.push({
          id: nodeId,
          data: { label: item.concept },
          position: { x: 0, y: 0 },
          style: {
            background: "#1f2933",
            color: "#e5e7eb",
            borderRadius: 10,
            padding: 10,
            border: "1px solid #6366f1",
            width: nodeWidth,
            height: nodeHeight,
            textAlign: "center",
            fontWeight: "600",
          },
        });

        item.depends_on?.forEach((dep) => {
          const depId = dep.replace(/\s+/g, "_");

          tempNodes.push({
            id: depId,
            data: { label: dep },
            position: { x: 0, y: 0 },
            style: {
              background: "#111827",
              color: "#d1d5db",
              borderRadius: 10,
              padding: 10,
              border: "1px solid #4b5563",
              width: nodeWidth,
              height: nodeHeight,
              textAlign: "center",
            },
          });

          tempEdges.push({
            id: `${depId}-${nodeId}`,
            source: depId,
            target: nodeId,
            animated: true,
            style: { stroke: "#a5b4fc" },
          });
        });
      });

      const uniqueNodes = Array.from(
        new Map(tempNodes.map((n) => [n.id, n])).values()
      );

      const layouted = getLayoutedElements(uniqueNodes, tempEdges);

      setNodes(layouted.nodes);
      setEdges(layouted.edges);

    } catch (err) {
      console.error(err);
      setError("Failed to generate concept graph. Upload a PDF first.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- HYDRATION BLOCK ---------------- */
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-gray-400">
        Restoring concept graph…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">

        <h1 className="text-2xl font-bold mb-4">
          🧠 Concept Dependency Graph
        </h1>

        <button
          onClick={generateGraph}
          disabled={loading}
          className="bg-indigo-600 px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Graph"}
        </button>

        {error && <p className="text-red-400 mt-4">{error}</p>}

        <div className="mt-6 h-[600px] bg-gray-900 rounded border border-gray-700">
          {nodes.length > 0 && (
            <ReactFlow nodes={nodes} edges={edges} fitView>
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          )}
        </div>

      </div>
    </div>
  );
}
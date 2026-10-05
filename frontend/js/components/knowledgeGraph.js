/**
 * AI Knowledge Graph Explorer Component.
 * Visualizes relational graph linkages between Policies, Research Papers,
 * Datasets, Institutions, and Geographic Jurisdictions on an interactive HTML5 Canvas.
 */

import { api } from '../api.js';

export async function renderKnowledgeGraph(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <div>
        <h1 style="font-size:22px; font-weight:800; color:var(--gov-navy-900); letter-spacing:-0.3px;">
          National Land Governance AI Knowledge Graph
        </h1>
        <p style="font-size:12px; color:var(--gov-slate-500);">
          Multi-entity relational discovery connecting legislative policies, empirical studies, spatial datasets, and institutions.
        </p>
      </div>
      <div style="display:flex; gap:10px; font-size:11px;">
        <span style="color:#10b981; font-weight:700;">● Policies</span>
        <span style="color:#3b82f6; font-weight:700;">● Research</span>
        <span style="color:#f59e0b; font-weight:700;">● Datasets</span>
        <span style="color:#8b5cf6; font-weight:700;">● Institutions</span>
        <span style="color:#ef4444; font-weight:700;">● Jurisdictions</span>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 300px; gap:16px;">
      <!-- Interactive Graph Canvas Box -->
      <div class="graph-canvas-box" id="graph-wrapper">
        <canvas id="kg-canvas" width="850" height="520" style="width:100%; height:100%; display:block;"></canvas>
      </div>

      <!-- Graph Entity Inspector -->
      <div class="card" id="kg-inspector">
        <h3 style="font-size:14px; font-weight:800; color:var(--gov-navy-900); margin-bottom:8px;" id="kg-node-title">
          Select an Entity Node
        </h3>
        <p style="font-size:12px; color:var(--gov-slate-500); margin-bottom:14px;" id="kg-node-type">
          Click any policy, research paper, dataset, or institution node on the canvas to inspect its relational graph edges.
        </p>

        <div id="kg-node-edges-list" style="display:flex; flex-direction:column; gap:8px;">
          <div style="background:var(--gov-slate-50); padding:10px; border-radius:4px; font-size:11px; color:var(--gov-slate-600);">
            <strong>Interactive Physics:</strong> Drag nodes or click to highlight connected cross-domain governance links.
          </div>
        </div>

        <div style="margin-top:auto; padding-top:14px; border-top:1px solid var(--gov-slate-200);">
          <button class="btn btn-outline" style="width:100%;" id="btn-reset-kg">
            Re-center Graph View
          </button>
        </div>
      </div>
    </div>
  `;

  try {
    const graphData = await api.getKnowledgeGraph();
    initGraphCanvas(graphData);
  } catch (err) {
    document.getElementById('graph-wrapper').innerHTML = `<div style="color:#fff; padding:30px;">Error loading Knowledge Graph: ${err.message}</div>`;
  }
}

function initGraphCanvas(data) {
  const canvas = document.getElementById('kg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Assign coordinate positions in a clustered circular graph layout
  const nodes = (data.nodes || []).map((n, i) => {
    const angle = (i / (data.nodes.length || 1)) * 2 * Math.PI;
    const radius = 180 + (i % 3) * 35;
    return {
      ...n,
      x: w / 2 + radius * Math.cos(angle),
      y: h / 2 + radius * Math.sin(angle),
      vx: 0,
      vy: 0,
      radius: n.type === 'Policy' ? 22 : 18
    };
  });

  const edges = data.edges || [];
  let selectedNode = nodes[0] || null;

  function draw() {
    ctx.fillStyle = '#0d1527';
    ctx.fillRect(0, 0, w, h);

    // Draw Edges
    edges.forEach(e => {
      const src = nodes.find(n => n.id === e.source);
      const tgt = nodes.find(n => n.id === e.target);
      if (src && tgt) {
        const isHighlighted = selectedNode && (selectedNode.id === src.id || selectedNode.id === tgt.id);
        ctx.strokeStyle = isHighlighted ? '#60a5fa' : 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = isHighlighted ? 2.5 : 1;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.stroke();

        // Edge label
        if (isHighlighted) {
          ctx.fillStyle = '#93c5fd';
          ctx.font = '10px Inter, sans-serif';
          ctx.fillText(e.relation, (src.x + tgt.x) / 2, (src.y + tgt.y) / 2 - 4);
        }
      }
    });

    // Draw Nodes
    nodes.forEach(n => {
      const isSelected = selectedNode && selectedNode.id === n.id;
      ctx.fillStyle = n.color || '#3b82f6';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Node label
      ctx.fillStyle = '#fff';
      ctx.font = isSelected ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, n.x, n.y + n.radius + 12);
    });
  }

  function updateInspector(node) {
    if (!node) return;
    document.getElementById('kg-node-title').textContent = node.label;
    document.getElementById('kg-node-type').innerHTML = `
      Entity Type: <span class="badge" style="background:${node.color}; color:#fff;">${node.type}</span> (ID: <code>${node.id}</code>)
    `;

    // Find connected edges
    const connectedEdges = edges.filter(e => e.source === node.id || e.target === node.id);
    const edgesListEl = document.getElementById('kg-node-edges-list');

    if (connectedEdges.length === 0) {
      edgesListEl.innerHTML = `<div style="font-size:11px; color:var(--gov-slate-500);">No directly registered graph relationships.</div>`;
      return;
    }

    edgesListEl.innerHTML = `
      <div style="font-size:11px; font-weight:700; color:var(--gov-slate-600); margin-bottom:4px;">
        Relational Links (${connectedEdges.length}):
      </div>
      ${connectedEdges.map(e => {
        const isOut = e.source === node.id;
        const otherId = isOut ? e.target : e.source;
        const otherNode = nodes.find(n => n.id === otherId) || { label: otherId, type: 'Entity' };
        return `
          <div style="background:var(--gov-slate-50); border:1px solid var(--gov-slate-200); padding:6px 10px; border-radius:4px; font-size:11px;">
            <span style="color:var(--gov-slate-400);">${isOut ? '→' : '←'} <strong>${e.relation}</strong></span><br/>
            <strong>${otherNode.label}</strong> <span style="font-size:10px; color:var(--gov-slate-500);">(${otherNode.type})</span>
          </div>
        `;
      }).join('')}
    `;
  }

  // Click detection
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (w / rect.width);
    const y = (e.clientY - rect.top) * (h / rect.height);

    const clickedNode = nodes.find(n => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (clickedNode) {
      selectedNode = clickedNode;
      updateInspector(selectedNode);
      draw();
    }
  });

  document.getElementById('btn-reset-kg').addEventListener('click', () => {
    selectedNode = nodes[0];
    updateInspector(selectedNode);
    draw();
  });

  // Initial draw and select
  updateInspector(selectedNode);
  draw();
}

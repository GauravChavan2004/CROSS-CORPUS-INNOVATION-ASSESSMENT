import React, { useRef, useEffect, useState } from 'react';
import { Eye, RotateCcw, Play, Pause, Layers, Sparkles, Target, BookOpen, ShieldCheck } from 'lucide-react';

export default function Innovation3DGraph({ result }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRotating, setIsRotating] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState({ x: 0.3, y: 0.5 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Extract nodes & links from result data
  const parsedIdea = result?.parsed_idea || { proposed_technology: 'Proposed Tech', domain: 'AI' };
  const papers = result?.papers || [];
  const patents = result?.patents || [];
  const gaps = result?.gaps || [];
  const relationships = result?.relationships || [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas
    const updateSize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 550;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Build 3D Node Topology
    const nodes = [];
    const links = [];

    // 1. Central Core Node (User Idea)
    const coreNode = {
      id: 'core',
      label: parsedIdea.proposed_technology || 'Proposed Idea Core',
      sublabel: `Domain: ${parsedIdea.domain || 'Cross-Domain'}`,
      type: 'core',
      x: 0, y: 0, z: 0,
      radius: 24,
      color: '#06b6d4', // Cyan
      glowColor: 'rgba(6, 182, 212, 0.8)'
    };
    nodes.push(coreNode);

    // 2. Paper Nodes (Blue Ring)
    papers.forEach((paper, i) => {
      const angle = (i / Math.max(papers.length, 1)) * Math.PI * 2;
      const radius = 180 + (i % 2) * 30;
      const node = {
        id: paper.paper_id,
        label: paper.title,
        sublabel: `Authors: ${paper.authors?.slice(0, 2).join(', ') || 'N/A'}`,
        type: 'paper',
        x: Math.cos(angle) * radius,
        y: Math.sin(angle * 2) * 40 - 30,
        z: Math.sin(angle) * radius,
        radius: 14,
        color: '#3b82f6', // Blue
        glowColor: 'rgba(59, 130, 246, 0.7)',
        data: paper
      };
      nodes.push(node);
      links.push({ source: 'core', target: paper.paper_id, label: 'Literature Context', color: 'rgba(59, 130, 246, 0.4)' });
    });

    // 3. Patent Nodes (Gold/Purple Ring)
    patents.forEach((patent, i) => {
      const angle = (i / Math.max(patents.length, 1)) * Math.PI * 2 + Math.PI / 4;
      const radius = 220 + (i % 2) * 40;
      const node = {
        id: patent.patent_id,
        label: patent.title,
        sublabel: `Assignee: ${patent.assignee || 'Unknown'}`,
        type: 'patent',
        x: Math.cos(angle) * radius,
        y: Math.cos(angle * 2) * 50 + 40,
        z: Math.sin(angle) * radius,
        radius: 14,
        color: '#a855f7', // Purple
        glowColor: 'rgba(168, 85, 247, 0.7)',
        data: patent
      };
      nodes.push(node);
      links.push({ source: 'core', target: patent.patent_id, label: 'Prior Art Bound', color: 'rgba(168, 85, 247, 0.4)' });
    });

    // 4. Research Gap Nodes (Rose/Orange)
    gaps.forEach((gap, i) => {
      const angle = (i / Math.max(gaps.length, 1)) * Math.PI * 2 + Math.PI / 2;
      const radius = 270;
      const node = {
        id: gap.gap_id,
        label: gap.gap_description,
        sublabel: `Severity: ${gap.severity || 'High'}`,
        type: 'gap',
        x: Math.cos(angle) * radius,
        y: Math.sin(angle * 3) * 60,
        z: Math.sin(angle) * radius,
        radius: 16,
        color: '#f43f5e', // Rose
        glowColor: 'rgba(244, 63, 94, 0.8)',
        data: gap
      };
      nodes.push(node);
      links.push({ source: 'core', target: gap.gap_id, label: 'Unresolved Gap', color: 'rgba(244, 63, 94, 0.5)' });
    });

    // Cross-Corpus Links from API
    relationships.forEach(rel => {
      links.push({
        source: rel.source_id,
        target: rel.target_id,
        label: `${rel.relationship_type} (${(rel.confidence * 100).toFixed(0)}%)`,
        color: 'rgba(245, 158, 11, 0.6)'
      });
    });

    // 3D Background Particles
    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 600,
        z: (Math.random() - 0.5) * 800,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.005 + 0.002
      });
    }

    // Rotational Matrix State
    let angleY = rotation.y;
    let angleX = rotation.x;

    // 3D Projection Calculation
    const project3D = (x, y, z, rotX, rotY, currentZoom, width, height) => {
      // Rotation Y
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = z * cosY + x * sinY;

      // Rotation X
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = z1 * cosX + y * sinX;

      // Perspective scale factor
      const fov = 450;
      const scale = (fov / (fov + z2)) * currentZoom;
      const projX = width / 2 + x1 * scale;
      const projY = height / 2 + y2 * scale;

      return { x: projX, y: projY, z: z2, scale };
    };

    let tick = 0;

    // Animation Render Loop
    const render = () => {
      tick += 0.015;
      if (isRotating && !isDragging.current) {
        angleY += 0.003;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Grid / Cosmic Dust Background
      particles.forEach(p => {
        p.z += Math.sin(tick + p.x) * 0.2;
        const proj = project3D(p.x, p.y, p.z, angleX, angleY, zoom, canvas.width, canvas.height);
        if (proj.scale > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.6, proj.scale * 0.3)})`;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Project Node Positions
      const projectedNodes = nodes.map(n => {
        // Subtle floating movement
        const floatY = n.y + Math.sin(tick + n.x * 0.05) * 6;
        const proj = project3D(n.x, floatY, n.z, angleX, angleY, zoom, canvas.width, canvas.height);
        return { ...n, projX: proj.x, projY: proj.y, projZ: proj.z, scale: proj.scale };
      });

      // Sort by Z for proper depth rendering
      projectedNodes.sort((a, b) => b.projZ - a.projZ);

      // Map node lookups by ID
      const nodeMap = {};
      projectedNodes.forEach(pn => { nodeMap[pn.id] = pn; });

      // Render 3D Energy Link Beams
      links.forEach(link => {
        const source = nodeMap[link.source];
        const target = nodeMap[link.target];
        if (source && target && source.scale > 0 && target.scale > 0) {
          ctx.beginPath();
          ctx.moveTo(source.projX, source.projY);
          ctx.lineTo(target.projX, target.projY);
          ctx.strokeStyle = link.color;
          ctx.lineWidth = Math.max(1, 2 * ((source.scale + target.scale) / 2));
          ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated energy pulse particle traveling along link
          const pulseProgress = (tick * 1.5 + (source.x % 5)) % 1;
          const px = source.projX + (target.projX - source.projX) * pulseProgress;
          const py = source.projY + (target.projY - source.projY) * pulseProgress;

          ctx.fillStyle = '#67e8f9';
          ctx.beginPath();
          ctx.arc(px, py, 3 * ((source.scale + target.scale) / 2), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Render 3D Orbit Rings around Core Node
      const coreProj = nodeMap['core'];
      if (coreProj && coreProj.scale > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(coreProj.projX, coreProj.projY, 120 * coreProj.scale, 40 * coreProj.scale, angleX, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
        ctx.beginPath();
        ctx.ellipse(coreProj.projX, coreProj.projY, 160 * coreProj.scale, 55 * coreProj.scale, -angleX * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Render 3D Nodes & Labels
      projectedNodes.forEach(n => {
        if (n.scale <= 0) return;

        const radius = n.radius * n.scale;

        // Glow aura
        const gradient = ctx.createRadialGradient(n.projX, n.projY, radius * 0.2, n.projX, n.projY, radius * 2.5);
        gradient.addColorStop(0, n.glowColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(n.projX, n.projY, radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Solid Node Sphere
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.projX, n.projY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(n.projX - radius * 0.3, n.projY - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Text Labels (if depth is visible enough)
        if (n.scale > 0.6) {
          ctx.font = `${Math.round(11 * n.scale)}px sans-serif`;
          ctx.fillStyle = n.id === selectedNode?.id ? '#fbbf24' : '#e2e8f0';
          ctx.textAlign = 'center';
          const shortLabel = n.label.length > 25 ? n.label.substring(0, 22) + '...' : n.label;
          ctx.fillText(shortLabel, n.projX, n.projY + radius + 14 * n.scale);

          ctx.font = `${Math.round(9 * n.scale)}px sans-serif`;
          ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
          ctx.fillText(n.type.toUpperCase(), n.projX, n.projY + radius + 26 * n.scale);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Mouse Controls for 3D Drag Rotation
    const handleMouseDown = (e) => {
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      angleY += deltaX * 0.008;
      angleX += deltaY * 0.008;
      setRotation({ x: angleX, y: angleY });
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // Node Click Inspector Handler
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const projected = nodes.map(n => {
        const proj = project3D(n.x, n.y, n.z, angleX, angleY, zoom, canvas.width, canvas.height);
        return { ...n, projX: proj.x, projY: proj.y, projZ: proj.z, scale: proj.scale };
      });

      // Find closest node
      let clicked = null;
      let minDistance = 30;

      projected.forEach(n => {
        const dx = clickX - n.projX;
        const dy = clickY - n.projY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          clicked = n;
        }
      });

      if (clicked) {
        setSelectedNode(clicked);
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [result, isRotating, zoom, selectedNode]);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', position: 'relative' }}>
      {/* Visual Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
            <Sparkles size={20} /> 3D Animated Cross-Corpus Innovation Universe
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Interactive 3D spatial view of paper abstracts, patent bounds, gap nodes, and core technology links. Drag to rotate 360°.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="tag"
            style={{ cursor: 'pointer', background: isRotating ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            {isRotating ? <Pause size={14} style={{ display: 'inline', marginRight: '4px' }} /> : <Play size={14} style={{ display: 'inline', marginRight: '4px' }} />}
            {isRotating ? 'Pause Orbit' : 'Rotate Orbit'}
          </button>
          <button
            onClick={() => setZoom(z => Math.min(z + 0.2, 2.0))}
            className="tag"
            style={{ cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            + Zoom
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
            className="tag"
            style={{ cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            - Zoom
          </button>
          <button
            onClick={() => { setZoom(1); setRotation({ x: 0.3, y: 0.5 }); }}
            className="tag"
            style={{ cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            <RotateCcw size={14} style={{ display: 'inline', marginRight: '4px' }} /> Reset 3D
          </button>
        </div>
      </div>

      {/* Legend Badge Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }}></span> Proposed Core Idea
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span> Research Papers
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#a855f7', display: 'inline-block' }}></span> Patent Claims
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }}></span> Unresolved Gap
        </span>
      </div>

      {/* 3D Canvas Box */}
      <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '550px', cursor: 'grab', display: 'block' }} />

        {/* Node Detail Inspector Overlay Modal */}
        {selectedNode && (
          <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', width: '320px', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '10px', padding: '1rem', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="tag" style={{ background: selectedNode.color, color: '#fff', textTransform: 'uppercase' }}>
                {selectedNode.type}
              </span>
              <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>

            <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem', color: '#fff' }}>{selectedNode.label}</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedNode.sublabel}</p>

            {selectedNode.data?.abstract && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#cbd5e1', maxHeight: '90px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
                {selectedNode.data.abstract}
              </div>
            )}

            {selectedNode.data?.claims && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#cbd5e1', maxHeight: '90px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '6px' }}>
                <strong>Claims:</strong> {selectedNode.data.claims.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

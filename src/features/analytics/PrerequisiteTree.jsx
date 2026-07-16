import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Maximize2, Minimize2, ZoomIn, ZoomOut,
  ChevronsDownUp, ChevronsUpDown, GitBranch
} from 'lucide-react';
import './PrerequisiteTree.css';

// ─── Tree Data (from CSE Undergraduate Prerequisites flow) ───
const TREE = {
  id: 'Root', code: '', name: 'CSE Undergraduate Prerequisites', type: 'root', children: [
    {
      id: 'Math', code: '', name: 'Mathematics Sequence', type: 'category', children: [
        {
          id: 'MATH1115', code: 'MATH1115', name: 'Math-I', type: 'core', children: [
            {
              id: 'MATH1219', code: 'MATH1219', name: 'Math-II', type: 'core', children: [
                {
                  id: 'MATH2101', code: 'MATH2101', name: 'Math-III', type: 'core', children: [
                    {
                      id: 'CSE3101', code: 'CSE3101', name: 'Math Analysis for CS', type: 'core', children: [
                        { id: 'CSE3207_M', code: 'CSE3207', name: 'Artificial Intelligence', type: 'elective' },
                        { id: 'CSE4137', code: 'CSE4137', name: 'Soft Computing', type: 'elective' },
                        { id: 'CSE4175_M', code: 'CSE4175', name: 'Natural Language Processing', type: 'elective' },
                        { id: 'CSE4223', code: 'CSE4223', name: 'Computational Complexity', type: 'elective' },
                        { id: 'CSE4265_M', code: 'CSE4265', name: 'Bioinformatics', type: 'elective' },
                      ],
                    },
                    { id: 'CSE4211', code: 'CSE4211', name: 'Simulation of Products', type: 'elective' },
                  ],
                },
              ],
            },
            {
              id: 'MATH2203', code: 'MATH2203', name: 'Math-IV', type: 'core', children: [
                { id: 'CSE4113_M', code: 'CSE4113', name: 'Pattern Recognition', type: 'elective' },
                { id: 'CSE4203', code: 'CSE4203', name: 'Computer Graphics', type: 'elective' },
                { id: 'CSE4209', code: 'CSE4209', name: 'Computer Vision', type: 'elective' },
                { id: 'CSE4219', code: 'CSE4219', name: 'Computational Geometry', type: 'elective' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'Prog', code: '', name: 'Programming & Software', type: 'category', children: [
        {
          id: 'CSE1101', code: 'CSE1101', name: 'Structured Programming', type: 'core', children: [
            { id: 'CSE1205', code: 'CSE1205', name: 'Object Oriented Programming', type: 'core' },
            {
              id: 'CSE2103', code: 'CSE2103', name: 'Data Structures', type: 'core', children: [
                {
                  id: 'CSE2207', code: 'CSE2207', name: 'Algorithms', type: 'core', children: [
                    { id: 'CSE3207_P', code: 'CSE3207', name: 'Artificial Intelligence', type: 'elective' },
                    { id: 'CSE4283_P', code: 'CSE4283', name: 'Advanced Algorithms', type: 'elective' },
                    { id: 'CSE4285_P', code: 'CSE4285', name: 'High Performance Computing', type: 'elective' },
                  ],
                },
                { id: 'CSE4283_D', code: 'CSE4283', name: 'Advanced Algorithms', type: 'elective' },
              ],
            },
          ],
        },
        {
          id: 'CSE3103', code: 'CSE3103', name: 'Database', type: 'core', children: [
            { id: 'CSE3223', code: 'CSE3223', name: 'Information System Design', type: 'elective' },
            { id: 'CSE4131', code: 'CSE4131', name: 'Multimedia Computing', type: 'elective' },
            { id: 'CSE4139', code: 'CSE4139', name: 'Advanced Database', type: 'elective' },
            { id: 'CSE4141', code: 'CSE4141', name: 'Data Warehousing', type: 'elective' },
            { id: 'CSE4261', code: 'CSE4261', name: 'Data Analytics', type: 'elective' },
          ],
        },
      ],
    },
    {
      id: 'Theory', code: '', name: 'Theory & Intelligence', type: 'category', children: [
        {
          id: 'CSE1203', code: 'CSE1203', name: 'Discrete Mathematics', type: 'core', children: [
            { id: 'CSE3101_T', code: 'CSE3101', name: 'Math Analysis for CS', type: 'core' },
            { id: 'CSE3103_T', code: 'CSE3103', name: 'Database', type: 'core' },
            { id: 'CSE3207_T', code: 'CSE3207', name: 'Artificial Intelligence', type: 'core' },
            { id: 'CSE4129', code: 'CSE4129', name: 'Formal Languages & Compilers', type: 'elective' },
            { id: 'CSE4175_T', code: 'CSE4175', name: 'Natural Language Processing', type: 'elective' },
            { id: 'CSE4221', code: 'CSE4221', name: 'Graph Theory', type: 'elective' },
          ],
        },
        {
          id: 'CSE3207_AI', code: 'CSE3207', name: 'Artificial Intelligence', type: 'core', children: [
            { id: 'CSE4113_AI', code: 'CSE4113', name: 'Machine Learning', type: 'elective' },
            { id: 'CSE4143', code: 'CSE4143', name: 'Expert Systems', type: 'elective' },
            { id: 'CSE4147', code: 'CSE4147', name: 'Neural Networks', type: 'elective' },
            { id: 'CSE4265_AI', code: 'CSE4265', name: 'Bioinformatics', type: 'elective' },
            { id: 'CSE4267', code: 'CSE4267', name: 'Cloud Computing', type: 'elective' },
          ],
        },
      ],
    },
    {
      id: 'Hardware', code: '', name: 'Hardware & Architecture', type: 'category', children: [
        {
          id: 'EEE1241', code: 'EEE1241', name: 'Basic Electrical Engineering', type: 'core', children: [
            { id: 'EEE2141', code: 'EEE2141', name: 'Electronic Devices & Circuits', type: 'core' },
          ],
        },
        {
          id: 'CSE2105', code: 'CSE2105', name: 'Digital Logic Design', type: 'core', children: [
            { id: 'CSE3109_H', code: 'CSE3109', name: 'Digital System Design', type: 'core' },
            { id: 'CSE3117_H', code: 'CSE3117', name: 'Microprocessors & Microcontrollers', type: 'core' },
          ],
        },
        {
          id: 'CSE2213', code: 'CSE2213', name: 'Computer Architecture', type: 'core', children: [
            { id: 'CSE3109_A', code: 'CSE3109', name: 'Digital System Design', type: 'core' },
            { id: 'CSE3117_A', code: 'CSE3117', name: 'Microprocessors & Microcontrollers', type: 'core' },
            { id: 'CSE4215', code: 'CSE4215', name: 'Advanced Computer Architecture', type: 'elective' },
            { id: 'CSE4245', code: 'CSE4245', name: 'Parallel Processing', type: 'elective' },
            { id: 'CSE4285_A', code: 'CSE4285', name: 'High Performance Computing', type: 'elective' },
          ],
        },
      ],
    },
    {
      id: 'Comm', code: '', name: 'Communications & Networks', type: 'category', children: [
        {
          id: 'CSE2211', code: 'CSE2211', name: 'Data Communication', type: 'core', children: [
            {
              id: 'CSE3201', code: 'CSE3201', name: 'Computer Networks', type: 'core', children: [
                { id: 'CSE4173', code: 'CSE4173', name: 'Cyber Security', type: 'elective' },
                { id: 'CSE4181', code: 'CSE4181', name: 'Web Computing', type: 'elective' },
                { id: 'CSE4235', code: 'CSE4235', name: 'Wireless Networks', type: 'elective' },
                { id: 'CSE4255', code: 'CSE4255', name: 'Telecommunication', type: 'elective' },
              ],
            },
            { id: 'CSE4173_C', code: 'CSE4173', name: 'Cyber Security', type: 'elective' },
            { id: 'CSE4235_C', code: 'CSE4235', name: 'Wireless Networks', type: 'elective' },
            { id: 'CSE4255_C', code: 'CSE4255', name: 'Telecommunication', type: 'elective' },
            { id: 'CSE4263', code: 'CSE4263', name: 'Internet of Things', type: 'elective' },
          ],
        },
      ],
    },
  ],
};

// ─── Static maps built once ───
const parentMap = {};   // id -> parent id
const nodeMap = {};     // id -> node
const parentIds = [];   // ids of all nodes that have children
(function index(node, parent) {
  nodeMap[node.id] = node;
  if (parent) parentMap[node.id] = parent.id;
  if (node.children?.length) {
    parentIds.push(node.id);
    node.children.forEach((c) => index(c, node));
  }
})(TREE, null);

const totalCourses = Object.values(nodeMap).filter((n) => n.code).length;

// ─── Neon accent per node type (resolved from the active theme in CSS) ───
const NEON_VAR = {
  root: 'var(--pt-root)',
  category: 'var(--pt-category)',
  core: 'var(--pt-core)',
  elective: 'var(--pt-elective)',
};

const ROW_H = 52;
const NODE_H = 34;
const COL_GAP = 90;
const PAD = 40;
const ZOOM_STEP = 0.2;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;

// ─── Estimate node pixel width from its label ───
function nodeWidth(node) {
  const text = node.code ? `${node.code}  ${node.name}` : node.name;
  const badge = node.children?.length ? 26 : 0;
  return Math.round(text.length * 6.6 + 30 + badge);
}

// ─── Layout the visible portion of the tree (left → right) ───
function computeLayout(expandedSet) {
  const visible = [];
  (function collect(node, depth) {
    visible.push({ node, depth });
    if (expandedSet.has(node.id) && node.children) {
      node.children.forEach((c) => collect(c, depth + 1));
    }
  })(TREE, 0);

  // column x positions (per-depth max width)
  const colWidths = [];
  visible.forEach(({ node, depth }) => {
    colWidths[depth] = Math.max(colWidths[depth] || 0, nodeWidth(node));
  });
  const colX = [];
  let acc = PAD;
  colWidths.forEach((w, i) => {
    colX[i] = acc;
    acc += w + COL_GAP;
  });

  // rows needed for each visible subtree
  const rowsOf = (node) => {
    if (!expandedSet.has(node.id) || !node.children?.length) return 1;
    return node.children.reduce((s, c) => s + rowsOf(c), 0);
  };

  const nodes = [];
  const edges = [];
  (function place(node, depth, topRow) {
    const rows = rowsOf(node);
    const x = colX[depth];
    const y = (topRow + rows / 2) * ROW_H + PAD;
    const w = nodeWidth(node);
    nodes.push({ node, x, y, w, depth });
    if (expandedSet.has(node.id) && node.children) {
      let r = topRow;
      node.children.forEach((child) => {
        const cr = rowsOf(child);
        edges.push({
          id: `${node.id}->${child.id}`,
          x1: x + w,
          y1: y,
          x2: colX[depth + 1],
          y2: (r + cr / 2) * ROW_H + PAD,
          type: child.type,
        });
        place(child, depth + 1, r);
        r += cr;
      });
    }
  })(TREE, 0, 0);

  const width = acc - COL_GAP + PAD;
  const height = rowsOf(TREE) * ROW_H + PAD * 2;
  return { nodes, edges, width, height };
}

// ─── Ancestor ids of a node (for search auto-expand) ───
function ancestorsOf(id) {
  const out = [];
  let cur = parentMap[id];
  while (cur) {
    out.push(cur);
    cur = parentMap[cur];
  }
  return out;
}

export default function PrerequisiteTree() {
  const [expanded, setExpanded] = useState(() => new Set(['Root']));
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  // single transform state so zoom + pan update atomically (cursor-anchored zoom)
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const wrapperRef = useRef(null);
  const containerRef = useRef(null);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const zoomTimerRef = useRef(null);

  const { scale, x: panX, y: panY } = view;

  // ─── Search: matched ids + auto-expanded ancestors ───
  const term = search.trim().toLowerCase();
  const matchedIds = useMemo(() => {
    if (!term) return new Set();
    const ids = new Set();
    Object.values(nodeMap).forEach((n) => {
      if (`${n.code} ${n.name}`.toLowerCase().includes(term)) ids.add(n.id);
    });
    return ids;
  }, [term]);

  const effectiveExpanded = useMemo(() => {
    if (!term) return expanded;
    const set = new Set(expanded);
    matchedIds.forEach((id) => ancestorsOf(id).forEach((a) => set.add(a)));
    return set;
  }, [expanded, matchedIds, term]);

  const { nodes, edges, width, height } = useMemo(
    () => computeLayout(effectiveExpanded),
    [effectiveExpanded]
  );

  const visibleCourses = nodes.filter((n) => n.node.code).length;

  // ─── Expand / collapse ───
  const toggleNode = useCallback((node) => {
    if (node.children?.length) {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
    }
    if (node.code) {
      setSelected((prev) => (prev?.id === node.id ? null : node));
    }
  }, []);

  const expandAll = useCallback(() => setExpanded(new Set(parentIds)), []);
  const collapseAll = useCallback(() => {
    setExpanded(new Set(['Root']));
    setSelected(null);
  }, []);

  // ─── Zoom (anchored: keeps a focal point fixed while scaling) ───
  const flashZoom = useCallback(() => {
    setIsZooming(true);
    clearTimeout(zoomTimerRef.current);
    zoomTimerRef.current = setTimeout(() => setIsZooming(false), 260);
  }, []);

  // Zoom toward a point in viewport coordinates (px, py)
  const zoomAt = useCallback((delta, px, py) => {
    setView((prev) => {
      const next = Math.min(Math.max(prev.scale + delta, MIN_ZOOM), MAX_ZOOM);
      if (next === prev.scale) return prev;
      const ratio = next / prev.scale;
      // keep the content point under (px, py) stationary
      const nv = {
        scale: next,
        x: px - (px - prev.x) * ratio,
        y: py - (py - prev.y) * ratio,
      };
      panOffsetRef.current = { x: nv.x, y: nv.y };
      return nv;
    });
    flashZoom();
  }, [flashZoom]);

  // Button zoom → anchor at viewport center
  const zoomFromCenter = useCallback((delta) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    zoomAt(delta, (rect?.width || 0) / 2, (rect?.height || 0) / 2);
  }, [zoomAt]);

  const zoomIn = useCallback(() => zoomFromCenter(ZOOM_STEP), [zoomFromCenter]);
  const zoomOut = useCallback(() => zoomFromCenter(-ZOOM_STEP), [zoomFromCenter]);

  const resetZoom = useCallback(() => {
    setView({ scale: 1, x: 0, y: 0 });
    panOffsetRef.current = { x: 0, y: 0 };
    flashZoom();
  }, [flashZoom]);

  // Wheel zoom → anchor at cursor position (plain scroll, no modifier needed)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect = wrapperRef.current?.getBoundingClientRect();
    const px = e.clientX - (rect?.left || 0);
    const py = e.clientY - (rect?.top || 0);
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    zoomAt(delta, px, py);
  }, [zoomAt]);

  // React attaches wheel as passive — bind manually so preventDefault works
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  useEffect(() => () => clearTimeout(zoomTimerRef.current), []);

  // ─── Pan (drag empty canvas) ───
  const handlePanStart = useCallback((e) => {
    if (e.target.closest('.pt-node')) return;
    if (e.button !== 0) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePanMove = useCallback((e) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setView((prev) => ({
      ...prev,
      x: panOffsetRef.current.x + dx,
      y: panOffsetRef.current.y + dy,
    }));
  }, [isPanning]);

  const handlePanEnd = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      panOffsetRef.current = { x: panX, y: panY };
    }
  }, [isPanning, panX, panY]);

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && fullscreen) setFullscreen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        const input = containerRef.current?.querySelector('.prereq-search-input');
        if (input) {
          e.preventDefault();
          input.focus();
        }
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) { e.preventDefault(); zoomIn(); }
      if ((e.metaKey || e.ctrlKey) && e.key === '-') { e.preventDefault(); zoomOut(); }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') { e.preventDefault(); resetZoom(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [fullscreen, zoomIn, zoomOut, resetZoom]);

  const zoomPercent = Math.round(scale * 100);

  // Lock body scroll while fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [fullscreen]);

  const content = (
    <div className={`prerequisite-tree ${fullscreen ? 'prereq-fullscreen' : ''}`} ref={containerRef}>
      {/* Toolbar */}
      <div className="prereq-toolbar">
        <div className="prereq-search">
          <Search size={14} className="prereq-search-icon" />
          <input
            type="text"
            className="prereq-search-input"
            placeholder="Search courses... (⌘F)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span className="prereq-stats">
          <GitBranch size={12} /> {visibleCourses} / {totalCourses} courses
        </span>

        <button className="prereq-action-btn" onClick={expandAll} title="Expand all branches">
          <ChevronsUpDown size={14} />
          <span>Expand All</span>
        </button>
        <button className="prereq-action-btn" onClick={collapseAll} title="Collapse all branches">
          <ChevronsDownUp size={14} />
          <span>Collapse All</span>
        </button>

        {/* Zoom Controls */}
        <div className="prereq-zoom-group">
          <button className="prereq-action-btn" onClick={zoomOut} disabled={scale <= MIN_ZOOM} title="Zoom out (⌘-)">
            <ZoomOut size={14} />
          </button>
          <button className="prereq-action-btn prereq-zoom-reset" onClick={resetZoom} title="Reset zoom (⌘0)">
            <span className={`prereq-zoom-pct ${isZooming ? 'is-zooming' : ''}`}>{zoomPercent}%</span>
          </button>
          <button className="prereq-action-btn" onClick={zoomIn} disabled={scale >= MAX_ZOOM} title="Zoom in (⌘=)">
            <ZoomIn size={14} />
          </button>
        </div>

        <button
          className={`prereq-action-btn ${fullscreen ? 'active' : ''}`}
          onClick={() => setFullscreen((p) => !p)}
          title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen view'}
        >
          {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          <span>{fullscreen ? 'Exit' : 'Fullscreen'}</span>
        </button>
      </div>

      {/* Selected course info */}
      {selected && (
        <div className="prereq-course-detail">
          <div className="prereq-course-detail-header">
            <span className="prereq-course-detail-code">{selected.code}</span>
            <span className="prereq-course-detail-name">{selected.name}</span>
            <button className="prereq-course-detail-close" onClick={() => setSelected(null)} title="Dismiss">
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Hint */}
      <div className="prereq-hint">
        <span>
          💡 <strong>Click</strong> a node to expand / collapse its children &bull;
          <strong> Scroll</strong> to zoom &bull;
          <strong> Drag</strong> to pan
        </span>
      </div>

      {/* Canvas */}
      <div className={`prereq-canvas ${fullscreen ? 'fullscreen' : ''}`}>
        <div
          className="prereq-viewport"
          ref={wrapperRef}
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onMouseUp={handlePanEnd}
          onMouseLeave={handlePanEnd}
          style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        >
          <div
            className={`prereq-transform-layer ${isZooming ? 'is-zooming' : ''}`}
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
              transformOrigin: '0 0',
              transition: isPanning
                ? 'none'
                : isZooming
                  ? 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
                  : 'transform 0.15s ease',
            }}
          >
            <svg
              className="pt-svg"
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
            >
              {/* Edges */}
              <g className="pt-edges">
                {edges.map((e) => {
                  const midX = (e.x1 + e.x2) / 2;
                  return (
                    <path
                      key={e.id}
                      className={`pt-edge pt-edge--${e.type}`}
                      d={`M ${e.x1} ${e.y1} C ${midX} ${e.y1}, ${midX} ${e.y2}, ${e.x2} ${e.y2}`}
                    />
                  );
                })}
              </g>

              {/* Nodes */}
              <g className="pt-nodes">
                {nodes.map(({ node, x, y, w }) => {
                  const hasChildren = !!node.children?.length;
                  const isOpen = effectiveExpanded.has(node.id);
                  const isMatch = matchedIds.has(node.id);
                  const dim = term && !isMatch && !hasChildren;
                  const neon = NEON_VAR[node.type] || NEON_VAR.core;
                  return (
                    <g
                      key={node.id}
                      className={[
                        'pt-node',
                        `pt-node--${node.type}`,
                        hasChildren ? 'pt-node--parent' : '',
                        isMatch ? 'pt-node--match' : '',
                        dim ? 'pt-node--dim' : '',
                      ].join(' ')}
                      transform={`translate(${x}, ${y - NODE_H / 2})`}
                      onClick={() => toggleNode(node)}
                    >
                      <rect className="pt-node-rect" width={w} height={NODE_H} rx={9} />
                      <text className="pt-node-text" x={14} y={NODE_H / 2 + 4}>
                        {node.code && <tspan className="pt-node-code">{node.code}</tspan>}
                        <tspan className="pt-node-name" dx={node.code ? 7 : 0}>{node.name}</tspan>
                      </text>
                      {hasChildren && (
                        <g transform={`translate(${w - 15}, ${NODE_H / 2})`}>
                          <circle className="pt-toggle-badge" r={8} />
                          <text className="pt-toggle-sign" y={3.5} textAnchor="middle">
                            {isOpen ? '−' : '+'}
                          </text>
                        </g>
                      )}
                      {hasChildren && !isOpen && (
                        <text className="pt-child-count" x={w + 8} y={NODE_H / 2 + 3.5} fill={neon}>
                          {node.children.length}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="prereq-legend">
        <div className="prereq-legend-group">
          <span className="prereq-legend-title">Legend</span>
          {[
            { label: 'Root', type: 'root' },
            { label: 'Category', type: 'category' },
            { label: 'Core Course', type: 'core' },
            { label: 'Elective', type: 'elective' },
          ].map((item) => (
            <div key={item.label} className="prereq-legend-item">
              <span
                className="prereq-legend-swatch"
                style={{
                  background: 'transparent',
                  border: `2px solid ${NEON_VAR[item.type]}`,
                  boxShadow: `0 0 6px ${NEON_VAR[item.type]}`,
                }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="prereq-legend-group">
          <span className="prereq-legend-title">Controls</span>
          <span className="prereq-legend-item" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            Click to expand/collapse &bull; Scroll to zoom &bull; ⌘F Search &bull; ⌘0 Reset &bull; Esc Exit fullscreen
          </span>
        </div>
      </div>
    </div>
  );

  // Render into <body> when fullscreen so no parent transform/overflow can trap it
  return fullscreen ? createPortal(content, document.body) : content;
}

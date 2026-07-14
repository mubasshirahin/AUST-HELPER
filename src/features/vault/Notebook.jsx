import React, { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react';
import { Bold, Italic, Underline, Image, Plus, Trash2, Move, Type, FileImage, Maximize2, Minimize2, StickyNote, Link2, Link2Off, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const STORAGE_PREFIX = 'aust-notebook-';

function loadNotes(key) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveNotes(key, data) {
  try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data)); }
  catch (e) { console.error('Failed to save notebook:', e); }
}

export default function Notebook({ vaultContext, batch }) {
  const { department, yearSem } = vaultContext;
  const storageKey = `${department}-${yearSem}-${batch?.id || 'default'}`;

  const [mode, setMode] = useState('editor');
  const editorRef = useRef(null);
  const [saved, setSaved] = useState(true);

  // Canvas state
  const [items, setItems] = useState([]);
  const [dragId, setDragId] = useState(null);
  const [dragOff, setDragOff] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [connections, setConnections] = useState([]);
  const [connectFrom, setConnectFrom] = useState(null);
  const [drawMode, setDrawMode] = useState(false);
  const [drawPhase, setDrawPhase] = useState('idle'); // idle | placing | done
  const [drawStart, setDrawStart] = useState(null);
  const [manualLines, setManualLines] = useState([]);
  const [drawPreview, setDrawPreview] = useState(null);
  const [lineColor, setLineColor] = useState('#22c55e');
  const [lineStyle, setLineStyle] = useState('solid'); // solid | dashed | dotted

  // Load saved data
  useEffect(() => {
    const saved = loadNotes(storageKey);
    if (saved) {
      if (saved.editorHtml) {
        lastEditorHtml.current = saved.editorHtml;
        if (editorRef.current) editorRef.current.innerHTML = saved.editorHtml;
      }
      if (saved.items) setItems(saved.items);
      if (saved.mode) setMode(saved.mode);
      if (saved.connections) setConnections(saved.connections);
      if (saved.manualLines) setManualLines(saved.manualLines);
    } else {
      if (editorRef.current) {
        editorRef.current.innerHTML = '<p style="color:var(--text-tertiary);font-style:italic;">Start typing or paste an image (Ctrl+V)…</p>';
      }
    }
  }, [storageKey]);

  // Auto-save
  const lastEditorHtml = useRef('');

  const doSave = useCallback(() => {
    if (editorRef.current) lastEditorHtml.current = editorRef.current.innerHTML;
    const data = {
      editorHtml: lastEditorHtml.current,
      items,
      mode,
      connections,
      manualLines,
    };
    saveNotes(storageKey, data);
    setSaved(true);
  }, [items, mode, connections, manualLines, storageKey]);

  useEffect(() => {
    if (!saved) {
      const timer = setTimeout(doSave, 500);
      return () => clearTimeout(timer);
    }
  }, [saved, doSave]);

  const markDirty = () => setSaved(false);

  // ─── Text formatting ───
  const exec = (cmd, val) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    markDirty();
  };

  // ─── Image paste ───
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = `<img src="${ev.target.result}" style="max-width:100%;border-radius:8px;margin:8px 0;" contenteditable="false" />`;
          document.execCommand('insertHTML', false, img);
          markDirty();
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  // ─── Drag & drop images ───
  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files) return;
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = `<img src="${ev.target.result}" style="max-width:100%;border-radius:8px;margin:8px 0;" contenteditable="false" />`;
          if (editorRef.current) {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
              const range = sel.getRangeAt(0);
              const rect = editorRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const pos = document.caretPositionFromPoint ? document.caretPositionFromPoint(x, y) : null;
              if (pos) {
                range.setStart(pos.offsetNode, pos.offset);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
              }
            }
            document.execCommand('insertHTML', false, img);
            markDirty();
          }
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); };

  // ─── Canvas / Whiteboard ───

  const addCanvasImage = (file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      setItems(prev => [...prev, {
        id: Date.now(),
        type: 'image',
        src: ev.target.result,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        w: 300,
        h: 200,
      }]);
      markDirty();
    };
    reader.readAsDataURL(file);
  };

  const addTextBox = () => {
    setItems(prev => [...prev, {
      id: Date.now(),
      type: 'text',
      content: 'Double-click to edit',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      w: 200,
      h: 60,
    }]);
    setEditingId(null);
    markDirty();
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files) {
      for (const f of files) {
        if (f.type.startsWith('image/')) { addCanvasImage(f); break; }
      }
    }
  };

  const handleCanvasDragOver = (e) => { e.preventDefault(); };

  const startDrag = (e, id) => {
    if (drawMode) return;
    const item = items.find(i => i.id === id);
    if (!item) return;
    setDragId(id);
    setDragOff({ x: e.clientX - item.x * canvasZoom, y: e.clientY - item.y * canvasZoom });
  };

  const onCanvasMouseMove = (e) => {
    if (!dragId) return;
    setItems(prev => prev.map(i =>
      i.id === dragId
        ? { ...i, x: (e.clientX - dragOff.x) / canvasZoom, y: (e.clientY - dragOff.y) / canvasZoom }
        : i
    ));
  };

  const stopDrag = () => {
    if (dragId) { setDragId(null); markDirty(); }
  };

  const updateItemContent = (id, content) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, content } : i));
    markDirty();
  };

  const updateItemSize = (id, w, h) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, w, h } : i));
    markDirty();
  };

  // ─── Connections ───
  const toggleConnectMode = () => {
    setConnectFrom(prev => prev === null ? 'ready' : null);
    setDrawMode(false);
  };

  const handleItemClick = (id) => {
    if (!connectFrom) return;
    if (connectFrom === 'ready') {
      setConnectFrom(id);
    } else if (connectFrom !== id) {
      setConnections(prev => {
        const exists = prev.find(c => c.fromId === connectFrom && c.toId === id);
        if (exists) return prev.filter(c => c.id !== exists.id);
        const newConn = {
          id: Date.now(),
          fromId: connectFrom,
          toId: id,
        };
        return [...prev, newConn];
      });
      setConnectFrom('ready');
      markDirty();
    } else {
      setConnectFrom('ready');
    }
  };

  const deleteConnection = (connId) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
    markDirty();
  };

  // Remove orphan connections when an item is deleted
  const deleteItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setConnections(prev => prev.filter(c => c.fromId !== id && c.toId !== id));
    if (connectFrom === id || connectFrom === 'ready') setConnectFrom(null);
    markDirty();
  };

  // ─── Manual drawing ───
  const getCanvasPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / canvasZoom, y: (e.clientY - rect.top) / canvasZoom };
  };

  const handleDrawClick = (e) => {
    if (!drawMode) return;
    const pt = getCanvasPoint(e);

    if (drawPhase === 'idle') {
      setDrawStart(pt);
      setDrawPreview(pt);
      setDrawPhase('placing');
    } else if (drawPhase === 'placing') {
      const dx = pt.x - drawStart.x;
      const dy = pt.y - drawStart.y;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        setManualLines(prev => [...prev, { x1: drawStart.x, y1: drawStart.y, x2: pt.x, y2: pt.y, id: Date.now(), color: lineColor, style: lineStyle }]);
        markDirty();
      }
      setDrawPhase('idle');
      setDrawPreview(null);
      setDrawStart(null);
    }
  };

  const onDrawMouseMove = (e) => {
    if (drawPhase === 'placing') {
      const pt = getCanvasPoint(e);
      setDrawPreview(pt);
    } else if (drawPreview) {
      setDrawPreview(null);
    }
  };

  const deleteLine = (lineId) => {
    setManualLines(prev => prev.filter(l => l.id !== lineId));
    markDirty();
  };

  const toggleDrawMode = () => {
    setDrawMode(prev => !prev);
    setDrawPhase('idle');
    setDrawStart(null);
    setDrawPreview(null);
    setConnectFrom(null);
  };

  // ─── Clear ───
  const clearEditor = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    markDirty();
  };

  const clearCanvas = () => {
    setItems([]);
    setConnections([]);
    setManualLines([]);
    setDrawStart(null);
    setDrawPreview(null);
    setDrawPhase('idle');
    markDirty();
  };

  const canvasHeight = useMemo(() => {
    if (items.length === 0) return 800;
    const maxY = Math.max(...items.map(i => (i.y || 0) + (i.h || 100)));
    return Math.max(800, maxY + 300);
  }, [items]);

  // ─── Export ───
  const exportAsImage = async (type) => {
    const el = type === 'editor' ? editorRef.current : canvasRef.current;
    if (!el) return;
    try {
      const origTransform = el.style.transform;
      if (type === 'canvas') el.style.transform = 'none';
      const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2, useCORS: true });
      if (type === 'canvas') el.style.transform = origTransform;
      const link = document.createElement('a');
      link.download = `notebook-${type}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (e) { console.error('Export failed:', e); }
  };

  const exportAsPDF = async (type) => {
    const el = type === 'editor' ? editorRef.current : canvasRef.current;
    if (!el) return;
    try {
      const origTransform = el.style.transform;
      if (type === 'canvas') el.style.transform = 'none';
      const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2, useCORS: true });
      if (type === 'canvas') el.style.transform = origTransform;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      let heightLeft = pdfH;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfW, pdfH);
      while (heightLeft > pdf.internal.pageSize.getHeight()) {
        position -= pdf.internal.pageSize.getHeight();
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfW, pdfH);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      pdf.save(`notebook-${type}-${Date.now()}.pdf`);
    } catch (e) { console.error('PDF export failed:', e); }
  };

  // ─── Canvas image upload via click ───
  const canvasFileRef = useRef(null);

  return (
    <div className="nb-container">
      {/* Toolbar */}
      <div className="nb-toolbar">
        <div className="nb-toolbar-left">
          <button className={`nb-mode-btn ${mode === 'editor' ? 'active' : ''}`} onClick={() => { setMode('editor'); markDirty(); }}>
            <StickyNote size={14} /> Editor
          </button>
          <button className={`nb-mode-btn ${mode === 'canvas' ? 'active' : ''}`} onClick={() => { setMode('canvas'); markDirty(); }}>
            <Move size={14} /> Canvas
          </button>
        </div>
        {mode === 'editor' && (
          <div className="nb-format-bar">
            <button className="nb-fmt-btn" onClick={() => exec('bold')} title="Bold"><Bold size={14} /></button>
            <button className="nb-fmt-btn" onClick={() => exec('italic')} title="Italic"><Italic size={14} /></button>
            <button className="nb-fmt-btn" onClick={() => exec('underline')} title="Underline"><Underline size={14} /></button>
            <span className="nb-fmt-sep" />
            <button className="nb-fmt-btn" onClick={() => exec('insertUnorderedList')} title="Bullet list">☰</button>
            <button className="nb-fmt-btn" onClick={() => exec('insertOrderedList')} title="Numbered list">#</button>
            <span className="nb-fmt-sep" />
            <button className="nb-fmt-btn" onClick={() => exec('formatBlock', '<h1>')} title="Heading 1">H1</button>
            <button className="nb-fmt-btn" onClick={() => exec('formatBlock', '<h2>')} title="Heading 2">H2</button>
            <button className="nb-fmt-btn" onClick={() => exec('formatBlock', '<h3>')} title="Heading 3">H3</button>
            <span className="nb-fmt-sep" />
            <button className="nb-fmt-btn" onClick={clearEditor} title="Clear editor"><Trash2 size={13} /></button>
          </div>
        )}
        {mode === 'canvas' && (
          <div className="nb-canvas-tools">
            <button className="nb-fmt-btn" onClick={addTextBox} title="Add text box"><Type size={14} /></button>
            <button className="nb-fmt-btn" onClick={() => canvasFileRef.current?.click()} title="Add image"><Image size={14} /></button>
            <input ref={canvasFileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) addCanvasImage(f); e.target.value = ''; }} />
            <span className="nb-fmt-sep" />
            <span className="nb-fmt-sep" />
            <button className="nb-fmt-btn" onClick={clearCanvas} title="Clear canvas"><Trash2 size={13} /></button>
            <span className="nb-fmt-sep" />
            <button className={`nb-fmt-btn ${drawMode ? 'active' : ''}`} onClick={toggleDrawMode} title="Draw line">
              <Move size={14} />
            </button>
            {drawMode && (
              <>
                <span className="nb-fmt-sep" />
                {['#22c55e','#ef4444','#3b82f6','#eab308','#a855f7','#f97316'].map(c => (
                  <button key={c} className="nb-fmt-btn" onClick={() => setLineColor(c)} title={c}
                    style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: lineColor === c ? '2px solid #fff' : '2px solid transparent', boxSizing: 'content-box' }}
                  />
                ))}
                <span className="nb-fmt-sep" />
                {['solid','dashed','dotted'].map(s => (
                  <button key={s} className={`nb-fmt-btn ${lineStyle === s ? 'active' : ''}`} onClick={() => setLineStyle(s)}
                    style={{ fontSize: 9, padding: '0 4px' }}>
                    {s === 'solid' ? '━━' : s === 'dashed' ? '╌╌' : '┅┅'}
                  </button>
                ))}
                <span className="nb-fmt-sep" />
                <span className="nb-connect-hint">{drawPhase === 'placing' ? 'Click to end line' : 'Click to start line'}</span>
              </>
            )}
            <button className={`nb-fmt-btn ${connectFrom ? 'active' : ''}`} onClick={toggleConnectMode} title="Connect items">
              {connectFrom ? <Link2Off size={14} /> : <Link2 size={14} />}
            </button>
            {connectFrom && connectFrom !== 'ready' && (
              <span className="nb-connect-hint">Click another item to connect</span>
            )}
            <span className="nb-fmt-sep" />
            <button className="nb-fmt-btn" onClick={() => setCanvasZoom(z => Math.min(3, z + 0.1))} title="Zoom in"><Maximize2 size={13} /></button>
            <span className="nb-zoom-label">{Math.round(canvasZoom * 100)}%</span>
            <button className="nb-fmt-btn" onClick={() => setCanvasZoom(z => Math.max(0.3, z - 0.1))} title="Zoom out"><Minimize2 size={13} /></button>
          </div>
        )}
        <div className="nb-toolbar-right">
          <div className="nb-export-group">
            <button className="nb-export-btn" onClick={() => exportAsImage(mode)} title="Export as PNG">
              <Download size={12} /> PNG
            </button>
            <button className="nb-export-btn" onClick={() => exportAsPDF(mode)} title="Export as PDF">
              <Download size={12} /> PDF
            </button>
          </div>
          <span className="nb-save-status">{saved ? 'Saved' : 'Unsaved…'}</span>
        </div>
      </div>

      {/* Editor Mode */}
      {mode === 'editor' && (
        <div
          ref={editorRef}
          className="nb-editor"
          contentEditable
          suppressContentEditableWarning
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onInput={markDirty}
          onKeyDown={() => markDirty()}
        />
      )}

      {/* Canvas Mode */}
      {mode === 'canvas' && (
        <div
          ref={canvasRef}
          className={`nb-canvas ${drawMode ? 'draw-active' : ''}`}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          onMouseMove={(e) => { onDrawMouseMove(e); onCanvasMouseMove(e); }}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onClick={(e) => {
            if (drawMode) { handleDrawClick(e); return; }
            if (e.target === e.currentTarget) setConnectFrom(null);
          }}
          style={{ transform: `scale(${canvasZoom})`, transformOrigin: '0 0', height: canvasHeight }}
        >
          {/* Canvas grid background */}
          <div className="nb-canvas-grid" />

          {/* Manual lines */}
          {manualLines.map(line => {
            const dx = line.x2 - line.x1;
            const dy = line.y2 - line.y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            const col = line.color || '#22c55e';
            const isSolid = !line.style || line.style === 'solid';
            return (
              <Fragment key={line.id}>
                <div style={{
                  position: 'absolute',
                  left: line.x1,
                  top: line.y1,
                  width: len,
                  height: 0,
                  borderTop: isSolid ? `3px solid ${col}` : line.style === 'dashed' ? `2px dashed ${col}` : `2px dotted ${col}`,
                  transformOrigin: '0 0',
                  transform: `rotate(${angle}deg)`,
                  pointerEvents: 'none',
                  zIndex: 2,
                }} />
                <div
                  onClick={(e) => { e.stopPropagation(); deleteLine(line.id); }}
                  style={{
                    position: 'absolute',
                    left: line.x2 - 6,
                    top: line.y2 - 6,
                    width: 12,
                    height: 12,
                    background: col,
                    clipPath: 'polygon(0% 20%, 100% 50%, 0% 80%)',
                    transform: `rotate(${angle}deg)`,
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                    zIndex: 3,
                  }}
                  title="Delete line"
                />
                <div style={{
                  position: 'absolute',
                  left: line.x1 - 3,
                  top: line.y1 - 3,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: col,
                  pointerEvents: 'none',
                  zIndex: 2,
                }} />
              </Fragment>
            );
          })}
          {/* Preview line */}
          {drawPreview && drawStart && (() => {
            const dx = drawPreview.x - drawStart.x;
            const dy = drawPreview.y - drawStart.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            const col = lineColor;
            const isSolid = lineStyle === 'solid';
            return (
              <div style={{ position: 'absolute', pointerEvents: 'none', zIndex: 1, opacity: 0.6 }}>
                <div style={{
                  position: 'absolute',
                  left: drawStart.x,
                  top: drawStart.y,
                  width: len,
                  height: 0,
                  borderTop: isSolid ? `3px solid ${col}` : lineStyle === 'dashed' ? `2px dashed ${col}` : `2px dotted ${col}`,
                  transformOrigin: '0 0',
                  transform: `rotate(${angle}deg)`,
                }} />
                <div style={{
                  position: 'absolute',
                  left: drawStart.x - 4,
                  top: drawStart.y - 4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: col,
                  opacity: 0.8,
                }} />
              </div>
            );
          })()}
          {/* Connection lines between items */}
          {connections.map(conn => {
            const from = items.find(i => i.id === conn.fromId);
            const to = items.find(i => i.id === conn.toId);
            if (!from || !to) return null;
            const x1 = from.x + from.w / 2;
            const y1 = from.y + from.h / 2;
            const x2 = to.x + to.w / 2;
            const y2 = to.y + to.h / 2;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            return (
              <div key={conn.id} style={{ position: 'absolute', pointerEvents: 'none', zIndex: 1 }}>
                <div style={{
                  position: 'absolute',
                  left: x1,
                  top: y1,
                  width: len,
                  height: 2,
                  background: 'var(--accent-blue)',
                  opacity: 0.7,
                  transformOrigin: '0 0',
                  transform: `rotate(${angle}deg)`,
                }} />
                <div
                  onClick={(e) => { e.stopPropagation(); deleteConnection(conn.id); }}
                  style={{
                    position: 'absolute',
                    left: x2 - 5,
                    top: y2 - 5,
                    width: 10,
                    height: 10,
                    background: 'var(--accent-blue)',
                    clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)',
                    transform: `rotate(${angle}deg)`,
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                  }}
                  title="Remove connection"
                />
              </div>
            );
          })}

          {items.map(item => (
            <div
              key={item.id}
              className={`nb-canvas-item ${connectFrom === item.id ? 'connecting' : ''} ${connectFrom && connectFrom !== 'ready' && connectFrom !== item.id ? 'connect-target' : ''}`}
              style={{ left: item.x, top: item.y, width: item.w, height: item.h }}
              onMouseDown={(e) => { if (connectFrom) { e.stopPropagation(); handleItemClick(item.id); } else { startDrag(e, item.id); } }}
            >
              {item.type === 'image' ? (
                <img src={item.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
              ) : (
                <div
                  className={`nb-canvas-text ${editingId === item.id ? 'editing' : ''}`}
                  contentEditable={editingId === item.id}
                  suppressContentEditableWarning
                  onBlur={(e) => { updateItemContent(item.id, e.currentTarget.textContent); setEditingId(null); }}
                  onDoubleClick={(e) => { e.stopPropagation(); setEditingId(item.id); }}
                >
                  {item.content}
                </div>
              )}
              <button className="nb-canvas-del" onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                onMouseDown={e => e.stopPropagation()}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

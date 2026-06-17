function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

let currentAnimation = { 'as': 0, 'ida': 0, 'bfs': 0, 'dfs': 0, 'sort': 0, 'trees': 0 };
function nextAnimId(which) { return ++currentAnimation[which]; }
function checkAnimId(which, id) { return currentAnimation[which] === id; }

function switchTab(name,btn){
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  const tabId = name;
  const panel = document.getElementById('tab-'+tabId);
  if(panel) panel.classList.add('active');
  btn.classList.add('active');

  if (name === 'astar')   { drawGraphSVG('as', asGraph, [], []); updateInfoPanel('as'); }
  if (name === 'idastar') { drawGraphSVG('ida', idaGraph, [], []); updateInfoPanel('ida'); }
  if (name === 'bfs')     { drawGraphSVG('bfs', bfsGraph, [], []); updateInfoPanel('bfs'); }
  if (name === 'dfs')     { drawGraphSVG('dfs', dfsGraph, [], []); updateInfoPanel('dfs'); }
  if (name === 'sorting') { updateInfoPanel('sorting'); }
  if (name === 'trees')   { drawTreeSVG([], [], []); updateInfoPanel('trees'); }
}

// Graphs store an array of edge objects {node: "B", weight: 10}
const asGraph  = {};
const idaGraph = {};
const bfsGraph = {};
const dfsGraph = {};

const EXAMPLE = {
  "A":[{"node":"B","weight":10}, {"node":"C","weight":15}],
  "B":[{"node":"D","weight":12}, {"node":"E","weight":15}],
  "C":[{"node":"F","weight":10}],
  "D":[{"node":"G","weight":20}],
  "E":[{"node":"G","weight":10}],
  "F":[{"node":"G","weight":5}],
  "G":[]
};

function addEdgeToGraph(g, from, to, weight){
  from=from.trim().toUpperCase(); to=to.trim().toUpperCase();
  if(!from||!to) return false;
  weight = parseInt(weight) || 1;
  
  if(!g[from]) g[from]=[];
  if(!g[to])   g[to]=[];
  
  const existing = g[from].find(e => e.node === to);
  if(existing) {
      existing.weight = weight;
  } else {
      g[from].push({node: to, weight: weight});
  }
  return true;
}

function asAddEdge(){
  const f=document.getElementById('as-from').value;
  const t=document.getElementById('as-to').value;
  const w=document.getElementById('as-weight').value;
  if(addEdgeToGraph(asGraph,f,t,w)){
    document.getElementById('as-from').value='';
    document.getElementById('as-to').value='';
    drawGraphSVG('as',asGraph,[],[]);
  }
}
function idaAddEdge(){
  const f=document.getElementById('ida-from').value;
  const t=document.getElementById('ida-to').value;
  const w=document.getElementById('ida-weight').value;
  if(addEdgeToGraph(idaGraph,f,t,w)){
    document.getElementById('ida-from').value='';
    document.getElementById('ida-to').value='';
    drawGraphSVG('ida',idaGraph,[],[]);
  }
}
function bfsAddEdge(){
  const f=document.getElementById('bfs-from').value;
  const t=document.getElementById('bfs-to').value;
  const w=document.getElementById('bfs-weight').value;
  if(addEdgeToGraph(bfsGraph,f,t,w)){
    document.getElementById('bfs-from').value='';
    document.getElementById('bfs-to').value='';
    drawGraphSVG('bfs',bfsGraph,[],[]);
  }
}
function dfsAddEdge(){
  const f=document.getElementById('dfs-from').value;
  const t=document.getElementById('dfs-to').value;
  const w=document.getElementById('dfs-weight').value;
  if(addEdgeToGraph(dfsGraph,f,t,w)){
    document.getElementById('dfs-from').value='';
    document.getElementById('dfs-to').value='';
    drawGraphSVG('dfs',dfsGraph,[],[]);
  }
}

function asLoadExample(){
  nextAnimId('as');
  Object.keys(asGraph).forEach(k=>delete asGraph[k]);
  Object.assign(asGraph,JSON.parse(JSON.stringify(EXAMPLE)));
  document.getElementById('as-start').value='A';
  document.getElementById('as-end').value='G';
  drawGraphSVG('as',asGraph,[],[]);
}
function idaLoadExample(){
  nextAnimId('ida');
  Object.keys(idaGraph).forEach(k=>delete idaGraph[k]);
  Object.assign(idaGraph,JSON.parse(JSON.stringify(EXAMPLE)));
  document.getElementById('ida-start').value='A';
  document.getElementById('ida-end').value='G';
  drawGraphSVG('ida',idaGraph,[],[]);
}
function bfsLoadExample(){
  nextAnimId('bfs');
  Object.keys(bfsGraph).forEach(k=>delete bfsGraph[k]);
  Object.assign(bfsGraph,JSON.parse(JSON.stringify(EXAMPLE)));
  document.getElementById('bfs-start').value='A';
  document.getElementById('bfs-end').value='G';
  drawGraphSVG('bfs',bfsGraph,[],[]);
}
function dfsLoadExample(){
  nextAnimId('dfs');
  Object.keys(dfsGraph).forEach(k=>delete dfsGraph[k]);
  Object.assign(dfsGraph,JSON.parse(JSON.stringify(EXAMPLE)));
  document.getElementById('dfs-start').value='A';
  document.getElementById('dfs-end').value='G';
  drawGraphSVG('dfs',dfsGraph,[],[]);
}

function asReset(){
  nextAnimId('as');
  Object.keys(asGraph).forEach(k=>delete asGraph[k]);
  drawGraphSVG('as',asGraph,[],[]);
  ['as-tcplx','as-scplx','as-nodes','as-path-val'].forEach(id=>document.getElementById(id).textContent='—');
  document.getElementById('as-log').textContent='Graph cleared.';
}
function idaReset(){
  nextAnimId('ida');
  Object.keys(idaGraph).forEach(k=>delete idaGraph[k]);
  drawGraphSVG('ida',idaGraph,[],[]);
  ['ida-tcplx','ida-scplx','ida-nodes','ida-path-val'].forEach(id=>document.getElementById(id).textContent='—');
  document.getElementById('ida-log').textContent='Graph cleared.';
}
function bfsReset(){
  nextAnimId('bfs');
  Object.keys(bfsGraph).forEach(k=>delete bfsGraph[k]);
  drawGraphSVG('bfs',bfsGraph,[],[]);
  ['bfs-tcplx','bfs-scplx','bfs-nodes','bfs-path-val'].forEach(id=>document.getElementById(id).textContent='—');
  document.getElementById('bfs-log').textContent='Graph cleared.';
}
function dfsReset(){
  nextAnimId('dfs');
  Object.keys(dfsGraph).forEach(k=>delete dfsGraph[k]);
  drawGraphSVG('dfs',dfsGraph,[],[]);
  ['dfs-tcplx','dfs-scplx','dfs-nodes','dfs-path-val'].forEach(id=>document.getElementById(id).textContent='—');
  document.getElementById('dfs-log').textContent='Graph cleared.';
}

function generateRandomGraphData() {
    const numNodes = Math.floor(Math.random() * 5) + 5; // 5 to 9 nodes
    const graph = {};
    const nodes = [];
    for (let i = 0; i < numNodes; i++) {
        const nodeName = String.fromCharCode(65 + i); // A, B, C...
        graph[nodeName] = [];
        nodes.push(nodeName);
    }
    
    // Create a guaranteed path from start to end mostly
    for (let i = 0; i < numNodes - 1; i++) {
        if (Math.random() > 0.3) { 
            const weight = Math.floor(Math.random() * 20) + 5;
            graph[nodes[i]].push({node: nodes[i+1], weight: weight});
        }
    }
    // Add random edges
    for (let i = 0; i < numNodes; i++) {
        const numEdges = Math.floor(Math.random() * 3) + 1; // 1 to 3 edges per node
        for (let j = 0; j < numEdges; j++) {
            const target = nodes[Math.floor(Math.random() * numNodes)];
            if (target !== nodes[i] && !graph[nodes[i]].some(e => e.node === target)) {
                const weight = Math.floor(Math.random() * 20) + 5;
                graph[nodes[i]].push({node: target, weight: weight});
            }
        }
    }
    
    if (graph[nodes[0]].length === 0) {
        graph[nodes[0]].push({node: nodes[1], weight: 10});
    }
    
    return { graph, start: nodes[0], end: nodes[numNodes - 1] };
}

function asGenerateRandom() {
    nextAnimId('as');
    Object.keys(asGraph).forEach(k=>delete asGraph[k]);
    const { graph, start, end } = generateRandomGraphData();
    Object.assign(asGraph, graph);
    document.getElementById('as-start').value = start;
    document.getElementById('as-end').value = end;
    drawGraphSVG('as', asGraph, [], []);
    ['as-tcplx','as-scplx','as-nodes','as-path-val'].forEach(id=>document.getElementById(id).textContent='—');
    document.getElementById('as-log').textContent='Random graph generated.';
}

function idaGenerateRandom() {
    nextAnimId('ida');
    Object.keys(idaGraph).forEach(k=>delete idaGraph[k]);
    const { graph, start, end } = generateRandomGraphData();
    Object.assign(idaGraph, graph);
    document.getElementById('ida-start').value = start;
    document.getElementById('ida-end').value = end;
    drawGraphSVG('ida', idaGraph, [], []);
    ['ida-tcplx','ida-scplx','ida-nodes','ida-path-val'].forEach(id=>document.getElementById(id).textContent='—');
    document.getElementById('ida-log').textContent='Random graph generated.';
}

function bfsGenerateRandom() {
    nextAnimId('bfs');
    Object.keys(bfsGraph).forEach(k=>delete bfsGraph[k]);
    const { graph, start, end } = generateRandomGraphData();
    Object.assign(bfsGraph, graph);
    document.getElementById('bfs-start').value = start;
    document.getElementById('bfs-end').value = end;
    drawGraphSVG('bfs', bfsGraph, [], []);
    ['bfs-tcplx','bfs-scplx','bfs-nodes','bfs-path-val'].forEach(id=>document.getElementById(id).textContent='—');
    document.getElementById('bfs-log').textContent='Random graph generated.';
}

function dfsGenerateRandom() {
    nextAnimId('dfs');
    Object.keys(dfsGraph).forEach(k=>delete dfsGraph[k]);
    const { graph, start, end } = generateRandomGraphData();
    Object.assign(dfsGraph, graph);
    document.getElementById('dfs-start').value = start;
    document.getElementById('dfs-end').value = end;
    drawGraphSVG('dfs', dfsGraph, [], []);
    ['dfs-tcplx','dfs-scplx','dfs-nodes','dfs-path-val'].forEach(id=>document.getElementById(id).textContent='—');
    document.getElementById('dfs-log').textContent='Random graph generated.';
}

function layoutGraph(graph, width, height){
  const nodes=Object.keys(graph);
  if(!nodes.length) return {};
  const positions={};
  const n=nodes.length;
  const cx=width/2, cy=height/2, r=Math.min(height/2 - 50, 40+n*18);
  
  // Custom layout for Example
  if(n === 7 && nodes.includes('A') && nodes.includes('G')){
      positions['A'] = {x: cx - 250, y: cy};
      positions['B'] = {x: cx - 100, y: cy - 100};
      positions['C'] = {x: cx - 100, y: cy + 100};
      positions['D'] = {x: cx + 100, y: cy - 150};
      positions['E'] = {x: cx + 100, y: cy - 50};
      positions['F'] = {x: cx + 100, y: cy + 100};
      positions['G'] = {x: cx + 250, y: cy};
      return positions;
  }

  nodes.forEach((name,i)=>{
    const angle=(2*Math.PI*i/n)-Math.PI/2;
    positions[name]={x:cx+r*Math.cos(angle), y:cy+r*Math.sin(angle)};
  });
  return positions;
}

function drawGraphSVG(which, graph, state, path){
  const wrap=document.getElementById(which+'-graph-wrap');
  const nodes=Object.keys(graph);
  if(!nodes.length){
    wrap.innerHTML='<p style="font-family:var(--mono);font-size:13px;color:var(--muted);padding:20px 0; text-align:center;">No nodes yet. Add edges or load the example graph.</p>';
    return;
  }

  const rect = wrap.getBoundingClientRect();
  const W = rect.width || 800;
  const H = rect.height || 600;

  const pos=layoutGraph(graph, W, H);
  
  let current = null, openSet = [], closedSet = [];
  if (Array.isArray(state)) {
      closedSet = state;
  } else if (state && typeof state === 'object') {
      current = state.current;
      if (which === 'as') {
          openSet = state.open || [];
          closedSet = state.closed || [];
      } else if (which === 'ida') {
          closedSet = state.path || [];
      } else {
          openSet = state.open || [];
          closedSet = state.closed || [];
      }
  }
  
  const pathSet=new Set(path);
  const visitSet=new Set(closedSet);
  const openSetMap=new Set(openSet);
  const cameFrom=state && state.came_from ? state.came_from : {};
  let accentColor = '#6366f1';
  if(which === 'ida') accentColor = '#22d3ee';
  if(which === 'bfs') accentColor = '#10b981';
  if(which === 'dfs') accentColor = '#f43f5e';

  let edgeSVG='';
  let weightSVG='';
  
  for(const [from, neighbors] of Object.entries(graph)){
    for(const edge of neighbors){
      const to = edge.node;
      const weight = edge.weight;
      if(!pos[from]||!pos[to]) continue;
      
      const {x:x1,y:y1}=pos[from];
      const {x:x2,y:y2}=pos[to];
      const onPath=path.length>1&&path.some((n,i)=>i<path.length-1&&path[i]===from&&path[i+1]===to);
      const onSearchPath = !path.length && (
          (which === 'ida' && closedSet.includes(from) && closedSet.includes(to) && closedSet.indexOf(to) === closedSet.indexOf(from) + 1) ||
          (which !== 'ida' && cameFrom[to] === from && (openSetMap.has(to) || visitSet.has(to) || current === to))
      );
      
      const col=onPath?'#f59e0b':(onSearchPath?'#3b82f6':'rgba(148, 163, 184, 0.4)');
      const sw=onPath?4:(onSearchPath?3:2);
      
      const dx=x2-x1, dy=y2-y1, dist=Math.sqrt(dx*dx+dy*dy);
      if(dist < 1) continue;
      const ux=dx/dist, uy=dy/dist;
      const R=24;
      const ex=x2-ux*R, ey=y2-uy*R;
      const sx=x1+ux*R, sy=y1+uy*R;
      
      // Arrowhead
      const ax=ex-ux*12+uy*7, ay=ey-uy*12-ux*7;
      const bx=ex-ux*12-uy*7, by=ey-uy*12+ux*7;
      
      edgeSVG+=`<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${col}" stroke-width="${sw}"/>
      <polygon points="${ex},${ey} ${ax},${ay} ${bx},${by}" fill="${col}"/>`;
      
      // Weight text box
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2 - 10;
      weightSVG+=`<rect x="${midX-12}" y="${midY-10}" width="24" height="20" rx="4" fill="#1e293b" stroke="${col}" stroke-width="1" />
      <text x="${midX}" y="${midY}" text-anchor="middle" dominant-baseline="central" fill="#e2e8f0" font-size="11" font-weight="600" font-family="JetBrains Mono,monospace">${weight}</text>`;
    }
  }

  let nodeSVG='';
  for(const [name,{x,y}] of Object.entries(pos)){
    let fill='rgba(15, 23, 42, 0.9)', stroke='rgba(148, 163, 184, 0.5)', textCol='#f8fafc';
    let pulseAnim = '';
    
    if(pathSet.has(name)) { 
        fill='rgba(245,158,11,.2)'; stroke='#f59e0b'; 
    } else if (name === current) {
        fill='rgba(59,130,246,.3)'; stroke='#3b82f6';
        pulseAnim = `<animate attributeName="r" values="24;28;24" dur="1s" repeatCount="indefinite" />`;
    } else if (openSetMap.has(name)) {
        fill='rgba(16,185,129,.15)'; stroke='#10b981';
    } else if (visitSet.has(name)) {
        fill = 'rgba(148, 163, 184, 0.15)';
        if(which==='as') fill='rgba(99,102,241,.15)';
        if(which==='ida') fill='rgba(34,211,238,.15)';
        if(which==='bfs') fill='rgba(16,185,129,.15)';
        if(which==='dfs') fill='rgba(244,63,94,.15)';
        stroke=accentColor; 
    }
    
    if(path.length && path[0]===name) { 
        fill='rgba(16,185,129,.2)'; stroke='#10b981'; 
        pulseAnim = `<animate attributeName="r" values="24;26;24" dur="2s" repeatCount="indefinite" />`;
    }
    if(path.length && path[path.length-1]===name) { 
        fill='rgba(239,68,68,.2)'; stroke='#ef4444'; 
        pulseAnim = `<animate attributeName="r" values="24;26;24" dur="2s" repeatCount="indefinite" />`;
    }
    
    nodeSVG+=`<circle cx="${x}" cy="${y}" r="24" fill="${fill}" stroke="${stroke}" stroke-width="3">${pulseAnim}</circle>
    <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="${textCol}" font-size="14" font-weight="700" font-family="JetBrains Mono,monospace">${escapeHTML(name)}</text>`;
  }

  wrap.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
    ${edgeSVG}${weightSVG}${nodeSVG}
  </svg>`;
}

async function playAnimation(which, graph, steps, path, animId) {
    const logBox = document.getElementById(which + '-log');
    const originalLog = logBox.innerHTML;
    const wrap = document.getElementById(which + '-graph-wrap');

    stepHistory = [];
    stepIndex = -1;
    setAnimRunning(true);

    for(let i=0; i<steps.length; i++) {
        if (!checkAnimId(which, animId)) { setAnimRunning(false); return; }

        // Pause hook
        while (animPaused) {
            await new Promise(r => { animResumeResolve = r; });
            if (!checkAnimId(which, animId)) { setAnimRunning(false); return; }
        }

        const step = steps[i];
        if (which === 'as') {
            logBox.innerHTML = `Step ${i+1}: Eval <b>${step.current}</b> (g: ${step.g.toFixed(1)}, f: ${step.f.toFixed(1)}) | Open: [${step.open.join(',')}] | Closed: [${step.closed.join(',')}]`;
        } else if (which === 'ida') {
            logBox.innerHTML = `Step ${i+1}: Eval <b>${step.current}</b> (bound: ${step.bound.toFixed(1)}, f: ${step.f.toFixed(1)}) | Path: [${step.path.join('→')}]`;
        } else {
            logBox.innerHTML = `Step ${i+1}: Eval <b>${step.current}</b> | Open: [${step.open.join(',')}] | Closed: [${step.closed.join(',')}]`;
        }
        drawGraphSVG(which, graph, step, []);

        // Snapshot for step-back
        stepHistory.push({ svgHTML: wrap.innerHTML, logHTML: logBox.innerHTML });
        stepIndex = stepHistory.length - 1;
        updateStepBtns();

        const delay = parseInt(document.getElementById('speed-slider').value) || 600;
        await new Promise(r => setTimeout(r, delay));
    }

    if (!checkAnimId(which, animId)) { setAnimRunning(false); return; }
    logBox.innerHTML = originalLog;
    drawGraphSVG(which, graph, [], path);
    setAnimRunning(false);
}

function getGraphPositions(which, graph) {
    const wrap = document.getElementById(which + '-graph-wrap');
    const rect = wrap.getBoundingClientRect();
    const W = rect.width || 800;
    const H = rect.height || 600;
    return layoutGraph(graph, W, H);
}

async function runAstar(){
  const start=document.getElementById('as-start').value.trim().toUpperCase();
  const end=document.getElementById('as-end').value.trim().toUpperCase();
  if(!start||!end){document.getElementById('as-log').innerHTML='<span class="log-err">Enter start and end node names.</span>';return;}
  
  document.getElementById('as-log').textContent='Running A* Search...';
  const positions = getGraphPositions('as', asGraph);
  
  try {
      const res=await fetch('/api/astar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({graph:asGraph,positions,start,end})});
      const d=await res.json();
      
      document.getElementById('as-tcplx').textContent=d.complexity_time;
      document.getElementById('as-scplx').textContent=d.complexity_space;
      document.getElementById('as-nodes').textContent=d.nodes_explored;
      document.getElementById('as-path-val').textContent=d.path.join(' → ') + (d.path.length > 0 ? ` (Cost: ${d.path_length})` : '');
      document.getElementById('as-log').innerHTML=`<span class="log-op">A*</span>  <span class="${d.found?'log-ok':'log-err'}">${escapeHTML(d.message)}</span>`;
      
      const animId = nextAnimId('as');
      // Play animation using iterative steps
      if (d.steps && d.steps.length > 0) {
          await playAnimation('as', asGraph, d.steps, d.path, animId);
      } else {
          drawGraphSVG('as', asGraph, [], d.path);
      }
  } catch(e) {
      document.getElementById('as-log').innerHTML='<span class="log-err">Server connection failed.</span>';
  }
}

async function runIdastar(){
  const start=document.getElementById('ida-start').value.trim().toUpperCase();
  const end=document.getElementById('ida-end').value.trim().toUpperCase();
  if(!start||!end){document.getElementById('ida-log').innerHTML='<span class="log-err">Enter start and end node names.</span>';return;}
  
  document.getElementById('ida-log').textContent='Running IDA* Search...';
  const positions = getGraphPositions('ida', idaGraph);
  
  try {
      const res=await fetch('/api/idastar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({graph:idaGraph,positions,start,end})});
      const d=await res.json();
      
      document.getElementById('ida-tcplx').textContent=d.complexity_time;
      document.getElementById('ida-scplx').textContent=d.complexity_space;
      document.getElementById('ida-nodes').textContent=d.nodes_explored;
      document.getElementById('ida-path-val').textContent=d.path.join(' → ') + (d.path.length > 0 ? ` (Cost: ${d.path_length})` : '');
      document.getElementById('ida-log').innerHTML=`<span class="log-op">IDA*</span>  <span class="${d.found?'log-ok':'log-err'}">${escapeHTML(d.message)}</span>`;
      
      const animId = nextAnimId('ida');
      if (d.steps && d.steps.length > 0) {
          await playAnimation('ida', idaGraph, d.steps, d.path, animId);
      } else {
          drawGraphSVG('ida', idaGraph, [], d.path);
      }
  } catch (e) {
      document.getElementById('ida-log').innerHTML='<span class="log-err">Server connection failed.</span>';
  }
}

async function runBfs(){
  const start=document.getElementById('bfs-start').value.trim().toUpperCase();
  const end=document.getElementById('bfs-end').value.trim().toUpperCase();
  if(!start||!end){document.getElementById('bfs-log').innerHTML='<span class="log-err">Enter start and end node names.</span>';return;}
  
  document.getElementById('bfs-log').textContent='Running BFS Algorithm...';
  const positions = getGraphPositions('bfs', bfsGraph);
  
  try {
      const res=await fetch('/api/bfs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({graph:bfsGraph,positions,start,end})});
      const d=await res.json();
      
      document.getElementById('bfs-tcplx').textContent=d.complexity_time;
      document.getElementById('bfs-scplx').textContent=d.complexity_space;
      document.getElementById('bfs-nodes').textContent=d.nodes_explored;
      document.getElementById('bfs-path-val').textContent=d.path.join(' → ') + (d.path.length > 0 ? ` (Length: ${d.path_length})` : '');
      document.getElementById('bfs-log').innerHTML=`<span class="log-op" style="background:var(--green)">BFS</span>  <span class="${d.found?'log-ok':'log-err'}">${escapeHTML(d.message)}</span>`;
      
      const animId = nextAnimId('bfs');
      if (d.steps && d.steps.length > 0) {
          await playAnimation('bfs', bfsGraph, d.steps, d.path, animId);
      } else {
          drawGraphSVG('bfs', bfsGraph, [], d.path);
      }
  } catch (e) {
      document.getElementById('bfs-log').innerHTML='<span class="log-err">Server connection failed.</span>';
  }
}

async function runDfs(){
  const start=document.getElementById('dfs-start').value.trim().toUpperCase();
  const end=document.getElementById('dfs-end').value.trim().toUpperCase();
  if(!start||!end){document.getElementById('dfs-log').innerHTML='<span class="log-err">Enter start and end node names.</span>';return;}
  
  document.getElementById('dfs-log').textContent='Running DFS Algorithm...';
  const positions = getGraphPositions('dfs', dfsGraph);
  
  try {
      const res=await fetch('/api/dfs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({graph:dfsGraph,positions,start,end})});
      const d=await res.json();
      
      document.getElementById('dfs-tcplx').textContent=d.complexity_time;
      document.getElementById('dfs-scplx').textContent=d.complexity_space;
      document.getElementById('dfs-nodes').textContent=d.nodes_explored;
      document.getElementById('dfs-path-val').textContent=d.path.join(' → ') + (d.path.length > 0 ? ` (Length: ${d.path_length})` : '');
      document.getElementById('dfs-log').innerHTML=`<span class="log-op" style="background:#f43f5e">DFS</span>  <span class="${d.found?'log-ok':'log-err'}">${escapeHTML(d.message)}</span>`;
      
      const animId = nextAnimId('dfs');
      if (d.steps && d.steps.length > 0) {
          await playAnimation('dfs', dfsGraph, d.steps, d.path, animId);
      } else {
          drawGraphSVG('dfs', dfsGraph, [], d.path);
      }
  } catch (e) {
      document.getElementById('dfs-log').innerHTML='<span class="log-err">Server connection failed.</span>';
  }
}

// Initial draw or empty message
window.addEventListener('resize', () => {
    if(Object.keys(asGraph).length > 0) drawGraphSVG('as', asGraph, [], []);
    if(Object.keys(idaGraph).length > 0) drawGraphSVG('ida', idaGraph, [], []);
    if(Object.keys(bfsGraph).length > 0) drawGraphSVG('bfs', bfsGraph, [], []);
    if(Object.keys(dfsGraph).length > 0) drawGraphSVG('dfs', dfsGraph, [], []);
});

/* ==========================================================
   TASK 3 — DARK / LIGHT MODE TOGGLE
   ========================================================== */
function toggleTheme() {
    const root = document.documentElement;
    const isLight = root.classList.toggle('light');
    document.getElementById('theme-toggle').textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('dsav-theme', isLight ? 'light' : 'dark');
}

/* ==========================================================
   TASK 4 — PAUSE / RESUME
   ========================================================== */
let animPaused = false;
let animResumeResolve = null;

function togglePause() {
    animPaused = !animPaused;
    const btn = document.getElementById('pause-resume-btn');
    const stepBack = document.getElementById('step-back-btn');
    const stepFwd  = document.getElementById('step-fwd-btn');

    if (animPaused) {
        btn.textContent = '▶ Resume';
        stepBack.classList.add('visible');
        stepFwd.classList.add('visible');
        updateStepBtns();
    } else {
        btn.textContent = '⏸ Pause';
        stepBack.classList.remove('visible');
        stepFwd.classList.remove('visible');
        if (animResumeResolve) { animResumeResolve(); animResumeResolve = null; }
    }
}

function setAnimRunning(running) {
    const pauseBtn = document.getElementById('pause-resume-btn');
    pauseBtn.disabled = !running;
    if (!running) {
        animPaused = false;
        pauseBtn.textContent = '⏸ Pause';
        document.getElementById('step-back-btn').classList.remove('visible');
        document.getElementById('step-fwd-btn').classList.remove('visible');
    }
}

/* ==========================================================
   TASK 5 — STEP FORWARD / STEP BACK
   ========================================================== */
let stepHistory = [];
let stepIndex   = -1;
let _stepCurrentWrap = null;
let _stepCurrentLog  = null;

function _findActiveWrapAndLog() {
    const activePanel = document.querySelector('.tab-panel.active');
    if (!activePanel) return;
    _stepCurrentWrap = activePanel.querySelector('[id$="-graph-wrap"], #sort-canvas-wrap, #tree-graph-wrap');
    _stepCurrentLog  = activePanel.querySelector('.log-box');
}

function updateStepBtns() {
    document.getElementById('step-back-btn').disabled = stepIndex <= 0;
    document.getElementById('step-fwd-btn').disabled  = stepIndex >= stepHistory.length - 1;
}

function stepBack() {
    if (stepIndex <= 0) return;
    stepIndex--;
    _findActiveWrapAndLog();
    if (_stepCurrentWrap) _stepCurrentWrap.innerHTML = stepHistory[stepIndex].svgHTML;
    if (_stepCurrentLog)  _stepCurrentLog.innerHTML  = stepHistory[stepIndex].logHTML;
    updateStepBtns();
}

function stepForward() {
    if (stepIndex >= stepHistory.length - 1) return;
    stepIndex++;
    _findActiveWrapAndLog();
    if (_stepCurrentWrap) _stepCurrentWrap.innerHTML = stepHistory[stepIndex].svgHTML;
    if (_stepCurrentLog)  _stepCurrentLog.innerHTML  = stepHistory[stepIndex].logHTML;
    updateStepBtns();
}

/* ==========================================================
   TASK 6 — ALGORITHM INFO PANEL
   ========================================================== */
const ALGO_INFO = {
    as: {
        name: 'A* Search',
        best: 'O((V+E) log V)',
        average: 'O((V+E) log V)',
        worst: 'O(V²)',
        space: 'O(V)',
        desc: 'A* combines Dijkstra\'s cost-so-far (g) with a heuristic estimate (h) to find the shortest path efficiently. It is optimal when the heuristic is admissible (never overestimates).'
    },
    ida: {
        name: 'IDA* Search',
        best: 'O(b^d)',
        average: 'O(b^d)',
        worst: 'O(b^d)',
        space: 'O(d)',
        desc: 'Iterative Deepening A* uses depth-first search with a cost bound that increases each iteration. It achieves A*\'s optimality with only linear memory usage proportional to the search depth.'
    },
    bfs: {
        name: 'Breadth-First Search',
        best: 'O(V+E)',
        average: 'O(V+E)',
        worst: 'O(V+E)',
        space: 'O(V)',
        desc: 'BFS explores all neighbors level-by-level using a queue, guaranteeing the shortest path in unweighted graphs. It visits every reachable node before going deeper.'
    },
    dfs: {
        name: 'Depth-First Search',
        best: 'O(V+E)',
        average: 'O(V+E)',
        worst: 'O(V+E)',
        space: 'O(V)',
        desc: 'DFS dives as deep as possible along each branch before backtracking. It uses a stack (or recursion) and is useful for cycle detection, topological sort, and connectivity checks.'
    },
    bubble: {
        name: 'Bubble Sort',
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)',
        desc: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if out of order. Simple to understand but inefficient for large arrays.'
    },
    merge: {
        name: 'Merge Sort',
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)',
        space: 'O(n)',
        desc: 'Divides the array in half recursively, sorts each half, then merges them back in sorted order. Stable and efficient with guaranteed O(n log n) performance.'
    },
    quick: {
        name: 'Quick Sort',
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n²)',
        space: 'O(log n)',
        desc: 'Selects a pivot element and partitions the array so elements less than the pivot come before it. Typically the fastest in practice due to cache efficiency.'
    },
    heapsort: {
        name: 'Heap Sort',
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)',
        space: 'O(1)',
        desc: 'Builds a max-heap from the array, then repeatedly extracts the maximum element to produce a sorted array. In-place and guaranteed O(n log n) with no extra memory.'
    },
    bst: {
        name: 'Binary Search Tree',
        best: 'O(log n)',
        average: 'O(log n)',
        worst: 'O(n)',
        space: 'O(n)',
        desc: 'A BST stores keys such that the left subtree contains smaller values and the right subtree contains larger values. Search, insert, and delete are O(log n) on average but O(n) if unbalanced.'
    },
    avl: {
        name: 'AVL Tree',
        best: 'O(log n)',
        average: 'O(log n)',
        worst: 'O(log n)',
        space: 'O(n)',
        desc: 'Self-balancing BST where the height difference (balance factor) between left and right subtrees is at most 1. Rotations (LL, RR, LR, RL) restore balance after insert/delete, guaranteeing O(log n) operations.'
    },
    heap: {
        name: 'Min Heap',
        best: 'O(1) peek',
        average: 'O(log n)',
        worst: 'O(log n)',
        space: 'O(n)',
        desc: 'A complete binary tree where every parent is smaller than its children. Push (heapify-up) and pop-min (heapify-down) both run in O(log n). The minimum element is always at the root.'
    }
};

const INFO_PANEL_ALGO_MAP = {
    as: 'as', ida: 'ida', bfs: 'bfs', dfs: 'dfs',
    sorting: null, trees: null
};

function _renderInfoBody(key) {
    const info = ALGO_INFO[key];
    if (!info) return '<p class="info-desc" style="color:var(--muted);font-size:12px">Select an algorithm or tree type to see details.</p>';
    return `
        <div class="info-complexity-grid">
            <div class="card"><div class="label">Best Case</div><div class="value">${info.best}</div></div>
            <div class="card"><div class="label">Average Case</div><div class="value">${info.average}</div></div>
            <div class="card"><div class="label">Worst Case</div><div class="value">${info.worst}</div></div>
            <div class="card"><div class="label">Space</div><div class="value">${info.space}</div></div>
        </div>
        <div class="info-desc">${info.desc}</div>`;
}

function updateInfoPanel(which) {
    const body = document.getElementById('info-body-' + which);
    if (!body) return;
    if (which === 'sorting') {
        body.innerHTML = _renderInfoBody(currentSortAlgo);
    } else if (which === 'trees') {
        body.innerHTML = _renderInfoBody(currentTreeType);
    } else {
        body.innerHTML = _renderInfoBody(which);
    }
}

function toggleInfoPanel(which) {
    const panel = document.getElementById('info-panel-' + which);
    if (panel) panel.classList.toggle('collapsed');
}

/* ==========================================================
   TASK 1 — SORTING VISUALIZER
   ========================================================== */
let sortArray = [];
let currentSortAlgo = 'bubble';

function selectSortAlgo(algo, btn) {
    currentSortAlgo = algo;
    document.querySelectorAll('.sort-algo-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const titles = { bubble: 'Bubble Sort', merge: 'Merge Sort', quick: 'Quick Sort', heapsort: 'Heap Sort' };
    document.getElementById('sort-viz-title').textContent = (titles[algo] || algo) + ' Visualization';
    updateInfoPanel('sorting');
}

function generateSortArray() {
    const size = parseInt(document.getElementById('sort-size-slider').value) || 30;
    sortArray = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    nextAnimId('sort');
    drawSortBars(sortArray, [], [], []);
    document.getElementById('sort-log').textContent = `Generated ${size} elements. Ready to sort.`;
}

function resetSort() {
    nextAnimId('sort');
    sortArray = [];
    drawSortBars([], [], [], []);
    document.getElementById('sort-log').textContent = 'Array cleared. Generate a new array to start.';
}

function drawSortBars(arr, comparing, swapping, sorted) {
    const container = document.getElementById('sort-bars-container');
    if (!arr.length) { container.innerHTML = '<p style="font-family:var(--mono);font-size:13px;color:var(--muted);padding:20px;text-align:center;">Generate an array to visualize sorting.</p>'; return; }
    const max = Math.max(...arr);
    const wrap = document.getElementById('sort-canvas-wrap');
    const availH = (wrap.getBoundingClientRect().height || 400) - 32;
    const cmpSet  = new Set(comparing);
    const swpSet  = new Set(swapping);
    const srtSet  = new Set(sorted);
    container.innerHTML = arr.map((v, i) => {
        let cls = 'sort-bar';
        if (srtSet.has(i))      cls += ' sorted';
        else if (swpSet.has(i)) cls += ' swapping';
        else if (cmpSet.has(i)) cls += ' comparing';
        const h = Math.max(4, Math.floor((v / max) * availH));
        return `<div class="${cls}" style="height:${h}px;" title="${v}"></div>`;
    }).join('');
}

// --- Sort Step Generators ---
function bubbleSortSteps(arr) {
    const a = [...arr], steps = [], n = a.length;
    const sorted = [];
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            steps.push({ arr: [...a], comparing: [j, j+1], swapping: [], sorted: [...sorted], msg: `Comparing [${j}]=${a[j]} and [${j+1}]=${a[j+1]}` });
            if (a[j] > a[j+1]) {
                [a[j], a[j+1]] = [a[j+1], a[j]];
                steps.push({ arr: [...a], comparing: [], swapping: [j, j+1], sorted: [...sorted], msg: `Swapped [${j}] and [${j+1}]` });
            }
        }
        sorted.unshift(n - 1 - i);
    }
    sorted.unshift(0);
    steps.push({ arr: [...a], comparing: [], swapping: [], sorted: Array.from({length: n}, (_,i)=>i), msg: 'Array sorted!' });
    return steps;
}

function mergeSortSteps(arr) {
    const a = [...arr], steps = [];
    function mergeSort(ar, l, r) {
        if (l >= r) return;
        const m = Math.floor((l + r) / 2);
        mergeSort(ar, l, m);
        mergeSort(ar, m+1, r);
        merge(ar, l, m, r);
    }
    function merge(ar, l, m, r) {
        const left = ar.slice(l, m+1), right = ar.slice(m+1, r+1);
        let i = 0, j = 0, k = l;
        while (i < left.length && j < right.length) {
            steps.push({ arr: [...ar], comparing: [l+i, m+1+j], swapping: [], sorted: [], msg: `Comparing [${l+i}]=${left[i]} vs [${m+1+j}]=${right[j]}` });
            if (left[i] <= right[j]) { ar[k++] = left[i++]; }
            else { ar[k++] = right[j++]; }
            steps.push({ arr: [...ar], comparing: [], swapping: [k-1], sorted: [], msg: `Placed ${ar[k-1]} at position ${k-1}` });
        }
        while (i < left.length) { ar[k++] = left[i++]; steps.push({ arr: [...ar], comparing: [], swapping: [k-1], sorted: [], msg: `Placed ${ar[k-1]}` }); }
        while (j < right.length) { ar[k++] = right[j++]; steps.push({ arr: [...ar], comparing: [], swapping: [k-1], sorted: [], msg: `Placed ${ar[k-1]}` }); }
    }
    mergeSort(a, 0, a.length - 1);
    steps.push({ arr: [...a], comparing: [], swapping: [], sorted: Array.from({length:a.length},(_,i)=>i), msg: 'Array sorted!' });
    return steps;
}

function quickSortSteps(arr) {
    const a = [...arr], steps = [];
    function partition(ar, lo, hi) {
        const pivot = ar[hi];
        steps.push({ arr: [...ar], comparing: [], swapping: [], sorted: [], pivot: hi, msg: `Pivot = ${pivot}` });
        let i = lo - 1;
        for (let j = lo; j < hi; j++) {
            steps.push({ arr: [...ar], comparing: [j, hi], swapping: [], sorted: [], pivot: hi, msg: `Compare [${j}]=${ar[j]} with pivot ${pivot}` });
            if (ar[j] <= pivot) {
                i++;
                [ar[i], ar[j]] = [ar[j], ar[i]];
                steps.push({ arr: [...ar], comparing: [], swapping: [i, j], sorted: [], pivot: hi, msg: `Swap [${i}] and [${j}]` });
            }
        }
        [ar[i+1], ar[hi]] = [ar[hi], ar[i+1]];
        steps.push({ arr: [...ar], comparing: [], swapping: [i+1, hi], sorted: [], pivot: i+1, msg: `Pivot placed at ${i+1}` });
        return i + 1;
    }
    function qs(ar, lo, hi) {
        if (lo >= hi) return;
        const p = partition(ar, lo, hi);
        qs(ar, lo, p - 1);
        qs(ar, p + 1, hi);
    }
    qs(a, 0, a.length - 1);
    steps.push({ arr: [...a], comparing: [], swapping: [], sorted: Array.from({length:a.length},(_,i)=>i), msg: 'Array sorted!' });
    return steps;
}

function heapSortSteps(arr) {
    const a = [...arr], n = a.length, steps = [], sorted = [];
    function heapify(ar, sz, i) {
        let largest = i, l = 2*i+1, r = 2*i+2;
        steps.push({ arr: [...ar], comparing: [i, l < sz ? l : i, r < sz ? r : i].filter((v,idx,s)=>s.indexOf(v)===idx && v<sz), swapping: [], sorted: [...sorted], msg: `Heapify at ${i}` });
        if (l < sz && ar[l] > ar[largest]) largest = l;
        if (r < sz && ar[r] > ar[largest]) largest = r;
        if (largest !== i) {
            [ar[i], ar[largest]] = [ar[largest], ar[i]];
            steps.push({ arr: [...ar], comparing: [], swapping: [i, largest], sorted: [...sorted], msg: `Swap [${i}] and [${largest}]` });
            heapify(ar, sz, largest);
        }
    }
    for (let i = Math.floor(n/2)-1; i >= 0; i--) heapify(a, n, i);
    for (let i = n-1; i > 0; i--) {
        [a[0], a[i]] = [a[i], a[0]];
        sorted.unshift(i);
        steps.push({ arr: [...a], comparing: [], swapping: [0, i], sorted: [...sorted], msg: `Extract max ${a[i]}, place at ${i}` });
        heapify(a, i, 0);
    }
    sorted.unshift(0);
    steps.push({ arr: [...a], comparing: [], swapping: [], sorted: Array.from({length:n},(_,i)=>i), msg: 'Array sorted!' });
    return steps;
}

async function playSortAnimation(steps, animId) {
    const log = document.getElementById('sort-log');
    const sortWrap = document.getElementById('sort-canvas-wrap');

    stepHistory = [];
    stepIndex   = -1;
    setAnimRunning(true);

    for (let i = 0; i < steps.length; i++) {
        if (!checkAnimId('sort', animId)) { setAnimRunning(false); return; }

        while (animPaused) {
            await new Promise(r => { animResumeResolve = r; });
            if (!checkAnimId('sort', animId)) { setAnimRunning(false); return; }
        }

        const s = steps[i];
        drawSortBars(s.arr, s.comparing || [], s.swapping || [], s.sorted || []);
        if (s.pivot !== undefined) {
            const bars = document.querySelectorAll('.sort-bar');
            if (bars[s.pivot]) bars[s.pivot].classList.add('pivot');
        }
        log.textContent = `Step ${i+1}/${steps.length}: ${s.msg}`;

        stepHistory.push({ svgHTML: sortWrap.innerHTML, logHTML: log.innerHTML });
        stepIndex = stepHistory.length - 1;
        updateStepBtns();

        const delay = parseInt(document.getElementById('speed-slider').value) || 600;
        await new Promise(r => setTimeout(r, delay));
    }

    if (!checkAnimId('sort', animId)) { setAnimRunning(false); return; }
    log.innerHTML = '<span class="log-ok">✓ Sorting complete!</span>';
    setAnimRunning(false);
}

async function runSort() {
    if (!sortArray.length) { generateSortArray(); }
    nextAnimId('sort');
    const animId = currentAnimation['sort'];
    const generators = { bubble: bubbleSortSteps, merge: mergeSortSteps, quick: quickSortSteps, heapsort: heapSortSteps };
    const gen = generators[currentSortAlgo];
    if (!gen) return;
    const steps = gen([...sortArray]);
    await playSortAnimation(steps, animId);
}

/* ==========================================================
   TASK 2 — TREE VISUALIZER
   ========================================================== */
let currentTreeType = 'bst';
let treeNodeList = [];   // {id, val, x, y}
let treeEdgeList = [];   // {from, to}

function selectTreeType(type, btn) {
    currentTreeType = type;
    document.querySelectorAll('#tab-trees .sort-algo-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const titles = { bst: 'Binary Search Tree (BST)', avl: 'AVL Tree', heap: 'Min Heap' };
    document.getElementById('tree-viz-title').textContent = titles[type] || type;
    // Toggle op buttons
    document.getElementById('tree-op-btns').style.display  = type === 'heap' ? 'none' : 'grid';
    document.getElementById('tree-heap-btns').style.display = type === 'heap' ? 'grid' : 'none';
    document.getElementById('tree-rotation-label').style.display = 'none';
    treeClear();
    updateInfoPanel('trees');
}

function treeClear() {
    nextAnimId('trees');
    treeNodeList = [];
    treeEdgeList = [];
    drawTreeSVG([], [], []);
    document.getElementById('tree-log').textContent = 'Tree cleared.';
    document.getElementById('tree-rotation-label').style.display = 'none';
}

function drawTreeSVG(nodes, edges, highlights) {
    const wrap = document.getElementById('tree-graph-wrap');
    if (!nodes.length) {
        wrap.innerHTML = '<p style="font-family:var(--mono);font-size:13px;color:var(--muted);padding:20px;text-align:center">Tree is empty. Insert values to begin.</p>';
        return;
    }
    const rect = wrap.getBoundingClientRect();
    const W = rect.width || 700;
    const H = rect.height || 500;
    const hlSet = new Set(highlights);

    let edgeSVG = '', nodeSVG = '';
    for (const e of edges) {
        const f = nodes.find(n => n.id === e.from);
        const t = nodes.find(n => n.id === e.to);
        if (!f || !t) continue;
        edgeSVG += `<line x1="${f.x}" y1="${f.y}" x2="${t.x}" y2="${t.y}" stroke="rgba(148,163,184,0.4)" stroke-width="2"/>`;
    }
    for (const nd of nodes) {
        const isHL = hlSet.has(nd.id);
        const fill   = isHL ? 'rgba(245,158,11,.25)' : 'rgba(15,23,42,0.9)';
        const stroke = isHL ? '#f59e0b' : (nd.color || 'rgba(148,163,184,0.5)');
        const pulse  = isHL ? `<animate attributeName="r" values="22;26;22" dur="0.8s" repeatCount="indefinite"/>` : '';
        nodeSVG += `<circle cx="${nd.x}" cy="${nd.y}" r="22" fill="${fill}" stroke="${stroke}" stroke-width="3">${pulse}</circle>
        <text x="${nd.x}" y="${nd.y}" text-anchor="middle" dominant-baseline="central" fill="#f8fafc" font-size="13" font-weight="700" font-family="JetBrains Mono,monospace">${escapeHTML(String(nd.val))}</text>`;
    }
    wrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">${edgeSVG}${nodeSVG}</svg>`;
}

async function playTreeAnimation(animSteps, animId) {
    const log  = document.getElementById('tree-log');
    const wrap = document.getElementById('tree-graph-wrap');
    const rotLbl = document.getElementById('tree-rotation-label');

    stepHistory = [];
    stepIndex   = -1;
    setAnimRunning(true);

    for (let i = 0; i < animSteps.length; i++) {
        if (!checkAnimId('trees', animId)) { setAnimRunning(false); return; }

        while (animPaused) {
            await new Promise(r => { animResumeResolve = r; });
            if (!checkAnimId('trees', animId)) { setAnimRunning(false); return; }
        }

        const s = animSteps[i];
        drawTreeSVG(s.nodes, s.edges, s.highlights || []);
        log.innerHTML = s.message || '';
        if (s.rotation) {
            rotLbl.textContent = `Rotation: ${s.rotation}`;
            rotLbl.style.display = 'block';
        } else {
            rotLbl.style.display = 'none';
        }

        // Update persistent state to last step
        if (i === animSteps.length - 1) {
            treeNodeList = s.nodes;
            treeEdgeList = s.edges;
        }

        stepHistory.push({ svgHTML: wrap.innerHTML, logHTML: log.innerHTML });
        stepIndex = stepHistory.length - 1;
        updateStepBtns();

        const delay = parseInt(document.getElementById('speed-slider').value) || 600;
        await new Promise(r => setTimeout(r, delay));
    }
    setAnimRunning(false);
}

async function treeInsert() {
    const val = parseInt(document.getElementById('tree-val').value);
    if (isNaN(val)) { document.getElementById('tree-log').innerHTML = '<span class="log-err">Enter a valid number.</span>'; return; }
    document.getElementById('tree-val').value = '';
    document.getElementById('tree-log').textContent = `Inserting ${val}...`;
    const animId = nextAnimId('trees');

    try {
        const res = await fetch(`/api/${currentTreeType}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: treeNodeList.map(n => n.val), operation: 'insert', target: val, width: getTreeWrapSize().w, height: getTreeWrapSize().h })
        });
        const d = await res.json();
        if (d.steps && d.steps.length > 0) await playTreeAnimation(d.steps, animId);
        else if (d.nodes) { treeNodeList = d.nodes; treeEdgeList = d.edges; drawTreeSVG(d.nodes, d.edges, []); }
        document.getElementById('tree-log').innerHTML = `<span class="log-ok">${escapeHTML(d.message || 'Insert complete.')}</span>`;
    } catch (e) {
        document.getElementById('tree-log').innerHTML = '<span class="log-err">Server connection failed.</span>';
    }
}

async function treeSearch() {
    const val = parseInt(document.getElementById('tree-val').value);
    if (isNaN(val)) { document.getElementById('tree-log').innerHTML = '<span class="log-err">Enter a valid number.</span>'; return; }
    document.getElementById('tree-log').textContent = `Searching for ${val}...`;
    const animId = nextAnimId('trees');

    try {
        const res = await fetch(`/api/${currentTreeType}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: treeNodeList.map(n => n.val), operation: 'search', target: val, width: getTreeWrapSize().w, height: getTreeWrapSize().h })
        });
        const d = await res.json();
        if (d.steps && d.steps.length > 0) await playTreeAnimation(d.steps, animId);
        document.getElementById('tree-log').innerHTML = `<span class="${d.found ? 'log-ok' : 'log-err'}">${escapeHTML(d.message || '')}</span>`;
    } catch (e) {
        document.getElementById('tree-log').innerHTML = '<span class="log-err">Server connection failed.</span>';
    }
}

async function treeDelete() {
    const val = parseInt(document.getElementById('tree-val').value);
    if (isNaN(val)) { document.getElementById('tree-log').innerHTML = '<span class="log-err">Enter a valid number.</span>'; return; }
    document.getElementById('tree-val').value = '';
    document.getElementById('tree-log').textContent = `Deleting ${val}...`;
    const animId = nextAnimId('trees');

    try {
        const res = await fetch(`/api/${currentTreeType}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: treeNodeList.map(n => n.val), operation: 'delete', target: val, width: getTreeWrapSize().w, height: getTreeWrapSize().h })
        });
        const d = await res.json();
        if (d.steps && d.steps.length > 0) await playTreeAnimation(d.steps, animId);
        else if (d.nodes) { treeNodeList = d.nodes; treeEdgeList = d.edges; drawTreeSVG(d.nodes, d.edges, []); }
        document.getElementById('tree-log').innerHTML = `<span class="log-ok">${escapeHTML(d.message || 'Delete complete.')}</span>`;
    } catch (e) {
        document.getElementById('tree-log').innerHTML = '<span class="log-err">Server connection failed.</span>';
    }
}

async function heapPop() {
    if (!treeNodeList.length) { document.getElementById('tree-log').innerHTML = '<span class="log-err">Heap is empty.</span>'; return; }
    document.getElementById('tree-log').textContent = 'Popping minimum...';
    const animId = nextAnimId('trees');
    try {
        const res = await fetch('/api/heap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: treeNodeList.map(n => n.val), operation: 'pop', target: null, width: getTreeWrapSize().w, height: getTreeWrapSize().h })
        });
        const d = await res.json();
        if (d.steps && d.steps.length > 0) await playTreeAnimation(d.steps, animId);
        document.getElementById('tree-log').innerHTML = `<span class="log-ok">${escapeHTML(d.message || 'Pop complete.')}</span>`;
    } catch (e) {
        document.getElementById('tree-log').innerHTML = '<span class="log-err">Server connection failed.</span>';
    }
}

function getTreeWrapSize() {
    const wrap = document.getElementById('tree-graph-wrap');
    const rect = wrap.getBoundingClientRect();
    return { w: rect.width || 700, h: rect.height || 500 };
}

/* ==========================================================
   INIT
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Restore theme
    if (localStorage.getItem('dsav-theme') === 'light') {
        document.documentElement.classList.add('light');
        document.getElementById('theme-toggle').textContent = '☀️';
    }
    // Init info panels for default tab (A*)
    updateInfoPanel('as');
    // Generate initial sort array
    generateSortArray();
    // Init tree panel
    updateInfoPanel('trees');
});

function switchTab(name,btn){
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  btn.classList.add('active');
}

// Graphs store an array of edge objects {node: "B", weight: 10}
const asGraph  = {};
const idaGraph = {};

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

function asLoadExample(){
  Object.keys(asGraph).forEach(k=>delete asGraph[k]);
  Object.assign(asGraph,JSON.parse(JSON.stringify(EXAMPLE)));
  document.getElementById('as-start').value='A';
  document.getElementById('as-end').value='G';
  drawGraphSVG('as',asGraph,[],[]);
}
function idaLoadExample(){
  Object.keys(idaGraph).forEach(k=>delete idaGraph[k]);
  Object.assign(idaGraph,JSON.parse(JSON.stringify(EXAMPLE)));
  document.getElementById('ida-start').value='A';
  document.getElementById('ida-end').value='G';
  drawGraphSVG('ida',idaGraph,[],[]);
}

function asReset(){
  Object.keys(asGraph).forEach(k=>delete asGraph[k]);
  drawGraphSVG('as',asGraph,[],[]);
  ['as-tcplx','as-scplx','as-nodes','as-path-val'].forEach(id=>document.getElementById(id).textContent='—');
  document.getElementById('as-log').textContent='Graph cleared.';
}
function idaReset(){
  Object.keys(idaGraph).forEach(k=>delete idaGraph[k]);
  drawGraphSVG('ida',idaGraph,[],[]);
  ['ida-tcplx','ida-scplx','ida-nodes','ida-path-val'].forEach(id=>document.getElementById(id).textContent='—');
  document.getElementById('ida-log').textContent='Graph cleared.';
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
    Object.keys(idaGraph).forEach(k=>delete idaGraph[k]);
    const { graph, start, end } = generateRandomGraphData();
    Object.assign(idaGraph, graph);
    document.getElementById('ida-start').value = start;
    document.getElementById('ida-end').value = end;
    drawGraphSVG('ida', idaGraph, [], []);
    ['ida-tcplx','ida-scplx','ida-nodes','ida-path-val'].forEach(id=>document.getElementById(id).textContent='—');
    document.getElementById('ida-log').textContent='Random graph generated.';
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
  } else if (state) {
      current = state.current;
      if (which === 'as') {
          openSet = state.open || [];
          closedSet = state.closed || [];
      } else {
          closedSet = state.path || [];
      }
  }
  
  const pathSet=new Set(path);
  const visitSet=new Set(closedSet);
  const openSetMap=new Set(openSet);
  const accentColor = which==='as'?'#6366f1':'#22d3ee';

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
          (closedSet.includes(from) && closedSet.includes(to) && closedSet.indexOf(to) === closedSet.indexOf(from) + 1) ||
          (current === to && closedSet[closedSet.length-1] === from)
      );
      
      const col=onPath?'#f59e0b':(onSearchPath?'#3b82f6':'rgba(148, 163, 184, 0.4)');
      const sw=onPath?4:(onSearchPath?3:2);
      
      const dx=x2-x1, dy=y2-y1, dist=Math.sqrt(dx*dx+dy*dy);
      const ux=dx/dist, uy=dy/dist;
      const R=24; // Node radius + padding
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
        fill=which==='as'?'rgba(99,102,241,.15)':'rgba(34,211,238,.15)'; 
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
    <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="${textCol}" font-size="14" font-weight="700" font-family="JetBrains Mono,monospace">${name}</text>`;
  }

  wrap.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
    ${edgeSVG}${weightSVG}${nodeSVG}
  </svg>`;
}

async function playAnimation(which, graph, steps, path) {
    const logBox = document.getElementById(which + '-log');
    const originalLog = logBox.innerHTML;
    
    // Step by step animation of evaluated states
    for(let i=0; i<steps.length; i++) {
        const step = steps[i];
        if (which === 'as') {
            logBox.innerHTML = `Step ${i+1}: Eval <b>${step.current}</b> (g: ${step.g.toFixed(1)}, f: ${step.f.toFixed(1)}) | Open: [${step.open.join(',')}] | Closed: [${step.closed.join(',')}]`;
        } else {
            logBox.innerHTML = `Step ${i+1}: Eval <b>${step.current}</b> (bound: ${step.bound.toFixed(1)}, f: ${step.f.toFixed(1)}) | Path: [${step.path.join('→')}]`;
        }
        drawGraphSVG(which, graph, step, []);
        await new Promise(r => setTimeout(r, 600)); // Delay for iterative view
    }
    
    // Finally show the path
    logBox.innerHTML = originalLog;
    drawGraphSVG(which, graph, [], path);
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
      document.getElementById('as-log').innerHTML=`<span class="log-op">A*</span>  <span class="${d.found?'log-ok':'log-err'}">${d.message}</span>`;
      
      // Play animation using iterative steps
      if (d.steps && d.steps.length > 0) {
          await playAnimation('as', asGraph, d.steps, d.path);
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
      document.getElementById('ida-log').innerHTML=`<span class="log-op">IDA*</span>  <span class="${d.found?'log-ok':'log-err'}">${d.message}</span>`;
      
      if (d.steps && d.steps.length > 0) {
          await playAnimation('ida', idaGraph, d.steps, d.path);
      } else {
          drawGraphSVG('ida', idaGraph, [], d.path);
      }
  } catch (e) {
      document.getElementById('ida-log').innerHTML='<span class="log-err">Server connection failed.</span>';
  }
}

// Initial draw or empty message
window.addEventListener('resize', () => {
    if(Object.keys(asGraph).length > 0) drawGraphSVG('as', asGraph, [], []);
    if(Object.keys(idaGraph).length > 0) drawGraphSVG('ida', idaGraph, [], []);
});

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Dict, List, Tuple
import heapq
import math

app = FastAPI()

# Mount static and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

class Edge(BaseModel):
    node: str
    weight: int = 1

class NodeData(BaseModel):
    x: float
    y: float

class GraphRequest(BaseModel):
    graph: Dict[str, List[Edge]]
    positions: Dict[str, NodeData]
    start: str
    end: str

def heuristic(a: str, b: str, positions: Dict[str, NodeData]) -> float:
    if a not in positions or b not in positions:
        return 0.0
    p1 = positions[a]
    p2 = positions[b]
    # Scale down Euclidean distance to match typical weights (e.g., divided by 20)
    return math.hypot(p1.x - p2.x, p1.y - p2.y) / 20.0

@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/astar")
def astar(req: GraphRequest):
    graph = req.graph
    positions = req.positions
    start = req.start
    end = req.end

    if start not in graph:
        return {"found":False,"path":[],"steps":[],"nodes_explored":0,
                "complexity_time":"O((V+E) log V)","complexity_space":"O(V)",
                "message":f"Start node '{start}' not in graph"}

    open_set = []
    heapq.heappush(open_set, (heuristic(start, end, positions), 0, start))
    came_from: Dict[str, str] = {}
    g_score: Dict[str, float] = {start: 0}
    
    closed_set = set()
    open_set_hash = {start}
    steps = []

    while open_set:
        f, g, current = heapq.heappop(open_set)
        open_set_hash.remove(current)

        steps.append({
            "current": current,
            "open": list(open_set_hash),
            "closed": list(closed_set),
            "g": g,
            "f": f
        })

        if current == end:
            path = []
            node = current
            while node in came_from:
                path.append(node)
                node = came_from[node]
            path.append(start)
            path.reverse()
            
            steps.append({
                "current": current,
                "open": list(open_set_hash),
                "closed": list(closed_set) + [current],
                "g": g,
                "f": f
            })
            
            return {"found":True,"path":path,"steps":steps,
                    "path_length":round(g, 2),"nodes_explored":len(closed_set)+1,
                    "complexity_time":"O((V+E) log V)","complexity_space":"O(V)",
                    "message":f"Path found: {' → '.join(path)} (Cost: {round(g, 2)}) | Explored {len(closed_set)+1} nodes"}

        closed_set.add(current)

        for edge in graph.get(current, []):
            neighbor = edge.node
            weight = edge.weight
            if neighbor in closed_set:
                continue
                
            tg = g_score[current] + weight
            if neighbor not in g_score or tg < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tg
                f_score = tg + heuristic(neighbor, end, positions)
                if neighbor not in open_set_hash:
                    open_set_hash.add(neighbor)
                    heapq.heappush(open_set, (f_score, tg, neighbor))

    return {"found":False,"path":[],"steps":steps,
            "path_length":0,"nodes_explored":len(closed_set),
            "complexity_time":"O((V+E) log V)","complexity_space":"O(V)",
            "message":f"No path from '{start}' to '{end}'. Explored {len(closed_set)} nodes."}

@app.post("/idastar")
def idastar(req: GraphRequest):
    graph = req.graph
    positions = req.positions
    start = req.start
    end = req.end

    if start not in graph:
        return {"found":False,"path":[],"steps":[],"nodes_explored":0,
                "complexity_time":"O(b^d)","complexity_space":"O(d)",
                "message":f"Start node '{start}' not in graph"}

    steps = []
    nodes_explored = [0]

    def search(path, g, bound):
        node = path[-1]
        f = g + heuristic(node, end, positions)
        
        steps.append({
            "current": node,
            "path": list(path),
            "bound": bound,
            "g": g,
            "f": f
        })

        if f > bound:
            return f, None
        if node == end:
            return -1, list(path)
            
        minimum = float('inf')
        nodes_explored[0] += 1
            
        for edge in graph.get(node, []):
            neighbor = edge.node
            weight = edge.weight
            if neighbor not in path:
                path.append(neighbor)
                t, result = search(path, g + weight, bound)
                if t == -1:
                    return -1, result
                if t < minimum:
                    minimum = t
                path.pop()
        return minimum, None

    bound = heuristic(start, end, positions)
    path = [start]

    for _ in range(500):
        t, result = search(path, 0, bound)
        if t == -1:
            # Reconstruct cost
            cost = 0
            for i in range(len(result)-1):
                curr = result[i]
                nxt = result[i+1]
                for e in graph[curr]:
                    if e.node == nxt:
                        cost += e.weight
                        break
                        
            return {"found":True,"path":result,"steps":steps,
                    "path_length":round(cost, 2),"nodes_explored":nodes_explored[0],
                    "complexity_time":"O(b^d) per iteration","complexity_space":"O(d)  ← linear space advantage",
                    "message":f"Path found: {' → '.join(result)} (Cost: {round(cost, 2)}) | Explored {nodes_explored[0]} nodes"}
        if t == float('inf'):
            break
        bound = t

    return {"found":False,"path":[],"steps":steps,
            "path_length":0,"nodes_explored":nodes_explored[0],
            "complexity_time":"O(b^d) per iteration","complexity_space":"O(d)",
            "message":f"No path from '{start}' to '{end}'."}

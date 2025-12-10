import networkx as nx
from typing import Any, Dict, List, Tuple

def explain_route(G: nx.Graph, path: list) -> list:
    explanation = []
    for i in range(len(path) - 1):
        u, v = path[i], path[i+1]
        edge = G[u][v]
        reasons = []
        if edge.get('hazard_penalty', 0) > 0:
            reasons.append(f"Hazard penalty: {edge['hazard_penalty']}")
        if edge.get('weight', 0) > edge.get('base_cost', 0):
            reasons.append(f"Increased cost: {edge['weight']}")
        explanation.append({
            'from': u,
            'to': v,
            'base_cost': edge.get('base_cost', 0),
            'weight': edge.get('weight', 0),
            'reasons': reasons or ["Normal segment"]
        })
    return explanation

def get_alternative_routes(G: nx.Graph, start: str, end: str, k: int = 2) -> list:
    try:
        paths = list(nx.shortest_simple_paths(G, start, end, weight='weight'))
        return paths[:k+1]
    except Exception:
        return []

def accessibility_score(G: nx.Graph, path: list) -> float:
    total = 0
    penalty = 0
    for i in range(len(path) - 1):
        u, v = path[i], path[i+1]
        total += G[u][v].get('base_cost', 1)
        penalty += G[u][v].get('hazard_penalty', 0)
    score = max(0, 100 - (penalty / (total+1)) * 10)
    return round(score, 1)

def annotate_edges(G: nx.Graph, annotations: dict) -> nx.Graph:
    for (u, v), props in annotations.items():
        for k, v2 in props.items():
            G[u][v][k] = v2
    return G

def apply_user_preferences(G: nx.Graph, preferences: dict) -> nx.Graph:
    for u, v in G.edges():
        if preferences.get('avoid_slope') and G[u][v].get('slope', 0) > 0.05:
            G[u][v]['weight'] = float('inf')
        if preferences.get('prefer_covered') and not G[u][v].get('covered', False):
            G[u][v]['weight'] *= 1.5
    return G

def export_route_geojson(nodes: dict, path: list) -> dict:
    return {
        "type": "LineString",
        "coordinates": [[nodes[n][1], nodes[n][0]] for n in path]
    }

def simulate_live_reroute(G: nx.Graph, nodes: dict, path: list, new_hazard: tuple) -> list:
    if len(path) < 2:
        return path
    u, v = path[1], path[2] if len(path) > 2 else path[1]
    G[u][v]['hazard_penalty'] = 999
    try:
        new_path = nx.dijkstra_path(G, u, path[-1], weight='weight')
        return [path[0]] + new_path
    except Exception:
        return path

def hazard_feedback_suggestion(path: list, hazards: dict, nodes: dict) -> list:
    suggestions = []
    for n in path:
        for feature in hazards.get('features', []):
            coords = feature['geometry']['coordinates']
            if abs(nodes[n][0] - coords[1]) < 0.00005 and abs(nodes[n][1] - coords[0]) < 0.00005:
                suggestions.append({
                    'node': n,
                    'hazard_id': feature['properties']['id'],
                    'message': f"You passed hazard {feature['properties']['type']} at {n}. Confirm or update?"
                })
    return suggestions

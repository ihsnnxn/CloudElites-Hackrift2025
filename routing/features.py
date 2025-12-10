def simulate_realtime_hazard(G: nx.Graph, nodes: dict, path: list, hazard_type: str = "lift_breakdown") -> list:
    """
    Simulate a real-time hazard (e.g., lift breakdown, rain) and reroute user.
    Returns new path and a message.
    """
    # For demo, block the next edge and reroute
    if len(path) < 2:
        return path, f"No reroute needed."
    u, v = path[1], path[2] if len(path) > 2 else path[1]
    G[u][v]['hazard_penalty'] = 999
    G[u][v]['blocked'] = hazard_type
    try:
        new_path = [path[0]] + list(nx.dijkstra_path(G, u, path[-1], weight='weight'))
        msg = f"Hazard '{hazard_type}' detected at edge {u}-{v}. Rerouting..."
        return new_path, msg
    except Exception:
        return path, f"No alternative route found due to hazard."

def voice_activated_routing_stub(command: str) -> str:
    """
    Stub for voice-activated routing. Returns a mock response.
    """
    if "safest route" in command:
        return "Routing to safest path based on current hazards."
    if "report" in command:
        return "Hazard report received. Thank you!"
    return "Voice command not recognized."

def accessibility_heatmap(G: nx.Graph, nodes: dict) -> dict:
    """
    Generate a mock accessibility heatmap based on edge penalties.
    Returns a dict of node:score for visualization.
    """
    heatmap = {}
    for n in nodes:
        score = 100
        for nbr in G.neighbors(n):
            score -= G[n][nbr].get('hazard_penalty', 0) / 10
        heatmap[n] = max(0, round(score, 1))
    return heatmap

def instant_feedback_loop(path: list, hazards: dict, nodes: dict) -> list:
    """
    After user passes a hazard, prompt for confirmation/update.
    """
    feedback = []
    for n in path:
        for feature in hazards.get('features', []):
            coords = feature['geometry']['coordinates']
            if abs(nodes[n][0] - coords[1]) < 0.00005 and abs(nodes[n][1] - coords[0]) < 0.00005:
                feedback.append({
                    'node': n,
                    'hazard_id': feature['properties']['id'],
                    'prompt': f"Did you encounter hazard '{feature['properties']['type']}' at {n}? Confirm, update, or mark as resolved."
                })
    return feedback

def personalized_ai_recommendations(user_history: list, preferences: dict, weather: str = None) -> list:
    """
    Suggest activities, meetups, or venues based on user history, preferences, and weather.
    Returns a list of recommendations (mock/demo).
    """
    recs = []
    if weather == "rain":
        recs.append("Rain approaching: Here are 3 wheelchair-friendly indoor activities near you.")
    if preferences.get("prefer_parks"):
        recs.append("Based on your outings, you may like these accessible parks.")
    if user_history:
        recs.append(f"You and {user_history[-1]['friend']} both visited {user_history[-1]['place']}. Want to meet up again?")
    if not recs:
        recs.append("Explore new accessible venues nearby!")
    return recs
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

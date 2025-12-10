# --- Real-World Adaptation Modules ---
def ingest_realtime_hazards(api_data: Any) -> Dict[str, Any]:
    """
    Ingest real-time hazard data from external APIs, sensors, or user reports.
    Args:
        api_data: raw data from external source
    Returns:
        hazards: GeoJSON-like dict for routing engine
    """
    # Example: transform API data to GeoJSON format
    # This is a stub; replace with real transformation logic
    hazards = {"type": "FeatureCollection", "features": []}
    for item in api_data:
        hazards["features"].append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [item["lng"], item["lat"]]},
            "properties": {
                "id": item.get("id", "api_hazard"),
                "type": item.get("type", "unknown"),
                "severity": item.get("severity", 1.0),
                "confidence": item.get("confidence", 1.0),
                "last_seen": item.get("timestamp", "now")
            }
        })
    return hazards

def update_edge_weights_for_conditions(
    G: nx.Graph,
    nodes: Dict[str, Tuple[float, float]],
    weather: str = None,
    time_of_day: str = None,
    construction_zones: list = None
) -> nx.Graph:
    """
    Dynamically update edge weights based on weather, time, or live events.
    Args:
        G: networkx.Graph object
        nodes: dict mapping node names to (lat, lng)
        weather: current weather condition (e.g., 'rain', 'heat')
        time_of_day: e.g., 'morning', 'night'
        construction_zones: list of (lat, lng) tuples for temporary hazards
    Returns:
        G: updated graph
    """
    # Example: increase cost for outdoor edges during rain
    if weather == 'rain':
        for u, v in G.edges():
            # Simple demo: increase cost for all edges
            G[u][v]['weight'] = G[u][v].get('weight', 1) * 2
    # Example: block edges near construction zones
    if construction_zones:
        for zone in construction_zones:
            for u, v in G.edges():
                u_pos = nodes[u]
                v_pos = nodes[v]
                if (abs(u_pos[0] - zone[0]) < 0.00005 and abs(u_pos[1] - zone[1]) < 0.00005) or \
                   (abs(v_pos[0] - zone[0]) < 0.00005 and abs(v_pos[1] - zone[1]) < 0.00005):
                    G[u][v]['weight'] = float('inf')  # Block edge
    return G

def handle_temporary_hazards(
    hazards: Dict[str, Any],
    current_time: str
) -> Dict[str, Any]:
    """
    Filter or update hazards based on their last_seen timestamp for temporary events.
    Args:
        hazards: GeoJSON-like dict
        current_time: ISO timestamp string
    Returns:
        hazards: filtered/updated dict
    """
    # Example: only keep hazards seen in last 24 hours
    from datetime import datetime, timedelta
    now = datetime.fromisoformat(current_time)
    filtered = []
    for feature in hazards.get('features', []):
        try:
            seen = datetime.fromisoformat(feature['properties'].get('last_seen', current_time))
            if now - seen < timedelta(hours=24):
                filtered.append(feature)
        except Exception:
            filtered.append(feature)
    return {"type": "FeatureCollection", "features": filtered}
import networkx as nx
import json
from typing import Tuple, List, Dict, Any

def load_graph() -> Tuple[nx.Graph, Dict[str, Tuple[float, float]]]:
    """
    Load a sample accessibility graph with hardcoded nodes and edges.
    Returns:
        G: networkx.Graph object
        nodes: dict mapping node names to (lat, lng) tuples
    """
    G = nx.Graph()
    nodes = {
        'A': (1.290270, 103.851959),
        'B': (1.290300, 103.852000),
        'C': (1.290350, 103.852050),
        'D': (1.290400, 103.852100),
        'E': (1.290450, 103.852150),
        'F': (1.290500, 103.852200),
        'G': (1.290550, 103.852250),
        'H': (1.290600, 103.852300)
    }
    for k, v in nodes.items():
        G.add_node(k, pos=v)
    edges = [
        ('A', 'B', 10), ('B', 'C', 10), ('C', 'D', 10), ('D', 'E', 10),
        ('E', 'F', 10), ('F', 'G', 10), ('G', 'H', 10),
        ('A', 'C', 15), ('B', 'D', 15), ('C', 'E', 15), ('D', 'F', 15),
        ('E', 'G', 15), ('F', 'H', 15)
    ]
    for u, v, cost in edges:
        G.add_edge(u, v, base_cost=cost)
    return G, nodes

# Map hazards to edges (simple proximity for demo)
def apply_hazards(
    G: nx.Graph,
    nodes: Dict[str, Tuple[float, float]],
    hazards: Dict[str, Any],
    hazard_weight: float = 100.0,
    severity_weight: float = 1.0,
    confidence_weight: float = 1.0,
    proximity_threshold: float = 0.00005
) -> nx.Graph:
    """
    Apply hazard penalties to graph edges based on proximity to hazard points.
    Allows custom weights for developer tuning.
    Args:
        G: networkx.Graph object
        nodes: dict mapping node names to (lat, lng)
        hazards: GeoJSON dict with hazard features
        hazard_weight: base multiplier for hazard penalty
        severity_weight: multiplier for severity
        confidence_weight: multiplier for confidence
        proximity_threshold: how close a hazard must be to affect an edge
    Returns:
        G: updated graph with hazard_penalty on edges
    """
    def is_near(p: Tuple[float, float], c: Tuple[float, float], threshold: float = proximity_threshold) -> bool:
        """Check if point p is near coordinates c (approx. 5m)."""
        return abs(p[0] - c[1]) < threshold and abs(p[1] - c[0]) < threshold

    # Reset all hazard penalties
    for u, v in G.edges():
        G[u][v]['hazard_penalty'] = 0

    # Integrate all hazards from GeoJSON
    for feature in hazards.get('features', []):
        coords = feature['geometry']['coordinates']
        confidence = feature['properties'].get('confidence', 1.0) * confidence_weight
        severity = feature['properties'].get('severity', 1.0) * severity_weight
        for u, v in G.edges():
            u_pos = nodes[u]
            v_pos = nodes[v]
            if is_near(u_pos, coords) or is_near(v_pos, coords):
                G[u][v]['hazard_penalty'] += confidence * severity * hazard_weight
    return G

# Dijkstra with hazard weighting
def compute_route(
    G: nx.Graph,
    start: str,
    end: str,
    base_cost_weight: float = 1.0,
    hazard_penalty_weight: float = 1.0
) -> List[str]:
    """
    Compute the optimal route using Dijkstra's algorithm, considering hazard penalties.
    Allows custom weights for developer tuning.
    Args:
        G: networkx.Graph object
        start: start node name
        end: end node name
        base_cost_weight: multiplier for base cost
        hazard_penalty_weight: multiplier for hazard penalty
    Returns:
        path: list of node names representing the route
    Raises:
        nx.NetworkXNoPath: if no path exists
    """
    for u, v in G.edges():
        cost = G[u][v].get('base_cost', 1) * base_cost_weight + G[u][v].get('hazard_penalty', 0) * hazard_penalty_weight
        G[u][v]['weight'] = cost
    try:
        path = nx.dijkstra_path(G, start, end, weight='weight')
    except nx.NetworkXNoPath as e:
        raise e
    return path

# Get hazards near route
def get_route_hazards(
    path: List[str],
    nodes: Dict[str, Tuple[float, float]],
    hazards: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Get hazards near the computed route.
    Args:
        path: list of node names in the route
        nodes: dict mapping node names to (lat, lng)
        hazards: GeoJSON dict with hazard features
    Returns:
        List of hazard property dicts near the route
    """
    route_hazards = []
    for feature in hazards.get('features', []):
        coords = feature['geometry']['coordinates']
        for node in path:
            pos = nodes[node]
            if abs(pos[0] - coords[1]) < 0.00005 and abs(pos[1] - coords[0]) < 0.00005:
                route_hazards.append(feature['properties'])
    return route_hazards

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

    # Reset all hazard penalties and ensure 'weight' is initialized
    for u, v in G.edges():
        G[u][v]['hazard_penalty'] = 0
        base_cost = G[u][v].get('base_cost', 1)
        G[u][v]['weight'] = base_cost

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
    # After applying hazards, update 'weight' to include hazard_penalty
    for u, v in G.edges():
        base_cost = G[u][v].get('base_cost', 1)
        hazard_penalty = G[u][v].get('hazard_penalty', 0)
        G[u][v]['weight'] = base_cost + hazard_penalty
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

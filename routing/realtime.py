import networkx as nx
from typing import Any, Dict, Tuple

def ingest_realtime_hazards(api_data: Any) -> Dict[str, Any]:
    """
    Ingest real-time hazard data from external APIs, sensors, or user reports.
    Args:
        api_data: raw data from external source
    Returns:
        hazards: GeoJSON-like dict for routing engine
    """
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
    """
    if weather == 'rain':
        for u, v in G.edges():
            G[u][v]['weight'] = G[u][v].get('weight', 1) * 2
    if construction_zones:
        for zone in construction_zones:
            for u, v in G.edges():
                u_pos = nodes[u]
                v_pos = nodes[v]
                if (abs(u_pos[0] - zone[0]) < 0.00005 and abs(u_pos[1] - zone[1]) < 0.00005) or \
                   (abs(v_pos[0] - zone[0]) < 0.00005 and abs(v_pos[1] - zone[1]) < 0.00005):
                    G[u][v]['weight'] = float('inf')
    return G

def handle_temporary_hazards(
    hazards: Dict[str, Any],
    current_time: str
) -> Dict[str, Any]:
    """
    Filter or update hazards based on their last_seen timestamp for temporary events.
    """
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

import logging
import networkx as nx
from typing import Any, Dict, List, Tuple


route_cache = {}

def get_route_with_external_data(G: nx.Graph, nodes: dict, start: str, end: str, profile: str = "safest", external_data: dict = None) -> list:
    """
    Compute a route using all available data, including external APIs/sensors (e.g., crowd, weather).
    Args:
        G: networkx.Graph object
        nodes: dict mapping node names to (lat, lng)
        start: start node name
        end: end node name
        profile: routing profile (e.g., 'safest', 'fastest')
        external_data: dict of external data (optional)
    Returns:
        path: list of node names representing the route
    """
    if external_data:
        G = merge_external_data(G, nodes, external_data)
    return get_route_with_profile(G, start, end, profile)

def merge_external_data(G: nx.Graph, nodes: dict, external_data: dict) -> nx.Graph:
    """
    Merge external API/sensor data into the graph for routing/hazard enrichment.
    Args:
        G: networkx.Graph object
        nodes: dict mapping node names to (lat, lng)
        external_data: dict with external info (e.g., {'crowd_density': {...}, 'weather': {...}})
    Returns:
        Updated graph with external data applied
    """
    # Example: crowd density increases hazard penalty
    crowd_density = external_data.get('crowd_density', {})
    for node, density in crowd_density.items():
        for u, v in G.edges():
            if u == node or v == node:
                if 'hazard_penalty' not in G[u][v]:
                    G[u][v]['hazard_penalty'] = 0
                G[u][v]['hazard_penalty'] += density * 10
    # Example: weather alerts (rain) increase hazard penalty
    weather = external_data.get('weather', {})
    if weather.get('rain', False):
        for u, v in G.edges():
            if 'hazard_penalty' not in G[u][v]:
                G[u][v]['hazard_penalty'] = 0
            G[u][v]['hazard_penalty'] += 25
    # After merging external data, update 'weight' to include hazard_penalty
    for u, v in G.edges():
        base_cost = G[u][v].get('base_cost', 1)
        hazard_penalty = G[u][v].get('hazard_penalty', 0)
        G[u][v]['weight'] = base_cost + hazard_penalty
    return G

def route_usage_stats(route_history: list) -> dict:
    """
    Analyze route usage history and return stats: most popular routes, average length, etc.
    Args:
        route_history: list of route lists, e.g. [['A','B','C'], ['A','C']]
    Returns:
        Dict with stats
    """
    from collections import Counter
    route_counts = Counter(tuple(r) for r in route_history)
    most_popular = route_counts.most_common(1)[0][0] if route_counts else []
    avg_length = sum(len(r) for r in route_history) / len(route_history) if route_history else 0
    return {
        'most_popular_route': list(most_popular),
        'average_route_length': avg_length,
        'total_routes': len(route_history)
    }

def hazard_frequency_stats(hazard_history: list) -> dict:
    """
    Analyze hazard reports and return frequency stats by type.
    Args:
        hazard_history: list of hazard dicts, e.g. [{'type': 'curb'}, {'type': 'ramp'}]
    Returns:
        Dict with frequency by hazard type
    """
    from collections import Counter
    type_counts = Counter(h['type'] for h in hazard_history if 'type' in h)
    return dict(type_counts)

def accessibility_trend_stats(heatmap_history: list) -> dict:
    """
    Analyze accessibility heatmap history and return trend stats.
    Args:
        heatmap_history: list of heatmap dicts, e.g. [{'A': 80, 'B': 90}, ...]
    Returns:
        Dict with average accessibility per node
    """
    if not heatmap_history:
        return {}
    node_scores = {}
    for heatmap in heatmap_history:
        for node, score in heatmap.items():
            node_scores.setdefault(node, []).append(score)
    avg_scores = {node: sum(scores)/len(scores) for node, scores in node_scores.items()}
    return avg_scores

def process_realtime_feedback(G: nx.Graph, path: list, feedback: list) -> nx.Graph:
    """
    Integrate real-time user feedback into route scoring and hazard penalties.
    Args:
        G: networkx.Graph object
        path: list of node names in the route
        feedback: list of dicts, e.g. [{'node': 'B', 'hazard_id': 'h1', 'resolved': True, 'severity': 0.5}]
    Returns:
        Updated graph with feedback applied to hazard penalties
    """
    for entry in feedback:
        node = entry.get('node')
        resolved = entry.get('resolved', False)
        severity = entry.get('severity', 1.0)
        for i in range(len(path) - 1):
            u, v = path[i], path[i+1]
            if u == node or v == node:
                if 'hazard_penalty' not in G[u][v]:
                    G[u][v]['hazard_penalty'] = 0
                if resolved:
                    G[u][v]['hazard_penalty'] = max(0, G[u][v]['hazard_penalty'] - 50)
                else:
                    G[u][v]['hazard_penalty'] += severity * 25
    return G

def calculate_user_points(user_reports: list) -> int:
    """
    Calculate user points based on hazard reports and feedback contributions.
    Each valid report or feedback earns points.
    """
    points = 0
    for report in user_reports:
        points += 10  # Each report earns 10 points
        if report.get('resolved'):
            points += 5  # Bonus for resolving a hazard
    return points

def assign_badges(points: int) -> list:
    """
    Assign badges based on user points.
    """
    badges = []
    if points >= 100:
        badges.append('Gold Contributor')
    elif points >= 50:
        badges.append('Silver Contributor')
    elif points >= 20:
        badges.append('Bronze Contributor')
    if points >= 10:
        badges.append('Active Reporter')
    return badges

def calculate_leaderboard(user_data: list) -> list:
    """
    Calculate leaderboard from a list of user data dicts: [{'user': 'Alice', 'points': 120}, ...]
    Returns sorted leaderboard.
    """
    leaderboard = sorted(user_data, key=lambda x: x['points'], reverse=True)
    return leaderboard

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

def instant_feedback_loop(path: list, hazards: dict, nodes: dict) -> list:
    """
    After user passes a hazard, prompt for confirmation/update.
    Returns a list of feedback prompts for each hazard encountered on the path.
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

def integrate_crowdsourced_hazards(G: nx.Graph, nodes: dict, hazards: dict, user_reports: list) -> nx.Graph:
    """
    Integrate crowdsourced hazard and feedback reports into the graph.
    Args:
        G: networkx.Graph object
        nodes: dict mapping node names to (lat, lng)
        hazards: GeoJSON dict with hazard features
        user_reports: list of dicts with user hazard reports (e.g., [{'node': 'B', 'type': 'curb', 'severity': 2}])
    Returns:
        Updated graph with user-reported hazard penalties
    """
    # Apply existing hazards first
    for feature in hazards.get('features', []):
        coords = feature['geometry']['coordinates']
        severity = feature['properties'].get('severity', 1.0)
        for u, v in G.edges():
            u_pos = nodes[u]
            v_pos = nodes[v]
            if abs(u_pos[0] - coords[1]) < 0.00005 or abs(v_pos[0] - coords[1]) < 0.00005:
                if 'hazard_penalty' not in G[u][v]:
                    G[u][v]['hazard_penalty'] = 0
                G[u][v]['hazard_penalty'] += severity * 100
    # Integrate user reports
    for report in user_reports:
        node = report.get('node')
        hazard_type = report.get('type', 'generic')
        severity = report.get('severity', 1.0)
        for u, v in G.edges():
            if u == node or v == node:
                if 'hazard_penalty' not in G[u][v]:
                    G[u][v]['hazard_penalty'] = 0
                G[u][v]['hazard_penalty'] += severity * 50  # User reports weighted less than official hazards
                G[u][v]['crowdsourced'] = True
    return G

def get_collaborative_route(G: nx.Graph, nodes: dict, start: str, end: str, hazards: dict, user_reports: list, profile: str = "safest") -> list:
    """
    Compute a route using both official and crowdsourced hazard data.
    Args:
        G: networkx.Graph object
        nodes: dict mapping node names to (lat, lng)
        start: start node name
        end: end node name
        hazards: GeoJSON dict with hazard features
        user_reports: list of dicts with user hazard reports
        profile: routing profile
    Returns:
        path: list of node names representing the route
    """
    G = integrate_crowdsourced_hazards(G, nodes, hazards, user_reports)
    return get_route_with_profile(G, start, end, profile)

def get_route_with_profile(G: nx.Graph, start: str, end: str, profile: str = "safest") -> list:
    """
    Get route based on selected profile: 'fastest', 'safest', 'scenic', etc.
    Adjusts weights and preferences accordingly.
    Caches result for repeated queries.
    """
    cache_key = f"{start}-{end}-{profile}"
    if cache_key in route_cache:
        logging.info(f"Cache hit for {cache_key}")
        return route_cache[cache_key]
    prefs = {}
    if profile == "safest":
        prefs = {"avoid_slope": True, "prefer_covered": True}
    elif profile == "fastest":
        prefs = {"avoid_slope": False, "prefer_covered": False}
    elif profile == "scenic":
        prefs = {"prefer_parks": True}
    G = apply_user_preferences(G, prefs)
    # Ensure 'weight' is set on all edges before running Dijkstra
    for u, v in G.edges():
        base_cost = G[u][v].get('base_cost', 1)
        hazard_penalty = G[u][v].get('hazard_penalty', 0)
        G[u][v]['weight'] = base_cost + hazard_penalty
    try:
        path = list(nx.dijkstra_path(G, start, end, weight='weight'))
        route_cache[cache_key] = path
        logging.info(f"Route computed for {cache_key}")
        return path
    except Exception as e:
        logging.error(f"Routing error for {cache_key}: {e}")
        return [f"No route found: {e}"]

def predict_hazard_penalties(G: nx.Graph, nodes: dict, hazards: dict, time_of_day: str = None) -> nx.Graph:
    """
    Adjust hazard penalties on the graph based on predicted hazards and time-based adaptation.
    Uses historical and real-time data (stub/demo logic for now).
    Args:
        G: networkx.Graph object
        nodes: dict mapping node names to (lat, lng)
        hazards: GeoJSON dict with hazard features
        time_of_day: Optional string (e.g., 'morning', 'evening')
    Returns:
        Updated graph with predicted hazard penalties
    """
    # Reset all hazard penalties
    for u, v in G.edges():
        G[u][v]['hazard_penalty'] = 0
    # Demo: Increase penalties for certain times or hazard types
    for feature in hazards.get('features', []):
        coords = feature['geometry']['coordinates']
        hazard_type = feature['properties'].get('type', 'generic')
        severity = feature['properties'].get('severity', 1.0)
        # Simulate time-based hazard prediction
        penalty = severity * 100
        if time_of_day == 'morning' and hazard_type == 'rain':
            penalty *= 1.5
        if time_of_day == 'evening' and hazard_type == 'crowd':
            penalty *= 2
        for u, v in G.edges():
            u_pos = nodes[u]
            v_pos = nodes[v]
            # Simple proximity check
            if abs(u_pos[0] - coords[1]) < 0.00005 or abs(v_pos[0] - coords[1]) < 0.00005:
                G[u][v]['hazard_penalty'] += penalty
    return G

def get_predictive_route(G: nx.Graph, nodes: dict, start: str, end: str, hazards: dict, time_of_day: str = None, profile: str = "safest") -> list:
    """
    Compute a route using predicted hazard penalties and time-based adaptation.
    Args:
        G: networkx.Graph object
        nodes: dict mapping node names to (lat, lng)
        start: start node name
        end: end node name
        hazards: GeoJSON dict with hazard features
        time_of_day: Optional string (e.g., 'morning', 'evening')
        profile: routing profile
    Returns:
        path: list of node names representing the route
    """
    G = predict_hazard_penalties(G, nodes, hazards, time_of_day)
    return get_route_with_profile(G, start, end, profile)

def ingest_additional_data(data_type: str, data: dict) -> dict:
    """
    Hook to ingest additional data sources (crowd density, transport status, weather alerts).
    Returns processed data for routing engine.
    """
    # Stub: just log and return data for now
    logging.info(f"Ingesting {data_type} data: {data}")
    return data


def get_route_multi_modal(G: nx.Graph, start: str, end: str, mode: str = "wheelchair", profile: str = "safest") -> list:
    """
    Multi-modal routing: supports 'wheelchair', 'walking', 'public_transit', etc.
    Applies mode-specific constraints and preferences.
    Caches result for repeated queries.
    """
    cache_key = f"{start}-{end}-{mode}-{profile}"
    if cache_key in route_cache:
        logging.info(f"Cache hit for {cache_key}")
        return route_cache[cache_key]
    prefs = {}
    # Mode-specific constraints
    if mode == "wheelchair":
        prefs.update({"avoid_slope": True, "prefer_covered": True, "avoid_stairs": True})
    elif mode == "walking":
        prefs.update({"avoid_slope": False, "prefer_covered": False, "avoid_stairs": False})
    elif mode == "public_transit":
        prefs.update({"prefer_transit": True, "avoid_stairs": True})
    # Profile-specific preferences
    if profile == "safest":
        prefs.update({"prefer_covered": True})
    elif profile == "fastest":
        prefs.update({"prefer_covered": False})
    elif profile == "scenic":
        prefs.update({"prefer_parks": True})
    G = apply_user_preferences_multi_modal(G, prefs)
    try:
        path = list(nx.dijkstra_path(G, start, end, weight='weight'))
        route_cache[cache_key] = path
        logging.info(f"Multi-modal route computed for {cache_key}")
        return path
    except Exception as e:
        logging.error(f"Multi-modal routing error for {cache_key}: {e}")
        return [f"No route found: {e}"]

def apply_user_preferences_multi_modal(G: nx.Graph, preferences: dict) -> nx.Graph:
    for u, v in G.edges():
        # Wheelchair: avoid steep slopes and stairs
        if preferences.get('avoid_slope') and G[u][v].get('slope', 0) > 0.05:
            G[u][v]['weight'] = float('inf')
        if preferences.get('avoid_stairs') and G[u][v].get('stairs', False):
            G[u][v]['weight'] = float('inf')
        # Public transit: prefer transit edges
        if preferences.get('prefer_transit') and not G[u][v].get('transit', False):
            G[u][v]['weight'] *= 2
        # Scenic: prefer parks
        if preferences.get('prefer_parks') and G[u][v].get('park', False):
            G[u][v]['weight'] *= 0.8
        # Covered: prefer covered paths
        if preferences.get('prefer_covered') and not G[u][v].get('covered', False):
            G[u][v]['weight'] *= 1.5
    return G
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
    except Exception as e:
        logging.error(f"Alternative routing error: {e}")
        return [f"No alternative route found: {e}"]

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
        base_cost = G[u][v].get('base_cost', 1)
        hazard_penalty = G[u][v].get('hazard_penalty', 0)
        G[u][v]['weight'] = base_cost + hazard_penalty
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

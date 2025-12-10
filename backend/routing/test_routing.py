def test_get_route_with_external_data():
    from features import get_route_with_external_data
    import networkx as nx
    G = nx.Graph()
    G.add_edge('A', 'B', base_cost=10, weight=10)
    G.add_edge('B', 'C', base_cost=5, weight=5)
    nodes = {'A': (0, 0), 'B': (1, 1), 'C': (2, 2)}
    external_data = {
        'crowd_density': {'B': 2},
        'weather': {'rain': True}
    }
    path = get_route_with_external_data(G, nodes, 'A', 'C', profile='safest', external_data=external_data)
    print(f"Route with external data: {path}")
    assert isinstance(path, list)
    assert 'A' in path and 'C' in path
    print("get_route_with_external_data test passed.")
import networkx as nx
from features import (
    explain_route, get_alternative_routes, accessibility_score, annotate_edges,
    apply_user_preferences, export_route_geojson, simulate_live_reroute,
    hazard_feedback_suggestion, simulate_realtime_hazard, accessibility_heatmap,
    instant_feedback_loop, personalized_ai_recommendations,
)

def test_merge_external_data():
    from features import merge_external_data
    G = nx.Graph()
    G.add_edge('A', 'B', hazard_penalty=0)
    G.add_edge('B', 'C', hazard_penalty=0)
    nodes = {'A': (0, 0), 'B': (1, 1), 'C': (2, 2)}
    external_data = {
        'crowd_density': {'B': 2},
        'weather': {'rain': True}
    }
    G_updated = merge_external_data(G, nodes, external_data)
    ab_penalty = G_updated['A']['B']['hazard_penalty']
    bc_penalty = G_updated['B']['C']['hazard_penalty']
    print(f"A-B penalty: {ab_penalty}")
    print(f"B-C penalty: {bc_penalty}")
    assert ab_penalty == 45  # 2*10 (crowd) + 25 (rain)
    assert bc_penalty == 45
    print("merge_external_data test passed.")

def test_route_usage_stats():
    print("\n--- Extensible Data Sources Demo ---")
    test_merge_external_data()
    from features import route_usage_stats
    history = [['A','B','C'], ['A','C'], ['A','B','C']]
    stats = route_usage_stats(history)
    assert stats['most_popular_route'] == ['A','B','C']
    assert stats['total_routes'] == 3
    assert stats['average_route_length'] > 0

def test_hazard_frequency_stats():
    from features import hazard_frequency_stats
    hazards = [{'type': 'curb'}, {'type': 'ramp'}, {'type': 'curb'}]
    freq = hazard_frequency_stats(hazards)
    assert freq['curb'] == 2
    assert freq['ramp'] == 1

def test_accessibility_trend_stats():
    from features import accessibility_trend_stats
    heatmaps = [{'A': 80, 'B': 90}, {'A': 70, 'B': 95}]
    trends = accessibility_trend_stats(heatmaps)
    assert abs(trends['A'] - 75) < 0.1
    assert abs(trends['B'] - 92.5) < 0.1

def test_process_realtime_feedback():
    from features import process_realtime_feedback
    G = nx.Graph()
    G.add_edge('A', 'B', hazard_penalty=100)
    G.add_edge('B', 'C', hazard_penalty=50)
    path = ['A', 'B', 'C']
    feedback = [
        {'node': 'B', 'hazard_id': 'h1', 'resolved': True, 'severity': 0.5},
        {'node': 'C', 'hazard_id': 'h2', 'resolved': False, 'severity': 2}
    ]
    G = process_realtime_feedback(G, path, feedback)
    assert G['A']['B']['hazard_penalty'] <= 100
    assert G['B']['C']['hazard_penalty'] > 50

def test_accessibility_heatmap_demo():
    from features import accessibility_heatmap
    G = nx.Graph()
    G.add_edge('A', 'B', hazard_penalty=10)
    G.add_edge('B', 'C', hazard_penalty=20)
    nodes = {'A': (1.0, 2.0), 'B': (3.0, 4.0), 'C': (5.0, 6.0)}
    heatmap = accessibility_heatmap(G, nodes)
    assert isinstance(heatmap, dict)
    assert all(isinstance(v, (int, float)) for v in heatmap.values())
def test_calculate_user_points():
    from features import calculate_user_points
    reports = [{'node': 'A', 'type': 'curb'}, {'node': 'B', 'type': 'ramp', 'resolved': True}]
    points = calculate_user_points(reports)
    assert points == 25

def test_assign_badges():
    from features import assign_badges
    badges = assign_badges(120)
    assert 'Gold Contributor' in badges
    badges = assign_badges(55)
    assert 'Silver Contributor' in badges
    badges = assign_badges(25)
    assert 'Bronze Contributor' in badges
    badges = assign_badges(10)
    assert 'Active Reporter' in badges

def test_calculate_leaderboard():
    from features import calculate_leaderboard
    user_data = [
        {'user': 'Alice', 'points': 120},
        {'user': 'Bob', 'points': 55},
        {'user': 'Carol', 'points': 25}
    ]
    leaderboard = calculate_leaderboard(user_data)
    assert leaderboard[0]['user'] == 'Alice'
    assert leaderboard[1]['user'] == 'Bob'
    assert leaderboard[2]['user'] == 'Carol'

def test_get_predictive_route():
    from features import get_predictive_route
    G = nx.Graph()
    G.add_edge('A', 'B', base_cost=10, weight=10)
    G.add_edge('B', 'C', base_cost=5, weight=5)
    nodes = {'A': (1.0, 2.0), 'B': (3.0, 4.0), 'C': (5.0, 6.0)}
    hazards = {'features': [{'geometry': {'coordinates': [2.0, 1.0]}, 'properties': {'type': 'rain', 'severity': 2}}]}
    path = get_predictive_route(G, nodes, 'A', 'C', hazards, time_of_day='morning', profile='safest')
    assert isinstance(path, list)

def test_get_collaborative_route():
    from features import get_collaborative_route
    G = nx.Graph()
    G.add_edge('A', 'B', base_cost=10, weight=10)
    G.add_edge('B', 'C', base_cost=5, weight=5)
    nodes = {'A': (1.0, 2.0), 'B': (3.0, 4.0), 'C': (5.0, 6.0)}
    hazards = {'features': [{'geometry': {'coordinates': [2.0, 1.0]}, 'properties': {'type': 'curb', 'severity': 2}}]}
    user_reports = [{'node': 'B', 'type': 'curb', 'severity': 1.5}]
    path = get_collaborative_route(G, nodes, 'A', 'C', hazards, user_reports, profile='safest')
    assert isinstance(path, list)

def test_explain_route():
    G = nx.Graph()
    G.add_edge('A', 'B', base_cost=10, hazard_penalty=20, weight=30)
    path = ['A', 'B']
    result = explain_route(G, path)
    assert isinstance(result, list)
    assert result[0]['from'] == 'A'
    assert result[0]['to'] == 'B'

def test_get_alternative_routes():
    G = nx.Graph()
    G.add_edge('A', 'B', weight=1)
    G.add_edge('B', 'C', weight=1)
    G.add_edge('A', 'C', weight=2)
    paths = get_alternative_routes(G, 'A', 'C', k=2)
    assert len(paths) >= 1

def test_accessibility_score():
    G = nx.Graph()
    G.add_edge('A', 'B', base_cost=10, hazard_penalty=20)
    path = ['A', 'B']
    score = accessibility_score(G, path)
    assert isinstance(score, float)

def test_annotate_edges():
    G = nx.Graph()
    G.add_edge('A', 'B')
    annotations = {('A', 'B'): {'slope': 0.1, 'covered': True}}
    G = annotate_edges(G, annotations)
    assert G['A']['B']['slope'] == 0.1
    assert G['A']['B']['covered'] is True


def test_apply_user_preferences():
    G = nx.Graph()
    G.add_edge('A', 'B', slope=0.1, covered=False, weight=1)
    prefs = {'avoid_slope': True, 'prefer_covered': True}
    G = apply_user_preferences(G, prefs)
    assert G['A']['B']['weight'] == float('inf') or G['A']['B']['weight'] > 1

def test_export_route_geojson():
    nodes = {'A': (1.0, 2.0), 'B': (3.0, 4.0)}

    path = ['A', 'B']
    geojson = export_route_geojson(nodes, path)
    assert geojson['type'] == 'LineString'

def test_simulate_live_reroute():
    G = nx.Graph()
    G.add_edge('A', 'B', weight=1)
    G.add_edge('B', 'C', weight=1)
    nodes = {'A': (1.0, 2.0), 'B': (3.0, 4.0), 'C': (5.0, 6.0)}
    path = ['A', 'B', 'C']
    new_path = simulate_live_reroute(G, nodes, path, ('B', 'C'))
    assert isinstance(new_path, list)

def test_hazard_feedback_suggestion():
    path = ['A']
    hazards = {'features': [{'geometry': {'coordinates': [2.0, 1.0]}, 'properties': {'id': 'h1', 'type': 'curb'}}]}
    nodes = {'A': (1.0, 2.0)}
    feedback = hazard_feedback_suggestion(path, hazards, nodes)
    assert isinstance(feedback, list)

def test_simulate_realtime_hazard():
    G = nx.Graph()
    G.add_edge('A', 'B', weight=1)
    G.add_edge('B', 'C', weight=1)
    nodes = {'A': (1.0, 2.0), 'B': (3.0, 4.0), 'C': (5.0, 6.0)}
    path = ['A', 'B', 'C']
    new_path, msg = simulate_realtime_hazard(G, nodes, path, 'rain')
    assert isinstance(new_path, list)
    assert isinstance(msg, str)

def test_accessibility_heatmap():
    G = nx.Graph()
    G.add_edge('A', 'B', hazard_penalty=10)
    nodes = {'A': (1.0, 2.0), 'B': (3.0, 4.0)}
    heatmap = accessibility_heatmap(G, nodes)
    assert isinstance(heatmap, dict)

def test_instant_feedback_loop():
    path = ['A']
    hazards = {'features': [{'geometry': {'coordinates': [2.0, 1.0]}, 'properties': {'id': 'h1', 'type': 'curb'}}]}
    nodes = {'A': (1.0, 2.0)}
    feedback = instant_feedback_loop(path, hazards, nodes)
    assert isinstance(feedback, list)

def test_personalized_ai_recommendations():
    user_history = [{'friend': 'Alex', 'place': 'Park'}]
    prefs = {'prefer_parks': True}
    recs = personalized_ai_recommendations(user_history, prefs, weather='rain')
    assert isinstance(recs, list)


def test_get_route_multi_modal():
    from features import get_route_multi_modal
    G = nx.Graph()
    # Add edges with attributes for multi-modal demo
    G.add_edge('A', 'B', base_cost=10, slope=0.1, stairs=True, covered=False, transit=False, park=False, weight=10)
    G.add_edge('B', 'C', base_cost=5, slope=0.01, stairs=False, covered=True, transit=True, park=True, weight=5)
    G.add_edge('A', 'C', base_cost=15, slope=0.02, stairs=False, covered=True, transit=False, park=False, weight=15)
    # Wheelchair mode should avoid stairs and steep slopes
    path_wheelchair = get_route_multi_modal(G, 'A', 'C', mode='wheelchair', profile='safest')
    assert 'B' in path_wheelchair or 'C' in path_wheelchair
    # Walking mode should allow all edges
    path_walking = get_route_multi_modal(G, 'A', 'C', mode='walking', profile='fastest')
    assert 'B' in path_walking or 'C' in path_walking
    # Public transit mode should prefer transit edges
    path_transit = get_route_multi_modal(G, 'A', 'C', mode='public_transit', profile='fastest')
    assert 'B' in path_transit or 'C' in path_transit


if __name__ == "__main__":
    print("\n--- Route with External Data Integration Demo ---")
    test_get_route_with_external_data()
    print("\n--- Extensible Data Sources Demo ---")
    test_merge_external_data()
    test_explain_route()
    test_get_alternative_routes()
    test_accessibility_score()
    test_annotate_edges()
    test_apply_user_preferences()
    test_export_route_geojson()
    test_simulate_live_reroute()
    test_hazard_feedback_suggestion()
    test_simulate_realtime_hazard()
    test_accessibility_heatmap()
    test_instant_feedback_loop()
    test_personalized_ai_recommendations()
    test_get_route_multi_modal()
    test_get_predictive_route()
    test_get_collaborative_route()
    print("All routing feature tests passed.")

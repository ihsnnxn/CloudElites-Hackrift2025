import networkx as nx
import json
from typing import Tuple, List, Dict

# Load sample graph (for demo, hardcoded nodes/edges)
def load_graph():
    G = nx.Graph()
    # Expanded nodes (lat, lng)
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
    # Expanded edges (with base cost)
    G.add_edge('A', 'B', base_cost=10)
    G.add_edge('B', 'C', base_cost=10)
    G.add_edge('C', 'D', base_cost=10)
    G.add_edge('D', 'E', base_cost=10)
    G.add_edge('E', 'F', base_cost=10)
    G.add_edge('F', 'G', base_cost=10)
    G.add_edge('G', 'H', base_cost=10)
    G.add_edge('A', 'C', base_cost=15)
    G.add_edge('B', 'D', base_cost=15)
    G.add_edge('C', 'E', base_cost=15)
    G.add_edge('D', 'F', base_cost=15)
    G.add_edge('E', 'G', base_cost=15)
    G.add_edge('F', 'H', base_cost=15)
    return G, nodes

# Map hazards to edges (simple proximity for demo)
def apply_hazards(G, nodes, hazards):
    # Reset all hazard penalties
    for u, v in G.edges():
        G[u][v]['hazard_penalty'] = 0
    # Integrate all hazards from GeoJSON
    for feature in hazards.get('features', []):
        coords = feature['geometry']['coordinates']
        confidence = feature['properties']['confidence']
        severity = feature['properties']['severity']
        # If hazard is close to any edge, increase cost
        for u, v in G.edges():
            u_pos = nodes[u]
            v_pos = nodes[v]
            # Check if hazard is close to the edge (within ~5m)
            def is_near(p, c):
                # Approximate 0.00005 deg ~ 5m
                return abs(p[0] - c[1]) < 0.00005 and abs(p[1] - c[0]) < 0.00005
            if is_near(u_pos, coords) or is_near(v_pos, coords):
                G[u][v]['hazard_penalty'] += confidence * severity * 100
    return G

# Dijkstra with hazard weighting
def compute_route(G, start, end):
    for u, v in G.edges():
        cost = G[u][v].get('base_cost', 1) + G[u][v].get('hazard_penalty', 0)
        G[u][v]['weight'] = cost
    path = nx.dijkstra_path(G, start, end, weight='weight')
    return path

# Get hazards near route
def get_route_hazards(path, nodes, hazards):
    route_hazards = []
    for feature in hazards.get('features', []):
        coords = feature['geometry']['coordinates']
        for node in path:
            pos = nodes[node]
            # If hazard is close to any node in the path
            if abs(pos[0] - coords[1]) < 0.00005 and abs(pos[1] - coords[0]) < 0.00005:
                route_hazards.append(feature['properties'])
    return route_hazards

# Routing Engine: Advanced Accessibility & Extensible Data Integration

## Overview
This module powers a modular, extensible, and demo-ready routing engine for wheelchair-accessible navigation and social engagement. It supports multi-modal routing, predictive and collaborative features, gamification, analytics, real-time feedback, and seamless integration of external data sources (APIs, sensors, etc.).

## Key Features
- **Multi-modal Routing:** Supports wheelchair, walking, public transit, and more, with mode-specific constraints.
- **Predictive Routing:** Adapts to hazards and time-based conditions using historical and real-time data.
- **Collaborative Routing:** Integrates crowdsourced hazard and feedback reports for dynamic, community-driven routing.
- **Gamification & Social:** Leaderboards, badges, and user points to encourage engagement and contributions.
- **Accessibility Heatmaps:** Visualizes accessibility levels using aggregated hazard, feedback, and route data.
- **Real-time Feedback Loop:** Users can rate routes, report hazards, and provide instant feedback, which is integrated into route scoring and analytics.
- **Route Analytics & Visualization:** Provides analytics for route usage, hazard frequency, accessibility trends, and user engagement.
- **Extensible Data Sources:** Easily ingest and merge external data (e.g., crowd density, weather, transport status) into routing decisions.

## Usage Patterns
### 1. Basic Routing
```python
from features import get_route_with_profile
path = get_route_with_profile(G, start, end, profile='safest')
```

### 2. Multi-modal Routing
```python
from features import get_route_multi_modal
path = get_route_multi_modal(G, start, end, mode='wheelchair', profile='safest')
```

### 3. Routing with External Data
```python
from features import get_route_with_external_data
external_data = {'crowd_density': {...}, 'weather': {...}}
path = get_route_with_external_data(G, nodes, start, end, profile='safest', external_data=external_data)
```

### 4. Collaborative Routing
```python
from features import get_collaborative_route
path = get_collaborative_route(G, nodes, start, end, hazards, user_reports, profile='safest')
```

### 5. Real-time Feedback Integration
```python
from features import process_realtime_feedback
G = process_realtime_feedback(G, path, feedback)
```

### 6. Analytics & Visualization
```python
from features import route_usage_stats, hazard_frequency_stats, accessibility_trend_stats
usage = route_usage_stats(route_history)
hazards = hazard_frequency_stats(hazard_history)
trends = accessibility_trend_stats(heatmap_history)
```

## Extending the Engine
- **Add new data sources:** Use `merge_external_data` and `ingest_additional_data` to bring in new APIs or sensor feeds.
- **Customize profiles:** Adjust or add routing profiles in `get_route_with_profile` and `get_route_multi_modal`.
- **Integrate with UI/API:** Call these functions from your FastAPI backend or React Native frontend for real-time, user-driven experiences.

## Demo & Testing
Run `python routing/test_routing.py` to see all features in action, including:
- Multi-modal, predictive, and collaborative routing
- Real-time feedback and analytics
- External data integration

## File Structure
- `features.py`: All routing logic and advanced features
- `test_routing.py`: Unit tests and feature demos

## Contact
For hackathon/demo support or further integration, see the project README or contact the maintainers.

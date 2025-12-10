# Routing Engine Documentation

See [ROUTING_ENGINE.md](./ROUTING_ENGINE.md) for a full overview of the advanced, extensible routing engine powering this project. It covers:
- Multi-modal, predictive, and collaborative routing
- Gamification, analytics, and real-time feedback
- Extensible data source integration (APIs, sensors, etc.)
- Usage patterns, extension, and demo/testing instructions

For quickstart and integration, refer to the code examples and API in that file.
# Routing Features Module

This module provides advanced, hackathon-ready routing features for wheelchair-accessible navigation and social mobility apps.

## Key Features
- Configurable routing profiles: fastest, safest, scenic, etc.
- Route caching for performance
- Route explanation and accessibility scoring
- Multiple route options and error handling
- Real-time hazard simulation and rerouting
- Voice-activated routing stub
- Accessibility heatmap generation
- Instant feedback loop for hazard confirmation
- Personalized AI recommendations
- Extensible data source hooks (crowd density, transport status, weather alerts)

## Usage Example
```python
from features import get_route_with_profile, explain_route, accessibility_score

G, nodes = ... # Load graph and nodes
path = get_route_with_profile(G, 'A', 'H', profile='safest')
explanation = explain_route(G, path)
score = accessibility_score(G, path)
print('Route:', path)
print('Explanation:', explanation)
print('Accessibility Score:', score)
```

## Testing
Run `python test_routing.py` to execute all unit tests for routing features.

## Extending
- Add new data sources via `ingest_additional_data()`
- Add new routing profiles by updating `get_route_with_profile()`

## Logging
Uses Python's `logging` module for analytics and debugging.

---
For more details, see the source code and test suite.

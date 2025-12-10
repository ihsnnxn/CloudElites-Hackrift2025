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

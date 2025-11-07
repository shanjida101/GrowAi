from datetime import date, timedelta
from typing import List
import math

def holt_additive(series: List[float], horizon: int, alpha=0.6, beta=0.3) -> List[float]:
    # simple Holt linear trend (additive) fallback – no external deps
    if not series: return [0.0] * horizon
    level = series[0]
    trend = series[1] - series[0] if len(series) > 1 else 0.0
    for y in series:
        prev_level = level
        level = alpha * y + (1 - alpha) * (level + trend)
        trend = beta * (level - prev_level) + (1 - beta) * trend
    return [level + (i + 1) * trend for i in range(horizon)]

def build_future_dates(start: date, horizon: int):
    return [(start + timedelta(days=i)).isoformat() for i in range(1, horizon + 1)]

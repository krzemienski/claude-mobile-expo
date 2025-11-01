"""Metrics collection utilities."""

import time
from typing import Dict, List
from collections import defaultdict
import structlog

logger = structlog.get_logger()


class MetricsCollector:
    """Collect application metrics."""

    def __init__(self):
        self.counters: Dict[str, int] = defaultdict(int)
        self.gauges: Dict[str, float] = {}
        self.histograms: Dict[str, List[float]] = defaultdict(list)
        self.timers: Dict[str, float] = {}

    def increment(self, metric: str, value: int = 1):
        """Increment counter."""
        self.counters[metric] += value

    def set_gauge(self, metric: str, value: float):
        """Set gauge value."""
        self.gauges[metric] = value

    def record_time(self, metric: str, duration_ms: float):
        """Record timing."""
        self.histograms[metric].append(duration_ms)

    def start_timer(self, metric: str):
        """Start timer for metric."""
        self.timers[metric] = time.time()

    def stop_timer(self, metric: str):
        """Stop timer and record duration."""
        if metric in self.timers:
            duration = (time.time() - self.timers[metric]) * 1000
            self.record_time(metric, duration)
            del self.timers[metric]
            return duration
        return 0

    def get_stats(self) -> Dict:
        """Get all metrics."""
        return {
            "counters": dict(self.counters),
            "gauges": dict(self.gauges),
            "histograms": {
                metric: {
                    "count": len(values),
                    "min": min(values) if values else 0,
                    "max": max(values) if values else 0,
                    "avg": sum(values) / len(values) if values else 0,
                }
                for metric, values in self.histograms.items()
            }
        }

    def reset(self):
        """Reset all metrics."""
        self.counters.clear()
        self.gauges.clear()
        self.histograms.clear()
        self.timers.clear()


# Global metrics collector
metrics = MetricsCollector()

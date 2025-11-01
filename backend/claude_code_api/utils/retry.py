"""Retry utilities for resilient operations."""

import asyncio
import time
from typing import Callable, TypeVar, Optional
from functools import wraps
import structlog

logger = structlog.get_logger()

T = TypeVar('T')


async def retry_async(
    func: Callable,
    max_attempts: int = 3,
    delay_seconds: float = 1.0,
    backoff_multiplier: float = 2.0,
    exceptions: tuple = (Exception,)
):
    """
    Retry async function with exponential backoff.
    """
    attempt = 0
    current_delay = delay_seconds

    while attempt < max_attempts:
        try:
            return await func()
        except exceptions as e:
            attempt += 1

            if attempt >= max_attempts:
                logger.error(
                    "Retry exhausted",
                    function=func.__name__,
                    attempts=attempt,
                    error=str(e)
                )
                raise

            logger.warning(
                "Retry attempt",
                function=func.__name__,
                attempt=attempt,
                max_attempts=max_attempts,
                delay=current_delay,
                error=str(e)
            )

            await asyncio.sleep(current_delay)
            current_delay *= backoff_multiplier


def retry_sync(
    func: Callable,
    max_attempts: int = 3,
    delay_seconds: float = 1.0,
    backoff_multiplier: float = 2.0,
    exceptions: tuple = (Exception,)
):
    """Retry synchronous function with exponential backoff."""
    attempt = 0
    current_delay = delay_seconds

    while attempt < max_attempts:
        try:
            return func()
        except exceptions as e:
            attempt += 1

            if attempt >= max_attempts:
                logger.error(
                    "Retry exhausted",
                    function=func.__name__,
                    attempts=attempt,
                    error=str(e)
                )
                raise

            logger.warning(
                "Retry attempt",
                function=func.__name__,
                attempt=attempt,
                delay=current_delay
            )

            time.sleep(current_delay)
            current_delay *= backoff_multiplier

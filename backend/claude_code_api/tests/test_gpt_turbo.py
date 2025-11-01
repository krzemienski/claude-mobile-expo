"""Tests for GPT-3.5 Turbo integration."""

import os
import pytest
import openai
from openai import OpenAI
from ..models.openai import ChatCompletionRequest, ChatMessage

# Note: This test requires setting the OPENAI_API_KEY environment variable
# You can set this by running: export OPENAI_API_KEY='your-api-key-here'

@pytest.mark.skipif(
    not os.environ.get('OPENAI_API_KEY'), 
    reason="OpenAI API key is not set. Set OPENAI_API_KEY environment variable to run this test."
)
def test_gpt_turbo_prompt_mock():
    """Test ChatCompletionRequest model compatibility."""
    # Create a test request that matches the OpenAI API structure
    messages = [
        {"role": "system", "content": "You are a helpful coding assistant."},
        {"role": "user", "content": "Write a Python function to calculate the factorial of a number."}
    ]

    # Validate request can be parsed
    request_data = {
        "model": "gpt-3.5-turbo",
        "messages": messages,
        "temperature": 0,
        "max_tokens": 250
    }

    request = ChatCompletionRequest(**request_data)
    assert request.model == "gpt-3.5-turbo"
    assert len(request.messages) == 2
    assert all(isinstance(msg, ChatMessage) for msg in request.messages)

def test_claude_gpt_turbo_compatibility():
    """Ensure our models can parse GPT-3.5 Turbo request."""
    # Create a request matching GPT-3.5 Turbo structure
    request_data = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello, world!"}
        ],
        "temperature": 0.7,
        "max_tokens": 100,
        "stream": False
    }
    
    # Try parsing with our models
    request = ChatCompletionRequest(**request_data)
    
    # Validate parsed request
    assert request.model == "gpt-3.5-turbo"
    assert len(request.messages) == 2
    assert all(isinstance(msg, ChatMessage) for msg in request.messages)
    assert request.temperature == 0.7
    assert request.max_tokens == 100
    assert not request.stream
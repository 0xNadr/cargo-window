"""The one place the server talks to Claude. Every failure becomes AIUnavailable, so callers fall back."""

import os

import anthropic

MODEL = os.environ.get("CARGO_WINDOW_MODEL", "claude-opus-5-5")

_client: anthropic.AsyncAnthropic | None = None


class AIUnavailable(Exception):
    """Claude could not answer; the reason is a short code the browser shows as a fallback note."""


def ai_enabled() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY"))


def _get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        # A stage demo should fall back quickly rather than wait through long retries.
        _client = anthropic.AsyncAnthropic(timeout=60.0, max_retries=1)
    return _client


async def complete(prompt: str, *, schema: dict | None = None, max_tokens: int = 8000) -> str:
    """Send one prompt and return Claude's text; with a schema the text is guaranteed JSON."""
    if not ai_enabled():
        raise AIUnavailable("no_api_key")
    output_config: dict = {"effort": "low"}
    if schema is not None:
        output_config["format"] = {"type": "json_schema", "schema": schema}
    try:
        response = await _get_client().beta.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            output_config=output_config,
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.RateLimitError as e:
        raise AIUnavailable("rate_limited") from e
    except anthropic.APIStatusError as e:
        raise AIUnavailable(f"api_error_{e.status_code}") from e
    except anthropic.APIConnectionError as e:
        raise AIUnavailable("connection_error") from e

    if response.stop_reason == "refusal":
        raise AIUnavailable("refused")
    if response.stop_reason == "max_tokens":
        raise AIUnavailable("truncated")
    text = "".join(block.text for block in response.content if block.type == "text")
    if not text.strip():
        raise AIUnavailable("empty")
    return text

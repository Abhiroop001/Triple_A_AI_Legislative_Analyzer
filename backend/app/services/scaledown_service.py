from scaledown.compressor import ScaleDownCompressor
from app.config import settings
from app.utils.token_counter import count_tokens

compressor = ScaleDownCompressor(
    target_model="gpt-4o",
    rate="auto",
    api_key=settings.SCALEDOWN_API_KEY
)

def compress_text(text):

    result = compressor.compress(
        context=text,
        prompt="Summarize the legislative document"
    )

    compressed_text = result.content

    original_tokens = count_tokens(text)
    compressed_tokens = count_tokens(compressed_text)

    return {
        "compressed_text": compressed_text,
        "original_tokens": original_tokens,
        "compressed_tokens": compressed_tokens
    }
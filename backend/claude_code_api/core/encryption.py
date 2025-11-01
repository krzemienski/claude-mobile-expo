"""Encryption utilities for sensitive data."""

import os
from pathlib import Path
from cryptography.fernet import Fernet
import structlog

logger = structlog.get_logger()


class EncryptionService:
    """Service for encrypting/decrypting sensitive data."""

    def __init__(self):
        """Initialize with encryption key from environment or generate new."""
        self.key = self._get_or_create_key()
        self.cipher = Fernet(self.key)

    def _get_or_create_key(self) -> bytes:
        """Get encryption key from environment or create new."""
        # Check environment variable first
        env_key = os.environ.get('MCP_ENCRYPTION_KEY')
        if env_key:
            return env_key.encode()

        # Check .env file
        env_file = Path(__file__).parent.parent.parent / '.env'
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                if line.startswith('MCP_ENCRYPTION_KEY='):
                    key = line.split('=', 1)[1].strip()
                    logger.info("Loaded encryption key from .env file")
                    return key.encode()

        # Generate new key and save to .env
        new_key = Fernet.generate_key()

        logger.warning("Generated new encryption key - saving to .env")

        # Append to .env file
        with open(env_file, 'a') as f:
            f.write(f"\nMCP_ENCRYPTION_KEY={new_key.decode()}\n")

        logger.info("Encryption key saved to .env file")
        return new_key

    def encrypt(self, plaintext: str) -> str:
        """Encrypt string."""
        if not plaintext:
            return ""

        encrypted_bytes = self.cipher.encrypt(plaintext.encode())
        return encrypted_bytes.decode()

    def decrypt(self, ciphertext: str) -> str:
        """Decrypt string."""
        if not ciphertext:
            return ""

        decrypted_bytes = self.cipher.decrypt(ciphertext.encode())
        return decrypted_bytes.decode()


# Global instance
encryption_service = EncryptionService()

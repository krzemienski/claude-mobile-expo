"""Database migration: Add indexes for performance optimization."""

from sqlalchemy import text
from claude_code_api.core.database import engine, AsyncSessionLocal
import structlog
import asyncio

logger = structlog.get_logger()


async def add_indexes():
    """Add database indexes for common queries."""
    indexes = [
        # Sessions table indexes
        "CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id)",
        "CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at DESC)",
        "CREATE INDEX IF NOT EXISTS idx_sessions_model ON sessions(model)",
        "CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active)",
        "CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC)",
        
        # Messages table indexes
        "CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id)",
        "CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC)",
        "CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role)",
        
        # Projects table indexes
        "CREATE INDEX IF NOT EXISTS idx_projects_path ON projects(path)",
        "CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active)",
        
        # MCP servers table indexes
        "CREATE INDEX IF NOT EXISTS idx_mcp_servers_name ON mcp_servers(name)",
        "CREATE INDEX IF NOT EXISTS idx_mcp_servers_enabled ON mcp_servers(enabled)",
        "CREATE INDEX IF NOT EXISTS idx_mcp_servers_transport ON mcp_servers(transport)",
        
        # API keys table indexes
        "CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash)",
        "CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active)",
    ]
    
    async with AsyncSessionLocal() as session:
        for index_sql in indexes:
            try:
                await session.execute(text(index_sql))
                index_name = index_sql.split("IF NOT EXISTS")[1].split("ON")[0].strip()
                logger.info("Index created", name=index_name)
            except Exception as e:
                logger.error("Failed to create index", sql=index_sql, error=str(e))
        
        await session.commit()
    
    logger.info("All indexes created successfully", count=len(indexes))


async def drop_indexes():
    """Drop indexes (for rollback)."""
    index_names = [
        "idx_sessions_project_id",
        "idx_sessions_updated_at",
        "idx_sessions_model",
        "idx_sessions_is_active",
        "idx_sessions_created_at",
        "idx_messages_session_id",
        "idx_messages_created_at",
        "idx_messages_role",
        "idx_projects_path",
        "idx_projects_is_active",
        "idx_mcp_servers_name",
        "idx_mcp_servers_enabled",
        "idx_mcp_servers_transport",
        "idx_api_keys_hash",
        "idx_api_keys_is_active",
    ]
    
    async with AsyncSessionLocal() as session:
        for index_name in index_names:
            try:
                await session.execute(text(f"DROP INDEX IF EXISTS {index_name}"))
                logger.info("Index dropped", name=index_name)
            except Exception as e:
                logger.error("Failed to drop index", name=index_name, error=str(e))
        
        await session.commit()


if __name__ == "__main__":
    # Run migration
    asyncio.run(add_indexes())
    print("✅ Database indexes added successfully")

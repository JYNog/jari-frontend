# alembic/env.py
import os, sys
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# backend 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# 1) .env 먼저 로드
from dotenv import load_dotenv
ENV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
load_dotenv(ENV_PATH)

# 2) 그 다음에 db/models import
from db import Base    # backend/db.py
import models          # backend/models.py

config = context.config
target_metadata = Base.metadata

def run_migrations_offline():
    url = os.getenv("DATABASE_URL")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = os.getenv("DATABASE_URL")
    connectable = engine_from_config(configuration, prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
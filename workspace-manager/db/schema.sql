CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);

-- FINAL FIXED INSTANCE SCHEMA
CREATE TABLE instances (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    type TEXT NOT NULL,                 -- "vscode" or "jupyter"
    status TEXT NOT NULL DEFAULT 'running',

    efs_path TEXT NOT NULL,

    -- VSCode ECS
    vscode_task_arn TEXT,
    vscode_ip TEXT,

    -- Jupyter ECS
    jupyter_task_arn TEXT,
    jupyter_ip TEXT,

    ttl_hours INT NOT NULL,
    last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_instances_user ON instances(user_id);
CREATE INDEX idx_instances_last_active ON instances(last_active);
ALTER TABLE instances 
ADD COLUMN task_arn TEXT,
ADD COLUMN container_ip TEXT;


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";



CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);


CREATE TABLE instances (
    id            UUID PRIMARY KEY,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type          TEXT NOT NULL,              
    efs_path      TEXT NOT NULL,
    task_arn      TEXT,
    container_ip  TEXT,
    status        TEXT NOT NULL DEFAULT 'running',
    ttl_hours     INT NOT NULL,
    last_active   TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_instances_user ON instances(user_id);
CREATE INDEX idx_instances_last_active ON instances(last_active);

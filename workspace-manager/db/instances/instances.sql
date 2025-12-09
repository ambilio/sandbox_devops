-- name: CreateInstance :one
INSERT INTO instances (
    id, user_id, type, efs_path, ttl_hours
) VALUES (
    $1, $2, $3, $4, $5
)
RETURNING *;

-- name: UpdateVSCodeOnStart :one
UPDATE instances
SET 
    vscode_task_arn = $2,
    vscode_ip = $3,
    status = 'running'
WHERE id = $1
RETURNING *;

-- name: UpdateJupyterOnStart :one
UPDATE instances
SET 
    jupyter_task_arn = $2,
    jupyter_ip = $3,
    status = 'running'
WHERE id = $1
RETURNING *;

-- name: UpdateInstanceStatus :one
UPDATE instances
SET status = $2
WHERE id = $1
RETURNING *;


-- name: UpdateLastActive :one
UPDATE instances
SET last_active = $2
WHERE id = $1
RETURNING *;


-- name: ListUserInstances :many
SELECT *
FROM instances
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: GetInstanceByID :one
SELECT *
FROM instances
WHERE id = $1
LIMIT 1;


-- name: UpdateInstanceOnStart :one
UPDATE instances
SET 
    task_arn = $2,
    container_ip = $3,
    status = 'running',
    last_active = NOW()
WHERE id = $1
RETURNING 
    id,
    user_id,
    type,
    efs_path,
    task_arn,
    container_ip,
    status,
    ttl_hours,
    last_active,
    created_at,
    vscode_task_arn,
    vscode_ip,
    jupyter_task_arn,
    jupyter_ip;


-- name: ClearVSCodeData :exec
UPDATE instances
SET
    vscode_task_arn = NULL,
    vscode_ip = NULL,
    status = 'stopped',
    last_active = NOW()
WHERE id = $1;


-- name: ClearJupyterData :exec
UPDATE instances
SET
    jupyter_task_arn = NULL,
    jupyter_ip = NULL,
    status = 'stopped',
    last_active = NOW()
WHERE id = $1;

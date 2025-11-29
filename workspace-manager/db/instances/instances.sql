-- name: CreateInstance :one
INSERT INTO instances (
    id, user_id, type, efs_path, ttl_hours
) VALUES (
    $1, $2, $3, $4, $5
)
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
SET task_arn = $2,
    container_ip = $3,
    status = 'running'
WHERE id = $1
RETURNING id, user_id, type, efs_path, task_arn, container_ip, status, ttl_hours, last_active, created_at;

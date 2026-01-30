-- name: CreateInstance :one
INSERT INTO instances (
    id,
    user_id,
    type,
    efs_path,
    ttl_hours,
    console_url
) VALUES (
    $1, $2, $3, $4, $5, $6
)
RETURNING *;



-- name: UpdateInstanceOnStart :one
UPDATE instances
SET
    container_id = $2,
    host_port = $3,
    status = 'running',
    last_active = NOW()
WHERE id = $1
RETURNING *;



-- name: UpdateInstanceStatus :one
UPDATE instances
SET
    status = $2,
    container_id = NULL,
    host_port = NULL,
    last_active = NOW()
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

-- name: ListExpiredInstances :many
SELECT *
FROM instances
WHERE
    status = 'running'
    AND container_id IS NOT NULL
    AND (
        created_at + (ttl_hours || ' hours')::interval < NOW()
        OR last_active < NOW() - INTERVAL '30 minutes'
    );




-- name: StopExpiredInstance :exec
UPDATE instances
SET
  status = 'stopped',
  task_arn = NULL,
  container_ip = NULL,
  last_active = NOW()
WHERE id = $1;


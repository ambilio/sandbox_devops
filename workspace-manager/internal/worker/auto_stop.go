package worker

import (
	"context"
	"log"
	"time"

	db "example.com/m/v2/db/sqlc"
	ecsmanager "example.com/m/v2/ecs"
)

type AutoStopWorker struct {
	q   *db.Queries
	ecs *ecsmanager.ECSManager
}

func NewAutoStopWorker(q *db.Queries, ecs *ecsmanager.ECSManager) *AutoStopWorker {
	return &AutoStopWorker{q: q, ecs: ecs}
}

func (w *AutoStopWorker) Start(ctx context.Context) {
	ticker := time.NewTicker(5 * time.Minute) // ✅ configurable
	go func() {
		for {
			select {
			case <-ticker.C:
				w.runOnce(ctx)
			case <-ctx.Done():
				ticker.Stop()
				return
			}
		}
	}()
}

func (w *AutoStopWorker) runOnce(ctx context.Context) {
	instances, err := w.q.ListExpiredInstances(ctx)
	if err != nil {
		log.Println("auto-stop query error:", err)
		return
	}

	for _, inst := range instances {
		log.Printf("Auto-stopping instance %s\n", inst.ID)

		_ = w.ecs.StopTask(ctx, inst.TaskArn.String)

		_, _ = w.q.UpdateInstanceStatus(ctx, db.UpdateInstanceStatusParams{
			ID:     inst.ID,
			Status: "stopped",
		})
	}
}

#!/bin/bash
echo "Starting LangFlow..."
langflow run \
  --host 0.0.0.0 \
  --port 7860 \
  --data-path /data

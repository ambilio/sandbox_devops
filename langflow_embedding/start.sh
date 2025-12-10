#!/bin/sh
set -e

# Start nginx
nginx

# Start LangFlow
exec langflow run --host 127.0.0.1 --port 7860

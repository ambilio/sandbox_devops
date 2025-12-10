#!/bin/sh
set -e

nginx

exec langflow run --host 127.0.0.1 --port 7860

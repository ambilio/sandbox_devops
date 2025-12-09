#!/bin/bash

service nginx start

su coder -c "/home/coder/.local/bin/jupyter lab \
    --ServerApp.ip=0.0.0.0 \
    --ServerApp.port=8888 \
    --ServerApp.token='' \
    --ServerApp.password='' \
    --ServerApp.base_url=/jupyter_backend/ \
    --ServerApp.allow_origin='*' \
    --ServerApp.disable_check_xsrf=True \
    --no-browser" &

tail -f /dev/null

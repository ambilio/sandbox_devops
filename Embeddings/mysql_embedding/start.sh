#!/bin/bash
set -e

nginx

export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

exec ttyd \
    -p 7681 \
    -t fontSize=16 \
    -t disableReconnect=false \
    bash -lc "mysqlsh"

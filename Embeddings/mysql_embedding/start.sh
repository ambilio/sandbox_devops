#!/bin/bash
set -e

nginx

# locales (fix LC_ALL error)
apt-get update && apt-get install -y locales
echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
locale-gen

export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

# run ttyd as PID 1 so container stops when user disconnects
exec ttyd -p 7681 -W bash -lc "mysqlsh"

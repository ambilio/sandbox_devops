#!/bin/bash
set -e

nginx

apt-get update && apt-get install -y locales
echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
locale-gen

export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

exec ttyd -p 7681 -W bash -lc "mysqlsh"

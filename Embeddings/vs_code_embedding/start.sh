#!/bin/bash

# Start nginx
service nginx start

# Start code-server
sudo -u coder code-server --bind-addr 0.0.0.0:8080 --auth none

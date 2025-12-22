#!/bin/bash

service nginx start

sudo -u coder code-server --bind-addr 0.0.0.0:8080 --auth none

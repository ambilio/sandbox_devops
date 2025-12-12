#!/bin/bash

ttyd -p 7681 mysqlsh &

nginx -g "daemon off;"

# workspace-image/Dockerfile
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl wget git build-essential \
    python3 python3-pip \
    nodejs npm \
    nginx \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -L -o /tmp/code-server.deb \
    https://github.com/coder/code-server/releases/download/v4.106.2/code-server_4.106.2_amd64.deb && \
    dpkg -i /tmp/code-server.deb || apt-get install -f -y && \
    rm -f /tmp/code-server.deb

RUN pip3 install --no-cache-dir jupyterlab notebook jupyter

RUN useradd -m coder && mkdir -p /home/coder/notebooks && chown -R coder:coder /home/coder

COPY nginx.conf /etc/nginx/sites-enabled/default

EXPOSE 80


CMD service nginx start && \
    su coder -c "code-server --bind-addr 0.0.0.0:8080 --auth none --user-data-dir=/home/coder/.local/share/code-server" & \
    su coder -c 'jupyter lab \
        --ip=0.0.0.0 \
        --port=8888 \
        --no-browser \
        --ServerApp.token="" \
        --ServerApp.password="" \
        --ServerApp.base_url=/jupyter_backend/ \
        --ServerApp.allow_origin="*" \
        --ServerApp.disable_check_xsrf=True \
        --ServerApp.root_dir=/home/coder/workspace' & \
    tail -f /dev/null

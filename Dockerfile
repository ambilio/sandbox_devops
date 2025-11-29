FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl wget git sudo build-essential \
    python3 python3-pip \
    nodejs npm \
    nginx \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m coder
RUN echo "coder ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER coder
WORKDIR /home/coder

# Install code-server
RUN curl -L -o code-server.deb \
    https://github.com/coder/code-server/releases/download/v4.106.2/code-server_4.106.2_amd64.deb && \
    sudo dpkg -i code-server.deb || sudo apt-get install -f -y && \
    rm code-server.deb

# Install Jupyter Server (Notebook 7 uses ServerApp)
RUN python3 -m pip install --upgrade pip && \
    pip install --user jupyter jupyterlab notebook

ENV PATH="/home/coder/.local/bin:${PATH}"

USER root
COPY nginx.conf /etc/nginx/sites-enabled/default

EXPOSE 80

CMD service nginx start && \
    su coder -c "code-server --bind-addr 0.0.0.0:8080 --auth none" & \
    su coder -c "/home/coder/.local/bin/jupyter lab \
        --ServerApp.ip=0.0.0.0 \
        --ServerApp.port=8888 \
        --ServerApp.token='' \
        --ServerApp.password='' \
        --ServerApp.base_url=/jupyter_backend/ \
        --ServerApp.allow_origin='*' \
        --ServerApp.disable_check_xsrf=True \
        --no-browser" & \
    tail -f /dev/null
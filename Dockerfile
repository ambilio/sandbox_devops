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

RUN curl -L -o code-server.deb \
    https://github.com/coder/code-server/releases/download/v4.106.2/code-server_4.106.2_amd64.deb && \
    sudo dpkg -i code-server.deb || sudo apt-get install -f -y && \
    rm code-server.deb

RUN python3 -m pip install --upgrade pip && \
    pip install jupyter

USER root
COPY nginx.conf /etc/nginx/sites-enabled/default

EXPOSE 80

CMD service nginx start && \
    su coder -c "code-server --bind-addr 0.0.0.0:8080 --auth none" & \
    su coder -c "jupyter notebook --ip=0.0.0.0 --port=8888 --no-browser --NotebookApp.token='' --NotebookApp.base_url=/jupyter_backend/ --NotebookApp.allow_origin='*'" & \
    tail -f /dev/null

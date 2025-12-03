FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl wget git sudo build-essential \
    python3 python3-pip \
    nodejs npm \
    nginx \
    bash \
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

# Install Jupyter Server
RUN python3 -m pip install --upgrade pip && \
    pip install --user jupyter jupyterlab notebook

ENV PATH="/home/coder/.local/bin:${PATH}"

USER root
COPY nginx.conf /etc/nginx/sites-enabled/default

EXPOSE 80
EXPOSE 8080
EXPOSE 8888

# ---- FIX: use a bash startup script ----
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/bin/bash", "/start.sh"]

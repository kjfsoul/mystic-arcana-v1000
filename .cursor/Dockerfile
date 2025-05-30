FROM ubuntu:22.04

# Set non-interactive mode for apt
ENV DEBIAN_FRONTEND=noninteractive

# Install essential system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    python3 \
    python3-pip \
    python3-dev \
    pkg-config \
    libssl-dev \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    tmux \
    vim \
    sudo

# Install Node.js 20 LTS for Next.js development
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Install Swiss Ephemeris for astronomical calculations
RUN apt-get install -y libswe-dev

# Install Python dependencies for astronomical calculations
RUN pip3 install pyephem swisseph numpy pandas

# Install global npm packages for spiritual technology development
RUN npm install -g npm@latest pnpm@latest

# Create ubuntu user with sudo privileges
RUN useradd -m -s /bin/bash ubuntu && \
    echo 'ubuntu ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Set working directory
WORKDIR /home/ubuntu

# Switch to ubuntu user
USER ubuntu

# Set up development environment
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
# C++ Execution Environment
FROM gcc:13.2-bookworm

LABEL project="codearena"
LABEL component="executor-cpp"

# Install necessary tools and C++ specific Boost libraries
# We avoid libboost-all-dev to bypass the broken gfortran dependency
RUN apt-get update && apt-get install -y \
    time \
    g++ \
    libboost-dev \
    libboost-system-dev \
    libboost-filesystem-dev \
    libboost-regex-dev \
    libboost-program-options-dev \
    libboost-test-dev \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -s /bin/bash coderunner

# Set working directory
WORKDIR /workspace

# Set ownership of workspace
RUN chown -R coderunner:coderunner /workspace

# Copy execution script
COPY scripts/cpp-runner.sh /usr/local/bin/runner.sh
# Standardize line endings and make executable
RUN sed -i 's/\r$//' /usr/local/bin/runner.sh && chmod +x /usr/local/bin/runner.sh

# Set resource limits (Sandbox Hardening)
# These limits (nofile: 1024, nproc: 128, fsize: 10MB) balance security with runtime requirements
RUN echo "coderunner hard cpu 1" >> /etc/security/limits.conf && \
    echo "coderunner hard nproc 128" >> /etc/security/limits.conf && \
    echo "coderunner hard fsize 10240" >> /etc/security/limits.conf && \
    echo "coderunner hard nofile 1024" >> /etc/security/limits.conf

# Switch to non-root user for security
USER coderunner

# Entry point
ENTRYPOINT ["/usr/local/bin/runner.sh"]
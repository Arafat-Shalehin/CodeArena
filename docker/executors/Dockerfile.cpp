# C++ Execution Environment
FROM gcc:13.2-bookworm

# Install necessary tools
RUN apt-get update && apt-get install -y \
    time \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -s /bin/bash coderunner

# Set working directory
WORKDIR /workspace

# Set ownership of workspace
RUN chown -R coderunner:coderunner /workspace

# Copy execution script
COPY scripts/cpp-runner.sh /usr/local/bin/runner.sh
RUN sed -i 's/\r$//' /usr/local/bin/runner.sh && chmod +x /usr/local/bin/runner.sh

# Set resource limits
RUN echo "coderunner hard cpu 1" >> /etc/security/limits.conf && \
    echo "coderunner hard nproc 50" >> /etc/security/limits.conf && \
    echo "coderunner hard fsize 10240" >> /etc/security/limits.conf

# Switch to non-root user
USER coderunner

# Entry point
ENTRYPOINT ["/usr/local/bin/runner.sh"]

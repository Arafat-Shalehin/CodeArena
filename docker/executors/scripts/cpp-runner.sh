#!/bin/bash
set -e

# Set umask to allow execute permissions
umask 000

# Compilation and execution script for C++
SOURCE_FILE="/workspace/solution.cpp"
BINARY_FILE="/workspace/solution"
INPUT_FILE="/workspace/input.txt"
OUTPUT_FILE="/workspace/output.txt"
ERROR_FILE="/workspace/error.txt"
TIME_LIMIT=${TIME_LIMIT:-5}
MEMORY_LIMIT=${MEMORY_LIMIT:-512000}

# Compile C++ code
echo "Compiling C++ code..."
if ! g++ -std=c++17 -O2 -Wall "$SOURCE_FILE" -o "$BINARY_FILE" 2>"$ERROR_FILE"; then
    echo "COMPILATION_ERROR"
    cat "$ERROR_FILE"
    exit 1
fi

# Make binary executable and Ensure ownership
chmod +x "$BINARY_FILE"


# Execute with time and memory limits
echo "Executing C++ code..."
START_TIME=$(date +%s%N)
EXIT_CODE=0

if [ -f "$INPUT_FILE" ]; then
    timeout ${TIME_LIMIT}s /usr/bin/time -f "%M" "$BINARY_FILE" < "$INPUT_FILE" > "$OUTPUT_FILE" 2>"$ERROR_FILE" || EXIT_CODE=$?
else
    timeout ${TIME_LIMIT}s /usr/bin/time -f "%M" "$BINARY_FILE" > "$OUTPUT_FILE" 2>"$ERROR_FILE" || EXIT_CODE=$?
fi

END_TIME=$(date +%s%N)
EXECUTION_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

# Check exit status
if [ $EXIT_CODE -eq 124 ]; then
    echo "TIME_LIMIT_EXCEEDED"
    echo "Execution time: ${EXECUTION_TIME}ms"
    exit 1
elif [ $EXIT_CODE -ne 0 ]; then
    echo "RUNTIME_ERROR"
    cat "$ERROR_FILE"
    exit 1
fi

# Check memory usage
MEMORY_USED=$(tail -1 "$ERROR_FILE")
if [ "$MEMORY_USED" -gt "$MEMORY_LIMIT" ]; then
    echo "MEMORY_LIMIT_EXCEEDED"
    echo "Memory used: ${MEMORY_USED}KB"
    exit 1
fi

echo "SUCCESS"
echo "Execution time: ${EXECUTION_TIME}ms"
echo "Memory used: ${MEMORY_USED}KB"
cat "$OUTPUT_FILE"

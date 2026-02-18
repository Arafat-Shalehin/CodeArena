#!/bin/bash
set -e

# Execution script for Python
SOURCE_FILE="/workspace/solution.py"
INPUT_FILE="/workspace/input.txt"
OUTPUT_FILE="/workspace/output.txt"
ERROR_FILE="/workspace/error.txt"
TIME_LIMIT=${TIME_LIMIT:-5}
MEMORY_LIMIT=${MEMORY_LIMIT:-512000}

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "SOURCE_FILE_NOT_FOUND"
    exit 1
fi

# Execute with time and memory limits
echo "Executing Python code..."
START_TIME=$(date +%s%N)
EXIT_CODE=0

if [ -f "$INPUT_FILE" ]; then
    timeout ${TIME_LIMIT}s /usr/bin/time -f "%M" python3 "$SOURCE_FILE" < "$INPUT_FILE" > "$OUTPUT_FILE" 2>"$ERROR_FILE" || EXIT_CODE=$?
else
    timeout ${TIME_LIMIT}s /usr/bin/time -f "%M" python3 "$SOURCE_FILE" > "$OUTPUT_FILE" 2>"$ERROR_FILE" || EXIT_CODE=$?
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

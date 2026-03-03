#!/bin/bash
set -e

# Execution script for JavaScript
SOURCE_FILE="/workspace/solution.js"
INPUT_FILE="/workspace/input.txt"
OUTPUT_FILE="/workspace/output.txt"
ERROR_FILE="/workspace/error.txt"
TIME_LIMIT=${TIME_LIMIT:-5}
MEMORY_LIMIT=${MEMORY_LIMIT:-512000}
OUTPUT_LIMIT=${OUTPUT_LIMIT:-10485760} # Default 10MB

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "SOURCE_FILE_NOT_FOUND"
    exit 1
fi

# Execute with time and memory limits
echo "Executing JavaScript code..."
START_TIME=$(date +%s%N)
EXIT_CODE=0
if [ -f "$INPUT_FILE" ]; then
    MAX_OLD_SPACE=$((MEMORY_LIMIT / 1024))
    timeout ${TIME_LIMIT}s /usr/bin/time -f "%M" node --max-old-space-size=$MAX_OLD_SPACE "$SOURCE_FILE" < "$INPUT_FILE" | head -c "$OUTPUT_LIMIT" > "$OUTPUT_FILE" 2>"$ERROR_FILE" || EXIT_CODE=$?
else
    MAX_OLD_SPACE=$((MEMORY_LIMIT / 1024))
    timeout ${TIME_LIMIT}s /usr/bin/time -f "%M" node --max-old-space-size=$MAX_OLD_SPACE "$SOURCE_FILE" | head -c "$OUTPUT_LIMIT" > "$OUTPUT_FILE" 2>"$ERROR_FILE" || EXIT_CODE=$?
fi

# Capture output from temp file if we used redirection


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
MEMORY_USED=$(tail -1 "$ERROR_FILE" | tr -dc '0-9')
if [[ -n "$MEMORY_USED" ]] && [ "$MEMORY_USED" -gt "$MEMORY_LIMIT" ]; then
    echo "MEMORY_LIMIT_EXCEEDED"
    echo "Memory used: ${MEMORY_USED}KB"
    exit 1
fi

echo "SUCCESS"
echo "Execution time: ${EXECUTION_TIME}ms"
echo "Memory used: ${MEMORY_USED:-0}KB"
cat "$OUTPUT_FILE"

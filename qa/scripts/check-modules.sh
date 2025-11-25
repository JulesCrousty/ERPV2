#!/bin/bash
set -e

missing=()
for dir in backend frontend infrastructure monitoring; do
  if [ ! -d "$dir" ]; then
    missing+=("$dir")
  fi
done

if [ ${#missing[@]} -gt 0 ]; then
  echo "Missing modules: ${missing[*]}" >&2
  exit 1
fi

echo "All core modules present"

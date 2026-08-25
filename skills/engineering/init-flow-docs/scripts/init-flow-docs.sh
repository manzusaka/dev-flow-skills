#!/usr/bin/env bash

set -euo pipefail

usage() {
  echo "Usage: $0 <project-root> [--context-source <file>]" >&2
}

if [[ $# -lt 1 ]]; then
  usage
  exit 2
fi

project_root=$1
shift
context_source=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --context-source)
      if [[ $# -lt 2 ]]; then
        usage
        exit 2
      fi
      context_source=$2
      shift 2
      ;;
    *)
      usage
      exit 2
      ;;
  esac
done

if [[ ! -d "$project_root" ]]; then
  echo "Project root does not exist: $project_root" >&2
  exit 1
fi

if [[ -n "$context_source" && ! -f "$context_source" ]]; then
  echo "Prepared CONTEXT.md does not exist: $context_source" >&2
  exit 1
fi

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
assets_dir="$script_dir/../assets"

mkdir -p "$project_root/docs/adr"

context_target="$project_root/CONTEXT.md"
if [[ -n "$context_source" ]]; then
  if ! cmp -s "$context_source" "$context_target"; then
    cp "$context_source" "$context_target"
    echo "Updated CONTEXT.md from prepared content."
  else
    echo "CONTEXT.md already matches prepared content."
  fi
elif [[ ! -e "$context_target" ]]; then
  cp "$assets_dir/CONTEXT.md" "$context_target"
  echo "Created CONTEXT.md from template."
else
  echo "Preserved existing CONTEXT.md; pass --context-source to update it."
fi

echo "Flow docs initialized at $project_root"

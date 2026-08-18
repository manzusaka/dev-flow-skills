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

mkdir -p \
  "$project_root/docs/adr" \
  "$project_root/openspec/specs" \
  "$project_root/openspec/changes/archive" \
  "$project_root/openspec/schemas/templates"

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

config_target="$project_root/openspec/config.yaml"
if [[ ! -e "$config_target" ]]; then
  cp "$assets_dir/openspec/config.yaml" "$config_target"
  echo "Created openspec/config.yaml."
else
  echo "Preserved existing openspec/config.yaml."
fi

schema_asset_dir="$assets_dir/openspec/schemas"
schema_target_dir="$project_root/openspec/schemas"

for relative_path in \
  schema.yaml \
  templates/proposal.md \
  templates/spec.md \
  templates/design.md \
  templates/tasks.md
do
  source_path="$schema_asset_dir/$relative_path"
  target_path="$schema_target_dir/$relative_path"

  if [[ ! -e "$target_path" ]]; then
    cp "$source_path" "$target_path"
    echo "Created openspec/schemas/$relative_path."
  else
    echo "Preserved existing openspec/schemas/$relative_path."
  fi
done

echo "Flow docs initialized at $project_root"

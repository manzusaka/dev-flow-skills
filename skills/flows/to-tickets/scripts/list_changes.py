#!/usr/bin/env python3
"""List active OpenSpec changes without invoking the OpenSpec CLI."""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re


TASK_PATTERN = re.compile(r"^\s*[-*]\s*\[([\sxX])\]\s*(.*)")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="List active OpenSpec changes as JSON.")
    parser.add_argument(
        "--root",
        type=Path,
        default=Path.cwd(),
        help="Repository root containing openspec/changes (default: current directory).",
    )
    parser.add_argument(
        "--sort",
        choices=("recent", "name"),
        default="recent",
        help="Sort changes by most recent modification or name.",
    )
    return parser.parse_args()


def task_progress(tasks_path: Path) -> tuple[int, int]:
    if not tasks_path.is_file():
        return 0, 0

    matches = [
        match
        for line in tasks_path.read_text(encoding="utf-8").splitlines()
        if (match := TASK_PATTERN.match(line))
    ]
    completed = sum(match.group(1).lower() == "x" for match in matches)
    return completed, len(matches)


def last_modified(change_dir: Path) -> float:
    files = [path for path in change_dir.rglob("*") if path.is_file()]
    return max((path.stat().st_mtime for path in files), default=change_dir.stat().st_mtime)


def iso_timestamp(timestamp: float) -> str:
    return (
        datetime.fromtimestamp(timestamp, tz=timezone.utc)
        .isoformat(timespec="milliseconds")
        .replace("+00:00", "Z")
    )


def list_changes(root: Path, sort: str = "recent") -> dict[str, object]:
    resolved_root = root.resolve()
    changes_dir = resolved_root / "openspec" / "changes"
    directories = []
    if changes_dir.is_dir():
        directories = [
            path
            for path in changes_dir.iterdir()
            if path.is_dir() and path.name != "archive" and not path.name.startswith(".")
        ]

    changes = []
    for change_dir in directories:
        completed, total = task_progress(change_dir / "tasks.md")
        modified = last_modified(change_dir)
        changes.append(
            {
                "name": change_dir.name,
                "completedTasks": completed,
                "totalTasks": total,
                "lastModified": iso_timestamp(modified),
                "status": (
                    "no-tasks"
                    if total == 0
                    else "complete"
                    if completed == total
                    else "in-progress"
                ),
                "_modified": modified,
            }
        )

    if sort == "name":
        changes.sort(key=lambda change: str(change["name"]))
    else:
        changes.sort(key=lambda change: float(change["_modified"]), reverse=True)

    for change in changes:
        del change["_modified"]

    return {
        "changes": changes,
        "root": {"path": str(resolved_root), "source": "explicit"},
    }


def main() -> None:
    args = parse_args()
    print(json.dumps(list_changes(args.root, args.sort), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

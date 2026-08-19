from __future__ import annotations

import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).parents[1] / "scripts" / "list_changes.py"
SPEC = importlib.util.spec_from_file_location("list_changes", SCRIPT)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class ListChangesTests(unittest.TestCase):
    def test_missing_changes_directory_returns_openspec_json_shape(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            result = MODULE.list_changes(root)

        self.assertEqual(result["changes"], [])
        self.assertEqual(
            result["root"], {"path": str(root.resolve()), "source": "explicit"}
        )

    def test_lists_active_changes_and_counts_tasks(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            changes = root / "openspec" / "changes"
            active = changes / "add-cancellation"
            complete = changes / "rename-customer"
            no_tasks = changes / "document-terms"
            archived = changes / "archive" / "old-change"
            hidden = changes / ".draft"
            for path in (active, complete, no_tasks, archived, hidden):
                path.mkdir(parents=True)

            (active / "tasks.md").write_text(
                "- [x] 1.1 Done\n  - [ ] 1.2 Pending\n", encoding="utf-8"
            )
            (complete / "tasks.md").write_text(
                "* [X] 1.1 Done\n", encoding="utf-8"
            )
            (archived / "tasks.md").write_text("- [ ] Hidden\n", encoding="utf-8")
            (hidden / "tasks.md").write_text("- [ ] Hidden\n", encoding="utf-8")

            result = MODULE.list_changes(root, sort="name")

        self.assertEqual(
            [change["name"] for change in result["changes"]],
            ["add-cancellation", "document-terms", "rename-customer"],
        )
        self.assertEqual(
            [
                (
                    change["completedTasks"],
                    change["totalTasks"],
                    change["status"],
                )
                for change in result["changes"]
            ],
            [(1, 2, "in-progress"), (0, 0, "no-tasks"), (1, 1, "complete")],
        )
        self.assertEqual(
            set(result["changes"][0]),
            {
                "name",
                "completedTasks",
                "totalTasks",
                "lastModified",
                "status",
            },
        )
        self.assertRegex(
            result["changes"][0]["lastModified"],
            r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$",
        )

    def test_recent_sort_uses_latest_file_timestamp(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            older = root / "openspec" / "changes" / "older"
            newer = root / "openspec" / "changes" / "newer"
            older.mkdir(parents=True)
            newer.mkdir(parents=True)
            older_file = older / "proposal.md"
            newer_file = newer / "proposal.md"
            older_file.write_text("old", encoding="utf-8")
            newer_file.write_text("new", encoding="utf-8")
            os.utime(older_file, (1_700_000_000, 1_700_000_000))
            os.utime(newer_file, (1_800_000_000, 1_800_000_000))

            result = MODULE.list_changes(root)

        self.assertEqual(
            [change["name"] for change in result["changes"]], ["newer", "older"]
        )

    def test_cli_prints_valid_json(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            completed = subprocess.run(
                [sys.executable, str(SCRIPT), "--root", directory],
                check=True,
                capture_output=True,
                text=True,
            )

        payload = json.loads(completed.stdout)
        self.assertEqual(payload["changes"], [])
        self.assertEqual(payload["root"]["source"], "explicit")


if __name__ == "__main__":
    unittest.main()

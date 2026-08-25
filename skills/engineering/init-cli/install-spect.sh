#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/bin/spect"
DEST_DIR="$HOME/.local/bin"
DEST="$DEST_DIR/spect"

if ! command -v node >/dev/null 2>&1; then
  echo "错误：未找到 node。spect 需要 Node.js >= 22。" >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "错误：node 版本过低（需要 >= 22，当前 $(node --version)）。" >&2
  exit 1
fi

if [ ! -f "$SRC" ]; then
  echo "错误：找不到可执行文件 $SRC。请重新安装 init-cli skill。" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"
cp "$SRC" "$DEST"
chmod +x "$DEST"
echo "已安装：$DEST"

if command -v spect >/dev/null 2>&1; then
  echo "spect $(spect --version) 已就绪。"
else
  echo ""
  echo "注意：$DEST_DIR 不在当前 PATH 中。请将以下行加入你的 shell 配置（如 ~/.zshrc）："
  echo "  export PATH=\"$DEST_DIR:\$PATH\""
  echo "然后重新打开终端，或直接把 $DEST 链接到已在 PATH 中的目录。"
fi

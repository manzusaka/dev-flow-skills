---
name: init-cli
description: 检查、安装或更新 spect（精简版 OpenSpec CLI）命令。当 `spect --version` 报 command not found、用户要求安装或更新 spect / OpenSpec CLI、setup-skills 做环境检查、或其他 skill 需要 spect 命令但本机缺失或版本过旧时使用。
---

# Init CLI

确认本机可用的 `spect` 命令；缺失时安装它，版本过旧时更新它。支持 macOS、Linux 与 Windows（PowerShell）。`spect` 是 devtrain-skills 的精简版 OpenSpec CLI（规范驱动开发的变更管理命令），随本 skill 分发单文件可执行程序，安装不需要联网、不需要 npm。OpenSpec 模板的单一事实来源在本 skill 的 `assets/schemas/` 下，构建期内嵌进可执行程序，`spect init` 会把它们写入目标项目。

## Process

### 1. Detect

确定当前系统的类型和版本：

```bash
uname -sm
```

- 输出含 `Darwin` 或 `Linux`：macOS/Linux，后续步骤使用 `install-spect.sh`。
- 命令缺失或输出为其他内容：判定为 Windows，在 PowerShell 中运行 `$PSVersionTable.PSVersion` 与 `[System.Environment]::OSVersion` 取 PowerShell 和系统版本，后续步骤使用 `install-spect.ps1`。

### 2. Check

运行：

```bash
spect --version
```

- 命令缺失（command not found / PowerShell 报不是可识别的命令）：继续下一步，这是首次安装。
- 命令存在：再运行与本 SKILL.md 同目录下的 `node <本 skill 目录>/bin/spect --version`，取本 skill 随附的版本：
  - 两个版本一致：报告当前版本号并结束——不要重复安装，也不要做其他事。
  - 版本不一致：继续下一步，这是更新。

Windows 上用户若安装后从未配置 PATH，此步会持续判定命令缺失；重装是幂等覆盖，无害，安装脚本会再次给出 PATH 指引。

### 3. Confirm

安装会向用户机器写入可执行文件：macOS/Linux 写入 `~/.local/bin/spect`，Windows 写入 `%USERPROFILE%\.local\bin\spect.js` 并生成 `spect.cmd` 垫片。安装前必须向用户说明将要执行的动作（安装 spect；更新场景需说明版本变化），并等待用户明确同意。用户不同意则停止，不做任何写入。

### 4. Install

运行与本 SKILL.md 同目录下的安装脚本。

macOS/Linux：

```bash
bash <本 skill 目录>/install-spect.sh
```

Windows（PowerShell）：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File <本 skill 目录>\install-spect.ps1
```

脚本会检查 Node.js（>= 22）：macOS/Linux 上拷贝 `bin/spect` 到 `~/.local/bin/spect` 并赋予执行权限；Windows 上拷贝为 `spect.js` 并生成 `spect.cmd` 垫片。

### 5. Verify

macOS/Linux：再次运行 `spect --version`：

- 命令可用：报告版本号，完成。
- 命令仍不可用：通常是 `~/.local/bin` 不在 PATH 中。把安装脚本输出的 PATH 指引原样转达给用户（将 `export PATH="$HOME/.local/bin:$PATH"` 加入 shell 配置，或重新打开终端），不要替用户修改 shell 配置文件。

Windows：PATH 此时未配置，用全路径验证垫片：

```powershell
& "$env:USERPROFILE\.local\bin\spect.cmd" --version
```

- 能输出版本号：安装成功，把安装脚本输出的 PATH 指引原样转达给用户（执行其中的 `[Environment]::SetEnvironmentVariable(...)` 命令后重新打开终端），不要替用户修改环境变量。
- 仍失败：把错误信息报告给用户。

完成条件：`spect --version` 能输出版本号（Windows 用全路径垫片验证），或已把缺失原因和修复步骤告知用户。

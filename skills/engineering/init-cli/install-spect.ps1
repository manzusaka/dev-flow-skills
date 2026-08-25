# install-spect.ps1 — 在 Windows 上安装 spect 到 %USERPROFILE%\.local\bin
# 注意：本文件必须以 UTF-8 带 BOM 保存，否则 PowerShell 5.1 下中文会乱码。
# 需要 Node.js >= 22。脚本不修改 PATH；目录不在 PATH 中时只打印指引。

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Src = Join-Path $ScriptDir 'bin\spect'
$DestDir = Join-Path $env:USERPROFILE '.local\bin'
$DestJs = Join-Path $DestDir 'spect.js'
$DestCmd = Join-Path $DestDir 'spect.cmd'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "错误：未找到 node。spect 需要 Node.js >= 22。"
    exit 1
}

$NodeMajor = & node -p 'process.versions.node.split(".")[0]'
if ([int]$NodeMajor -lt 22) {
    Write-Error ("错误：node 版本过低（需要 >= 22，当前 {0}）。" -f (node --version))
    exit 1
}

if (-not (Test-Path -LiteralPath $Src)) {
    Write-Error "错误：找不到可执行文件 $Src。请重新安装 init-cli skill。"
    exit 1
}

New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
Copy-Item -LiteralPath $Src -Destination $DestJs -Force
Set-Content -LiteralPath $DestCmd -Value '@node "%~dp0spect.js" %*' -Encoding ASCII

Write-Host "已安装：$DestCmd"

if (($env:PATH -split ';') -contains $DestDir) {
    $Version = & $DestCmd --version
    Write-Host "spect $Version 已就绪。"
} else {
    Write-Host ""
    Write-Host "注意：$DestDir 不在当前 PATH 中。请在 PowerShell 中执行以下命令（写入当前用户 PATH，永久生效）："
    Write-Host "  [Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'User') + ';$DestDir', 'User')"
    Write-Host "然后重新打开终端，即可直接使用 spect 命令。"
}

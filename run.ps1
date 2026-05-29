# run.ps1 — Serve the v1 Discovery Map (Nevada County Cultural Map) persistently.
#
# The server runs as a DETACHED process in its own minimized window, so it
# survives Claude Code restarts / session resets. Run again any time to restart.
#
#   Usage:  .\run.ps1            # start (or report it's already up)
#           .\run.ps1 -Stop      # stop the server
#           .\run.ps1 -Port 4178 # custom port (default 4178)

param(
    [int]$Port = 4178,
    [switch]$Stop
)

$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot 'website\cultural-map-redesign-stitch-lab'
$url  = "http://127.0.0.1:$Port/v1-discovery-map/index.html"

function Get-Listener { Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue }

if ($Stop) {
    $c = Get-Listener
    if ($c) { Stop-Process -Id $c.OwningProcess -Force; Write-Host "Stopped server on port $Port." }
    else    { Write-Host "Nothing listening on port $Port." }
    return
}

if (Get-Listener) {
    Write-Host "Already serving -> $url"
    return
}

Start-Process -FilePath 'python' -ArgumentList '-m', 'http.server', "$Port" `
    -WorkingDirectory $root -WindowStyle Minimized

Start-Sleep -Milliseconds 800
if (Get-Listener) {
    Write-Host "v1 Discovery Map serving (detached, survives Claude restarts):"
    Write-Host "  $url"
} else {
    Write-Host "Server did not come up on port $Port. Is python on PATH?"
}

param([Parameter(Mandatory=$true)][string]$Phase)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$logs = Join-Path $taskRoot 'evidencias/rediseno'
New-Item -ItemType Directory -Force $logs | Out-Null
Push-Location (Join-Path $taskRoot 'web')
try {
  foreach ($check in @('lint','typecheck','build','test:export','test:e2e')) {
    if ($check -eq 'build') { $env:GITHUB_PAGES = 'true' }
    if ($check -eq 'test:e2e') { Remove-Item Env:GITHUB_PAGES -ErrorAction SilentlyContinue }
    $output = & npm.cmd run $check 2>&1
    $exit = $LASTEXITCODE
    $output | Set-Content -LiteralPath (Join-Path $logs "$Phase-$($check.Replace(':','-')).txt")
    Write-Output "$Phase | npm run $check | exit $exit"
    if ($exit -ne 0) { $output | Write-Output; throw "fallo en $check" }
    $output | Select-Object -Last 5 | Write-Output
  }
} finally {
  Remove-Item Env:GITHUB_PAGES -ErrorAction SilentlyContinue
  Pop-Location
}

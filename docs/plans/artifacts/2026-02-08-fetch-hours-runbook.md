# Fetch Hours Runbook

Updated: 2026-02-08

## Canonical Python Interpreter

Always use:

`C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe`

Do not use bare `python` in this environment.

## Preflight

1. Confirm API key works:

```powershell
C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe scripts/fetch-hours.py --test-api
```

2. Confirm script options:

```powershell
C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe scripts/fetch-hours.py --help
```

## Normal Run (Resume Mode)

Default mode skips rows that already contain both `pid` and `h` keys.

```powershell
C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe scripts/fetch-hours.py
```

Expected output includes:
- `Resume mode: enabled (...)`
- final `Data file updated successfully`

## Force Full Re-Fetch

Use only when intentionally reprocessing all assets:

```powershell
C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe scripts/fetch-hours.py --force
```

## Checkpoint Frequency

Default checkpoint write interval is 25 processed venues.

Examples:

```powershell
# Every 10 processed venues
C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe scripts/fetch-hours.py --save-every 10

# Disable mid-run checkpoints (final write still happens)
C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe scripts/fetch-hours.py --save-every 0
```

## Interruption and Recovery

1. Check if a fetch-hours process is running:

```powershell
Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'python' -and $_.CommandLine -match 'fetch-hours.py' } | Select-Object ProcessId,CommandLine
```

2. If you must stop it:

```powershell
Stop-Process -Id <PID> -Force
```

3. Restart in resume mode:

```powershell
C:\Users\ender\AppData\Local\Programs\Python\Python312\python.exe scripts/fetch-hours.py
```

Because checkpoint writes are enabled, restart resumes from already-written `pid`/`h` fields.

## Success Criteria

Run is successful only if output includes all of:
- `Completed inspection of ...`
- `Results:` block
- `Checkpoint (final) written to ...`
- `Data file updated successfully`

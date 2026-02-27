# Running Upaya Locally

## Prerequisites

PostgreSQL must be running before starting anything:
```powershell
Start-Service postgresql-x64-18
```

---

## Terminal 1 — API (port 3001)

```bash
cd C:\upaya
pnpm --filter @upaya/api dev
```

## Terminal 2 — Mobile / Metro (port 8081)

```bash
cd C:\upaya
pnpm --filter @upaya/mobile dev
```

---

## When to restart

| What changed | Action |
|---|---|
| Mobile `.tsx` file | Nothing — Metro hot reloads |
| `app.json` | Restart Terminal 2 |
| API route / service | Restart Terminal 1 |
| `.env` file | Restart Terminal 1 |
| New npm package | `pnpm install` + restart both |
| `packages/shared` | `pnpm --filter @upaya/shared build` + restart both |

---

## Kill by port (if terminal is gone)

```powershell
# Kill API (3001)
Get-NetTCPConnection -LocalPort 3001 -State Listen | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# Kill Metro (8081)
Get-NetTCPConnection -LocalPort 8081 -State Listen | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

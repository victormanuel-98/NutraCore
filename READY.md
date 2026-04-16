# NutraCore - Estado Listo

## Estructura principal
- `frontend/`: React + Vite (HTML5/CSS3 en la UI)
- `backend/`: Node.js + Express + MongoDB (JavaScript)

## Estado actual
- Frontend validado con build correcto (`npm run build`).
- Frontend en ejecución: `http://127.0.0.1:5173`
- Backend en ejecución: `http://127.0.0.1:5000`
- Health backend: `http://127.0.0.1:5000/health` (OK)

## Comandos para iniciar manualmente
### Frontend
```powershell
cd c:\Proyectos\Repos\NutraCore\frontend
npm.cmd install
npm.cmd run dev
```

### Backend
```powershell
cd c:\Proyectos\Repos\NutraCore\backend
npm.cmd install
npm.cmd run dev
```

## Comando para detener procesos Node
```powershell
Get-Process node | Stop-Process -Force
```

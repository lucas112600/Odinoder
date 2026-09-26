# 嘗試啟動資料庫容器 (若已啟動則無影響)
docker start odinoder-pg

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "      Odinoder 全端系統一鍵啟動腳本       " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] 啟動後端 API 伺服器 (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd apps/backend; npm run start:dev`""

Write-Host "[2/4] 啟動消費者點餐端 (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd apps/liff-consumer; npm run dev`""

Write-Host "[3/4] 啟動 POS 門市接單系統 (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd apps/pos-tablet; npm run dev`""

Write-Host "[4/4] 啟動 Admin 總管理後台 (Port 5174)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd apps/admin-dashboard; npm run dev`""

Write-Host ""
Write-Host "✅ 所有系統已成功啟動！將彈出 4 個獨立視窗運作。" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 系統網址清單："
Write-Host "📱 消費者點餐端: http://localhost:3001"
Write-Host "🖥️ 門市 POS/KDS: http://localhost:5173"
Write-Host "📊 總營運管理後台: http://localhost:5174"
Write-Host "⚙️ 後端 API 核心: http://localhost:3000"
Write-Host "==========================================" -ForegroundColor Cyan

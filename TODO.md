# i18n 導入計畫（next-intl / App Router / 無 i18n 路由）

本文件記錄以 next-intl（App Router，without i18n routing）導入專案的規劃、步驟與驗證方式。套件管理工具：yarn。第二語系：zh-TW（預設語系：en）。

## 目標

- 導入 next-intl（v3 插件）以提供 request-scoped 的 locale 與 messages。
- 在 Client Components 使用 `useTranslations`，在 Server Components 使用 `getTranslations`。
- 先完成最小可行整合（Sidebar 與首頁），其他字串逐步轉換。

## 範圍

- 最小可行：Sidebar 導覽與常用字串 i18n（en / zh-TW）。
- 進度：Settings 頁首波 i18n 已完成（標題、區塊標題、主要表單標籤與說明、placeholder）。
- 後續：Library、Discover、Toaster、Navbar、PDF 匯出等字串逐步抽取。

## 套件與版本

- next: ^15.2.2（現有）
- next-intl: 新增（以 yarn 安裝）

## 設計要點

- Locale 來源：cookie `locale`，fallback `'en'`。
- Messages 檔：`/messages/*.json`。
- Key 規劃（建議）：
  - `navigation`: `{ home, discover, library, settings }`
  - `common`: `{ appName, exportedOn, citations, user, assistant }`
  - `pages.home`: `{ title, description }`

## 需新增/修改檔案

- 新增目錄與檔案：
  - `messages/en.json`
  - `messages/zh-TW.json`
  - `src/i18n/request.ts`（以 cookie 讀取 `locale`，載入對應 messages）
- 修改檔案：
  - `next.config.mjs`（使用 `next-intl/plugin` 包裝既有 `nextConfig`）
  - `src/app/layout.tsx`（`getLocale` 設定 `<html lang>`；注入 `NextIntlClientProvider`）
  - `src/components/Sidebar.tsx`（導覽標籤改用 `useTranslations('navigation')`）
- 可選後續：
  - `src/components/LocaleSwitcher.tsx`（cookie-based 切換語系，切完 `router.refresh()`）

## 執行步驟（建議以小步提交）

- [x] docs: 建立本檔 `TODO.md`
- [x] chore: 安裝 `next-intl`（yarn）
- [x] chore: 調整 `next.config.mjs`，加入 `next-intl/plugin`
- [x] feat(i18n): 新增 `src/i18n/request.ts`，來源為 cookie `locale`（fallback: 'en'）
- [x] feat(i18n): 新增 `messages/en.json`、`messages/zh-TW.json`（導覽與常用字串）
- [x] feat(layout): `layout.tsx` 注入 `NextIntlClientProvider`，`<html lang={locale}>`
- [x] feat(sidebar): `Sidebar.tsx` 導覽標籤改用 `useTranslations('navigation')`
- [x] chore/test: `yarn dev` 本機驗證顯示；cookie `locale=zh-TW` 驗證中文
- [x] feat: 新增 `LocaleSwitcher`（cookie-based），放於 Settings → Preferences
- [x] feat(settings): Settings 頁主要字串 i18n 化（標題、區塊標題、欄位與說明、placeholder）

## 驗證步驟（Smoke Test）

- 啟動開發伺服器後，首頁 Sidebar 導覽應顯示英文。
- 設定 cookie `locale=zh-TW` 並重整，Sidebar 導覽應顯示中文。
- 切換回 `locale=en` 應恢復英文。

補充：

- Settings 頁的 Language 選單切換語系後，應立即刷新並應用全站語系。

## 目前進度

- i18n 基礎建置完成（plugin、request、Provider、messages）。
- Sidebar 與 Settings 頁字串已 i18n 化；LocaleSwitcher 已上線並運作正常。
- 本機 smoke test 通過（首頁與 Settings 可切換 en / zh-TW）。

## 下一步規劃（擬）

1. Navbar 與匯出相關字串 i18n 化

- 選單項：Export as Markdown / Export as PDF
- 匯出內容：Chat Export 標題、Exported on、User/Assistant、Citations（部分 key 已有，可補齊缺漏）

2. 首頁文案與 metadata 國際化

- 使用 `generateMetadata` + `getTranslations` 提供各語系標題描述

3. Library / Discover 頁的標題與文案 i18n 化
4. Toaster 與其他零散硬字串抽取到 messages
5. 型別與工具（可選）

- TypeScript augmentation（讓 t(key) 有型別提示）
- ESLint i18n 規則與 VSCode 訊息檔管理整合

## 風險與回滾

- 插件導入可能影響 `next.config.mjs` 載入順序：變更僅包裝 `nextConfig`，如有異常可暫時移除 plugin 驗證。
- 若發生 runtime 無法解析 messages，先確認 `src/i18n/request.ts` 匯入路徑與 `locale` 值（cookie）是否正確。

## 後續工作

- Pages 的 metadata 國際化：改為 `generateMetadata` + `getTranslations`。
- 全站字串逐步抽取至 messages，統一 key 命名規範。
- 型別增強：TypeScript augmentation 與 ESLint i18n 規則（可選）。

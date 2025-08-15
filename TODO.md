# i18n 導入計畫（next-intl / App Router / 無 i18n 路由）

本文件記錄以 next-intl（App Router，without i18n routing）導入專案的規劃、步驟與驗證方式。套件管理工具：yarn。第二語系：zh-TW（預設語系：en）。

## 目標

- 導入 next-intl（v3 插件）以提供 request-scoped 的 locale 與 messages。
- 在 Client Components 使用 `useTranslations`，在 Server Components 使用 `getTranslations`。
- 先完成最小可行整合（Sidebar 與首頁），其他字串逐步轉換。

## 範圍

- 最小可行：Sidebar 導覽與常用字串 i18n（en / zh-TW）。
- 後續：Settings、Library、Discover、Toaster、Navbar、PDF 匯出等字串逐步抽取。

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

1. docs: 建立本檔 `TODO.md`（當前步驟）
2. chore: 安裝 `next-intl`（yarn）
3. chore: 調整 `next.config.mjs`，加入 `next-intl/plugin`
4. feat(i18n): 新增 `src/i18n/request.ts`，來源為 cookie `locale`（fallback: 'en'）
5. feat(i18n): 新增 `messages/en.json`、`messages/zh-TW.json`（先放導覽與常用字串）
6. feat(layout): `layout.tsx` 注入 `NextIntlClientProvider`，`<html lang={locale}>`
7. feat(sidebar): `Sidebar.tsx` 導覽標籤改用 `useTranslations('navigation')`
8. chore/test: `yarn dev` 本機驗證顯示；設定 cookie `locale=zh-TW` 後重整驗證中文
9. feat(optional): 新增 `LocaleSwitcher`（cookie-based），放置於 Navbar 或 Settings

## 驗證步驟（Smoke Test）

- 啟動開發伺服器後，首頁 Sidebar 導覽應顯示英文。
- 設定 cookie `locale=zh-TW` 並重整，Sidebar 導覽應顯示中文。
- 切換回 `locale=en` 應恢復英文。

## 風險與回滾

- 插件導入可能影響 `next.config.mjs` 載入順序：變更僅包裝 `nextConfig`，如有異常可暫時移除 plugin 驗證。
- 若發生 runtime 無法解析 messages，先確認 `src/i18n/request.ts` 匯入路徑與 `locale` 值（cookie）是否正確。

## 後續工作

- Pages 的 metadata 國際化：改為 `generateMetadata` + `getTranslations`。
- 全站字串逐步抽取至 messages，統一 key 命名規範。
- 型別增強：TypeScript augmentation 與 ESLint i18n 規則（可選）。

# i18n 導入計畫（next-intl / App Router / 無 i18n 路由）

本文件記錄以 next-intl（App Router，without i18n routing）導入專案的規劃、步驟與驗證方式。套件管理工具：yarn。第二語系：zh-TW（預設語系：en）。

## 目標

- 導入 next-intl（v4 插件）以提供 request-scoped 的 locale 與 messages。
- 在 Client Components 使用 `useTranslations`，在 Server Components 使用 `getTranslations`。
- 先完成最小可行整合（Sidebar 與首頁），其他字串逐步轉換。

## 範圍

- 最小可行：Sidebar 導覽與常用字串 i18n（en / zh-TW）。
- 進度：Settings 頁首波 i18n 已完成（標題、區塊標題、主要表單標籤與說明、placeholder）。
- 後續：Library、Discover、Navbar、PDF 匯出與各元件字串逐步抽取；Toaster/錯誤訊息規劃中。

## 套件與版本

- next: ^15.2.2（現有）
- next-intl: ^4（已安裝）

## 設計要點

- Locale 來源：cookie `locale`，fallback `'en'`。
- Messages 檔：`/messages/*.json`。
- Key 規劃（建議）：
  - `navigation`: `{ home, discover, library, settings }`
  - `common`: `{ appName, exportedOn, citations, user, assistant }`
  - `pages.home`: `{ title, description }`
  - `components`: 各通用元件文案（messageInput, attach, focus, optimization, messageBox, messageActions, searchImages, searchVideos, weather, newsArticleWidget, emptyChat, common.viewMore）

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
- 新增工具與支援：
  - `src/lib/utils.ts`（`formatRelativeTime`、`formatDate`）
  - `src/lib/pdfFont.ts`（匯出 PDF 之中文字型註冊 Noto Sans TC，本機託管）
  - `src/components/Navbar.tsx`（分享/匯出整合與在地化、改用 `formatDate` 並以 `useLocale` 提供語系）

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
      // --- 已完成的後續工作 ---
- [x] feat(pages): 首頁 metadata i18n（`generateMetadata` + `getTranslations`）
- [x] feat(navbar/export): Navbar 分享/匯出（Markdown/PDF）i18n；PDF 改用本機 Noto Sans TC 字型，移除外網依賴；匯出日期使用 `formatDate`，語系取自 `useLocale`
- [x] feat(pages.discover): 標題、topics、錯誤訊息 i18n；Loading 維持 SVG 動畫（不使用 i18n 文案）
- [x] feat(pages.library): 標題、空狀態 i18n；相對時間在地化；Loading 維持 SVG 動畫（不使用 i18n 文案）
- [x] feat(utils): 新增 `formatRelativeTime`、`formatDate` 並導入使用
- [x] fix(messages): 將 `components` 命名空間移至 messages 根層，修復 zh-TW MISSING_MESSAGE
- [x] feat(components Step 1): MessageInput 與 MessageInputActions（Attach、AttachSmall、Copilot、Focus、Optimization）抽字串與在地化（命名空間：`components.*`）
- [x] feat(components Step 2+): 其他元件抽字串與在地化：
  - MessageBox（`Sources`、`Answer`、`Related`）
  - MessageActions：Rewrite 按鈕、Copy 複製的 `Citations` 標題
  - MessageSources（Dialog 標題、`View N more`）
  - SearchImages / SearchVideos（搜尋按鈕、Video 徽章、`View N more`）
  - EmptyChat 首屏標題
  - NewsArticleWidget 錯誤訊息
  - WeatherWidget（`Humidity`、`Now`）
- [x] chore: Loading 指示統一維持 SVG 動畫，移除 `common.loading` 相關文案

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

- Navbar Share 選單與匯出（Markdown/PDF）內容已 i18n 化。
- PDF 匯出中文字型：改用本機託管 Noto Sans TC（`public/fonts`），完全移除外網依賴，中文不會亂碼。
- 匯出 PDF（zh-TW）驗收成功（標題 / 內容 / 參考來源顯示正確）。

- Discover / Library 已完成頁面文案 i18n；相對時間以 `Intl.RelativeTimeFormat` 實作並已在兩語系驗證。
- 匯出時間與 UI 的日期格式統一由 `formatDate` 提供（匯出已套用；UI 可逐步導入）。
- 元件層面已完成多數常見元件字串抽取（詳見上方 Checklist）。

- 首頁文案與 metadata 國際化已完成（`generateMetadata` + `getTranslations`）。
- Navbar 相對時間字串已在地化（使用 `formatRelativeTime`）。
- 日期/時間格式統一：本輪掃描完成，Navbar/匯出皆使用 `formatDate`（UI 新增處請沿用）。

## 後續工作

- 繼續元件 i18n 掃描：MessageBoxLoading、ThinkBox、MessageActions 其餘項目等。
- 全站字串逐步抽取至 messages，統一 key 命名規範。

- 擴充語系：擴充 `src/i18n/locales.ts` 內的 `LOCALES` 與 `LOCALE_LABELS` 支援更多語言（如：zh-CN、ja、ko、fr、de…）。
  - 新增對應的 `messages/<locale>.json` 檔並補齊必要字串。
  - 更新 Accept-Language 解析對應（`src/i18n/request.ts`）以正確匹配新增語系。
  - 前端初次載入以伺服器 `getLocale()` 結果寫入 cookie（`LocaleBootstrap` 已就緒）；驗證語系切換（`LocaleSwitcher`）與各頁 i18n（metadata、manifest、Settings、Navbar、Weather/News 等）。

# Teaching PPT Skill

為中學物理（及 STEM）課堂生成單一 HTML 檔教學素材的 Claude Code Skill。

---

## 兩種形式

| 形式 | 場景 | 特點 |
|------|------|------|
| **簡報式**（Slide） | 課堂投影、師生互動 | 深色背景、逐頁翻頁、Click-to-reveal 揭曉答案 |
| **閱讀式**（Reader） | 課後自學、參考答案、講義 | 淺色背景、卷動瀏覽、題目答案直接展示 |

兩種形式均為**單一 HTML 檔案**，內聯所有 CSS/JS，雙擊即可在瀏覽器打開，不需伺服器。

---

## 檔案結構

```
.
├── SKILL.md                      # Skill 定義：觸發條件、使用流程、設計規範
├── README.md                     # 本檔案
├── assets/
│   ├── template.html                  # 簡報式模板（深色主題）
│   ├── template-latex.html            # 簡報式 + KaTeX 離線公式
│   ├── template-reader.html           # 閱讀式模板（淺色主題）
│   ├── template-reader-advanced.html  # 閱讀式進階模板（可選導航 / reveal）
│   ├── katex-inline.html              # KaTeX 內聯資源片段
│   ├── build-katex.py                 # 重建 KaTeX 模板腳本
│   ├── upgrade-to-latex.py            # 舊模板升級 LaTeX 腳本
│   └── latex-cookbook.md              # LaTeX 避坑指南
```

---

## 快速開始

### 作為 Claude Code Skill 使用

將本倉庫克隆到 Claude Code skills 目錄：

```bash
git clone https://github.com/moleong/teaching-ppt.git \
  ~/.claude/skills/teaching-ppt
```

在 Claude Code 中輸入教學相關請求即可觸發，例如：
- 「製作教學 PPT」
- 「做成課堂簡報」
- 「做課堂練習題頁」
- 「做成閱讀式網頁」

Skill 會先詢問你想製作**簡報式**還是**閱讀式**，然後基於對應模板生成教材。

### 直接使用模板

也可不通過 Claude Code，直接複製模板手動編輯：

```bash
cp assets/template.html my-lesson.html        # 簡報式
cp assets/template-reader.html my-reader.html  # 閱讀式
```

---

## 模板速覽

### 簡報式（`template.html`）

- **深色主題**：`#1a1a2e` 背景，適合投影機暗室
- **翻頁導航**：鍵盤方向鍵、Space、點擊、觸控滑動
- **揭曉機制**：填空／解析預設隱藏，按 Space 或點擊揭曉
- **字體縮放**：`+` / `-` 鍵即時調整（0.7–1.6x）
- **iPad 適配**：橫豎屏自動調整、觸控滑動防誤觸
- **列印友好**：`Ctrl+P` 自動白底分頁
- **公式**：Unicode 字元或 KaTeX 離線渲染

### 閱讀式（`template-reader.html`）

- **淺色主題**：`#f8f9fa` 背景，長時間閱讀不累眼
- **卷動瀏覽**：自然滾動，不需翻頁
- **答案直接展示**：題目與解析在同一卡片內可見
- **響應式**：手機、平板、桌面自適應
- **列印友好**：去除陰影、保留邊框、白底
- **公式**：MathJax CDN（`\(...\)` 行內、`\[...\]` 獨立）

如需**導航列、章節跳轉、題目答案點擊揭曉**等功能，可改用 `template-reader-advanced.html`：在 `<body>` 加上 `data-nav="true"` 開啟 sticky 導航，在個別 `.question` 加上 `data-reveal="true"` 讓該題答案可點擊顯示。

---

## 設計規範

### 簡報式色板

| 元素 | 顏色 |
|------|------|
| 背景 | `#1a1a2e` 深藍黑 |
| 主色 | `#f5a623` 橙色 |
| 輔色-紅 | `#e94560` 錯誤／危險 |
| 輔色-綠 | `#2ecc71` 正確／確認 |
| 輔色-青 | `#4ecdc4` 輔助說明 |

### 閱讀式色板

| 元素 | 顏色 |
|------|------|
| 背景 | `#f8f9fa` 淺灰白 |
| 題目標題 | `#2980b9` 藍色 |
| 答案區 | `#e8f4fc` + 左邊框 `#3498db` |
| 頁面標題 | `#2c3e50` 深藍灰 |
| 正文 | `#333` 深灰 |

---

## 驗證清單

生成教材後，建議按 `SKILL.md` 中的驗證清單檢查：

**簡報式**：封面、翻頁節奏、揭曉重置、iPad 適配、字體縮放、列印預覽

**閱讀式**：標題卡片、卷動瀏覽、響應式排版、公式渲染、列印樣式

---

## 相關項目

- [Claude Code](https://claude.ai/code) — Anthropic 官方 CLI
- [MathJax](https://www.mathjax.org/) — 網頁公式渲染
- [KaTeX](https://katex.org/) — 快速公式渲染（簡報式離線版使用）

---

## 授權

MIT

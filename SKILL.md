---
name: teaching-ppt
description: >
  Create classroom-ready teaching materials in HTML for physics/STEM lessons.
  Supports two formats: PPT-style slides (dark theme, click-to-reveal) and reader-style
  webpages (light theme, scrollable, answers directly visible). Triggers when user asks to
  make 教學 PPT, 課堂簡報, 講解網頁, 教學網頁, 課堂練習, 練習題解答, 講義;
  or "把這段內容做成 PPT", "做成簡報", "做課堂用網頁", "做成閱讀式網頁".
  All outputs are single self-contained HTML files with inline CSS/JS.
when_to_use:
  - "製作教學 PPT 網頁"
  - "做成課堂簡報"
  - "做教學用網頁"
  - "做課堂練習題頁"
  - "把這個內容做成簡報"
  - "做成投影用網頁"
  - "把這份學案做成網頁"
  - "做成教案網頁"
  - "做成練習題解答頁"
  - "做成閱讀式網頁"
  - "做成講義網頁"
---

# Teaching PPT Skill

## 用途

為中學物理（或 STEM）課堂製作教學用 HTML 素材。支援兩種形式：

| 形式 | 用途場景 | 特點 |
|------|----------|------|
| **簡報式**（PPT 風格） | 課堂投影、師生互動 | 深色背景、逐頁翻頁、click-to-reveal 揭曉答案 |
| **閱讀式**（網頁風格） | 課後自學、參考答案、講義 | 淺色背景、卷動閱讀、題目答案直接展示 |

輸出均為單一 HTML 檔，內聯所有 CSS/JS，可直接雙擊在瀏覽器打開，不需伺服器。

## 起步方式

### 第一步：詢問形式

使用本 skill 時，**先問用戶想製作哪種形式**：

| 選項 | 名稱 | 適合場景 | 對應模板 |
|------|------|----------|----------|
| 1 | **簡報式** | 課堂投影、師生互動、逐步揭曉答案 | `assets/template.html` |
| 2 | **閱讀式** | 課後自學、參考答案、講義形式 | `assets/template-reader.html` |

- 若內容含複雜公式（分數、希臘符號巢狀等），簡報式可選 `template-latex.html`
- 閱讀式暫無離線 LaTeX 版本（MathJax CDN 已足夠），日後有離線需求再追加

### 第二步：複製模板並填寫內容

1. 複製對應模板到用戶指定的目標路徑（通常是 `teaching/` 下）
2. 改檔名為 `{主題}-{用途}.html`
3. 根據用戶提供的教學內容，修改模板中的預留區塊
4. 保留模板中的 CSS/JS 部分不動

如果沒有 `assets/` 下的模板可用，也可以從現有範例提取骨架複製。

## Slide 類型與設計模式

### 1. 封面（.slide.cover）
```html
<section class="slide cover active">
  <h1>大標題</h1>
  <div class="subtitle">副標題 · 用途</div>
  <div class="meta">學科 · 單元</div>
</section>
```

### 2. 目錄（.toc）
```html
<ul class="toc">
  <li><span class="num">1.</span>概念名<span class="desc">— 簡述</span></li>
</ul>
```

### 3. 概念講解（.content + .card-grid / table / .callout）
- **兩欄對比**：用 `.card-grid` + `.card.r1` / `.card.r2`，左邊紅右邊綠
- **表格**：標準 `table`，th 用紅底，重點行用 `.label` 標亮
- **提示區塊**：`.callout` 黃邊框；`.callout.danger` 紅邊框；`.callout.ok` 綠邊框

### 4. 填空題（data-reveal + .blank）
```html
<section class="slide" data-reveal="true">
  <div class="callout">
    溫度是 <span class="blank" data-fill="分子平均動能">分子平均動能</span> 的標誌
  </div>
  <div class="reveal-hint" data-hint>按 空格鍵 / 點擊 顯示填空答案</div>
</section>
```
- 答案用 `.blank` 包，內文是答案本身（預設 `color: transparent`）
- 點擊/Space 後，slide 加 `.revealed` class，`.blank` 顯示答案
- 不需 `.answer-box.hidden` — 填空答案直接內嵌在 `.blank` 元素中

### 5. 題目 + 解析（.question + .callout.ok.hidden）
```html
<section class="slide" data-reveal="true">
  <div class="slide-header">
    <span class="slide-tag">題 1</span>
    <span class="slide-title">標題</span>
  </div>
  <div class="question">
    <p><span class="sub-q">（1）</span> 第一小問...</p>
    <p><span class="sub-q">（2）</span> 第二小問...</p>
  </div>
  <div class="reveal-hint" data-hint>按 空格鍵 / 點擊 顯示解析</div>
  <div class="callout ok hidden" data-answer>
    <span class="callout-title">解析：</span><br>
    <div class="answer-step"><span class="step-num">（1）</span> 第一小問解析...</div>
    <div class="answer-step"><span class="step-num">（2）</span> 第二小問解析...</div>
  </div>
</section>
```
- `.question`：題目文字區，子問題用 `.sub-q` 包編號（青色高亮）
- `.callout.ok.hidden`：解析區預設隱藏，揭曉後顯示；`.callout-title` 為標題，`.answer-step` + `.step-num` 分步呈現
- 長解析會自動捲動；iPad 上揭曉後題目會自動縮小，騰出空間給答案

### 6. SVG 圖示（內聯 SVG）
- 不使用外部圖片，全部用內聯 SVG 繪製
- 常用元素：`<path>`（曲線）、`<line>`（座標軸）、`<circle>`（點）、`<text>`（標籤）
- 顏色用主色板：`#f5a623`（橙）、`#e94560`（紅）、`#2ecc71`（綠）

### 7. 公式展示
- 大公式：`.big-formula`（大標題用）
- 行內公式：`.formula`（中等）

### 8. 總結（.summary-list）
```html
<ul class="summary-list">
  <li><span class="em">關鍵詞</span> 說明</li>
</ul>
```

## 閱讀式網頁（Reader Style）

### 用途

- 課後自學、學生回家複習
- 練習題參考答案直接對照
- 講義形式，可印製或發給學生

### 模板

複製 `assets/template-reader.html` 起步。

### 結構模式

#### 1. 頁面標題
```html
<h1>物理練習題解答</h1>
```

#### 2. 題目區塊（.question）
```html
<div class="question">
  <h2>1. 題目標題</h2>
  <p>題目描述...</p>
  <div class="answer">
    <div class="step">解析步驟...</div>
    <p><strong>答案：</strong>最終答案</p>
  </div>
</div>
```
- `.question`：題目卡片，白色背景 + 圓角 + 陰影
- `h2`：題號 + 標題（藍色 `#2980b9`）
- `.answer`：答案區，淺藍背景 `#e8f4fc` + 左邊框 `#3498db`
- `.step`：分步解析，可有多個

#### 3. 子問題
```html
<p><span class="sub-q">（1）</span> 第一小問...</p>
```
- `.sub-q`：子問題編號，藍色高亮

#### 4. 提示 / 注意 / 小結區塊
```html
<div class="callout">
  <strong>提示：</strong>補充說明文字
</div>
<div class="callout danger">
  <strong>注意：</strong>常見錯誤提醒
</div>
<div class="callout ok">
  <strong>小結：</strong>關鍵結論
</div>
```

#### 5. 公式
使用 MathJax CDN（已內建在模板中）：
- **行內公式**：`\( \frac{1}{2}mv^2 \)`
- **獨立公式**：`\[ \frac{1}{2}mv_0^2 = mgh \]` 或 `$$...$$`

#### 6. SVG 圖示
同簡報式，全部內聯 SVG，顏色建議：`#333`（線）、`#e74c3c`（紅）、`#27ae60`（綠）、`#3498db`（藍）

### 設計規範

| 項目 | 值 | 用途 |
|------|-----|------|
| 背景 | `#f8f9fa`（淺灰白） | 長時間閱讀不累眼 |
| 字色 | `#333`（深灰） | 印刷友好 |
| 題目卡片 | 白色 + 圓角 8px + 陰影 | 視覺分層 |
| 答案區 | `#e8f4fc` + 左邊框 `#3498db` | 與題目區分明顯 |
| 標題色 | `#2c3e50` / `#2980b9` | 層級分明 |
| 容器寬度 | `max-width: 900px` 居中 | 桌面最佳閱讀行寬 |
| 字體 | `Microsoft JhengHei` 優先 | 中文最佳顯示 |

### 與簡報式的對照

| 特性 | 簡報式 | 閱讀式 |
|------|--------|--------|
| 背景 | 深色 `#1a1a2e` | 淺色 `#f8f9fa` |
| 導航 | 鍵盤翻頁、觸控滑動 | 卷動瀏覽 |
| 答案展示 | click-to-reveal 揭曉 | 直接展示 |
| 字體單位 | `vw`（視口寬度） | `em/px`（固定比例） |
| 公式引擎 | KaTeX（離線）或 Unicode | MathJax CDN |
| 適合場景 | 課堂投影 | 課後自學、講義 |
| 列印 | 強制分頁、白底 | 白底、去除陰影 |

## LaTeX 模式（opt-in）

### 何時用
含複雜公式時——分數、希臘符號、上下標巢狀、求和 / 積分。
**純文字、簡單代數題用原 `template.html` 即可**，別讓所有教材都吃 ~470 KB KaTeX 資產。

### 起步
複製 `assets/template-latex.html` 到目標路徑，改檔名後即可寫 LaTeX 公式。
這份模板已內聯 KaTeX 0.16.10（CSS + JS + 7 個 WOFF2 字體 base64）+ 自動渲染啟動程式碼，**完全離線可播**，原檔案約 470 KB。

### 怎麼寫公式
- **區塊公式**（獨立一行）：`<div class="formula">$$\frac{p_1V_1}{T_1} = \frac{p_2V_2}{T_2}$$</div>`
- **行內公式**：`溫度 $T_1 = 273\;\mathrm{K}$ 時，氣體...`
- **公式回顧頁的 `.law`**：用 `$...$` + `\dfrac` 強制大尺寸：`<div class="law">$\dfrac{p_1}{T_1} = \dfrac{p_2}{T_2}$</div>`

KaTeX 會在頁面載入時掃描整份 `body`，看到 `$$...$$` / `$...$` 自動渲染，無需手動標 class。

### 已知避坑（完整對照與雷區見 `assets/latex-cookbook.md`）
- **`\text{}` 內禁用 Unicode `·`**（KaTeX 會誤映射為 `\cdotp` 命令並渲染失敗）
  → 用 `\mathrm{atm \cdot L/(mol \cdot K)}` 代替 `\text{atm·L/(mol·K)}`
- 中文下標：`T_{\text{右}}`（`\text{}` 內可放中文）
- `%` 要逃逸：`20\%`（LaTeX 中 `%` 是註解符號）
- 多字符上下標必須加 `{}`：`10^{-2}`、`x_{12}`（單字符可省）

### 升級已存在的 Unicode HTML
若想把已寫好的（用 Unicode 字元）教材回頭升級為 LaTeX 模式：
```bash
python assets/upgrade-to-latex.py <html_path> --mapping <mapping.json>
```
腳本是 idempotent（已升級過的檔重跑不會破壞）。對照表 JSON 格式見 `upgrade-to-latex.py` 開頭 docstring。

### 換 KaTeX 版本 / 加字體
跑 `assets/build-katex.py`，會從 jsdelivr 重抓 KaTeX，重建 `assets/katex-inline.html` + `assets/template-latex.html`。
若要支援 `\mathcal`、`\mathfrak` 等花俏字體，編輯 `build-katex.py` 中的 `CORE_FONTS` 加入對應字體名再重跑。

## 設計規範

| 項目 | 值 | 用途 |
|------|-----|------|
| 背景 | `#1a1a2e`（深藍黑） | 投影機暗室，眼睛不累 |
| 主色 | `#f5a623`（橙色） | 公式、重點標記 |
| 輔色1 | `#e94560`（紅色） | 錯誤、危險、否定 |
| 輔色2 | `#2ecc71`（綠色） | 正確、確認、提示 |
| 輔色3 | `#4ecdc4`（青色） | 輔助說明 |
| 字體單位 | `vw`（視口寬度） | 自適應任何解析度 |
| 文字 | `Microsoft JhengHei` 優先 | 中文最佳顯示 |

## 互動規範

| 輸入 | 行為 |
|------|------|
| **Space / Enter / 左鍵點擊 / iPad tap** | **揭曉題**：toggle 揭曉 ↔ 隱藏（留在當頁）；**非揭曉題**：前進 |
| **→ / PageDown** | 前進（若揭曉題已揭曉,離開時自動重置） |
| **← / PageUp** | 後退（同樣離開時自動重置） |
| **右鍵點擊（桌機）** | 前進（同 →,攔截 browser context menu） |
| **左滑（touch）** | 前進（同 →） |
| **右滑（touch）** | 後退（同 ←） |
| **Home / End** | 跳到首頁/末頁 |
| **F** | 全螢幕切換 |
| **+ / −** | 字體放大 / 縮小（步進 0.1，範圍 0.7–1.6） |
| **0** | 字體重置為 100% |
| **Ctrl + P** | 列印（自動白底 + 分頁 + HUD 與控制組隱藏） |

**關鍵**：**Space / 點擊** 只做「揭曉控制」（toggle 揭曉 ↔ 隱藏）;**前進專鍵**是 → / 右鍵 / 左滑。離開揭曉頁（無論方向）時,該頁自動重置為 fresh 狀態 — 下次回到該頁需要重新揭曉。

## iPad / 觸控適配

- `viewport-fit=cover` + `apple-mobile-web-app-capable`
- `touch-action: manipulation` 消除 300 ms tap delay
- `@media (orientation: portrait)` 全盤字體放大（直握 iPad 時 vw 字體會過小），**且同樣受 A+/A− 縮放控制**
- 觸控滑動判斷：水平位移 > 50 px、時間 < 0.6 s、|dx| > |dy| 才觸發；點擊控制組與 iOS 提示氣泡時不觸發翻頁
- iOS / iPadOS 全屏限制：點全屏按鈕時顯示提示「Safari 分享 → 加到主畫面」
- `@media print`：白底 + 去除 HUD + 去除控制組 + 保留答案

## 命名約定

- 檔名：`{主題}-{用途}.html`
- 用途常見：`課堂練習`、`概念講解`、`講義`、`例題`、`複習`
- 全部用中文檔名，方便老師快速辨識
- 放置路徑：`teaching/` 或 `teaching/單元名/`

## 驗證清單

### 簡報式驗證

每次生成後，主動確認：
1. 在瀏覽器開啟，封面正常顯示
2. Space → 揭曉答案 → Space → 進下一頁（正確節奏）
3. → → 直接翻頁（不卡在中間揭曉狀態）
4. ← 回上一頁，確認填空/答案已重置（方便重播）
5. DevTools Device Mode → iPad Pro portrait → 字體可讀
6. 長解析頁：Space 揭曉 → 確認可捲動查看完整內容；iPad 上確認題目自動縮小
7. 點擊右上角 A+/A−，確認所有字體同步縮放、排版不變形；確認到達 0.7/1.6 時按鈕自動 disabled
8. Ctrl+P 預覽列印，確認白底 + 自動分頁 + 控制組隱藏
9. 檔案是單一 HTML（無外部依賴）

### 閱讀式驗證

每次生成後，主動確認：
1. 在瀏覽器開啟，標題與題目卡片正常顯示
2. 卷動瀏覽，確認所有題目與答案完整可見
3. DevTools Device Mode → iPhone SE / iPad → 確認響應式排版正常（padding 縮小、字體可讀）
4. 確認公式由 MathJax 正確渲染（行內 `\(...\)` 與獨立 `\[...\]` 均正常）
5. Ctrl+P 預覽列印，確認白底 + 去除陰影 + 題目卡片邊框保留
6. 檔案是單一 HTML（MathJax CDN 除外）

## 參考範例

- `h:/bigleong/Project_P/teaching/分子動能與內能-概念講解.html`
  - 12 頁：概念講解 + SVG 勢能曲線 + 彈簧類比 + 填空模式
- `h:/bigleong/Project_P/teaching/分子動能與內能-課堂練習.html`
  - 7 頁：題目 + 解析揭曉 + 計算題模式

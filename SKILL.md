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
| 2b | **閱讀式（進階）** | 長講義、需要章節導航或部分題目答案可揭曉 | `assets/template-reader-advanced.html` |

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
- **單個點擊顯示**：每個 `.blank` 綁定 click 事件，`e.stopPropagation(); this.classList.toggle('show')`，點擊單個填空只顯示該填空答案，不觸發整頁 reveal
- CSS 需定義 `.blank.show`（與 `.revealed .blank` 共用相同樣式），並給 `.blank` 加 `cursor: pointer`
- Space/點擊 slide 空白處 仍會整頁 reveal（顯示全部填空），方便課堂統一揭曉
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
- 大公式：`.big-formula`（獨立展示，預設 `calc(3.2vw * var(--fs-scale))`）
- 行內公式框：`.formula`（嵌入內容中，預設 `calc(2.0vw * var(--fs-scale))`）
- **字號原則**：公式不宜過大，佔據畫面 1/4–1/3 為宜，留足空間給說明文字

### 8. 逐步顯示（data-step-reveal）
```html
<section class="slide" data-step-reveal="true">
  <div class="slide-header">
    <span class="slide-tag">標籤</span>
    <span class="slide-title">頁標題</span>
  </div>
  <div class="reveal-step">
    <!-- 第一個區塊：問題描述或第一個概念 -->
  </div>
  <div class="reveal-step">
    <!-- 第二個區塊：例子或深入說明 -->
  </div>
  <div class="reveal-step">
    <!-- 第三個區塊：總結或結論 -->
  </div>
  <div class="reveal-hint" data-hint>按 空格鍵 / 點擊 逐步揭曉</div>
</section>
```
- 每個 `.reveal-step` 是一個區塊，預設 `opacity: 0`
- 按 Space 逐一顯示（`.visible` 添加後 `opacity: 1`）
- 全部顯示後再按 Space 才進入下一頁
- 離開該頁時自動重置，下次回來需重新揭曉
- **與 `data-reveal` 的區別**：`data-step-reveal` 是逐步顯示區塊；`data-reveal` 是整頁一次性揭曉

### 9. 總結（.summary-list）
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

若講義較長、需要**章節導航列**或**部分題目答案可點擊揭曉**，改用 `assets/template-reader-advanced.html`：

- 開啟固定頂部導航（fixed）：在 `<body>` 加上 `data-nav="true"`，並把各區塊加上 `id`。
- 導航區塊位置：`<nav>` 與 `.nav-panel` 必須放在 `<body>` 之後、`.container` 之前（fixed 定位，勿放在文檔流中間，否則會遮擋內容）。
- 開啟單題 reveal：在 `.question` 加上 `data-reveal="true"`。
- 教學內容區塊用 `.section`，題目區塊用 `.question`，樣式會自動區分。
- 詳解建議三段式：`.step`（第一性原理推導）→ `.callout.danger`（對抗式審查：列常見迷思並反駁）→ `.answer-box`（✅ 最終答案）；題型標籤用 `<span class="badge">`（如「多選」「補償法」），放在題目 `h2` 末尾。
- 導航列右側 `.nav-tools` 含字級縮放鈕（A−／100%／A+）：全站以 `--fs-scale` 縮放，localStorage 持久化（key `teaching-fs-scale`）；元件字級須用 `em`（不要用 rem/px）才能隨動。
- `<body>` 後的 `<noscript>` 降級區塊（無 JS 時答案直接顯示、游標還原）必須保留。
- 目錄連結會隨捲動自動高亮當前章節（`.is-active`，由 JS 的 `updateCurrentChapter` 同步）。
- 寬屏適配（2026-10 起內建）：字級 `clamp(16px, 1.6vw + 4px, 60px)`——≤750px 維持 16px 不變、iPad 橫向（1180px）≈23px、FHD ≈35px、4K 封頂 60px；欄寬 `58em`，每行恆約 58 字。導航列高 2.6em、按鈕 1.8em、錨點讓位 3.5em，皆隨字級等比放大（寬屏字放大時導航不破版）。與 A−/A+ 的 `--fs-scale` 相乘、互不衝突。
- 全屏按鈕：`fsToggle`（導航列 A+ 與 ↑ 之間，內聯 SVG 展開/縮回圖示），點擊或快捷鍵 `F` 切換 Fullscreen API；**嵌入環境被拒時**（如 Apps Script 的 sandbox iframe 無 `allowfullscreen`）顯示降級 toast，引導 iPad「分享 → 加入主畫面」替代做法。直接開 HTML 檔則可正常全屏。
- SVG 圖示上限寬度一律用 **em**（`style="width:100%;max-width:{viewBox寬÷16}em;height:auto;"`），圖才會隨字級等比放大、維持圖文比例；勿用 px 固定。
- 顯示公式間距（2026-11 起內建）：`.formula { padding: 2px 0; margin: 4px 0; }` ＋ `mjx-container[display="true"] { margin: 0.35em 0 !important; }`——後者覆寫 MathJax v3 預設 1em 邊距（預設未覆寫時公式上下各 ~36px、極浪費版面；壓縮後每側 ~12px）。兩條規則須同時存在，缺一不可。

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
同簡報式，全部內聯 SVG，顏色建議：`#333`（線）、`#e74c3c`（紅）、`#27ae60`（綠）、`#3498db`（藍）。
寬度上限**一律用 em**（`max-width:{viewBox寬÷16}em`），例如 viewBox 寬 420 → `max-width:26.25em`，圖才會隨寬屏字級放大。

### 設計規範

| 項目 | 值 | 用途 |
|------|-----|------|
| 背景 | `#f8f9fa`（淺灰白） | 長時間閱讀不累眼 |
| 字色 | `#333`（深灰） | 印刷友好 |
| 題目卡片 | 白色 + 圓角 8px + 陰影 | 視覺分層 |
| 答案區 | `#e8f4fc` + 左邊框 `#3498db` | 與題目區分明顯 |
| 標題色 | `#2c3e50` / `#2980b9` | 層級分明 |
| 容器寬度 | `max-width: 58em` 居中（每行恆約 58 字） | 桌面最佳閱讀行寬；字級隨屏寬放大時欄寬等比跟隨 |
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
| 字體單位 | `calc(vw * var(--fs-scale))` | 自適應解析度 + A+/A− 縮放控制 |
| 文字 | `Microsoft JhengHei` 優先 | 中文最佳顯示 |

## 內容正確性規範

### 計算結果的有效數字

- 練習題解答中**所有計算得出的數值結果一律取 3 位有效數字**（如 \(\pi\times0.03 = 0.0942\ \mathrm{m/s}\)、\(2\pi\sqrt{0.30/9.8} = 1.10\ \mathrm{s}\)、\(8/1.5 = 5.33\ \mathrm{m/s}\)）。
- 一律不動：由整數／準確數據精確算出的值（200 N、1.25 Hz、8 cm、比值 9:16 等）、題目給定數據本身、圖讀估計值（如 f ≈ 0.3 Hz，本質只能讀 1 位）、計算式中間的保護位（如 2π × 1.118）。
- 同一結果若同時出現在計算式行與「答案：」行，**兩處都要改**；修改前用 python3 精確核算每個數值。
- 注意：前導零不算有效數字（0.0942 是 3 位），小數末尾的零算（1.10 是 3 位）。

### 正弦／餘弦圖象的畫法

- x–t 振動圖象必須按公式**逐點取樣生成 polyline**（python3 每 5° 取一點即可），不要手調貝茲曲線：貝茲的極值到達不了控制點，峰頂必然偏低、過零點斜率不正確。
- 畫好後檢查：峰／谷精確觸及 ±A 虛線、週期標記（T、2T、t₀ 等）放在軸上或軸旁且**不被曲線、標記線遮擋**、時間軸比例一致。

## SVG 圖片緊湊規範（2026-11 起）

所有內聯 SVG 插圖（不限電路圖）必須遵守——消除畫布內部留白。版面三層緊湊缺一不可：公式間距（見「閱讀式網頁 → 模板」條目）、圖片外距（`.diagram { margin: 6px auto }`，模板已內建）、畫布留白（本節）。

- **viewBox 必須貼合內容**：手排 SVG 的 viewBox 常遠大於內容實際範圍（工具預設未調校，非設計選擇），寬屏字級放大後上下可達 70–120px 空白。產出流程：畫圖 → 量 `getBBox()` 內容邊界 → 裁 viewBox 到「內容邊界＋12px 安全邊距」（12px 覆蓋線寬 ≤4、marker 延伸 ≤9、字體度量誤差）。
- **只裁不放大**；唯內容已超出舊 viewBox（既有裁切）才順帶修復。裁剪後 `max-width` 若原本符合「viewBox 寬 ÷16 em」慣例則同步更新——內容屏幕尺寸不變、純消空白；px 或其它寫法不動。
- **工具**：`assets/trim-viewbox.py`（`gen` 產生測量頁 → 瀏覽器量 `getBBox` → `apply` 回寫）。新講義手排 SVG 每幅必走此流程；`circuit.mjs` 生成器產出的圖 layout 緊湊、通常無需再裁，但產出後仍須目視。
- **只裁 class 含 `diagram` 的 SVG**；UI 圖示（如 fs-icon）固定尺寸不動。
- 第十四章講義 24 幅全裁為首個實例（2026-11），方法與本節一致。

## 電路圖與標註文字規範

畫任何電路圖與 SVG 插圖時必須遵守（2026-11 起，源自 IEC 60617／內地課本慣例與 ISO 80000 排版規範）。數值以 **400px 寬 viewBox** 為基準，其他圖幅等比縮放。

### 首選工具：`assets/circuit.mjs` 電路圖生成器（2026-11 起）

**畫新電路圖一律優先用生成器，不再手排座標**（手算座標必然逐漸漂移，見「防錯規則」）。

```bash
# 1. 複製 assets/circuit-example.mjs 改成你的圖（七種符號的用法全在裡面）
# 2. 執行，把輸出的靜態 SVG 貼進講義 HTML（不依賴瀏覽器 JS，noscript/列印安全）
node ~/.kimi-code/skills/teaching-ppt/assets/circuit.mjs my-diagram.mjs
# --html 包成預覽頁；--list 列出 SPEC 全部基準尺寸（審計用）
```

- API：`c.part(type, x1, y1, x2, y2, opts)` 把元件**置中於導線段**（水平／垂直／**任意角度斜線段**，橋式電路可用）、導線自動在符號處中斷；`c.distribute(x1,y1,x2,y2, [{type,opts}...])` 同段線路內多元件**平均分佈**（優先於連續 part()）；`c.at('名',x,y)` 定義命名節點後，part/wire/node/terminal/current/branch/distribute 的座標都可以用名稱代替（如 `part('resistor','T1','M1')`）；`c.wire()` 導線；`c.node()` 手動節點黑點（**一般用不到**：svg() 自動在三線交會處加點，轉角不加；僅例外覆蓋）；`c.terminal(x,y)` 開口接線柱（導線盡頭）；`c.branch(x1,y1,x2,y2,off)` 並聯支路封閉迴路（自動加兩端黑點）；`c.current(x1,y1,x2,y2,label)` 電流箭頭（紫紅 `#d63384`，方向 = 起點→終點）；`c.text(x,y,DSL)` 標註。
- type：`resistor / cell / vsource / switch / lamp / meter / capacitor / rheostat`。`meter` 需 `opts.ch`（G/V/A/N）＋可選 `opts.color`（語義色）；`cell`/`vsource` 可 `opts.flip` 調換極性方向；`rheostat` 可 `opts.slider:'left'|'right'`。
- 標註 DSL：`{i:R}` 斜體物理量、`{u:V}` 正體單位、`{sub:x}` 正體下標、`{sup:2}` 上標；純文字預設正體。例：`'{i:U}{sub:M} = 3 {u:V}'`。
- 直放元件**不用重寫**：part() 對垂直導線段自動旋轉，電表圈內字母自動保持正立。
- 產出 SVG 的 `max-width` 已用 em（viewBox寬÷16），符合寬屏規範；產出後仍須過「驗證清單」的電路圖檢查項。

**新增符號規範的統一流程（三者同改，缺一不可）：**

1. 在 `circuit.mjs` 的 `SPEC` 加基準尺寸（全專案唯一尺寸來源）
2. 在 `SYMBOLS` 加 `{ span, halfH, draw }`（draw 一律畫在「導線沿 +x、中心在原點」的局部座標系）
3. 同步更新下方「符號形狀與基準尺寸」表（它是 SPEC 的人讀鏡像）

### 圖中標註文字（所有 SVG 圖通用）

- 圖內英文字體一律 `"Times New Roman", Times, serif`。
- **物理量斜體**（I、U、E、R、r、F、q…）；**單位正體**（V、A、mA、Ω）；**標籤下標正體**（是標籤不是量）：Rx 的 x、U_M/I_M 的 M（量程）、W_電 的「電」。
- 電表圓圈內的字母（Ⓖ Ⓥ Ⓐ）是儀表符號 → **正體**（IEC 慣例），與作為單位的 A、V 區分。
- 混合樣式用 `<tspan font-style="italic">` 切換：`<text ... font-family="'Times New Roman', Times, serif"><tspan font-style="italic">R</tspan><tspan>x</tspan></text>`
- **標註與任何圖形元素保持淨空**：不壓導線、不壓符號——文字邊緣與導線、符號框、電表／燈泡圓圈、**端子圓圈、節點黑點**都至少留 ~10px（14-33 的端子標籤 a 曾貼到圓圈邊）。
- 圖內只放圖本身無法表達的資訊；正文題設已有的數據（如 I_g、R_g）**不在圖內重複**。

### 電路圖畫法

**比例原則（2026-11 起）**：除電表圓圈等圓形符號外，**符號最長邊 ≥ 2× 最短邊**；各符號尺寸以 **400px 寬 viewBox** 為基準，其他圖幅等比縮放。

**符號形狀與基準尺寸**（形狀依 IEC 60617／內地課本慣例；尺寸依 2026-11 第十四章講義實踐定稿）：

| 符號 | 形狀 | 基準尺寸（400px viewBox） | 備註 |
|------|------|--------------------------|------|
| 電阻 | 矩形，**長邊沿導線**（美式 zigzag 折線不用） | **橫放 32×16、直放 16×32，全檔統一** | 白底（fill:#fff）遮住下方導線；**比例與絕對尺寸都是規範**——只統一比例時，48×24 與 32×16 並存仍會被讀成「形狀不同」 |
| 電源（電池） | 長細線（正極）＋短粗線（負極）成對緊鄰 | 長線 ~34×2、短線 ~16×4、兩板間距 ~15 | 長線 = 正極；− 左 + 右（依電流方向定） |
| 電壓源（圓形） | 圓＋導線軸上 +/− 標記（+ 在導線段起點側） | 圓 r≈17、+/− 距圓心 26 | **預設不用**：電源一律用 cell 長短線；僅原題明確要求圓形符號時用（`part('vsource',...)`，flip 調換極性） |
| 開關（刀閘，斷開態） | **不畫接點圓點**：導線斷成兩個共線端點，刀刃鉸接在其中一端、**向外張開 ~45°**，與導線同粗 | 刀刃長 ~30–36 | 兩端點的間隙即「斷開」；標籤放刀刃旁淨空處 |
| 燈泡 | 圓＋內十字叉絲 | 圓 r≈15，叉絲貫穿全圓 | 導線接圓的左右切點 |
| 電表（Ⓐ Ⓥ Ⓖ Ⓝ） | 圓＋圈內**正體**字母 | 圓 r≈14，字母 ~13px | 導線在圓的左右切點中斷；**語義色**：改裝圖中 G／改裝前＝藍 `#3498db`、改裝後 V／A／Rx＝紅 `#e74c3c`；一般量測電路圖中的電表用黑（與導線同色）；在豎直段上時依「元件置中於所在導線段」規則定位 |
| 電容 | 兩平行板（不接通） | 板長 ~40、板距 ~8、線粗 3 | 兩板各接一導線，板間留隙 |
| 變阻器 | 電阻體**長條矩形 48×16**＋**滑片引線**：導線自上方長引線繞下，以**細箭頭接觸框頂**（「一上一下」接法的具體化；未接入的一端懸空） | 箭頭固定 7px：`markerUnits="userSpaceOnUse"`（防隨線寬放大）、與導線同粗同色；上方引線宜長（~25px）勿貼框 | **禁止用斜箭頭穿框表示變阻器**——斜箭頭是「可變電阻」記法（見下行），兩者勿混；滑片接線端要真的畫進電路 |
| 可變電阻（斜箭頭記法） | 電阻框＋**黑色細斜箭頭**穿框（左下→右上，線段兩端各穿出框外 ~6px） | 箭頭固定 7px：`markerUnits="userSpaceOnUse"`（與變阻器箭頭同規格），黑色、與導線同粗 | 僅用於「阻值變化」的定性題（如 14-33 的 R₁）；原圖有此箭頭才畫 |
| 接線柱（端子） | 開口小圓（白底） | 圓 r≈5 | 導線盡頭的接線端；生成器用 `c.terminal(x,y)`，不用 part()；**外接電源／市電用成對端子＋上下箭頭與 U 標註（如 U = 220 V），不畫電池**（14-29、14-32 曾誤畫電池符號） |

- **導線在元件符號處中斷**，不得穿過燈泡、電表圓圈、電阻框（線畫到符號邊緣為止，兩段線接圓圈左右切點）。
- **並聯支路畫成封閉迴路**：導線從元件**左右端點**向外延伸再轉折上行，不得從電阻符號頂部／中部引出；支路迴路寬於被並聯的表頭。
- **T 型節點（三線交會）加黑點** `<circle cx=".." cy=".." r="3.5" fill="#333"/>`；單一迴路的兩線轉角**不加**（導線連續已表達連通，加點反而偏離標準）。生成器自動判定：統計每點的連接方向數，≥3 才加點，轉角／直通接縫（2 方向）不加；`node()` 僅作例外覆蓋。
- **元件置中於所在導線段**：元件串在哪段導線上，中心就對齊**該段的中點**——尤其是豎直段（如豎直匯流條上半段的電表），不與右方水平元件對齊、也不對整條軸置中。**「段」的端點 = 節點／端子／轉角**（以節點為參考）：若節點不在段端（如端子與節點之間還有一小段引出線），元件只置中於兩節點之間，引出線用 `wire()` 另畫。複雜圖先用 `c.at('名', x, y)` 定義節點再以名稱引用（`part('resistor','T1','M1')`），避免手算段座標。
- **同段線路內多元件平均分佈**：一段導線上串多個元件時，各元件均分該段（生成器用 `c.distribute()`，勿逐個手排座標）。
- **「改裝前 ⇒ 改裝後」推導圖**：上下兩圖以箭頭為中軸**置中對齊**，兩側空白線段精簡（~35–40px），箭頭對準兩圖中心。

### 符號座標模板（畫新圖時複製貼上再平移，勿逐張手算座標）

```html
<!-- 直放電阻 16×32：cx=中心 x，y=頂邊；導線在 y 上方接入、y+32 接出 -->
<rect x="{cx-8}" y="{y}" width="16" height="32" stroke="#333" stroke-width="2" fill="#fff"/>
<!-- 橫放電阻 32×16：x=左邊，cy=中心 y -->
<rect x="{x}" y="{cy-8}" width="32" height="16" stroke="#333" stroke-width="2" fill="#fff"/>
<!-- 電源長短對（垂直導線；x=短板 −，長板 + 在其右 15，cy=兩板中點；短粗負極、長細正極） -->
<line x1="{x}" y1="{cy-8}" x2="{x}" y2="{cy+8}" stroke="#333" stroke-width="4"/>
<line x1="{x+15}" y1="{cy-17}" x2="{x+15}" y2="{cy+17}" stroke="#333" stroke-width="2"/>
<!-- 開關（斷開態，水平導線；x=左導線端=鉸接點，cy=導線 y） -->
<line x1="{x}" y1="{cy}" x2="{x+10}" y2="{cy}" stroke="#333" stroke-width="2"/>
<line x1="{x+10}" y1="{cy}" x2="{x+34}" y2="{cy-20}" stroke="#333" stroke-width="2"/>
<line x1="{x+46}" y1="{cy}" x2="{x+70}" y2="{cy}" stroke="#333" stroke-width="2"/>
<!-- 開關（斷開態，垂直導線；cx=導線 x，y=鉸接點=下導線端；上導線端在 y−36，刀刃 31px 向上左張、刀尖 (cx−20, y−24)，距上端 12px） -->
<line x1="{cx}" y1="{y-46}" x2="{cx}" y2="{y-36}" stroke="#333" stroke-width="2"/>
<line x1="{cx}" y1="{y}" x2="{cx-20}" y2="{y-24}" stroke="#333" stroke-width="2"/>
<line x1="{cx}" y1="{y}" x2="{cx}" y2="{y+10}" stroke="#333" stroke-width="2"/>
<!-- 電表圓圈 r=14（圈內字母正體；G 可換 V/A。語義色：改裝前藍、改裝後紅，一般電路圖用黑） -->
<circle cx="{cx}" cy="{cy}" r="14" stroke="#3498db" stroke-width="2" fill="none"/>
<text x="{cx-5}" y="{cy+4}" font-size="13" fill="#3498db" font-family="'Times New Roman', Times, serif">G</text>
<!-- 變阻器（電阻體 48×16 長條；x=框左，cy=導線 y；滑片自上方長引線繞下觸框頂，左端懸空） -->
<rect x="{x}" y="{cy-8}" width="48" height="16" stroke="#333" stroke-width="2" fill="#fff"/>
<polyline points="{ax},{cy} {ax},{cy-26} {x+24},{cy-26}" stroke="#333" stroke-width="2" fill="none"/>
<line x1="{x+24}" y1="{cy-26}" x2="{x+24}" y2="{cy-10}" stroke="#333" stroke-width="2" marker-end="url(#arrRheo)"/>
```

水平導線上的電源／垂直導線上的開關：把對應片段旋轉 90°，**長線仍為正極、刀刃仍鉸接於一端向外張開**。垂直開關的朝向定為**鉸接下端、向上左張**（與課本原圖一致；用生成器時把垂直開關段**由下往上**定義即得此朝向）。模板中 `url(#arrRheo)` 箭頭需在 `<defs>` 定義（`markerUnits="userSpaceOnUse"` 鎖定 7px，不隨線寬放大）：`<marker id="arrRheo" markerUnits="userSpaceOnUse" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#333"/></marker>`

### 防錯規則（2026-11 第十四章講義實踐總結）

- **電源預設用 cell（長短線）**：不照抄題圖的圓形電壓源；`vsource` 僅在原題明確要求時使用。
- **導線端點必須有歸屬**：每段 `wire()` 的兩端各連接一個元件引腳／節點／端子／轉角；懸空線段即錯（曾發生節點右側多出一截不連接任何元件的線段）。畫完逐段自問「這段線兩端各接到甚麼」。**線端（僅一個連接方向的點）只能是端子或元件引腳**——元件支路不得斷在半空；生成器在 `svg()` 時自動驗證，違者報錯拒絕產出。
- **純連接導線宜短，整圖緊湊**：無標註的空白線段約 25–40px 即可，勿拉長留白（空白段的下限 = 能容納該處標註）。
- **段端點不得是直通點**：`part()` 段的端點只能是節點／端子／轉角，或與另一元件相接的串聯點；直通點（上下／左右各一條共線導線）作端點 = 段被憑空截短，元件必然不置中。生成器在 `svg()` 時自動驗證此規則，違者報錯拒絕產出（錯誤訊息會指出元件類型與座標）。
- **導線不得穿過任何符號**：包括端子圓圈。`terminal()` 已收入置頂圖層（與呼叫次序無關），但產出後仍須目視檢查每個符號內部乾淨。
- **有原圖必逐元件轉錄，禁止憑印象重構**：先列「節點表」（原圖有幾個節點、各在何處）與「支路表」（每條支路接哪兩節點、含哪些元件與標註），核對無誤後才生成。憑印象畫「大概」曾造成：虛構匯流條（14-28）、裸線短路整排燈（14-29）、漏畫逐燈開關（14-29）、電池端子張冠李戴（14-29、14-32）。
- **四層自檢（每幅電路圖產出／修改後必過）**：① **拓撲層**——逐支路問「兩端各接哪個節點」，有無裸線跨接造成短路、有無懸空線段；② **符號層**——逐元件對「符號形狀與基準尺寸」表，方向／極性正確（電池長線＝正極，且**極性必須與圖中電流箭頭自洽**：電流由長線端正極流出、經外電路回短線端負極——14.5、14.6 節圖曾長短線畫反致與箭頭矛盾；市電用端子不畫電池）；③ **幾何層**——元件置中於所在導線段；**相接線段的端點座標必須完全相等**（y2=106 對 y=110 的 4px 斷隙即反例）；T 點有點、轉角無點；④ **訊息層**——題目所求量（如幹路電流 I）與解題關鍵元件在圖中可找到，圖內不重複正文數據。
- **修補舊圖同受「生成器優先」約束**：發現手排舊圖有結構性錯誤（拓撲錯、元件缺失）時，用 `circuit.mjs` 整圖重畫，不在錯圖上手補座標。

- **先讀後改**：skill 與教學檔案都可能被外部工具竄改（本檔曾被外部編輯插入與實踐衝突的符號表；教學 HTML 曾被整份換模板，導致行序重排、字元遺失、CSS 缺塊）。修改任何文件前，先讀取目標區段的當前實際內容，禁止憑記憶構造匹配字串。
- **符號從模板複製**：電阻／電源／開關／電表一律從「符號座標模板」或既有合規圖複製。每張新圖重新手算座標，數值必然逐漸漂移——曾發生「新畫的圖違反兩天前已定規範」。
- **窮舉審計，禁止抽查**：「統一尺寸／樣式」修改後，用程式窮舉全檔複查，例如：
  `grep -o '<rect[^>]*>' 檔案.html | grep -o 'width="[^"]*" height="[^"]*"' | sort | uniq -c`
  確認只剩標準尺寸。抽查曾漏掉早期畫的框（14.6 的 R 框 56×16 連漏兩輪）。
- **比例與絕對尺寸雙定義**：符號規範須同時寫死兩者。只統一比例（2:1）時，48×24 與 32×16 並存，讀者仍會視為「形狀不同」。

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

**揭曉模式對照**：

| 模式 | 標記 | Space / 點擊行為 | 適用場景 |
|------|------|-------------------|----------|
| 逐步顯示 | `data-step-reveal="true"` | 逐一顯示 `.reveal-step` 區塊，全部顯示後才前進 | 概念講解、分步推導 |
| 整頁揭曉 | `data-reveal="true"` | toggle 整頁揭曉 ↔ 隱藏 | 填空題、答案統一揭曉 |
| 無互動 | 無標記 | 直接前進 | 封面、目錄、已完整展示的內容 |

**關鍵**：離開揭曉頁（無論方向）時，該頁自動重置為 fresh 狀態 — 下次回到該頁需要重新揭曉。

## iPad / 觸控適配

- `viewport-fit=cover` + `apple-mobile-web-app-capable`
- `touch-action: manipulation` 消除 300 ms tap delay
- `@media (orientation: portrait)` 全盤字體放大（直握 iPad 時 vw 字體會過小），**且同樣受 A+/A− 縮放控制**
- 觸控滑動判斷：水平位移 > 50 px、時間 < 0.6 s、|dx| > |dy| 才觸發；點擊控制組與 iOS 提示氣泡時不觸發翻頁
- iOS / iPadOS 全屏限制：點全屏按鈕時顯示提示「Safari 分享 → 加到主畫面」
- `@media print`：白底 + 去除 HUD + 去除控制組 + 保留答案

## 命名約定

- 檔名：`{主題}-{用途}.html`
- **用途詞統一**：閱讀式產物檔名結尾用「**講義**」（如 `選修3第5章-原子核-講義.html`），簡報式產物檔名結尾用「**簡報**」（如 `選修3第5章-原子核-簡報.html`）
- **棄用** `閱讀版`、`簡報式` 作為檔名結尾（既有舊檔保留原名，不追溯改名；「簡報式／閱讀式」保留為形式名稱，僅用於選擇模板）
- 其他用途仍可用：`課堂練習`、`概念講解`、`例題`、`複習`
- 全部用中文檔名，方便老師快速辨識
- 放置路徑：`teaching/` 或 `teaching/單元名/`

## 驗證清單

### 簡報式驗證

每次生成後，主動確認：
1. 在瀏覽器開啟，封面正常顯示
2. Space → 揭曉答案 → → 進下一頁（正確節奏；注意揭曉題上 Space 是 toggle 顯示/隱藏，會留在當頁）
3. → → 直接翻頁（不卡在中間揭曉狀態）
4. ← 回上一頁，確認填空/答案已重置（方便重播）
5. DevTools Device Mode → iPad Pro portrait → 字體可讀
6. 長解析頁：Space 揭曉 → 確認可捲動查看完整內容；iPad 上確認題目自動縮小
7. 點擊右上角 A+/A−，確認所有字體同步縮放、排版不變形；確認到達 0.7/1.6 時按鈕自動 disabled
8. Ctrl+P 預覽列印，確認白底 + 自動分頁 + 控制組隱藏
9. 檔案是單一 HTML（無外部依賴）
10. 含電路圖／SVG 插圖時，逐項對照「電路圖與標註文字規範」檢查（導線中斷、節點黑點、符號比例、字體斜體規則、標註淨空；新圖應由 `assets/circuit.mjs` 產生），並過「四層自檢」（拓撲→符號→幾何→訊息）；SVG viewBox 貼合內容（無 >20px 內部留白，見「SVG 圖片緊湊規範」，用 assets/trim-viewbox.py 量測）

### 閱讀式驗證

每次生成後，主動確認：
1. 在瀏覽器開啟，標題與題目卡片正常顯示
2. 卷動瀏覽，確認所有題目與答案完整可見
3. DevTools Device Mode → iPhone SE / iPad → 確認響應式排版正常（padding 縮小、字體可讀）
4. 確認公式由 MathJax 正確渲染（行內 `\(...\)` 與獨立 `\[...\]` 均正常）
5. Ctrl+P 預覽列印，確認白底 + 去除陰影 + 題目卡片邊框保留
6. 檔案是單一 HTML（MathJax CDN 除外）
7. 寬屏檢查：視窗拉至 ≥1440px（或用 Device Mode 設 1920px），確認字與 SVG 圖同步放大、每行字數不變（約 58 字）、無橫向捲軸；SVG 上限寬度須為 em 而非 px
8. （進階模板）點導航列 ⛶ 或按 `F`，確認全屏可切換、圖示隨狀態變換；若頁面部署在 Apps Script 等嵌入環境，確認被拒時顯示降級提示而非靜默失敗
9. 含電路圖／SVG 插圖時，逐項對照「電路圖與標註文字規範」檢查（導線中斷、節點黑點、符號比例、字體斜體規則、標註淨空；新圖應由 `assets/circuit.mjs` 產生），並過「四層自檢」（拓撲→符號→幾何→訊息）；SVG viewBox 貼合內容（無 >20px 內部留白，見「SVG 圖片緊湊規範」，用 assets/trim-viewbox.py 量測）

## 參考範例

- `h:/bigleong/Project_P/teaching/分子動能與內能-概念講解.html`
  - 12 頁：概念講解 + SVG 勢能曲線 + 彈簧類比 + 填空模式
- `h:/bigleong/Project_P/teaching/分子動能與內能-課堂練習.html`
  - 7 頁：題目 + 解析揭曉 + 計算題模式

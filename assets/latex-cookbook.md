# LaTeX 物理寫法 Cookbook

寫教學 PPT 公式的速查手冊,專注於 KaTeX 0.16.x 支援的語法 + 物理 / STEM 常用樣式。

寫入位置:`<div class="formula">$$ ... $$</div>`(區塊)或 `... $T_1 = 273\;\mathrm{K}$ ...`(行內)。

---

## 1. 常用符號對照

| Unicode | LaTeX | 備註 |
|---|---|---|
| `×` | `\times` |  |
| `·` | `\cdot` | **必須在數學模式**,不要寫進 `\text{}` |
| `÷` | `\div` |  |
| `±` | `\pm` |  |
| `∓` | `\mp` |  |
| `≈` | `\approx` |  |
| `≠` | `\neq` |  |
| `≤ / ≥` | `\le / \ge` |  |
| `→` | `\to` 或 `\rightarrow` |  |
| `⟹` | `\implies` |  |
| `⟺` | `\iff` |  |
| `∞` | `\infty` |  |
| `°` | `^\circ` | 例 `25^\circ\mathrm{C}` |
| `Δ` | `\Delta` | 大寫 |
| `δ` | `\delta` | 小寫 |
| `π / θ / φ / ω` | `\pi / \theta / \phi / \omega` | 希臘小寫 |
| `Σ / Π` | `\Sigma / \Pi` | 希臘大寫 |
| `√x` | `\sqrt{x}` |  |
| `∫` | `\int` |  |
| `∑` | `\sum` |  |
| `′ / ″` | `'` / `''` | 一撇 / 兩撇 |

## 2. 上下標

| 寫法 | 結果 |
|---|---|
| `p_1` | p₁(下標單字符) |
| `p_{12}` | p₁₂(下標多字符要加 `{}`)|
| `10^{-2}` | 10⁻²(冪次多字符要加 `{}`)|
| `T_{\text{右}}` | T 下標「右」(中文下標)|
| `e^{i\pi}` | eⁱᵖⁱ |

⚠️ **單字符下標可省略 `{}`,多字符必加**:`x_1` 對,`x_12` 會變 x₁2。

## 3. 分數

| 寫法 | 結果 / 場景 |
|---|---|
| `\frac{a}{b}` | 自動依上下文選大小 |
| `\dfrac{a}{b}` | **強制大尺寸**(行內也用大字)|
| `\tfrac{a}{b}` | **強制小尺寸**(較精緻、緊湊)|
| `a/b` | 斜線分數(非真分數)|

**選擇建議**:
- 在 `<div class="formula">$$...$$</div>` 區塊裡:用 `\frac` 即可(預設 display 樣式)
- 在 `.law`(公式回顧頁)用 `$...$` inline 模式時:用 `\dfrac` 強制大尺寸

範例:`\dfrac{p_1V_1}{T_1} = \dfrac{p_2V_2}{T_2}`

## 4. 單位寫法

物理量數值後接單位,有兩種推薦寫法:

| 寫法 | 場景 |
|---|---|
| `5\;\mathrm{Pa}` | 推薦:`\;` 厚空格 + `\mathrm` 直立字體 |
| `5\,\mathrm{Pa}` | 較窄空格 |
| `5\ \text{Pa}` | 在 `\text{}` 內,**不能含 Unicode `·`** |
| `5\;\mathrm{atm \cdot L/(mol \cdot K)}` | **複合單位的標準寫法** |

⚠️ **大坑**:`\text{atm·L/(mol·K)}` 中的 `·` 會被 KaTeX 誤映射為 `\cdotp` 命令並渲染失敗。**單位中要中點分隔,務必走 `\mathrm{}` + `\cdot`**。

## 5. 著色與粗體

KaTeX 支援部分 LaTeX 樣式命令:

| 寫法 | 效果 |
|---|---|
| `\textcolor{#2ecc71}{20\%}` | 顯示綠色 20% |
| `\color{#e94560} 紅` | 從這裡之後直到結尾全紅(不推薦,會影響後續)|
| `\mathbf{x}` | 粗體 |
| `\mathit{x}` | 斜體(數學模式預設斜) |
| `\mathrm{Pa}` | 直立字體 |
| `\textbf{文字}` | 粗體文字模式 |
| `\textcolor{#2ecc71}{\mathbf{20\%}}` | 綠色粗體 |

⚠️ **`%` 在 LaTeX 是註解符號**,要顯示 `%` 寫 `\%`。

範例(配合 teaching-ppt 主色板):
- 答案高亮:`\textcolor{#2ecc71}{...}`(綠色)
- 警告 / 錯誤:`\textcolor{#e94560}{...}`(紅色)
- 重點:`\textcolor{#f5a623}{...}`(橙色)

## 6. 中文混排

KaTeX 支援 `\text{}` 內中文(預設用 `\rm` 字體):

| 寫法 | 效果 |
|---|---|
| `T_{\text{右}}` | T 下標「右」 |
| `\text{答}: x = 5` | 在公式中嵌入中文「答」 |

⚠️ `\text{}` 內可放中文,但**不要放 Unicode 數學符號(如 `·`)**。

## 7. 排版微調

| 寫法 | 用途 |
|---|---|
| `\,` | 細空格(數值與單位間) |
| `\;` | 厚空格(較大間隔) |
| `\quad` | 一個 em 寬空格(分隔不同公式) |
| `\\` | 換行(在 align / cases 環境內)|
| `\left( ... \right)` | 自動匹配大小的括號 |
| `\boxed{x = 5}` | 在公式外加邊框(KaTeX 0.16+ 支援)|

---

## 8. 完整範例(取自氣體章)

```latex
% 玻意耳定律應用
V_2 = \frac{p_1 V_1}{p_2}
    = \frac{2 \times 10^6 \times 10}{1.0 \times 10^5}
    = 200 \text{ L}

% 蓋-呂薩克定律
V_2 = V_1 \cdot \frac{T_2}{T_1}
    = 1.0 \times 10^{-2} \times \frac{400}{300}
    \approx 1.33 \times 10^{-2} \text{ m}^3

% 克拉珀龍方程 + 帶複合單位
R = \frac{p_0 V_0}{T_0}
  = \frac{1 \times 22.4}{273}
  \approx 0.0821\;\mathrm{atm \cdot L/(mol \cdot K)}

% 含 % 與顏色高亮
\frac{n_2}{n_1} = \frac{p_2}{p_1}
              = \frac{9.8 \times 10^5}{4.9 \times 10^6}
              = \textcolor{#2ecc71}{\mathbf{20\%}}

% 中文下標
\frac{p_0 V_0}{300}
  = \frac{(4/3)\,p_0 \cdot (5/4)\,V_0}{T_{\text{右}}}
  \implies T_{\text{右}} = 500 \text{ K}
```

---

## 9. 已知雷區檢查表

寫公式前 / 出問題時逐條檢查:

- [ ] **`\text{}` 內有 Unicode `·`?** → 改用 `\mathrm{... \cdot ...}`
- [ ] **多字符下標 / 上標沒包 `{}`?** → `x_{12}` 而非 `x_12`
- [ ] **`%` 沒逃逸?** → `20\%` 而非 `20%`
- [ ] **`&` 在公式中?** → `\&`(LaTeX 表格分隔符)
- [ ] **`#` 在公式中?** → `\#`
- [ ] **公式被 `<div>` 但缺 `$$` 包裹?** → KaTeX 不會渲染
- [ ] **`\cdot` 寫進 `\text{}`?** → 移到數學模式

---

## 10. KaTeX 不支援的命令(踩雷別寫)

KaTeX 是 LaTeX 的子集,以下要避開:

- `\begin{align*}` → 改用 `\begin{aligned}`(KaTeX 支援)
- `\verb|...|` 不支援
- 自訂 `\newcommand` 一般不支援(需 `trust: true` 設定)
- 完整 LaTeX package(`\usepackage`)不支援

完整支援表:<https://katex.org/docs/supported.html>

---

## 11. 小工具

- 線上即時試 LaTeX:<https://katex.org/#demo>
- 公式排版練習:<https://katex.org/docs/api>
- 把已存在的 Unicode HTML 升級:跑 `assets/upgrade-to-latex.py`,參考 `assets/template-latex.html` 看 KaTeX 啟動的標準寫法

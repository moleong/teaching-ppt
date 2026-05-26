#!/usr/bin/env python3
"""
Build KaTeX inline assets for the teaching-ppt skill.

執行後會更新兩個檔案:
  1. assets/katex-inline.html  — 純 KaTeX 內聯片段(可拷貝到任何 HTML)
  2. assets/template-latex.html — template.html + KaTeX 內聯 + 啟動程式碼

從 jsdelivr 下載 KaTeX 0.16.x CSS / JS / 7 個核心 WOFF2 字體,
把字體做 base64 嵌入 CSS 的 @font-face,合成可內聯的 HTML 片段;
接著把 template.html 與 KaTeX 片段拼接成 template-latex.html。

用法:
  python build-katex.py [--version 0.16.10]

擴充字體:若需要的 LaTeX 命令未渲染(例如 \\mathcal{}, \\mathfrak{}),
編輯下方 CORE_FONTS 加入對應字體名,再重跑此腳本。
"""
import argparse
import base64
import re
import sys
import urllib.request
from pathlib import Path

DEFAULT_VERSION = '0.16.10'
ASSETS_DIR = Path(__file__).parent
KATEX_INLINE = ASSETS_DIR / 'katex-inline.html'
TEMPLATE_HTML = ASSETS_DIR / 'template.html'
TEMPLATE_LATEX_HTML = ASSETS_DIR / 'template-latex.html'

CDN_BASE = 'https://cdn.jsdelivr.net/npm/katex@{version}/dist'

# 在 template-latex.html 的 IIFE 結尾插入這段,啟動 KaTeX 自動渲染
KATEX_INIT_JS = '''
  // ===== KaTeX 自動渲染所有公式 =====
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$',  right: '$',  display: false }
      ],
      throwOnError: false
    });
  }
'''

# 7 個核心字體已足夠物理 / STEM 課堂常用公式
# (分數、希臘字母、上下標、\cdot / \approx 等基本符號)
# 若需要 \mathcal、\mathfrak、\mathsf 等花俏字體,加進此清單再重跑
CORE_FONTS = [
    'KaTeX_Main-Regular',
    'KaTeX_Main-Bold',
    'KaTeX_Main-Italic',
    'KaTeX_Math-Italic',
    'KaTeX_Size1-Regular',
    'KaTeX_Size2-Regular',
    'KaTeX_AMS-Regular',
]


def fetch(url: str) -> bytes:
    print(f'  GET {url}')
    with urllib.request.urlopen(url, timeout=30) as r:
        return r.read()


def build_katex_inline(version: str) -> None:
    """從 jsdelivr 抓 KaTeX 並產生 katex-inline.html(純內聯片段)。"""
    base = CDN_BASE.format(version=version)

    print(f'Fetching KaTeX {version} from jsdelivr ...')
    katex_css = fetch(f'{base}/katex.min.css').decode('utf-8')
    katex_js = fetch(f'{base}/katex.min.js').decode('utf-8')
    auto_render_js = fetch(f'{base}/contrib/auto-render.min.js').decode('utf-8')

    print(f'\nFetching {len(CORE_FONTS)} core fonts ...')
    font_b64 = {}
    for name in CORE_FONTS:
        data = fetch(f'{base}/fonts/{name}.woff2')
        font_b64[f'{name}.woff2'] = base64.b64encode(data).decode('ascii')

    print('\nReplacing CSS @font-face with base64 data URIs ...')

    def replace_font_face(match):
        block = match.group(0)
        m = re.search(r'url\(fonts/(KaTeX_[\w-]+\.woff2)\)', block)
        if not m:
            return block
        fname = m.group(1)
        if fname not in font_b64:
            return ''  # 移除無關字體的 @font-face
        data_uri = f'data:font/woff2;base64,{font_b64[fname]}'
        new_src = f'src:url({data_uri}) format("woff2")'
        return re.sub(
            r'src:[^}]+?(?=;font-style|;font-weight|;font-display|;unicode-range|})',
            new_src, block, count=1)

    new_css = re.sub(r'@font-face\{[^}]+\}', replace_font_face, katex_css)
    kept = new_css.count('@font-face')
    print(f'  kept {kept} @font-face,移除其餘')

    snippet = f'''<!-- ===== KaTeX {version} (inlined offline) ===== -->
<style id="katex-css">
{new_css}
</style>
<script id="katex-js">
{katex_js}
{auto_render_js}
</script>
<!-- ===== /KaTeX ===== -->
'''
    KATEX_INLINE.write_text(snippet, encoding='utf-8')
    size_kb = len(snippet.encode('utf-8')) / 1024
    print(f'\nWritten: {KATEX_INLINE.name}  ({size_kb:.1f} KB)')


def build_template_latex() -> None:
    """把 template.html + katex-inline.html + 啟動程式碼拼成 template-latex.html。"""
    if not TEMPLATE_HTML.exists():
        print(f'WARN: {TEMPLATE_HTML.name} not found, skip template-latex.html')
        return
    if not KATEX_INLINE.exists():
        print(f'WARN: {KATEX_INLINE.name} not found, run build_katex_inline first')
        return

    print(f'\nBuilding {TEMPLATE_LATEX_HTML.name} ...')
    template = TEMPLATE_HTML.read_text(encoding='utf-8')
    katex_block = KATEX_INLINE.read_text(encoding='utf-8')

    # 1. 在 </head> 前注入 KaTeX 內聯片段
    if '</head>' not in template:
        raise RuntimeError(f'{TEMPLATE_HTML.name} 缺少 </head>,無法定位注入點')
    out = template.replace('</head>', katex_block + '\n</head>', 1)

    # 2. 在主 IIFE 結尾(render(); 後)插入 KaTeX 啟動程式碼
    if '  render();\n})();' not in out:
        raise RuntimeError(
            TEMPLATE_HTML.name + ' 主 IIFE 結尾不匹配預期格式 — '
            'template 結構可能已變,需更新 build-katex.py'
        )
    out = out.replace('  render();\n})();', '  render();\n' + KATEX_INIT_JS + '})();')

    # 3. 改 <title> 提示這份是 LaTeX 變體
    out = re.sub(
        r'<title>(.*?)</title>',
        r'<title>\1 (LaTeX 變體)</title>',
        out, count=1
    )

    TEMPLATE_LATEX_HTML.write_text(out, encoding='utf-8')
    size_kb = len(out.encode('utf-8')) / 1024
    print(f'Written: {TEMPLATE_LATEX_HTML.name}  ({size_kb:.1f} KB)')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Build KaTeX inline + template-latex assets')
    parser.add_argument('--version', default=DEFAULT_VERSION, help='KaTeX version')
    parser.add_argument('--skip-template', action='store_true',
                        help='只重建 katex-inline.html,不重建 template-latex.html')
    parser.add_argument('--skip-katex', action='store_true',
                        help='只重建 template-latex.html(用既有 katex-inline.html),不重抓 KaTeX')
    args = parser.parse_args()

    if not args.skip_katex:
        build_katex_inline(args.version)
    if not args.skip_template:
        build_template_latex()

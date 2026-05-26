#!/usr/bin/env python3
"""
Upgrade an existing teaching-ppt HTML from Unicode formulas to LaTeX (via KaTeX).

把已存在、用 Unicode 字元寫公式的 HTML 教材,升級為 LaTeX 模式:
  1. 在 </head> 前注入 KaTeX 內聯片段(讀自 assets/katex-inline.html)
  2. 在主 IIFE 結尾(render(); 後)加上 renderMathInElement 啟動
  3. 依照對照表,把 .formula / .law 中的 Unicode 公式改寫為 $...$ / $$...$$ + LaTeX

腳本是 idempotent — 已升級過的檔案重跑不會破壞(會偵測已注入的 KaTeX 並跳過)。

用法:
  python upgrade-to-latex.py <html_path> --mapping <json_path>
  python upgrade-to-latex.py 熱學/氣體-課堂練習-精選版.html --mapping mappings/gas.json

對照表 JSON 格式:
{
  "formula": {
    "原 Unicode 公式(不含 <div class=\"formula\">)": "LaTeX 內容(不含 $$)"
  },
  "law": {
    "原 Unicode 公式": "LaTeX 內容(不含 $)"
  }
}

注意事項:
  - 對照表的 key 必須跟原 HTML 中 .formula / .law 內容**一字不差**
  - 內含 HTML 標籤(如 <sub>)的也照原樣寫進 key
  - LaTeX value 不要包 $...$,腳本會自動加
  - 對照表沒涵蓋的公式會保持 Unicode 原狀(腳本會列出 NOT FOUND 警告)
"""
import argparse
import json
import sys
from pathlib import Path

ASSETS_DIR = Path(__file__).parent
KATEX_INLINE = ASSETS_DIR / 'katex-inline.html'

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


def upgrade(html_path: Path, mapping_path: Path) -> None:
    if not KATEX_INLINE.exists():
        sys.exit(f'ERROR: {KATEX_INLINE} 不存在,請先跑 build-katex.py')
    if not html_path.exists():
        sys.exit(f'ERROR: {html_path} 不存在')
    if not mapping_path.exists():
        sys.exit(f'ERROR: {mapping_path} 不存在')

    html = html_path.read_text(encoding='utf-8')
    mapping = json.loads(mapping_path.read_text(encoding='utf-8'))
    katex_block = KATEX_INLINE.read_text(encoding='utf-8')

    print(f'=== Upgrading {html_path.name} ===')
    print(f'  before size: {len(html.encode("utf-8")) // 1024} KB')

    # 1. 注入 KaTeX 內聯
    if '<!-- ===== KaTeX' in html:
        print('  [skip] KaTeX 已注入')
    else:
        if '</head>' not in html:
            sys.exit('ERROR: HTML 缺少 </head>,無法定位注入點')
        html = html.replace('</head>', katex_block + '\n</head>', 1)
        print('  [+] KaTeX 內聯已注入')

    # 2. 加上 renderMathInElement 啟動
    if 'KaTeX 自動渲染' in html:
        print('  [skip] KaTeX 啟動程式碼已存在')
    else:
        if '  render();\n})();' not in html:
            print('  WARN: 找不到主 IIFE 結尾 "  render();\\n})();" — 啟動程式碼未注入')
            print('        請手動在主 IIFE 結尾加入 renderMathInElement 呼叫')
        else:
            html = html.replace('  render();\n})();',
                                '  render();\n' + KATEX_INIT_JS + '})();')
            print('  [+] KaTeX 啟動程式碼已加入')

    # 3. 改寫 .formula / .law 公式
    formula_map = mapping.get('formula', {})
    law_map = mapping.get('law', {})

    formula_done = 0
    formula_missing = []
    for orig, latex in formula_map.items():
        old_div = f'<div class="formula">{orig}</div>'
        new_div = f'<div class="formula">$${latex}$$</div>'
        if old_div in html:
            html = html.replace(old_div, new_div, 1)
            formula_done += 1
        elif new_div not in html:
            formula_missing.append(orig)

    law_done = 0
    law_missing = []
    for orig, latex in law_map.items():
        old_div = f'<div class="law">{orig}</div>'
        new_div = f'<div class="law">${latex}$</div>'
        if old_div in html:
            html = html.replace(old_div, new_div, 1)
            law_done += 1
        elif new_div not in html:
            law_missing.append(orig)

    print(f'  [+] .formula replaced: {formula_done} / {len(formula_map)}'
          + (f' (already-LaTeX: {len(formula_map) - formula_done - len(formula_missing)})'
             if (len(formula_map) - formula_done - len(formula_missing)) else ''))
    if formula_missing:
        print('  WARN .formula NOT FOUND in HTML:')
        for m in formula_missing:
            print(f'    - {m[:60]}{"..." if len(m) > 60 else ""}')

    print(f'  [+] .law     replaced: {law_done} / {len(law_map)}')
    if law_missing:
        print('  WARN .law NOT FOUND in HTML:')
        for m in law_missing:
            print(f'    - {m}')

    html_path.write_text(html, encoding='utf-8')
    print(f'  after size:  {len(html.encode("utf-8")) // 1024} KB')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Upgrade existing teaching-ppt HTML to LaTeX mode',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument('html_path', type=Path, help='Target HTML to upgrade')
    parser.add_argument('--mapping', type=Path, required=True,
                        help='Path to mapping JSON (Unicode → LaTeX)')
    args = parser.parse_args()
    upgrade(args.html_path, args.mapping)

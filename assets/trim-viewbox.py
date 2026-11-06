#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SVG viewBox 裁切工具——消除 SVG 畫布內部留白（第十四章講義 2026-11 實踐定稿）。

原理：手排 SVG 的 viewBox 通常遠大於內容實際範圍（預設留白），在寬屏字級放大後
上下可達 70–120px 空白。本工具用瀏覽器 getBBox() 量出真實內容邊界（含文字實際
寬度、箭頭 marker 延伸），把 viewBox 裁到「內容邊界 + 12px 安全邊距」。

兩步用法（需本機起一個 http 伺服器讓瀏覽器開 harness）：

  # 1. 產生測量頁（把所有 class="diagram" 的 SVG 嵌入，逐個量 getBBox）
  python3 trim-viewbox.py gen 講義.html [更多檔案...] -o /tmp/svg-harness.html

  # 2. 瀏覽器開 /tmp/svg-harness.html，等 #result 填好後把整段文字存成 bbox.txt
  #    （每行：file<N>|svg<M> x y w h）

  # 3. 依測量結果回寫各檔案的 viewBox（並同步符合 ÷16 慣例的 em 上限）
  python3 trim-viewbox.py apply bbox.txt 講義.html [更多檔案...]

規則（與 SKILL.md「SVG 圖片緊湊規範」一致）：
  - 只裁不放大；唯內容已超出舊 viewBox（既有裁切）才順帶修復擴大
  - 12px 安全邊距覆蓋線寬（≤4）＋marker 延伸（≤9）＋字體度量誤差
  - max-width 僅當其值 ≈ 舊 viewBox 寬 ÷16（em 慣例）時同步更新；px 或其它值不動
  - 只處理 class 含 "diagram" 的 SVG（UI 圖示如 fs-icon 不動）
"""
import re, math, sys, argparse

DIAGRAM_RE = re.compile(r'<svg class="[^"]*\bdiagram\b[^"]*".*?</svg>', re.S)
VB_RE = re.compile(r'view[Bb]ox="0 0 (\d+) (\d+)"', re.I)
PAD = 12.0


def collect(files):
    """回傳 [(path, [svg_block,...]), ...]，只收 class 含 diagram 的 SVG"""
    out = []
    for path in files:
        s = open(path, encoding='utf-8').read()
        svgs = DIAGRAM_RE.findall(s)
        if svgs:
            out.append((path, svgs))
    return out


def cmd_gen(files, out_path):
    parts = ['''<!DOCTYPE html><html><head><meta charset="UTF-8"><title>svg measure</title></head>
<body>
<div id="stage" style="position:absolute;left:-99999px;top:0"></div>
<pre id="result"></pre>
''']
    n_total = 0
    for fi, (path, svgs) in enumerate(files):
        for si, svg in enumerate(svgs):
            vb = VB_RE.search(svg)
            vb_s = vb.group(0) if vb else 'viewBox="?"'
            parts.append(f'<div class="fig" data-name="file{fi}|svg{si}|{path}|{vb_s}">{svg}</div>\n')
            n_total += 1
    parts.append('''<script>
window.addEventListener('load', function () {
  var out = [];
  var stage = document.getElementById('stage');
  document.querySelectorAll('.fig').forEach(function (fig) {
    var svg = fig.querySelector('svg');
    stage.appendChild(svg);
    try {
      var bb = svg.getBBox();
      out.push(fig.dataset.name + ' ' + [bb.x, bb.y, bb.width, bb.height].map(function (v) { return v.toFixed(1); }).join(' '));
    } catch (e) {
      out.push(fig.dataset.name + ' ERROR ' + e.message);
    }
  });
  document.getElementById('result').textContent = out.join('\\n');
  /* 量測完成自動下載 bbox.txt（瀏覽器下載目錄） */
  var blob = new Blob([out.join('\\n')], { type: 'text/plain' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'bbox.txt';
  document.body.appendChild(a); a.click(); a.remove();
});
</script></body></html>''')
    open(out_path, 'w', encoding='utf-8').write('\n'.join(parts))
    print(f'harness written: {out_path}（{n_total} 個 SVG，來自 {len(files)} 個檔案）')
    print('請用瀏覽器開啟該頁（需 http 伺服器），等 #result 出現後全文存成 bbox.txt')


def cmd_apply(bbox_path, files):
    data = {}
    for line in open(bbox_path, encoding='utf-8'):
        line = line.strip()
        if not line or ' ERROR ' in line:
            continue
        m = re.match(r'file(\d+)\|svg(\d+)\|.*?\|.*?([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)$', line)
        if not m:
            continue
        data[(int(m.group(1)), int(m.group(2)))] = tuple(float(x) for x in m.groups()[2:6])

    collected = collect(files)
    report = []
    for fi, (path, svgs) in enumerate(collected):
        s = open(path, encoding='utf-8').read()
        matches = list(DIAGRAM_RE.finditer(s))
        out, last, n_trim = [], 0, 0
        for si, m in enumerate(matches):
            blk = m.group(0)
            key = (fi, si)
            if key not in data:
                out.append(s[last:m.end()]); last = m.end()
                continue
            ov = VB_RE.search(blk)
            if not ov:
                out.append(s[last:m.end()]); last = m.end()
                report.append((path, si, 'skip: no viewBox'))
                continue
            ow, oh = int(ov.group(1)), int(ov.group(2))
            bx, by, bw, bh = data[key]
            nx = max(0, math.floor(bx - PAD)); ny = max(0, math.floor(by - PAD))
            nwd = math.ceil(bx + bw + PAD) - nx
            nhd = math.ceil(by + bh + PAD) - ny
            nw = nwd if (bx + bw > ow) else min(ow, nwd)
            nh = nhd if (by + bh > oh) else min(oh, nhd)
            if (nw, nh) == (ow, oh) and nx == 0 and ny == 0:
                out.append(s[last:m.end()]); last = m.end()
                continue
            nb = blk.replace(ov.group(0), f'viewBox="{nx} {ny} {nw} {nh}"', 1)
            omw = re.search(r'max-width:([\d.]+)em', nb)
            if omw:
                old_em = float(omw.group(1))
                if abs(old_em - round(ow / 16, 2)) < 0.05:
                    nb = nb.replace(omw.group(0), f'max-width:{round(nw / 16, 2)}em', 1)
            n_trim += 1
            out.append(s[last:m.start()]); out.append(nb); last = m.end()
        out.append(s[last:])
        open(path, 'w', encoding='utf-8').write(''.join(out))
        report.append((path, n_trim, f'{len(matches)} 個 diagram SVG'))
    for r in report:
        print('OK ', *r)
    print('完成。請瀏覽器逐檔目視檢查有無裁切過頭（標註被切）。')


def main():
    ap = argparse.ArgumentParser(description='SVG viewBox 裁切工具')
    sub = ap.add_subparsers(dest='cmd', required=True)
    g = sub.add_parser('gen', help='產生測量頁')
    g.add_argument('files', nargs='+')
    g.add_argument('-o', '--out', default='/tmp/svg-harness.html')
    a = sub.add_parser('apply', help='依 bbox 結果回寫')
    a.add_argument('bbox')
    a.add_argument('files', nargs='+')
    args = ap.parse_args()
    if args.cmd == 'gen':
        cmd_gen(collect(args.files), args.out)
    else:
        cmd_apply(args.bbox, args.files)


if __name__ == '__main__':
    main()

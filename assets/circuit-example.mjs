// circuit-example.mjs — circuit.mjs 範例與視覺驗證圖
// 產生三張圖：①簡單迴路 ②改裝電壓表（語義色） ③變阻器限流 + 並聯電容
// 用法：node circuit.mjs circuit-example.mjs --html > example.html

export default ({ Circuit }) => {
  const out = [];

  // ① 簡單迴路：電源 + 開關 + 電流表 + 燈泡
  {
    const c = new Circuit();
    c.part('cell', 40, 220, 40, 100, { label: '{i:E}' });
    c.part('switch', 120, 40, 260, 40, { label: '{i:S}' });
    c.part('meter', 340, 100, 340, 220, { ch: 'A' });
    c.part('lamp', 265, 280, 115, 280, { label: '{i:L}', labelSide: 'below' });
    c.wire(40, 100, 40, 40); c.wire(40, 40, 120, 40);
    c.wire(260, 40, 340, 40); c.wire(340, 40, 340, 100);
    c.wire(340, 220, 340, 280); c.wire(340, 280, 265, 280);
    c.wire(115, 280, 40, 280); c.wire(40, 280, 40, 220);
    out.push('<h3>① 簡單迴路</h3>' + c.svg());
  }

  // ② 改裝電壓表：表頭 G（改裝前藍）串聯分壓電阻 Rx（改裝後紅）
  {
    const c = new Circuit();
    c.distribute(60, 120, 300, 120, [
      { type: 'meter', opts: { ch: 'G', color: '#3498db', label: '{i:I}{sub:g}、{i:R}{sub:g}' } },
      { type: 'resistor', opts: { color: '#e74c3c', label: '{i:R}{sub:x}', labelColor: '#e74c3c' } },
    ]);
    c.terminal(60, 120); c.terminal(300, 120);
    out.push('<h3>② 改裝電壓表</h3>' + c.svg());
  }

  // ③ 變阻器限流電路：R 與並聯電容 C 支路，主迴路串變阻器
  {
    const c = new Circuit();
    c.part('cell', 40, 40, 40, 240, { flip: true });
    c.part('resistor', 140, 40, 240, 40, { label: '{i:R}' });
    const br = c.branch(140, 40, 240, 40, -60);        // 向下繞的並聯支路
    c.part('capacitor', br[0], br[1], br[2], br[3], { label: '{i:C}', labelSide: 'below' });
    c.part('rheostat', 40, 240, 340, 240, { label: '{i:R}{sub:P}', labelSide: 'below' });
    c.wire(40, 40, 140, 40); c.wire(240, 40, 340, 40);
    c.wire(340, 40, 340, 240);
    out.push('<h3>③ 變阻器限流 + 並聯電容</h3>' + c.svg());
  }

  return '<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8">' +
    '<title>circuit.mjs 範例</title></head>' +
    '<body style="margin:24px;background:#fff;max-width:560px;font-family:\'Microsoft JhengHei\',sans-serif">' +
    out.join('') + '</body></html>';
};

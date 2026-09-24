// Optional browser verification: npm install --no-save playwright && node verify.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  fs.mkdirSync('test-output', { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1500, height: 1050 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve('index.html')).href);
    await page.screenshot({ path: 'test-output/desktop.png', fullPage: true });
    async function exportPNG(filename, width, scale) {
      const height = await page.locator('#notice').evaluate(el => el.offsetHeight);
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#export').click();
      const download = await downloadPromise;
      await download.saveAs(`test-output/${filename}`);
      const png = fs.readFileSync(`test-output/${filename}`);
      assert.equal(png.readUInt32BE(16), width * scale);
      assert.equal(png.readUInt32BE(20), height * scale);
      await page.waitForFunction(() => !document.getElementById('export').disabled);
    }
    await exportPNG('notice.png', 1200, 2);
    await page.locator('[name=title]').fill('<测试标题> & 快乐');
    await page.locator('[name=subtitle]').fill('张同学　复试总成绩：184.6');
    await page.locator('[name=sender]').fill('示例大学');
    await page.locator('[name=sentAt]').fill('2026-09-25 09:43');
    await page.locator('[name=body]').fill('第一行测试\n这是一段用于检查换行的很长文字。'.repeat(8));
    await page.locator('[name=showBreadcrumb]').check();
    await page.locator('#addRow').click();
    assert.equal(await page.locator('#tableBody tr').count(), 5);
    await page.getByRole('button', { name: '删除第 5 行', exact: true }).click();
    assert.equal(await page.locator('#tableBody tr').count(), 4);
    await page.reload();
    assert.equal(await page.locator('#noticeTitle').textContent(), '<测试标题> & 快乐');
    assert.equal(await page.locator('#noticeSubtitle').isVisible(), true);
    await page.locator('[name=width]').selectOption('960');
    await page.locator('[name=scale]').selectOption('1');
    await page.setViewportSize({ width: 390, height: 844 });
    await exportPNG('mobile-edited.png', 960, 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await page.screenshot({ path: 'test-output/mobile.png', fullPage: true });
    await page.locator('#reset').click();
    await page.locator('#confirmReset').click();
    assert.equal(await page.locator('#noticeTitle').textContent(), '接受幸福的时刻');
    // Export the supplied second reference using the same editor and download path.
    await page.setViewportSize({ width: 1500, height: 1050 });
    await page.locator('[name=title]').fill('待录取通知');
    await page.locator('[name=subtitle]').fill('刘奋翼  复试总成绩：184.6');
    await page.locator('[name=sender]').fill('上海交通大学');
    await page.locator('[name=sentAt]').fill('2025-09-25 09:43');
    await page.locator('[name=body]').fill('同学您好！恭喜您通过推荐免试方式，被拟录取为我院2026级研究生，请尽快登录国家推免服务系统（网址：https://yz.chsi.com.cn/tm），确认录取通知。');
    await page.locator('[name=status]').fill('你于2025-09-25 14:04接受了上海交通大学的待录取通知');
    await page.locator('[name=detailsTitle]').fill('志愿详情');
    await page.locator('[name=showBreadcrumb]').check();
    await page.locator('[name=width]').selectOption('1440');
    await page.locator('[name=scale]').selectOption('1');
    await page.locator('[name=fontSize]').fill('24');
    const referenceRows = [
      ['招生单位', '上海交通大学', '层次', '直博生'],
      ['院系所', '人工智能学院', '专业', '(081200)计算机科学与技术'],
      ['学习方式', '全日制', '研究方向', '不分研究方向'],
      ['导师', '陈思衡', '专项计划', '普通计划'],
      ['就业类型', '非定向就业', '', '']
    ];
    for (let row = 1; row <= referenceRows.length; row++) {
      if (row > 4) await page.locator('#addRow').click();
      const inputs = page.locator(`#rowEditor .row-edit:nth-child(${row}) input`);
      for (let cell = 0; cell < 4; cell++) await inputs.nth(cell).fill(referenceRows[row - 1][cell]);
    }
    assert.equal(await page.locator('#tableBody tr').last().locator('td').count(), 2);
    assert.equal(await page.locator('#tableBody tr').last().locator('td').last().getAttribute('colspan'), '3');
    await exportPNG('reference-figure-2.png', 1440, 1);
    assert.deepEqual(errors, []);
    console.log('PASS: local-file loading, editing, safe text, rows, persistence, mobile layout, PNG sizes, reset, figure-2 export; no browser errors.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

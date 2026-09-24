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
    assert.equal(await page.title(), '录取通知生成器');
    assert.equal(await page.locator('.app-header h1').textContent(), '录取通知生成器');
    assert.equal(await page.locator('.app-header p').textContent(), '仅供娱乐，请勿用于真实通知。');
    assert.equal(await page.locator('#body').textContent(), '您好，距离国庆还有6天，马上就要国庆假期了，要一起快乐起来吗？');
    assert.equal(await page.locator('#status').textContent(), '您于2026-09-24 14:00接受了一张快乐邀请函');
    assert.equal(await page.locator('#detailsTitle').textContent(), '一些信息');
    assert.deepEqual(await page.locator('#tableBody tr').allTextContents(), [
      '我也不知道发生了什么',
      '但是听说这种图片配色就算不点开看',
      '也有人会点赞提前祝愿',
      '朋友圈的各位国庆节快乐！'
    ]);
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
    assert.equal(await page.locator('#entryEditor .entry-edit').count(), 8);
    await page.locator('#addEntry').click();
    assert.equal(await page.locator('#entryEditor .entry-edit').count(), 9);
    assert.equal(await page.locator('#tableBody tr').count(), 5);
    const lastFields = page.locator('#entryEditor .entry-edit').last().locator('input');
    await lastFields.nth(0).fill('备注');
    await lastFields.nth(1).fill('测试内容');
    assert.equal(await page.locator('#tableBody tr').last().locator('td').count(), 2);
    assert.equal(await page.locator('#tableBody tr').last().locator('td').first().textContent(), '备注');
    assert.equal(await page.locator('#tableBody tr').last().locator('td').last().getAttribute('colspan'), '3');
    await page.locator('#addEntry').click();
    assert.equal(await page.locator('#entryEditor .entry-edit').count(), 10);
    assert.equal(await page.locator('#tableBody tr').last().locator('td').count(), 4);
    await page.getByRole('button', { name: '删除第 10 栏', exact: true }).click();
    await page.getByRole('button', { name: '删除第 9 栏', exact: true }).click();
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
    const referenceEntries = [
      ['招生单位', '上海交通大学'], ['层次', '直博生'],
      ['院系所', '人工智能学院'], ['专业', '(081200)计算机科学与技术'],
      ['学习方式', '全日制'], ['研究方向', '不分研究方向'],
      ['导师', '陈思衡'], ['专项计划', '普通计划'],
      ['就业类型', '非定向就业']
    ];
    for (let entry = 0; entry < referenceEntries.length; entry++) {
      if (entry >= 8) await page.locator('#addEntry').click();
      const inputs = page.locator(`#entryEditor .entry-edit:nth-child(${entry + 1}) input`);
      for (let cell = 0; cell < 2; cell++) await inputs.nth(cell).fill(referenceEntries[entry][cell]);
    }
    assert.equal(await page.locator('#tableBody tr').last().locator('td').count(), 2);
    assert.equal(await page.locator('#tableBody tr').last().locator('td').last().getAttribute('colspan'), '3');
    await exportPNG('reference-figure-2.png', 1440, 1);
    await page.evaluate(() => localStorage.setItem('notice-generator-v1', JSON.stringify({
      body: '您好，距离国庆节还有5天，马上就要国庆假期了，要一起快乐起来吗？',
      status: '您于2026-09-25 14:00接受了一张快乐邀请函',
      rows: [['旧左', '内容一', '旧右', '内容二'], ['末项', '内容三', '', '']]
    })));
    await page.reload();
    assert.equal(await page.locator('#body').textContent(), '您好，距离国庆还有6天，马上就要国庆假期了，要一起快乐起来吗？');
    assert.equal(await page.locator('#status').textContent(), '您于2026-09-24 14:00接受了一张快乐邀请函');
    assert.equal(await page.locator('#entryEditor .entry-edit').count(), 3);
    assert.equal(await page.locator('#tableBody tr').count(), 2);
    assert.equal(await page.locator('#tableBody tr').last().locator('td').first().textContent(), '末项');
    assert.equal(await page.locator('#tableBody tr').last().locator('td').last().getAttribute('colspan'), '3');
    assert.deepEqual(errors, []);
    console.log('PASS: local-file loading, single-entry add/delete, odd-row layout, old-storage migration, persistence, mobile layout, PNG sizes, reset, figure-2 export; no browser errors.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

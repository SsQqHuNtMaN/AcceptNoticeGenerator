# 录取通知生成器

在线使用：[GitHub Pages](https://SsQqHuNtMaN.github.io/AcceptNoticeGenerator/)

双击 `index.html`，使用 Chrome 或 Edge 打开，无需安装、启动服务器或联网。

统一 HTML 模板参考提供图片中的浅蓝通知区、蓝色渐变标题、绿色确认状态及四列表格。初始文字为节日邀请内容，可以全部修改，没有区分恶搞和正式两套模板。页面仅供娱乐，请勿用于真实通知。

- 左侧修改内容，右侧实时预览；可选显示导航、姓名 / 副标题、发送单位和时间。
- 表格每次添加或删除一组「字段 + 内容」；两组排成一行，奇数项单独显示在最后一行左侧。旧版保存在浏览器里的表格内容会自动转换。
- 支持 960 / 1200 / 1440 像素宽度、16–30 像素字体、1× / 2× / 3× PNG 导出。
- 窄屏自动缩小预览，导出尺寸独立于预览大小。
- 内容自动保存在当前浏览器的本地存储中；不上传数据。浏览器限制本地存储时会显示提示。
- 点击「导出 PNG」，图片保存到浏览器下载目录。只导出通知区域，不包含编辑器。

请保留 `index.html`、`style.css`、`app.js` 和 `vendor` 文件夹的相对位置。字体使用系统中文字体，不同设备的字形和换行可能略有差异。

第三方依赖：随项目附带 html2canvas 1.4.1（MIT），许可证见 `vendor/html2canvas.LICENSE`。

## GitHub Pages 部署

仓库中的 `.github/workflows/deploy.yml` 会在每次推送到 `main` 后，把网页文件发布到 GitHub Pages。仓库的 **Settings → Pages → Build and deployment → Source** 需设置为 **GitHub Actions**。发布地址为 `https://SsQqHuNtMaN.github.io/AcceptNoticeGenerator/`。

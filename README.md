# 通知图片生成器

双击 `index.html`，使用 Chrome 或 Edge 打开，无需安装、启动服务器或联网。

统一 HTML 模板参考提供图片中的浅蓝通知区、蓝色渐变标题、绿色确认状态及四列表格。初始文字为节日邀请内容，可以全部修改，没有区分恶搞和正式两套模板。

- 左侧修改内容，右侧实时预览；可选显示导航、姓名 / 副标题、发送单位和时间。
- 表格每行两组「字段 + 内容」，可添加、删除行；右侧一组都留空时，左侧内容自动横跨剩余列。
- 支持 960 / 1200 / 1440 像素宽度、16–30 像素字体、1× / 2× / 3× PNG 导出。
- 窄屏自动缩小预览，导出尺寸独立于预览大小。
- 内容自动保存在当前浏览器的本地存储中；不上传数据。浏览器限制本地存储时会显示提示。
- 点击「导出 PNG」，图片保存到浏览器下载目录。只导出通知区域，不包含编辑器。

请保留 `index.html`、`style.css`、`app.js` 和 `vendor` 文件夹的相对位置。字体使用系统中文字体，不同设备的字形和换行可能略有差异。

第三方依赖：随项目附带 html2canvas 1.4.1（MIT），许可证见 `vendor/html2canvas.LICENSE`。

## GitHub Pages 部署

仓库中的 `.github/workflows/deploy.yml` 会在每次推送到 `main` 后，把网页文件发布到 GitHub Pages。仓库的 **Settings → Pages → Build and deployment → Source** 需设置为 **GitHub Actions**。发布地址通常为 `https://<用户名>.github.io/AcceptNoticeGenerator/`。

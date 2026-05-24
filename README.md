# Simple Homepage
A minimalist, customizable personal homepage deployed on Cloudflare Workers, with an admin panel for easy configuration.

<div align="center">
  <a href="#简体中文">简体中文</a> | <a href="#english">English</a>
</div>

---

## English

### Overview
Simple Homepage is a lightweight personal homepage designed specifically for deployment on Cloudflare Workers. It features a clean, modern UI with dark/light theme support, customizable personal information, social links, and a password-protected admin panel that allows you to update your site settings without editing any code.

### ✨ Features
- 🎨 Dark/light theme toggle with custom background color and image support
- 🔒 Password-protected admin panel for secure configuration
- 🖼️ Customizable avatar, name, motto, site title, and favicon
- 🔗 Built-in support for GitHub, Bilibili, and Email social links
- 📱 Fully responsive design optimized for mobile and desktop devices
- ⚡ Ultra-fast loading powered by Cloudflare's global edge network
- ✨ Smooth animations and interactive UI elements with ripple effects
- 🛡️ No database required - all configuration stored in Cloudflare KV

### 🚀 Deployment Guide (Cloudflare Workers)

#### Prerequisites
- A Cloudflare account (free tier available)
- A GitHub account

#### Step 1: Create a KV Namespace
1. Log in to your Cloudflare dashboard
2. Go to **Workers & Pages** > **KV**
3. Click **Create a namespace**
4. Name it `CONFIG_KV` and click **Add**

#### Step 2: Create a Worker
1. Go to **Workers & Pages** > **Overview**
2. Click **Create application** > **Create Worker**
3. Name your worker (e.g., `simple-homepage`) and click **Deploy**
4. Click **Quick edit** to open the code editor

#### Step 3: Deploy the Code
1. Delete all existing code in the editor
2. Copy the entire content of `worker.js` from this repository
3. Paste it into the Cloudflare code editor
4. Click **Save and deploy**

#### Step 4: Bind the KV Namespace
1. Go back to your Worker's main page
2. Click **Settings** > **Variables**
3. Under **KV Namespace Bindings**, click **Add binding**
4. Set **Variable name** to `CONFIG_KV`
5. Select the `CONFIG_KV` namespace you created earlier
6. Click **Save and deploy**

### 📝 Usage

#### Access the Admin Panel
1. Visit your deployed homepage
2. Add `#admin` to the end of the URL (e.g., `https://your-worker.your-account.workers.dev/#admin`)
3. Log in with the default password: `admin123`

#### Configure Your Homepage
After logging in, you can customize:
- Basic information (site title, name, motto, avatar, favicon)
- Social links (GitHub, Bilibili, Email)
- Appearance (background color, background image, dark/light theme)
- Admin password (highly recommended to change the default)

### ⚠️ Important Notes
- **Change the default admin password** immediately after first login
- All configuration changes are saved automatically to Cloudflare KV
- Background images should be direct URLs to image files
- The admin session is stored in your browser's sessionStorage and expires when you close the tab

### 📄 License
This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

---

## 简体中文

### 项目简介
Simple Homepage 是一个专为 Cloudflare Workers 设计的轻量级个人主页。它拥有简洁现代的用户界面，支持深色/浅色主题切换，可自定义个人信息和社交链接，并提供密码保护的管理面板，让你无需编辑任何代码即可更新网站设置。

### ✨ 功能特性
- 🎨 深色/浅色主题切换，支持自定义背景颜色和背景图片
- 🔒 密码保护的管理面板，确保配置安全
- 🖼️ 可自定义头像、姓名、格言、网站标题和图标
- 🔗 内置支持 GitHub、Bilibili 和 Email 社交链接
- 📱 完全响应式设计，完美适配手机和桌面设备
- ⚡ 依托 Cloudflare 全球边缘网络，加载速度极快
- ✨ 流畅的动画效果和交互式 UI 元素，包含涟漪特效
- 🛡️ 无需数据库，所有配置存储在 Cloudflare KV 中

### 🚀 部署指南 (Cloudflare Workers)

#### 前置要求
- 一个 Cloudflare 账户（免费版可用）
- 一个 GitHub 账户

#### 步骤 1：创建 KV 命名空间
1. 登录你的 Cloudflare 控制台
2. 进入 **Workers & Pages** > **KV**
3. 点击 **创建命名空间**
4. 命名为 `CONFIG_KV` 并点击 **添加**

#### 步骤 2：创建 Worker
1. 进入 **Workers & Pages** > **概览**
2. 点击 **创建应用程序** > **创建 Worker**
3. 为你的 Worker 命名（例如 `simple-homepage`）并点击 **部署**
4. 点击 **快速编辑** 打开代码编辑器

#### 步骤 3：部署代码
1. 删除编辑器中所有现有的代码
2. 复制本仓库中 `worker.js` 的全部内容
3. 粘贴到 Cloudflare 代码编辑器中
4. 点击 **保存并部署**

#### 步骤 4：绑定 KV 命名空间
1. 返回你的 Worker 主页面
2. 点击 **设置** > **变量**
3. 在 **KV 命名空间绑定** 下，点击 **添加绑定**
4. 设置 **变量名称** 为 `CONFIG_KV`
5. 选择你之前创建的 `CONFIG_KV` 命名空间
6. 点击 **保存并部署**

### 📝 使用方法

#### 访问管理面板
1. 访问你部署好的主页
2. 在 URL 末尾添加 `#admin`（例如 `https://your-worker.your-account.workers.dev/#admin`）
3. 使用默认密码登录：`admin123`

#### 配置你的主页
登录后，你可以自定义以下内容：
- 基本信息（网站标题、姓名、格言、头像、网站图标）
- 社交链接（GitHub、Bilibili、Email）
- 外观设置（背景颜色、背景图片、深色/浅色主题）
- 管理员密码（强烈建议修改默认密码）

### ⚠️ 重要提示
- **首次登录后请立即修改默认管理员密码**
- 所有配置更改会自动保存到 Cloudflare KV
- 背景图片应为图片文件的直接 URL
- 管理员会话存储在浏览器的 sessionStorage 中，关闭标签页后会过期

### 📄 许可证
本项目采用 **GNU General Public License v3.0** 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/Mornly">Mornly</a>
</div>

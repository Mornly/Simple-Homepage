// index.js - 个人主页（仅 me 板块）
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const KV = env.CONFIG_KV;

    const DEFAULT_CONFIG = {
      icon: '',
      title: 'My Page',
      avatar: '',
      name: 'Your Name',
      motto: 'This is my motto',
      github_link: '',
      bilibili_link: '',
      email_link: '',
      background_color: '#111111',
      theme: 'dark',
      background_image: '',
      admin_password: 'admin123'
    };

    async function getConfig() {
      const raw = await KV.get('site_config', 'json');
      return raw ? { ...DEFAULT_CONFIG, ...raw } : { ...DEFAULT_CONFIG };
    }

    async function saveConfig(config) {
      await KV.put('site_config', JSON.stringify(config));
      return config;
    }

    // API: 获取配置
    if (path === '/api/config' && method === 'GET') {
      const config = await getConfig();
      return new Response(JSON.stringify(config), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // API: 保存配置
    if (path === '/api/config' && method === 'PUT') {
      const password = request.headers.get('X-Admin-Password') || '';
      const currentConfig = await getConfig();
      if (password !== currentConfig.admin_password) {
        return new Response(JSON.stringify({ error: '密码错误' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      try {
        const body = await request.json();
        const newConfig = { ...currentConfig, ...body };
        await saveConfig(newConfig);
        return new Response(JSON.stringify({ success: true, config: newConfig }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: '无效的JSON数据' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const config = await getConfig();
    const configJSON = JSON.stringify(config).replace(/</g, '\\u003c');

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(config.title) || 'My Page'}</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⭐</text></svg>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <style>
        :root {
            --bg-color: #111111;
            --bg-gradient: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
            --text-primary: #f0f0f0;
            --text-secondary: #c0c0c0;
            --card-bg: rgba(30, 30, 30, 0.92);
            --card-border: rgba(255, 255, 255, 0.1);
            --input-bg: rgba(255, 255, 255, 0.06);
            --input-border: rgba(255, 255, 255, 0.18);
            --input-text: #f0f0f0;
            --btn-bg: rgba(255, 255, 255, 0.08);
            --btn-hover-bg: rgba(255, 255, 255, 0.18);
            --btn-active-bg: rgba(255, 255, 255, 0.25);
            --accent: #6cb4ee;
            --accent-hover: #8ec8f6;
            --danger: #e0556a;
            --danger-hover: #f07080;
            --success: #5cb878;
            --avatar-border: rgba(255, 255, 255, 0.5);
            --overlay-bg: rgba(0, 0, 0, 0.6);
            --scrollbar-thumb: rgba(255, 255, 255, 0.2);
            --scrollbar-track: transparent;
        }

        :root.light-theme {
            --bg-color: #e8ecf1;
            --bg-gradient: linear-gradient(135deg, #f0f3f6 0%, #dce1e8 100%);
            --text-primary: #1a1a2e;
            --text-secondary: #3a3a4e;
            --card-bg: rgba(255, 255, 255, 0.9);
            --card-border: rgba(0, 0, 0, 0.08);
            --input-bg: rgba(0, 0, 0, 0.04);
            --input-border: rgba(0, 0, 0, 0.2);
            --input-text: #1a1a2e;
            --btn-bg: rgba(0, 0, 0, 0.06);
            --btn-hover-bg: rgba(0, 0, 0, 0.12);
            --btn-active-bg: rgba(0, 0, 0, 0.18);
            --accent: #3a7ec8;
            --accent-hover: #5a9ee8;
            --overlay-bg: rgba(255, 255, 255, 0.5);
            --avatar-border: rgba(0, 0, 0, 0.35);
            --scrollbar-thumb: rgba(0, 0, 0, 0.2);
            --scrollbar-track: transparent;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        html {
            height: 100%;
        }

        body {
            font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
            background: var(--bg-gradient);
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            color: var(--text-primary);
            transition: background 0.5s ease, color 0.5s ease;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            position: relative;
            -webkit-tap-highlight-color: transparent;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
        }

        /* 背景图片层 */
        #bg-image-layer {
            position: fixed;
            inset: -20px;
            z-index: -1;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            filter: blur(2px) brightness(0.6);
            transform: scale(1.05);
            transition: opacity 0.8s ease;
            opacity: 0;
        }
        body.has-bg-image #bg-image-layer { opacity: 1; }
        .light-theme #bg-image-layer { filter: blur(2px) brightness(1.1); }

        .main-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 28px;
            animation: fadeInUp 0.7s cubic-bezier(0.22, 0.61, 0.36, 1) both;
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); filter: blur(4px); }
            to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }

        .me-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
            background: transparent;
            max-width: 90vw;
        }

        .avatar-wrapper {
            flex-shrink: 0;
            width: 110px;
            height: 110px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid var(--avatar-border);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            transition: transform 0.35s ease, border-color 0.4s ease, box-shadow 0.35s ease;
        }

        .avatar-wrapper:hover {
            transform: scale(1.06);
            border-color: rgba(255,255,255,0.8);
            box-shadow: 0 10px 28px rgba(0,0,0,0.45);
        }

        .avatar-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.5s ease;
        }
        .avatar-wrapper:hover img { transform: scale(1.08); }

        .avatar-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.08);
            font-size: 42px;
            color: var(--text-secondary);
        }

        .info-block {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-width: 0;
        }
        .info-name {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 0.02em;
            color: var(--text-primary);
            word-break: break-word;
            transition: transform 0.3s ease;
        }
        .info-name:hover { transform: translateY(-2px); }
        .info-motto {
            font-size: 15px;
            font-weight: 400;
            color: var(--text-secondary);
            line-height: 1.5;
            letter-spacing: 0.03em;
            word-break: break-word;
            transition: color 0.3s ease;
        }
        .info-motto:hover { color: var(--text-primary); }

        .btn-group {
            display: flex;
            gap: 18px;
            align-items: center;
            justify-content: center;
            animation: fadeInUp 0.7s ease 0.15s both;
        }

        .btn-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--btn-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--card-border);
            color: var(--text-primary);
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            position: relative;
            outline: none;
            -webkit-tap-highlight-color: transparent;
        }

        .btn-icon:hover {
            transform: translateY(-6px) scale(1.1);
            background: var(--btn-hover-bg);
            border-color: rgba(255,255,255,0.35);
            box-shadow: 0 12px 30px rgba(0,0,0,0.35);
            color: #fff;
        }
        .btn-icon:active {
            transform: translateY(-1px) scale(0.94);
            background: var(--btn-active-bg);
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            transition: all 0.08s ease;
        }

        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.35);
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out forwards;
            pointer-events: none;
        }
        @keyframes rippleEffect { to { transform: scale(4); opacity: 0; } }

        /* Admin 面板 */
        .admin-overlay {
            position: fixed;
            inset: 0;
            z-index: 100;
            background: var(--overlay-bg);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.4s ease;
        }
        .admin-overlay.active { opacity: 1; pointer-events: auto; }

        .admin-panel {
            background: var(--card-bg);
            backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px);
            border: 1px solid var(--card-border);
            border-radius: 20px;
            padding: 32px 28px;
            width: 92vw;
            max-width: 500px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.45);
            transform: translateY(20px) scale(0.94);
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
            opacity: 0;
            scrollbar-width: thin;
            scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
        }
        .admin-overlay.active .admin-panel { transform: translateY(0) scale(1); opacity: 1; }
        .admin-panel::-webkit-scrollbar { width: 5px; }
        .admin-panel::-webkit-scrollbar-track { background: var(--scrollbar-track); border-radius: 10px; }
        .admin-panel::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 10px; }

        .admin-panel h2 { font-size: 22px; font-weight: 700; margin-bottom: 20px; text-align: center; letter-spacing: 0.03em; color: var(--text-primary); }
        .admin-panel h3 { font-size: 15px; font-weight: 600; margin: 18px 0 8px; color: var(--text-primary); letter-spacing: 0.02em; padding-bottom: 6px; border-bottom: 1px solid var(--card-border); }

        .form-group { margin-bottom: 14px; }
        .form-group label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 5px; color: var(--text-secondary); letter-spacing: 0.02em; }
        .form-group input[type="text"],
        .form-group input[type="url"],
        .form-group input[type="password"],
        .form-group input[type="color"] {
            width: 100%;
            padding: 11px 14px;
            border-radius: 12px;
            border: 1px solid var(--input-border);
            background: var(--input-bg);
            color: var(--input-text);
            font-size: 14px;
            font-family: inherit;
            transition: all 0.25s ease;
            outline: none;
            letter-spacing: 0.02em;
        }
        .form-group input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(108,180,238,0.15); background: rgba(255,255,255,0.12); }
        .form-group input[type="color"] { padding: 4px 8px; height: 42px; cursor: pointer; min-width: 0; }

        .form-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .form-row .form-group { flex: 1; min-width: 120px; }

        .theme-toggle-group { display: flex; gap: 10px; flex-wrap: wrap; }
        .theme-option {
            flex: 1;
            min-width: 70px;
            padding: 10px 14px;
            border-radius: 12px;
            border: 2px solid var(--input-border);
            background: var(--input-bg);
            cursor: pointer;
            text-align: center;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.25s ease;
            color: var(--text-secondary);
            user-select: none;
        }
        .theme-option:hover { border-color: var(--accent); background: rgba(255,255,255,0.1); }
        .theme-option.active { border-color: var(--accent); background: rgba(108,180,238,0.18); color: var(--accent); font-weight: 600; box-shadow: 0 0 0 3px rgba(108,180,238,0.1); }

        .btn-row { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
        .btn {
            padding: 11px 22px;
            border-radius: 12px;
            border: 1px solid var(--card-border);
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            letter-spacing: 0.03em;
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-family: inherit;
            outline: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }
        .btn-save { background: var(--accent); color: #fff; border-color: var(--accent); flex: 1; min-width: 100px; }
        .btn-save:hover { background: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .btn-save:active { transform: scale(0.95); transition: all 0.08s ease; }
        .btn-cancel { background: transparent; color: var(--text-primary); flex: 1; min-width: 100px; }
        .btn-cancel:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); }
        .btn-cancel:active { transform: scale(0.95); transition: all 0.08s ease; }
        .btn-logout { background: transparent; color: var(--danger); border-color: var(--danger); font-size: 12px; padding: 8px 16px; }
        .btn-logout:hover { background: rgba(224,85,106,0.12); transform: translateY(-2px); }

        .password-panel { text-align: center; }
        .password-panel input { text-align: center; font-size: 18px; letter-spacing: 0.15em; }
        .password-panel .btn { margin-top: 8px; }

        .error-msg { color: var(--danger); font-size: 12px; margin-top: 4px; min-height: 18px; }
        .success-toast {
            position: fixed;
            top: 24px;
            left: 50%;
            transform: translateX(-50%) translateY(-120px);
            z-index: 200;
            background: var(--success);
            color: #fff;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 0.03em;
            box-shadow: 0 8px 28px rgba(0,0,0,0.4);
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            pointer-events: none;
        }
        .success-toast.show { transform: translateX(-50%) translateY(0); }

        @media (max-width: 600px) {
            .me-section { flex-direction: column; text-align: center; gap: 16px; }
            .avatar-wrapper { width: 96px; height: 96px; }
            .info-block { align-items: center; gap: 4px; }
            .info-name { font-size: 26px; }
            .info-motto { font-size: 14px; }
            .btn-icon { width: 44px; height: 44px; font-size: 18px; }
            .btn-group { gap: 14px; }
            .admin-panel { padding: 24px 18px; border-radius: 18px; max-height: 80vh; width: 94vw; }
        }

        @media (max-width: 380px) {
            .me-section { gap: 12px; }
            .avatar-wrapper { width: 78px; height: 78px; }
            .info-name { font-size: 20px; }
            .btn-icon { width: 40px; height: 40px; font-size: 16px; }
            .btn-group { gap: 10px; }
            .admin-panel { padding: 18px 12px; }
        }
    </style>
</head>
<body class="has-bg-image">
    <div id="bg-image-layer"></div>

    <div class="main-container" id="main-container">
        <div class="me-section" id="me-section">
            <div class="avatar-wrapper" id="avatar-wrapper">
                <img id="avatar-img" src="" alt="avatar" style="display:none;">
                <div class="avatar-placeholder" id="avatar-placeholder">
                    <i class="fa-solid fa-user"></i>
                </div>
            </div>
            <div class="info-block">
                <div class="info-name" id="info-name">${escapeHtml(config.name)}</div>
                <div class="info-motto" id="info-motto">${escapeHtml(config.motto)}</div>
            </div>
        </div>
        <div class="btn-group" id="btn-group">
            <a class="btn-icon" id="btn-github" href="${escapeHtml(config.github_link) || '#'}" target="_blank" rel="noopener" title="GitHub">
                <i class="fa-brands fa-github"></i>
            </a>
            <a class="btn-icon" id="btn-bilibili" href="${escapeHtml(config.bilibili_link) || '#'}" target="_blank" rel="noopener" title="Bilibili">
                <i class="fa-brands fa-bilibili"></i>
            </a>
            <a class="btn-icon" id="btn-email" href="${escapeHtml(config.email_link) || '#'}" target="_blank" rel="noopener" title="Email">
                <i class="fa-solid fa-envelope"></i>
            </a>
        </div>
    </div>

    <div class="admin-overlay" id="admin-overlay">
        <div class="admin-panel" id="admin-panel">
            <div id="admin-login-section" class="password-panel">
                <h2><i class="fa-solid fa-lock"></i> 管理员登录</h2>
                <div class="form-group">
                    <label for="admin-password-input">请输入密码</label>
                    <input type="password" id="admin-password-input" placeholder="••••••••" autocomplete="off">
                    <div class="error-msg" id="login-error"></div>
                </div>
                <div class="btn-row">
                    <button class="btn btn-save" id="btn-login"><i class="fa-solid fa-right-to-bracket"></i> 登录</button>
                    <button class="btn btn-cancel" id="btn-cancel-login"><i class="fa-solid fa-arrow-left"></i> 返回</button>
                </div>
            </div>
            <div id="admin-config-section" style="display:none;">
                <h2><i class="fa-solid fa-gear"></i> 网站配置</h2>
                <div style="text-align:right;margin-bottom:12px;">
                    <button class="btn btn-logout" id="btn-logout"><i class="fa-solid fa-right-from-bracket"></i> 退出登录</button>
                </div>

                <h3><i class="fa-solid fa-circle-info"></i> 基本信息</h3>
                <div class="form-group"><label>网站标题</label><input type="text" id="cfg-title" placeholder="My Page"></div>
                <div class="form-group"><label>网站图标 URL (imgurl)</label><input type="url" id="cfg-icon"></div>
                <div class="form-group"><label>名字</label><input type="text" id="cfg-name"></div>
                <div class="form-group"><label>个人格言</label><input type="text" id="cfg-motto"></div>
                <div class="form-group"><label>头像 URL (imgurl)</label><input type="url" id="cfg-avatar"></div>

                <h3><i class="fa-solid fa-link"></i> 链接设置</h3>
                <div class="form-group"><label>GitHub</label><input type="url" id="cfg-github"></div>
                <div class="form-group"><label>Bilibili</label><input type="url" id="cfg-bilibili"></div>
                <div class="form-group"><label>Email</label><input type="url" id="cfg-email"></div>

                <h3><i class="fa-solid fa-palette"></i> 背景设置</h3>
                <div class="form-row">
                    <div class="form-group"><label>背景颜色</label><input type="color" id="cfg-bg-color"></div>
                    <div class="form-group">
                        <label>网站色调</label>
                        <div class="theme-toggle-group">
                            <div class="theme-option active" data-theme="dark" id="theme-opt-dark"><i class="fa-solid fa-moon"></i> 深色</div>
                            <div class="theme-option" data-theme="light" id="theme-opt-light"><i class="fa-solid fa-sun"></i> 浅色</div>
                        </div>
                    </div>
                </div>
                <div class="form-group"><label>背景图片 URL (imgurl)</label><input type="url" id="cfg-bg-image"></div>

                <h3><i class="fa-solid fa-shield-halved"></i> 安全</h3>
                <div class="form-group"><label>修改密码（留空不修改）</label><input type="password" id="cfg-new-password" placeholder="新密码" autocomplete="off"></div>

                <div class="btn-row">
                    <button class="btn btn-save" id="btn-save-config"><i class="fa-solid fa-floppy-disk"></i> 保存配置</button>
                    <button class="btn btn-cancel" id="btn-close-admin"><i class="fa-solid fa-xmark"></i> 关闭</button>
                </div>
                <div class="error-msg" id="save-error" style="text-align:center;margin-top:8px;"></div>
            </div>
        </div>
    </div>

    <div class="success-toast" id="success-toast"><i class="fa-solid fa-circle-check"></i> 配置已保存</div>

    <script>
        (function() {
            const DEFAULT_CONFIG = ${JSON.stringify(DEFAULT_CONFIG)};
            let config = ${configJSON};

            let isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true';
            const storedPassword = sessionStorage.getItem('admin_password') || '';

            const body = document.body;
            const bgImageLayer = document.getElementById('bg-image-layer');
            const avatarImg = document.getElementById('avatar-img');
            const avatarPlaceholder = document.getElementById('avatar-placeholder');
            const infoName = document.getElementById('info-name');
            const infoMotto = document.getElementById('info-motto');
            const btnGithub = document.getElementById('btn-github');
            const btnBilibili = document.getElementById('btn-bilibili');
            const btnEmail = document.getElementById('btn-email');
            const adminOverlay = document.getElementById('admin-overlay');
            const adminLoginSection = document.getElementById('admin-login-section');
            const adminConfigSection = document.getElementById('admin-config-section');
            const loginError = document.getElementById('login-error');
            const saveError = document.getElementById('save-error');
            const successToast = document.getElementById('success-toast');

            function applyConfig(cfg) {
                config = { ...cfg };
                document.title = cfg.title || 'My Page';
                const faviconLink = document.querySelector('link[rel="icon"]');
                faviconLink.href = cfg.icon || "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⭐</text></svg>";

                if (cfg.avatar) {
                    avatarImg.src = cfg.avatar;
                    avatarImg.style.display = 'block';
                    avatarPlaceholder.style.display = 'none';
                } else {
                    avatarImg.src = '';
                    avatarImg.style.display = 'none';
                    avatarPlaceholder.style.display = 'flex';
                }
                infoName.textContent = cfg.name || 'Your Name';
                infoMotto.textContent = cfg.motto || 'This is my motto';

                function updateBtn(btn, url) {
                    if (url && url.trim()) { btn.href = url.trim(); btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
                    else { btn.href = '#'; btn.style.opacity = '0.4'; btn.style.pointerEvents = 'none'; }
                }
                updateBtn(btnGithub, cfg.github_link);
                updateBtn(btnBilibili, cfg.bilibili_link);
                updateBtn(btnEmail, cfg.email_link);

                body.style.backgroundColor = cfg.background_color || '#111111';
                document.documentElement.style.setProperty('--bg-color', cfg.background_color || '#111111');
                if (cfg.theme === 'light') document.documentElement.classList.add('light-theme');
                else document.documentElement.classList.remove('light-theme');

                if (cfg.background_image) {
                    bgImageLayer.style.backgroundImage = 'url(' + cfg.background_image + ')';
                    body.classList.add('has-bg-image');
                } else {
                    bgImageLayer.style.backgroundImage = '';
                    body.classList.remove('has-bg-image');
                }
                syncAdminFormValues(cfg);
            }

            function syncAdminFormValues(cfg) {
                document.getElementById('cfg-title').value = cfg.title || '';
                document.getElementById('cfg-icon').value = cfg.icon || '';
                document.getElementById('cfg-name').value = cfg.name || '';
                document.getElementById('cfg-motto').value = cfg.motto || '';
                document.getElementById('cfg-avatar').value = cfg.avatar || '';
                document.getElementById('cfg-github').value = cfg.github_link || '';
                document.getElementById('cfg-bilibili').value = cfg.bilibili_link || '';
                document.getElementById('cfg-email').value = cfg.email_link || '';
                document.getElementById('cfg-bg-color').value = cfg.background_color || '#111111';
                document.getElementById('cfg-bg-image').value = cfg.background_image || '';
                document.getElementById('cfg-new-password').value = '';
                document.getElementById('theme-opt-dark').classList.toggle('active', cfg.theme === 'dark');
                document.getElementById('theme-opt-light').classList.toggle('active', cfg.theme === 'light');
            }

            function addRipple(e) {
                const btn = e.currentTarget;
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = size + 'px';
                ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
                btn.appendChild(ripple);
                ripple.addEventListener('animationend', () => ripple.remove());
            }
            document.querySelectorAll('.btn-icon, .btn').forEach(b => b.addEventListener('click', addRipple));

            let toastTimer;
            function showToast(msg) {
                clearTimeout(toastTimer);
                successToast.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + (msg || '配置已保存');
                successToast.classList.add('show');
                toastTimer = setTimeout(() => successToast.classList.remove('show'), 2200);
            }

            function showAdminOverlay() {
                adminOverlay.classList.add('active');
                if (isAuthenticated && storedPassword) showAdminConfigUI();
                else showAdminLoginUI();
                document.body.style.overflow = 'hidden';
            }
            function hideAdminOverlay() {
                adminOverlay.classList.remove('active');
                document.body.style.overflow = '';
                if (window.location.hash === '#admin') history.replaceState(null, '', window.location.pathname + window.location.search);
            }
            function showAdminLoginUI() {
                adminLoginSection.style.display = 'block';
                adminConfigSection.style.display = 'none';
                document.getElementById('admin-password-input').value = '';
                loginError.textContent = '';
                isAuthenticated = false;
                sessionStorage.removeItem('admin_authenticated');
                sessionStorage.removeItem('admin_password');
                syncAdminFormValues(config);
            }
            function showAdminConfigUI() {
                adminLoginSection.style.display = 'none';
                adminConfigSection.style.display = 'block';
                loginError.textContent = '';
                saveError.textContent = '';
                syncAdminFormValues(config);
            }

            document.getElementById('btn-login').addEventListener('click', () => {
                const pwd = document.getElementById('admin-password-input').value.trim();
                if (!pwd) { loginError.textContent = '请输入密码'; return; }
                if (pwd === config.admin_password) {
                    isAuthenticated = true;
                    sessionStorage.setItem('admin_authenticated', 'true');
                    sessionStorage.setItem('admin_password', pwd);
                    showAdminConfigUI();
                } else {
                    loginError.textContent = '密码错误';
                    document.getElementById('admin-password-input').value = '';
                }
            });
            document.getElementById('btn-cancel-login').addEventListener('click', hideAdminOverlay);
            document.getElementById('btn-logout').addEventListener('click', () => {
                isAuthenticated = false;
                sessionStorage.removeItem('admin_authenticated');
                sessionStorage.removeItem('admin_password');
                showAdminLoginUI();
            });
            document.getElementById('btn-close-admin').addEventListener('click', hideAdminOverlay);
            adminOverlay.addEventListener('click', e => { if (e.target === adminOverlay) hideAdminOverlay(); });
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape' && adminOverlay.classList.contains('active')) hideAdminOverlay();
                if (e.key === 'Enter' && adminOverlay.classList.contains('active') && adminLoginSection.style.display !== 'none') {
                    document.getElementById('btn-login').click();
                }
            });

            document.getElementById('theme-opt-dark').addEventListener('click', function() {
                this.classList.add('active');
                document.getElementById('theme-opt-light').classList.remove('active');
            });
            document.getElementById('theme-opt-light').addEventListener('click', function() {
                this.classList.add('active');
                document.getElementById('theme-opt-dark').classList.remove('active');
            });

            document.getElementById('btn-save-config').addEventListener('click', async () => {
                saveError.textContent = '';
                const newConfig = {
                    title: document.getElementById('cfg-title').value.trim(),
                    icon: document.getElementById('cfg-icon').value.trim(),
                    name: document.getElementById('cfg-name').value.trim(),
                    motto: document.getElementById('cfg-motto').value.trim(),
                    avatar: document.getElementById('cfg-avatar').value.trim(),
                    github_link: document.getElementById('cfg-github').value.trim(),
                    bilibili_link: document.getElementById('cfg-bilibili').value.trim(),
                    email_link: document.getElementById('cfg-email').value.trim(),
                    background_color: document.getElementById('cfg-bg-color').value.trim(),
                    theme: document.getElementById('theme-opt-dark').classList.contains('active') ? 'dark' : 'light',
                    background_image: document.getElementById('cfg-bg-image').value.trim(),
                    admin_password: config.admin_password,
                };
                const newPassword = document.getElementById('cfg-new-password').value.trim();
                if (newPassword) newConfig.admin_password = newPassword;
                const currentPassword = storedPassword || config.admin_password;

                try {
                    const resp = await fetch('/api/config', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': currentPassword },
                        body: JSON.stringify(newConfig)
                    });
                    if (!resp.ok) throw new Error((await resp.json()).error || '保存失败');
                    const result = await resp.json();
                    applyConfig(result.config || newConfig);
                    if (newPassword) sessionStorage.setItem('admin_password', newPassword);
                    showToast('配置已保存');
                    setTimeout(hideAdminOverlay, 800);
                } catch (err) {
                    saveError.textContent = err.message;
                }
            });

            function handleHashChange() {
                if (window.location.hash === '#admin') showAdminOverlay();
                else if (adminOverlay.classList.contains('active')) hideAdminOverlay();
            }
            window.addEventListener('hashchange', handleHashChange);

            applyConfig(config);
            if (window.location.hash === '#admin') showAdminOverlay();

            function escapeHtml(str) {
                return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
            }
        })();
    </script>
</body>
</html>`;

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
    }

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' },
    });
  }
};

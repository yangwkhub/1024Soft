/**
 * 一次性示例数据生成器（pnpm seed）。
 * 生成的 content/software/*.md 严格遵循 src/content.config.ts 的 Zod schema。
 * 注意：这些是「演示用种子数据」，版本号/发布日期请在正式上线前按官网复核。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = resolve(ROOT, 'content/software');
const CHECKED = '2026-11-04';

// 下载量静态快照：零后端方案下由维护者录入，接入外部统计后可直接替换本表
const DOWNLOADS = {
  vlc: 1862400, firefox: 1528600, '7zip': 1374500, libreoffice: 986300, gimp: 742100,
  notepadpp: 689500, 'obs-studio': 631800, audacity: 578400, blender: 512700, bitwarden: 468900,
  qbittorrent: 419600, everything: 386200, thunderbird: 352800, inkscape: 318400, krita: 287500,
  handbrake: 264300, keepassxc: 241700, joplin: 218900, sharex: 196400, syncthing: 183200,
  pdf24: 168700, peazip: 154300, zotero: 147600, vscodium: 138900, drawio: 126500,
  jellyfin: 114800, rustdesk: 103600, nextcloud: 92600, sqlitebrowser: 84700, tabby: 76300
};

const S = (slug, name, tagline, description_md, o) => ({ slug, name, tagline, description_md, ...o });

const items = [
  S('7zip', '7-Zip', '开源免费的超高压缩比归档工具',
    '支持 7z、ZIP、RAR、TAR、GZIP 等格式的压缩与解压，体积不到 2 MB，无广告、无捆绑、无后台常驻进程。自带命令行版本便于脚本批量归档，是替代商业压缩软件的首选，也常被用作其他软件的解压内核。',
    { version: '24.09', developer: 'Igor Pavlov', homepage_url: 'https://www.7-zip.org/', repo_url: 'https://github.com/ip7z/7zip', download_url: 'https://www.7-zip.org/download.html', license_code: 'LGPL-2.1', pricing: 'free', is_open_source: true, platforms: ['windows', 'linux'], categories: ['file-management'], released_at: '2024-11-29', featured: true, weight: 96, risk_level: 'low', seo_title: '7-Zip 免费开源压缩解压软件 - 1024Soft', seo_description: '7-Zip 是经典的开源免费压缩工具，支持 7z/ZIP/RAR，无广告无捆绑，提供便携版与命令行。',
      review: '压缩比与稳定性长期领先，界面朴素但零学习成本。官方安装包不含任何推广组件，右键菜单集成度好，老机器上依然是首选。',
      scenes: ['大文件归档、按卷分卷压缩', '批量脚本化打包与解包', '需要 AES-256 加密压缩包'] }),

  S('peazip', 'PeaZip', '支持上百种格式的开源压缩管理器',
    '基于 7-Zip、p7zip 与 FreeArc 等开源内核的图形化压缩前端，可读写 200 多种归档格式，提供文件校验、加密、批量转换与压缩包内预览。界面比原生 7-Zip 更现代，并且提供 Windows 与 Linux 的便携版本，适合需要频繁处理冷门格式的用户。',
    { version: '10.x', developer: 'Giorgio Tani', homepage_url: 'https://peazip.github.io/', repo_url: 'https://github.com/peazip/PeaZip', download_url: 'https://github.com/peazip/PeaZip/releases', license_code: 'LGPL-3.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'linux', 'macos'], categories: ['file-management'], released_at: '2025-01-15', featured: false, weight: 82, risk_level: 'low', seo_title: 'PeaZip 免费开源压缩软件 - 1024Soft', seo_description: 'PeaZip 是跨平台的开源压缩管理器，支持 200 多种归档格式、加密与批量转换，提供便携版。',
      review: '如果你常被 RAR、ISO、ZPAQ 之类的冷门格式卡住，PeaZip 比原生工具省心得多，且全程无广告。',
      scenes: ['处理多种冷门归档格式', '批量校验与生成哈希', '需要便携版在 U 盘里使用'] }),

  S('vlc', 'VLC media player', '几乎能播一切的跨平台播放器',
    '由 VideoLAN 社区维护的自由软件播放器，内置绝大多数音视频编解码器，无需额外安装解码包即可播放本地文件、光盘、网络流与摄像头输入。支持字幕自动匹配、倍速播放、画面滤镜与格式转码，界面简洁且完全不含广告与推广组件。',
    { version: '3.0.x', developer: 'VideoLAN', homepage_url: 'https://www.videolan.org/vlc/', repo_url: 'https://github.com/videolan/vlc', download_url: 'https://www.videolan.org/vlc/download-windows.html', license_code: 'GPL-2.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux', 'android', 'ios'], categories: ['media'], released_at: '2024-06-01', featured: true, weight: 95, risk_level: 'low', seo_title: 'VLC 免费开源视频播放器 - 1024Soft', seo_description: 'VLC 是跨平台开源播放器，内置全格式解码、字幕匹配与网络流播放，无广告无捆绑。',
      review: '十几年来最稳的「万能播放器」，尤其适合播放编码不规范的本地文件。唯一的代价是高级设置项藏得比较深。',
      scenes: ['播放任意编码的本地视频', '网络串流与局域网投屏', '快速转码、截取片段'] }),

  S('vscodium', 'VSCodium', '去掉遥测的 VS Code 开源构建',
    '基于 VS Code 源码的社区发行版，保留完整的编辑、调试与扩展开发体验，但移除了微软的遥测上报、专有品牌资源与官方扩展市场限制。默认使用开源的 Open VSX 扩展仓库，配置与快捷键与 VS Code 完全兼容，可以直接沿用原有习惯。',
    { version: '1.x', developer: 'VSCodium Community', homepage_url: 'https://vscodium.com/', repo_url: 'https://github.com/VSCodium/vscodium', download_url: 'https://github.com/VSCodium/vscodium/releases', license_code: 'MIT', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux'], categories: ['dev-tools'], released_at: '2025-03-01', featured: true, weight: 93, risk_level: 'low', seo_title: 'VSCodium 开源无遥测代码编辑器 - 1024Soft', seo_description: 'VSCodium 是去掉遥测与专有品牌的 VS Code 开源构建，兼容原有配置，使用 Open VSX 扩展市场。',
      review: '对隐私敏感又离不开 VS Code 生态的开发者，几乎是无痛切换；扩展市场覆盖略小是唯一需要权衡的点。',
      scenes: ['日常代码编辑与调试', '需要禁用遥测的合规开发环境', '轻量替代完整 IDE'] }),

  S('firefox', 'Mozilla Firefox', '注重隐私的独立内核浏览器',
    '由 Mozilla 基金会维护的开源浏览器，使用独立的 Gecko 引擎，不依赖 Chromium 体系。内置增强型跟踪保护、指纹识别拦截与容器标签页，配合 uBlock Origin 等扩展可实现强隐私保护。同步服务可选自建，账号并非使用浏览器的必要条件。',
    { version: '13x', developer: 'Mozilla', homepage_url: 'https://www.mozilla.org/firefox/', repo_url: 'https://github.com/mozilla-firefox/firefox', download_url: 'https://www.mozilla.org/firefox/download/thanks/', license_code: 'MPL-2.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux', 'android', 'ios'], categories: ['security'], released_at: '2025-06-01', featured: true, weight: 92, risk_level: 'low', seo_title: 'Firefox 免费开源隐私浏览器 - 1024Soft', seo_description: 'Firefox 是 Mozilla 出品的独立内核开源浏览器，内置跟踪保护与容器标签，无需账号即可使用。',
      review: '在 Chromium 一家独大的环境里，保持第二个可用内核本身就是价值；隐私默认值也比多数浏览器保守。',
      scenes: ['注重隐私的日常上网', 'Web 开发跨内核兼容性测试', '需要强大扩展与用户样式'] }),

  S('gimp', 'GIMP', '功能完整的开源图像编辑器',
    'GNU 图像操作程序，提供图层、蒙版、通道、路径、选区与大量滤镜，支持脚本化批处理（Script-Fu 与 Python-Fu）。可读写 PSD、PNG、JPEG、WebP、TIFF 等格式，插件生态成熟，是无需订阅即可完成专业修图与合成的主流开源方案。',
    { version: '3.x', developer: 'GIMP Team / GNOME', homepage_url: 'https://www.gimp.org/', repo_url: 'https://github.com/GNOME/gimp', download_url: 'https://www.gimp.org/downloads/', license_code: 'GPL-3.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux'], categories: ['graphics'], released_at: '2025-03-16', featured: true, weight: 90, risk_level: 'low', seo_title: 'GIMP 免费开源图像编辑软件 - 1024Soft', seo_description: 'GIMP 是跨平台开源图像编辑器，支持图层蒙版、批处理与 PSD 读写，是 Photoshop 的免费替代方案。',
      review: '3.x 之后界面与色深支持改善明显。学习曲线仍偏陡，但一旦熟悉图层与非破坏性思路，日常修图完全够用。',
      scenes: ['照片修图与合成', '批量导出与格式转换', '需要可脚本化的图像处理流水线'] }),

  S('krita', 'Krita', '为数字绘画而生的开源画笔工具',
    '专注插画与概念设计的开源绘画软件，提供上百种笔刷引擎、笔刷稳定器、矢量图层、动画时间轴与色彩管理。支持 PSD 互操作与 OCIO 色彩配置，界面针对数位板做了专门优化，压感与笔刷手感在免费软件中属于第一梯队。',
    { version: '5.x', developer: 'KDE / Krita Foundation', homepage_url: 'https://krita.org/', repo_url: 'https://github.com/KDE/krita', download_url: 'https://krita.org/download/', license_code: 'GPL-3.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux', 'android'], categories: ['graphics'], released_at: '2025-02-01', featured: false, weight: 88, risk_level: 'low', seo_title: 'Krita 免费开源数字绘画软件 - 1024Soft', seo_description: 'Krita 是面向插画师的开源绘画工具，提供专业笔刷、动画时间轴与色彩管理，支持数位板压感。',
      review: '如果目标是「画画」而不是「修照片」，Krita 比通用图像编辑器顺手太多，笔刷响应尤其出色。',
      scenes: ['插画、漫画与概念设计', '逐帧动画与分镜', '搭配数位板进行创作'] }),

  S('inkscape', 'Inkscape', '开源矢量图形与 SVG 编辑器',
    '功能完整的矢量绘图工具，以 SVG 为原生格式，支持节点编辑、路径布尔运算、克隆、文本绕排与多页画布。可导入导出 PDF、EPS、DXF、PNG 等格式，适合制作图标、流程图、海报与激光切割图纸，且完全遵循开放标准。',
    { version: '1.x', developer: 'Inkscape Community', homepage_url: 'https://inkscape.org/', repo_url: 'https://gitlab.com/inkscape/inkscape', download_url: 'https://inkscape.org/release/', license_code: 'GPL-2.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux'], categories: ['graphics'], released_at: '2024-11-01', featured: false, weight: 86, risk_level: 'low', seo_title: 'Inkscape 免费开源矢量绘图软件 - 1024Soft', seo_description: 'Inkscape 是原生 SVG 的开源矢量编辑器，支持节点编辑、布尔运算与多格式导出，适合图标与流程图。',
      review: '开放 SVG 格式带来的好处是文件可以直接进版本库、用脚本处理，这一点是闭源工具很难替代的。',
      scenes: ['绘制图标与界面素材', '制作可缩放海报与示意图', '批量 SVG 导出为 PNG/PDF'] }),

  S('libreoffice', 'LibreOffice', '完整可用的开源办公套件',
    '包含 Writer、Calc、Impress、Draw、Math 与 Base 六大组件的办公套件，原生使用开放文档格式 ODF，并能读写 Microsoft Office 的 docx/xlsx/pptx。提供宏与命令行转换能力，无订阅、无广告、可离线使用，是替代付费办公软件的成熟方案。',
    { version: '25.x', developer: 'The Document Foundation', homepage_url: 'https://www.libreoffice.org/', repo_url: 'https://github.com/LibreOffice/core', download_url: 'https://www.libreoffice.org/download/download-libreoffice/', license_code: 'MPL-2.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux'], categories: ['office'], released_at: '2025-07-01', featured: true, weight: 94, risk_level: 'low', seo_title: 'LibreOffice 免费开源办公套件 - 1024Soft', seo_description: 'LibreOffice 提供文字、表格、演示与绘图六大组件，兼容 docx/xlsx/pptx，无订阅无广告。',
      review: '绝大多数日常文档场景可以直接换过去。真正需要谨慎的是复杂样式与 VBA 宏密集的历史文件。',
      scenes: ['日常文档与表格处理', '批量转换文档为 PDF', '在无网络环境离线办公'] }),

  S('obs-studio', 'OBS Studio', '免费开源的直播与录屏工作台',
    '提供场景、来源、混音器、滤镜与转场等专业直播能力，支持窗口捕获、游戏捕获、摄像头与多路音频，推流协议与编码器可自定义。插件生态覆盖虚拟摄像头、降噪、字幕与多路推流，且不需要账号即可使用全部本地功能。',
    { version: '31.x', developer: 'OBS Project', homepage_url: 'https://obsproject.com/', repo_url: 'https://github.com/obsproject/obs-studio', download_url: 'https://obsproject.com/download', license_code: 'GPL-2.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux'], categories: ['media'], released_at: '2025-04-01', featured: true, weight: 91, risk_level: 'low', seo_title: 'OBS Studio 免费开源录屏直播软件 - 1024Soft', seo_description: 'OBS Studio 是跨平台开源直播录屏工具，提供场景混音、插件生态与自定义推流，无需账号即可使用。',
      review: '免费软件里少有的「专业级」产品。设置项多但向导够用，学会场景与来源两个概念后即可上手。',
      scenes: ['课程与会议录制', '游戏直播与多路推流', '虚拟摄像头与画面合成'] }),

  S('audacity', 'Audacity', '轻量直观的开源音频编辑器',
    '跨平台的波形音频编辑工具，支持多轨录制、剪辑、降噪、均衡器、淡入淡出与批量处理，可导入导出 WAV、MP3、FLAC、OGG 等格式。内置 Nyquist 脚本与效果链，适合播客剪辑、语音降噪与简单的音乐处理，界面无需学习成本。',
    { version: '3.x', developer: 'Audacity Team / Muse Group', homepage_url: 'https://www.audacityteam.org/', repo_url: 'https://github.com/audacity/audacity', download_url: 'https://www.audacityteam.org/download/', license_code: 'GPL-2.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux'], categories: ['media'], released_at: '2025-01-01', featured: false, weight: 85, risk_level: 'low', seo_title: 'Audacity 免费开源音频编辑软件 - 1024Soft', seo_description: 'Audacity 是跨平台开源音频编辑器，支持多轨剪辑、降噪与批量导出，适合播客与语音处理。',
      review: '非破坏性编辑能力不如专业 DAW，但「打开就能剪、剪完就能导出」这件事它做得最好。',
      scenes: ['播客与人声剪辑', '录音降噪与音量标准化', '老磁带、语音素材数字化'] }),

  S('handbrake', 'HandBrake', '开源视频转码与压缩工具',
    '把 DVD、蓝光与常见视频文件转码为 MP4、MKV 或 WebM 的开源工具，内置设备预设、字幕轨道、章节、滤镜与批量队列。支持 x264/x265/AV1 编码器与硬件加速，可在不损失可观看性的前提下显著缩小视频体积。',
    { version: '1.x', developer: 'HandBrake Team', homepage_url: 'https://handbrake.fr/', repo_url: 'https://github.com/HandBrake/HandBrake', download_url: 'https://handbrake.fr/downloads.php', license_code: 'GPL-2.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux'], categories: ['media'], released_at: '2024-12-01', featured: false, weight: 84, risk_level: 'low', seo_title: 'HandBrake 免费开源视频转码软件 - 1024Soft', seo_description: 'HandBrake 是开源视频转码工具，支持 MP4/MKV/WebM、字幕轨道与批量队列，可显著压缩视频体积。',
      review: '预设已经覆盖大多数设备，先用默认参数跑一遍再微调，比从零研究编码器参数高效得多。',
      scenes: ['压缩课程录像与视频素材', '提取并保留字幕轨道', '批量转码为移动端可播放格式'] }),

  S('qbittorrent', 'qBittorrent', '无广告的开源 BT 下载客户端',
    '轻量且功能完整的 BitTorrent 客户端，内置搜索引擎、RSS 订阅自动下载、带宽调度、IP 过滤与 Web UI，支持磁力链接与 DHT。界面无广告、无推广插件，可通过 Web UI 在 NAS 或服务器上远程管理下载任务。',
    { version: '5.x', developer: 'qBittorrent Community', homepage_url: 'https://www.qbittorrent.org/', repo_url: 'https://github.com/qbittorrent/qBittorrent', download_url: 'https://www.qbittorrent.org/download', license_code: 'GPL-2.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux'], categories: ['network'], released_at: '2025-02-01', featured: false, weight: 83, risk_level: 'medium', seo_title: 'qBittorrent 免费开源 BT 客户端 - 1024Soft', seo_description: 'qBittorrent 是无广告开源 BT 客户端，支持 RSS 订阅、Web UI 与带宽调度，可用于合法开源镜像分发。',
      review: '开源客户端里最接近「装完不用调」的一款。Web UI 让它很适合放在家庭服务器里长期运行。',
      scenes: ['下载 Linux 镜像等合法开源资源', '通过 Web UI 远程管理任务', 'RSS 自动化订阅公开分发源'] }),

  S('bitwarden', 'Bitwarden', '可自托管的开源密码管理器',
    '端到端加密的密码管理器，支持跨设备同步、密码生成器、双因素验证码、安全共享与数据泄露检测。客户端与服务端均开源，个人版完全免费，企业可选择自建服务，浏览器扩展与桌面、移动端体验一致，支持导入主流密码库。',
    { version: '2025.x', developer: 'Bitwarden Inc.', homepage_url: 'https://bitwarden.com/', repo_url: 'https://github.com/bitwarden/clients', download_url: 'https://bitwarden.com/download/', license_code: 'GPL-3.0', pricing: 'freemium', is_open_source: true, platforms: ['windows', 'macos', 'linux', 'android', 'ios'], categories: ['security'], released_at: '2025-08-01', featured: true, weight: 93, risk_level: 'low', seo_title: 'Bitwarden 免费开源密码管理器 - 1024Soft', seo_description: 'Bitwarden 是端到端加密的开源密码管理器，免费版支持无限设备同步、密码生成与跨平台客户端。',
      review: '免费版的完成度非常高，且代码可审计。注意它属于免费增值模式，部分高级功能需要付费订阅。',
      scenes: ['跨设备管理与自动填充密码', '生成高强度随机密码', '团队内部安全共享凭据'] }),

  S('keepassxc', 'KeePassXC', '完全离线的本地密码保险库',
    '以本地加密数据库（KDBX）为核心的密码管理器，不依赖任何云端账号即可使用，支持浏览器扩展自动填充、TOTP 验证码、SSH Agent 与密钥文件双因子解锁。数据库可用任意网盘自行同步，适合不希望把密码交给第三方服务的用户。',
    { version: '2.7.x', developer: 'KeePassXC Team', homepage_url: 'https://keepassxc.org/', repo_url: 'https://github.com/keepassxc/keepassxc', download_url: 'https://keepassxc.org/download/', license_code: 'GPL-3.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux'], categories: ['security'], released_at: '2024-09-01', featured: false, weight: 89, risk_level: 'low', seo_title: 'KeePassXC 免费离线密码管理器 - 1024Soft', seo_description: 'KeePassXC 使用本地 KDBX 加密库管理密码，无需云端账号，支持 TOTP 与浏览器自动填充。',
      review: '把数据完全握在自己手里，代价是同步与备份要自己负责。对不愿使用云服务的用户，这是最稳妥的解法。',
      scenes: ['完全离线的密码保管', '配合自有网盘多设备同步', '管理 TOTP 与 SSH 密钥'] }),

  S('syncthing', 'Syncthing', '去中心化的开源文件同步工具',
    '点对点的连续文件同步工具，设备之间通过 TLS 加密直接传输，不需要中心服务器或账号。支持版本控制、单向同步、忽略规则与按需扫描，提供 Web 管理界面与命令行，适合在多台电脑、NAS 与手机之间同步个人文件。',
    { version: '1.x', developer: 'Syncthing Foundation', homepage_url: 'https://syncthing.net/', repo_url: 'https://github.com/syncthing/syncthing', download_url: 'https://syncthing.net/downloads/', license_code: 'MPL-2.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux', 'android'], categories: ['file-management'], released_at: '2025-05-01', featured: true, weight: 90, risk_level: 'low', seo_title: 'Syncthing 免费开源点对点文件同步 - 1024Soft', seo_description: 'Syncthing 是去中心化的开源文件同步工具，设备间 TLS 直连、无需账号，支持版本控制与 Web 管理。',
      review: '没有账号、没有服务端、没有容量限制，配置一次之后基本可以忘掉它的存在，这是最难得的。',
      scenes: ['多设备间自动同步工作目录', 'NAS 与笔记本之间备份照片', '不经过第三方云的文件共享'] }),

  S('nextcloud', 'Nextcloud', '功能完整的自托管私有云平台',
    '开源的私有云套件，提供文件同步与共享、日历、联系人、在线文档协作、相册与视频会议，并可通过应用商店扩展。服务端由自己部署，数据不经过第三方，客户端覆盖桌面、移动端与 Web，适合家庭、团队或组织搭建自有协作空间。',
    { version: '31.x', developer: 'Nextcloud GmbH / Community', homepage_url: 'https://nextcloud.com/', repo_url: 'https://github.com/nextcloud/server', download_url: 'https://nextcloud.com/install/', license_code: 'AGPL-3.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux', 'android', 'ios'], categories: ['network'], released_at: '2025-02-01', featured: false, weight: 87, risk_level: 'low', seo_title: 'Nextcloud 免费开源自托管私有云 - 1024Soft', seo_description: 'Nextcloud 是可自建的开源私有云，提供文件同步、日历、在线协作与丰富应用生态，数据完全由自己掌控。',
      review: '功能覆盖面是同类里最广的，但也要接受「你在运维一套服务」这件事。建议从 Docker 单实例起步。',
      scenes: ['搭建家庭或团队私有网盘', '替换第三方日历与联系人服务', '内部文档在线协作'] }),

  S('jellyfin', 'Jellyfin', '无订阅的开源媒体服务器',
    '把本地影视、音乐与照片整理成可跨设备访问的媒体库，服务端完全开源且由自己托管，支持硬件转码、元数据刮削、字幕、多用户权限与家长控制。无付费墙、无账号绑定、无远程遥测，客户端覆盖 Web、移动端、电视与第三方播放器。',
    { version: '10.x', developer: 'Jellyfin Contributors', homepage_url: 'https://jellyfin.org/', repo_url: 'https://github.com/jellyfin/jellyfin', download_url: 'https://jellyfin.org/download/', license_code: 'GPL-2.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux', 'android', 'ios'], categories: ['network'], released_at: '2025-05-01', featured: false, weight: 86, risk_level: 'low', seo_title: 'Jellyfin 免费开源媒体服务器 - 1024Soft', seo_description: 'Jellyfin 是自托管的开源媒体服务器，提供媒体库、硬件转码与多用户权限，无订阅无遥测。',
      review: '从闭源方案分叉而来，社区版把原本收费的硬件转码与客户端能力都放开了，部署门槛也不高。',
      scenes: ['家庭影视库整理与跨设备播放', '音乐与照片集中管理', '为不同成员设置独立账号与权限'] }),

  S('blender', 'Blender', '全流程开源的三维创作套件',
    '覆盖建模、雕刻、绑定、动画、渲染、合成、视频剪辑与物理仿真的三维创作套件，内置 Cycles 与 Eevee 渲染引擎、Geometry Nodes 程序化建模与 Python 脚本接口。完全免费且无功能限制，社区插件与教程资源极其丰富。',
    { version: '4.x', developer: 'Blender Foundation', homepage_url: 'https://www.blender.org/', repo_url: 'https://github.com/blender/blender', download_url: 'https://www.blender.org/download/', license_code: 'GPL-3.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux'], categories: ['graphics'], released_at: '2025-03-01', featured: true, weight: 92, risk_level: 'low', seo_title: 'Blender 免费开源三维建模渲染软件 - 1024Soft', seo_description: 'Blender 是全流程开源三维创作套件，涵盖建模、动画、渲染与合成，内置 Cycles/Eevee，无功能限制。',
      review: '开源软件里少见的「工业级且完全免费」。快捷键体系需要投入时间，但官方教程与社区资源足够丰富。',
      scenes: ['三维建模与产品可视化', '动画与短片渲染', '程序化建模与批量渲染脚本'] }),

  S('thunderbird', 'Mozilla Thunderbird', '开源可离线的邮件与日程客户端',
    '由 Mozilla 社区维护的桌面邮件客户端，支持多账户统一收件箱、IMAP/POP、OpenPGP 端到端加密、日历与任务、消息过滤与强大的插件体系。全部邮件可离线保存在本地，不绑定任何厂商云服务，账号与数据由用户自己掌控。',
    { version: '12x', developer: 'MZLA Technologies / Mozilla', homepage_url: 'https://www.thunderbird.net/', repo_url: 'https://github.com/mozilla/releases-comm-central', download_url: 'https://www.thunderbird.net/download/', license_code: 'MPL-2.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux'], categories: ['office'], released_at: '2025-07-01', featured: false, weight: 84, risk_level: 'low', seo_title: 'Thunderbird 免费开源邮件客户端 - 1024Soft', seo_description: 'Thunderbird 是开源桌面邮件客户端，支持多账户、OpenPGP 加密、日历与离线存档，不绑定云服务。',
      review: '在网页邮箱成为默认选项的今天，本地归档、全文检索与加密邮件仍是它不可替代的理由。',
      scenes: ['多邮箱统一管理与离线存档', '需要 OpenPGP 加密通信', '日历与任务的本地化管理'] }),

  S('zotero', 'Zotero', '开源文献管理与引用生成工具',
    '面向研究写作的参考文献管理工具，可通过浏览器扩展一键抓取论文元数据与 PDF，支持分组、标签、全文检索、笔记与批注。内置 Word / LibreOffice 插件与数千种引用格式，支持 WebDAV 或自建同步，个人版完全免费。',
    { version: '7.x', developer: 'Corporation for Digital Scholarship', homepage_url: 'https://www.zotero.org/', repo_url: 'https://github.com/zotero/zotero', download_url: 'https://www.zotero.org/download/', license_code: 'AGPL-3.0', pricing: 'freemium', is_open_source: true, platforms: ['windows', 'macos', 'linux'], categories: ['office'], released_at: '2025-01-01', featured: false, weight: 85, risk_level: 'low', seo_title: 'Zotero 免费开源文献管理软件 - 1024Soft', seo_description: 'Zotero 是开源文献管理工具，可抓取论文元数据、管理 PDF 并自动生成引用，支持 Word 与 LibreOffice。',
      review: '抓取准确率和引用样式覆盖是它的护城河。免费同步空间有限，但换成 WebDAV 就能完全绕开。',
      scenes: ['论文与 PDF 资料库管理', '自动生成参考文献与书目', '写作时一键插入引用'] }),

  S('joplin', 'Joplin', '支持端到端加密的开源笔记应用',
    '以本地 Markdown 文件为核心的笔记工具，支持笔记本层级、标签、待办、全文搜索、富文本与 Markdown 双模式编辑、网页剪藏与端到端加密同步。可同步到 Nextcloud、Dropbox、WebDAV 或自建 Joplin Server，数据随时可导出。',
    { version: '3.x', developer: 'Joplin Team', homepage_url: 'https://joplinapp.org/', repo_url: 'https://github.com/laurent22/joplin', download_url: 'https://joplinapp.org/download/', license_code: 'MIT', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux', 'android', 'ios'], categories: ['office'], released_at: '2025-04-01', featured: true, weight: 88, risk_level: 'low', seo_title: 'Joplin 免费开源 Markdown 笔记软件 - 1024Soft', seo_description: 'Joplin 是本地优先的开源笔记应用，Markdown 存储、端到端加密同步，支持 WebDAV 与自建服务器。',
      review: '纯文本存储 + 可选同步，意味着数据永远不会被锁死在某个服务里。插件生态让它可以很轻，也可以很重。',
      scenes: ['长期沉淀个人知识库', '需要离线与端到端加密的笔记', '从其他笔记工具迁移 Markdown'] }),

  S('drawio', 'diagrams.net', '无需账号的开源流程图工具',
    '浏览器内即可运行的绘图工具，可绘制流程图、UML、ER 图、网络拓扑与界面原型，图形库丰富且支持自定义形状。文件可保存到本地、GitHub、Google Drive 或 Nextcloud，也可下载为桌面版离线使用，全程无需注册账号。',
    { version: '26.x', developer: 'JGraph Ltd', homepage_url: 'https://app.diagrams.net/', repo_url: 'https://github.com/jgraph/drawio', download_url: 'https://github.com/jgraph/drawio/releases', license_code: 'Apache-2.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux'], categories: ['dev-tools'], released_at: '2025-06-01', featured: false, weight: 87, risk_level: 'low', seo_title: 'diagrams.net 免费开源流程图工具 - 1024Soft', seo_description: 'diagrams.net（draw.io）是无需账号的开源绘图工具，支持流程图、UML 与网络拓扑，可完全离线使用。',
      review: '打开网页就能画、保存的是自己电脑上的文件，这两点让它在团队协作与临时作图场景里几乎没有对手。',
      scenes: ['绘制架构图与流程图', 'UML / ER 建模', '把图形文件纳入 Git 版本管理'] }),

  S('sqlitebrowser', 'DB Browser for SQLite', '可视化的 SQLite 数据库管理工具',
    '专为 SQLite 设计的开源图形化管理工具，可以创建数据库、建表与索引、浏览与编辑数据、执行 SQL 并查看执行计划，支持导入导出 CSV、SQL 转储与图表化浏览。无需服务端、无需账号，单文件数据库直接打开即可操作。',
    { version: '3.x', developer: 'DB Browser for SQLite Team', homepage_url: 'https://sqlitebrowser.org/', repo_url: 'https://github.com/sqlitebrowser/sqlitebrowser', download_url: 'https://sqlitebrowser.org/dl/', license_code: 'GPL-3.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux'], categories: ['dev-tools'], released_at: '2024-10-01', featured: false, weight: 80, risk_level: 'low', seo_title: 'DB Browser for SQLite 免费开源数据库工具 - 1024Soft', seo_description: 'DB Browser for SQLite 是开源图形化 SQLite 管理工具，支持建表、SQL 执行与 CSV 导入导出，免安装可用。',
      review: '调试本地 SQLite 文件时最顺手的免费工具，不用起服务、不用记命令行参数，改完立刻能看到结果。',
      scenes: ['查看与编辑应用本地数据库', '快速执行 SQL 与查看执行计划', 'CSV 与 SQLite 之间互转'] }),

  S('rustdesk', 'RustDesk', '可自建中继的开源远程桌面',
    '使用 Rust 编写的跨平台远程桌面工具，开箱即可使用公共中继，也可以完全自建 ID 服务器与中继服务器，实现数据不经第三方。支持无人值守访问、文件传输、多屏、剪贴板同步与端到端加密，个人与商用均免费。',
    { version: '1.x', developer: 'RustDesk Community', homepage_url: 'https://rustdesk.com/', repo_url: 'https://github.com/rustdesk/rustdesk', download_url: 'https://rustdesk.com/download/', license_code: 'AGPL-3.0', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux', 'android', 'ios'], categories: ['network'], released_at: '2025-03-01', featured: false, weight: 86, risk_level: 'medium', seo_title: 'RustDesk 免费开源远程桌面 - 1024Soft', seo_description: 'RustDesk 是可自建中继的开源远程桌面工具，支持无人值守、文件传输与端到端加密，公共中继开箱即用。',
      review: '可自建中继是它与其他免费远程工具最大的区别；对内网设备运维尤其有用，公共中继仅作临时方案。',
      scenes: ['远程协助家人或同事', '内网服务器与设备维护', '搭建组织自有的远程接入通道'] }),

  S('sharex', 'ShareX', '功能密集的开源截图与自动化工具',
    'Windows 平台上的截图、录屏与文件分享工具，支持区域/窗口/滚动截屏、OCR、标注、GIF 录制、自动上传与自定义上传目标，并能把「截图 → 标注 → 上传 → 复制链接」串成一条工作流。完全免费、无广告、开源且提供便携版。',
    { version: '17.x', developer: 'ShareX Team', homepage_url: 'https://getsharex.com/', repo_url: 'https://github.com/ShareX/ShareX', download_url: 'https://getsharex.com/downloads/', license_code: 'GPL-3.0', pricing: 'free', is_open_source: true, platforms: ['windows'], categories: ['graphics'], released_at: '2025-01-01', featured: false, weight: 82, risk_level: 'low', seo_title: 'ShareX 免费开源截图录屏工具 - 1024Soft', seo_description: 'ShareX 是 Windows 开源截图工具，支持滚动截屏、标注、OCR、GIF 录制与自定义上传工作流，无广告。',
      review: '功能密度高到第一眼会有点晕，但把热键配置好之后，写文档、提 issue 配图的效率提升非常明显。',
      scenes: ['文档与 issue 配图', '长页面滚动截图', '快速录制 GIF 演示'] }),

  S('notepadpp', 'Notepad++', '轻快可靠的 Windows 文本编辑器',
    '基于 Scintilla 的轻量代码与文本编辑器，启动快、占用低，支持语法高亮、多标签、宏录制、正则查找替换、列编辑与插件扩展。适合快速查看日志、编辑配置文件或做轻量脚本修改，提供便携版与简体中文界面。',
    { version: '8.x', developer: 'Don Ho & Contributors', homepage_url: 'https://notepad-plus-plus.org/', repo_url: 'https://github.com/notepad-plus-plus/notepad-plus-plus', download_url: 'https://notepad-plus-plus.org/downloads/', license_code: 'GPL-3.0', pricing: 'free', is_open_source: true, platforms: ['windows'], categories: ['dev-tools'], released_at: '2025-02-01', featured: false, weight: 84, risk_level: 'low', seo_title: 'Notepad++ 免费开源文本编辑器 - 1024Soft', seo_description: 'Notepad++ 是轻量开源文本编辑器，支持语法高亮、正则替换、列编辑与插件，提供便携版和中文界面。',
      review: '不需要项目、不需要索引、双击就开，这种「随手改一行」的速度是重型编辑器给不了的。',
      scenes: ['快速查看日志与配置文件', '正则批量替换文本', 'U 盘随身便携编辑'] }),

  S('everything', 'Everything', '秒级检索本地文件的免费工具',
    '通过读取 NTFS 主文件表建立索引，输入即搜、几乎零延迟地定位本机文件，支持通配符、正则、路径过滤与结果导出。索引占用极小，提供 HTTP / ETP 服务与命令行接口，是 Windows 上本地文件检索的事实标准工具。',
    { version: '1.5a', developer: 'Voidtools', homepage_url: 'https://www.voidtools.com/', download_url: 'https://www.voidtools.com/downloads/', pricing: 'free', is_open_source: false, platforms: ['windows'], categories: ['system'], released_at: '2024-08-01', featured: true, weight: 90, risk_level: 'low', seo_title: 'Everything 免费本地文件搜索工具 - 1024Soft', seo_description: 'Everything 是 Windows 上秒级检索本地文件的免费工具，索引占用极小，支持正则、便携版与命令行。',
      review: '装过之后就再也回不去系统自带搜索了。它是闭源软件，但免费、干净、无任何推广组件，符合本站收录标准。',
      scenes: ['海量文件中瞬间定位', '按路径或扩展名批量筛选', '配合脚本导出文件清单'] }),

  S('pdf24', 'PDF24 Creator', '无水印的免费 PDF 工具箱',
    '集合 PDF 创建、合并、拆分、压缩、OCR、格式转换、编辑与签名于一体的免费工具，提供桌面版与在线版。通过虚拟打印机把任意可打印文档转成 PDF，无水印、无页数限制、无需注册，界面内置简体中文。',
    { version: '11.x', developer: 'PDF24 / Geek Software GmbH', homepage_url: 'https://www.pdf24.org/', download_url: 'https://www.pdf24.org/en/creator', pricing: 'free', is_open_source: false, platforms: ['windows'], categories: ['office'], released_at: '2025-01-01', featured: false, weight: 81, risk_level: 'medium', seo_title: 'PDF24 Creator 免费 PDF 工具箱 - 1024Soft', seo_description: 'PDF24 Creator 是免费 PDF 工具箱，支持虚拟打印、合并拆分、压缩与 OCR，无水印无页数限制。',
      review: '「把任意文档打印成 PDF」这一件事做得极其稳，附带的合并与压缩功能也省去了找在线工具的麻烦。',
      scenes: ['文档转 PDF 与虚拟打印', '合并、拆分与压缩 PDF', '扫描件 OCR 与简单编辑'] }),

  S('tabby', 'Tabby', '可高度定制的开源终端模拟器',
    '跨平台终端模拟器，支持分屏、标签页、SSH 连接管理、串行端口、主题与字体自定义、命令补全以及配置文件同步。基于 Web 技术构建但启动与渲染表现良好，插件体系覆盖 Docker、Kubernetes 与常用 shell 集成。',
    { version: '1.x', developer: 'Eugeny & Contributors', homepage_url: 'https://tabby.sh/', repo_url: 'https://github.com/Eugeny/tabby', download_url: 'https://github.com/Eugeny/tabby/releases', license_code: 'MIT', pricing: 'free', is_open_source: true, platforms: ['windows', 'macos', 'linux'], categories: ['dev-tools'], released_at: '2025-01-01', featured: false, weight: 80, risk_level: 'low', seo_title: 'Tabby 免费开源终端模拟器 - 1024Soft', seo_description: 'Tabby 是跨平台开源终端，支持分屏、SSH 管理、主题定制与插件，配置文件可导出同步。',
      review: '如果你习惯把终端当成长期工作台而不是临时窗口，分屏与连接管理带来的收益很明显。',
      scenes: ['多会话 SSH 运维', '本地与远程分屏对照', '统一多机器的终端外观与配置'] })
];

const q = (v) => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
const arr = (v) => `[${(v || []).join(', ')}]`;

function frontmatter(x) {
  const lines = [
    '---',
    'schema_version: 1',
    `slug: ${q(x.slug)}`,
    `name: ${q(x.name)}`,
    `tagline: ${q(x.tagline)}`,
    'description_md: |',
    ...x.description_md.match(/.{1,60}/gu).map((l) => `  ${l}`),
    `version: ${q(x.version)}`,
    `developer: ${q(x.developer)}`,
    `homepage_url: ${q(x.homepage_url)}`,
    ...(x.is_open_source && x.repo_url ? [`repo_url: ${q(x.repo_url)}`] : []),
    `download_url: ${q(x.download_url)}`,
    ...(x.is_open_source && x.license_code ? [`license_code: ${q(x.license_code)}`] : []),
    `pricing: ${q(x.pricing)}`,
    `is_open_source: ${x.is_open_source}`,
    `platforms: ${arr(x.platforms)}`,
    `categories: ${arr(x.categories)}`,
    'screenshots: []',
    `released_at: ${q(x.released_at)}`,
    `last_checked_at: ${q(CHECKED)}`,
    `featured: ${x.featured}`,
    `weight: ${x.weight}`,
    `downloads: ${DOWNLOADS[x.slug] ?? 0}`,
    `risk_level: ${q(x.risk_level)}`,
    `seo_title: ${q(x.seo_title)}`,
    `seo_description: ${q(x.seo_description)}`,
    '---',
    '',
    '## 编辑点评',
    '',
    x.review,
    '',
    '## 适用场景',
    '',
    ...x.scenes.map((s) => `- ${s}`),
    ''
  ];
  return lines.join('\n');
}

mkdirSync(DIR, { recursive: true });
for (const item of items) {
  writeFileSync(resolve(DIR, `${item.slug}.md`), frontmatter(item), 'utf8');
}
console.log(`已生成 ${items.length} 条示例软件数据 → content/software/`);

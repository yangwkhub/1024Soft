# 贡献指南

感谢帮 1024Soft 补充和维护内容。本站的「数据库」就是 `content/software/*.md`，任何改动都会经过 CI 校验并完全可追溯。

## 收录标准

**收**：确实可以免费使用的桌面 / 移动 / Web / 自托管工具；开源软件优先；官网可访问；下载来源可信；信息可核验。

**不收**：

- 试用版、需要激活码 / 破解 / 序列号的工具；
- 「免费」但核心功能必须付费才能用，或免费额度形同虚设的产品；
- 安装包含强制捆绑、主页大量广告跳转、诱导下载其他软件；
- 已停止维护且存在已知安全风险、或官网 / 下载页失效；
- 与已有条目实质重复的产品；
- 任何涉及盗版、侵权、恶意软件的内容。

## 字段说明

文件命名：`content/software/<slug>.md`，`slug` 必须与 frontmatter 的 `slug` 完全一致，格式 `^[a-z0-9][a-z0-9-]{1,59}$`。

| 字段 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- |
| `schema_version` | number | ✅ | 固定 `1` |
| `slug` | string | ✅ | 小写 / 数字 / 连字符，2–60 位，全局唯一；发布后可改（改名需同步重命名文件） |
| `name` | string | ✅ | ≤ 60 字 |
| `tagline` | string | ✅ | 4–60 字，一句话卖点 |
| `description_md` | string | ✅ | 10-200 字，纯文本简介（可含简单 Markdown） |
| `version` | string | — | ≤ 30 字 |
| `developer` | string | — | 建议填写 |
| `homepage_url` | URL | ✅ | 必须 `https://` |
| `repo_url` | URL | 条件 | 仅开源条目填写且必填；非开源留空 |
| `download_url` | URL | ✅ | 必须 `https://`，域名在 `data/allowed-download-hosts.json` 白名单内 |
| `license_code` | string | 条件 | 仅开源条目填写且必填，取值来自 `data/licenses.json`；非开源留空 |
| `pricing` | enum | ✅ | `free` / `freemium` / `free_for_personal` / `commercial`；开源与否由 `is_open_source` 单独标识 |
| `is_open_source` | boolean | ✅ | 为 `true` 时 `repo_url` 与 `license_code` 必填；为 `false` 时两者必须留空 |
| `platforms` | string[] | ✅ | ≥ 1 项，来自 `data/platforms.json` |
| `categories` | string[] | ✅ | 必填且至多 1 项，来自 `data/categories.json`（含子分类） |
| `screenshots` | string[] | — | ≤ 4 项；优先站内 WebP 小图 |
| `released_at` | date | — | `YYYY-MM-DD` |
| `last_checked_at` | date | ✅ | 复核当天日期，超过 180 天会标记「待复核」 |
| `featured` | boolean | — | 编辑精选，默认 `false` |
| `weight` | number | — | 0–100，默认 `50`，影响推荐排序 |
| `downloads` | number | — | 非负整数，默认 `0`，下载量静态快照，用于热门榜单排序；接入外部统计后可直接覆盖 |
| `risk_level` | enum | ✅ | `low` / `medium` / `high` |
| `seo_title` / `seo_description` | string | — | ≤ 60 / ≤ 155 字 |

正文（frontmatter 之后）建议用两个小节：`## 编辑点评` 与 `## 适用场景`。正文渲染器只支持 `##` / `###` 标题、无序列表、`**加粗**`、`` `行内代码` `` 与段落，**不要写裸 HTML 或脚本**。

## 提交流程

1. 搜索确认没有重复条目；
2. 复制一份相近的 `.md`，改成新 slug；
3. 本地跑 `npm run validate`（会检查 slug 唯一、字典引用、URL 协议、白名单域名、字段联动）；
4. `npm run build` 做一次完整构建；
5. 开 PR，填 `PULL_REQUEST_TEMPLATE.md` 的核对清单；
6. 等待 `Content CI` 全绿 + 维护者审批；合并后 Actions 自动发布。

不熟悉 Git？直接用 **Issues → 投稿一款免费软件** 表单，维护者会代为整理。

## 评论与举报

- 评论区用 GitHub 账号发言，内容存于 Discussions；禁止广告、引流、破解信息、人身攻击。
- 举报走 **Issues → 举报 / 纠错 / 链接失效**，会自动带 `report` 标签进入维护者后台的投稿审核。
- 演示模式的评论只存在你自己的浏览器里，不会上传。

## 维护者补充

- 新增字典项时同时更新 `data/*.json` 与 `scripts/validate-content.mjs` 的引用检查；
- 新增下载域名时先确认确实是官方域名，再加入白名单并在 PR 里说明理由；
- 管理后台生成的 PR 同样必须人工过目，CI 只保证格式不保证事实正确。

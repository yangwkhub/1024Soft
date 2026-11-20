/** UI 文案集中管理；MVP 仅 zh-CN，扩展语言时新增 locale 文件即可 */
export const ui = {
  lang: 'zh-CN',
  siteName: '1024Soft',
  /** 站点标语：置空即不展示任何标语文字（首页大标题、页面 title 均读取此处，改一处即可全站生效） */
  siteSlogan: '寻找免费、好用、开源的软件',
  /** 站点描述：置空即不输出 description / og:description，由各页面自行提供 */
  siteDescription: '',
  searchPlaceholder: '搜索软件或分类，例如「压缩」「笔记」「开源」…',
  nav: { home: '首页', catalog: '软件目录', ranking: '热门榜单', submit: '投稿软件', about: '联系本站', admin: '管理后台' },
  cta: { browse: '开始浏览', submit: '推荐一款软件', official: '前往官网下载', back: '返回详情' },
  labels: { featured: '编辑精选', latest: '最近更新', hot: '本周热门', categories: '分类', free: '免费', openSource: '开源', stale: '待复核', risk: '风险提示' },
  footer: '本站不托管、不修改、不分发任何软件，不对第三方软件安全性作担保；软件版权归原作者所有。如有侵权请提交 Issue，我们将在核实后下架。'
} as const;

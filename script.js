const STORAGE_KEY = "academicSiteData";
const LANG_KEY = "academicSiteLanguage";
const NAV_INDICATOR_KEY = "academicSiteNavIndicator";

// Helper: create <picture> with WebP + PNG fallback for file:// compatibility
function pictureTag(webpSrc, alt, cls, priority = false) {
  const pngSrc = webpSrc.replace(/\.webp$/, ".png");
  const classAttr = cls ? ` class="${cls}"` : "";
  const priorityAttr = priority ? ` fetchpriority="high"` : ` fetchpriority="low" loading="lazy"`;
  const decodingAttr = ` decoding="async"`;
  return `<picture><source srcset="${escapeHtml(webpSrc)}" type="image/webp"><img${classAttr} src="${escapeHtml(pngSrc)}" alt="${escapeHtml(alt || "")}"${priorityAttr}${decodingAttr} /></picture>`;
}

const header = document.querySelector(".site-header");
const canvas = document.querySelector("#research-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;

let width = 0;
let height = 0;
let particles = [];
let lightStreaks = [];
let rafId;
let frame = 0;
let storyProgress = 0;
let currentLang = loadLanguagePreference();
let compactNavClickBlockUntil = 0;
const lightfallColors = ["#a6c8ff", "#5227ff", "#ff9ffc", "#58d5ff"];

const translations = {
  zh: {
    profile: "简介",
    publications: "论文",
    patents: "专利",
    projects: "项目",
    achievements: "成果荣誉",
    awards: "奖励",
    conferences: "会议",
    experience: "学术经历",
    contact: "联系方式",
    admin: "后台",
    news: "新闻动态",
    navHome: "主页",
    results: "成果",
    honors: "荣誉",
    homeEyebrow: "光纤集成器件",
    homeTitle: "光纤集成智能光电子器件",
    homeSubtitle: "光纤集成 · 异质材料 · 智能光电子器件",
    profileCard: "身份、研究概述、学术关键词与联系方式。",
    publicationsCard: "《自然·电子学》《科学进展》《先进材料》等。",
    projectsCard: "国家自然科学基金、江苏省青年基金、广东省面上项目等。",
    achievementsCard: "专利、奖励、学术服务、会议报告与创新创业成果。",
    experienceCard: "南京大学学习工作经历与研究发展脉络。",
    contactCard: "邮箱、电话和后续可扩展的学术主页入口。",
    researchTitle: "研究内容",
    explore: "探索",
    manageContent: "维护内容",
    langButton: "EN",
    selectedWork: "代表成果",
    representativePublications: "代表论文",
    allPublications: "全部论文",
    publicationList: "论文列表",
    managePublications: "管理论文",
    publicationHero: "展示代表性成果，并提供完整论文列表入口。",
    projectsHero: "展示主持与参与的科研项目，覆盖国家、省部级基金、博士后项目与融合创新项目。",
    achievementsHero: "整合专利、奖励、学术任职、会议报告、学术服务与创新创业成果。",
    experienceHero: "从本科到博士、博士后与准聘助理教授，呈现研究主题持续演进的时间线。",
    contactHero: "欢迎围绕光纤集成器件、智能光电探测、精密光谱与多维光场分析等方向交流合作。",
    home: "返回首页",
  },
  en: {
    profile: "Profile",
    publications: "Publications",
    patents: "Patents",
    projects: "Projects",
    achievements: "Achievements",
    awards: "Awards",
    conferences: "Conferences",
    experience: "Experience",
    contact: "Contact",
    admin: "Admin",
    news: "News",
    navHome: "Home",
    results: "Results",
    honors: "Honors",
    homeEyebrow: "Optical Fiber Devices",
    homeTitle: "Fiber Integrated Intelligence",
    homeSubtitle: "Fiber integration · Heterogeneous materials · Intelligent optoelectronics",
    profileCard: "Position, research overview, academic keywords, and contact details.",
    publicationsCard: "Selected papers in Nature Electronics, Science Advances, Advanced Materials, and more.",
    projectsCard: "Funded research projects from national and provincial programs.",
    achievementsCard: "Patents, awards, academic service, talks, and innovation activities.",
    experienceCard: "Academic path and research development at Nanjing University.",
    contactCard: "Email, phone, and future academic profile links.",
    researchTitle: "Research",
    explore: "Explore",
    manageContent: "Manage Content",
    langButton: "中文",
    selectedWork: "Selected Work",
    representativePublications: "Selected Publications",
    allPublications: "All Publications",
    publicationList: "Publication List",
    managePublications: "Manage Publications",
    publicationHero: "Selected representative work with access to the complete publication list.",
    projectsHero: "Funded research projects across national, provincial, postdoctoral, and interdisciplinary programs.",
    achievementsHero: "Patents, awards, academic appointments, conference talks, service, and innovation activities.",
    experienceHero: "Academic training and appointments from undergraduate study to current faculty position.",
    contactHero: "Open to collaboration in fiber-integrated devices, intelligent photodetection, precision spectroscopy, and light-field analysis.",
    home: "Home",
  },
};

const profileEnglish = {
  nameCn: "Yifeng Xiong",
  title: "Researcher in Fiber-Integrated Intelligent Optoelectronic Devices",
  subtitle:
    "Tenure-track Assistant Professor and Ph.D. advisor at the School of Modern Engineering and Applied Sciences, Nanjing University, focusing on fiber-integrated devices, heterogeneous material integration, and intelligent optoelectronics.",
  affiliation: "School of Modern Engineering and Applied Sciences, Nanjing University",
  bio:
    "Yifeng Xiong is a tenure-track Assistant Professor and Ph.D. advisor at Nanjing University. His research focuses on fiber-integrated optoelectronic devices, localized additive/subtractive manufacturing on optical fiber surfaces, heterogeneous material integration, precision spectroscopy, multidimensional light-field analysis, intelligent photodetection, and imaging.",
  focus: "Optical Fiber Devices · Heterogeneous Integration · Intelligent Optoelectronics · Sensing & Imaging",
};

const researchEnglish = [
  {
    title: "Fiber-Integrated Optoelectronic Devices",
    text: "Developing compact, high-performance fiber devices through localized micro/nano fabrication and heterogeneous material integration.",
  },
  {
    title: "Multidimensional Light-Field Analysis",
    text: "Building fiber-end and microstructured systems for light fingerprinting, polarization analysis, mode demultiplexing, and tunable filtering.",
  },
  {
    title: "Intelligent Photodetection and Imaging",
    text: "Exploring intelligent sensing and imaging with 2D materials, van der Waals heterostructures, graphene detector arrays, and fiber platforms.",
  },
];

const publicationChineseTitles = {
  "One-pixel, one-shot identification of light fingerprints in fiber.": "光纤中光指纹的单像素、单次识别",
  "Megahertz-Rate Widely Tunable Fiber Filters Enabled by LiNbO3 Actuators.": "基于铌酸锂驱动器的兆赫兹速率宽调谐光纤滤波器",
  "Lithium Niobate Piezoelectric Actuator-Integrated Fiber Fabry-Perot Tunable Filter with Ultrahigh Speed and Linearity.":
    "集成铌酸锂压电驱动器的超高速高线性光纤法布里-珀罗可调滤波器",
  "Active fiber tips with optoelectronic integration: state-of-the-art, future trends, and challenges.":
    "光电集成有源光纤端面：研究现状、未来趋势与挑战",
  "Twisted black phosphorus-based van der Waals stacks for fiber-integrated polarimeters.":
    "用于光纤集成偏振计的扭转黑磷范德瓦尔斯堆叠结构",
  "Ultrahigh responsivity photodetectors of 2D covalent organic frameworks integrated on graphene.":
    "集成于石墨烯上的二维共价有机框架超高响应度光电探测器",
};

const zoneChinese = {
  Representative: "代表论文",
  Other: "其他论文",
};

const venueChinese = {
  "Nature Electronics": "《自然·电子学》",
  "Laser & Photonics Reviews": "《激光与光子学评论》",
  "ACS Photonics": "《ACS 光子学》",
  "Journal of Lightwave Technology": "《光波技术期刊》",
  "Science Advances": "《科学进展》",
  "Advanced Materials": "《先进材料》",
};

const representativeOrder = [
  "Identification of the mode, polarization, wavelength and intensity of light using a one-pixel device on an optical fibre tip.",
  "Twisted black phosphorus-based van der Waals stacks for fiber-integrated polarimeters.",
  "Ultrahigh responsivity photodetectors of 2D covalent organic frameworks integrated on graphene.",
  "Multifunctional integration on optical fiber tips: Challenges and opportunities.",
  "Megahertz-Rate Widely Tunable Fiber Filters Enabled by LiNbO3 Actuators.",
  "Ultracompact multicore fiber de-multiplexer using an endface-integrating graphene photodetector array.",
  "Active fiber tips with optoelectronic integration: state-of-the-art, future trends, and challenges.",
  "Broadband optical-fiber-compatible photodetector based on a graphene-MoS2-WS2 heterostructure with a synergetic photogenerating mechanism.",
  "Lithium Niobate Piezoelectric Actuator-Integrated Fiber Fabry-Perot Tunable Filter with Ultrahigh Speed and Linearity.",
  "Optical fiber tip integrated photoelectrochemical sensors.",
];

const textEnglish = {
  "长期": "Ongoing",
  "一作论文": "First-author Papers",
  "发明专利": "Patents",
  "获批项目": "Projects",
  "奖励": "Awards",
  "专利": "Patents",
  "学术任职": "Academic Appointments",
  "学术服务": "Academic Service",
  "审稿服务": "Reviewing Service",
  "会议报告": "Conference Talks",
  "创新创业": "Innovation",
  "学习工作经历": "Education and Appointments",
  "查看全部论文": "All Publications",
  "全部论文": "All Publications",
  "打开论文 PDF": "Open Paper PDF",
  "论文题目": "Paper Title",
  "期刊": "Journal",
  "作者": "Authors",
  "通讯作者": "Corresponding Authors",
  "完成单位": "Affiliations",
  "南京大学现代工程与应用科学学院，准聘助理教授":
    "Tenure-track Assistant Professor, School of Modern Engineering and Applied Sciences, Nanjing University",
  "博士生导师，开展光纤集成新型光电子器件、异质材料集成与智能探测成像研究。":
    "Ph.D. advisor; research on fiber-integrated optoelectronic devices, heterogeneous material integration, intelligent detection, and imaging.",
  "2024年1月 - 至今": "Jan. 2024 - Present",
  "2022年7月 - 2023年12月": "Jul. 2022 - Dec. 2023",
  "2017年9月 - 2022年6月": "Sep. 2017 - Jun. 2022",
  "南京大学现代工程与应用科学学院，博士后":
    "Postdoctoral Researcher, School of Modern Engineering and Applied Sciences, Nanjing University",
  "围绕多功能集成的光纤端面光电器件开展博士后研究。":
    "Postdoctoral research on multifunctionally integrated optoelectronic devices on optical fiber tips.",
  "南京大学现代工程与应用科学学院，博士":
    "Ph.D., School of Modern Engineering and Applied Sciences, Nanjing University",
  "光纤集成器件、二维材料光电探测与微纳光纤传感相关研究。":
    "Research on fiber-integrated devices, two-dimensional-material photodetection, and micro/nanofiber sensing.",
  "光纤端面集成的超紧凑模式解复用器": "Ultracompact Mode Demultiplexer Integrated on an Optical Fiber Tip",
  "国家自然科学基金青年科学基金项目，62305153，2024.01-2025.12，20万元，主持，结题。":
    "National Natural Science Foundation of China Young Scientists Fund, No. 62305153, Jan. 2024-Dec. 2025, RMB 200k, PI, completed.",
  "光纤端面微纳光电集成的多功能器件研究":
    "Micro/Nano Optoelectronic Integration on Optical Fiber Tips for Multifunctional Devices",
  "江苏省基础研究计划自然科学基金青年基金项目，BK20230769，2023.09-2026.08，20万元，主持，在研。":
    "Jiangsu Basic Research Program Young Scientists Fund, No. BK20230769, Sep. 2023-Aug. 2026, RMB 200k, PI, ongoing.",
  "光电集成的多功能光纤端面器件研究": "Multifunctional Optoelectronic Devices Integrated on Optical Fiber Tips",
  "广东省自然科学基金面上项目，2025A1515012111，2025.01-2027.12，10万元，主持，在研。":
    "Guangdong Basic and Applied Basic Research Foundation, No. 2025A1515012111, Jan. 2025-Dec. 2027, RMB 100k, PI, ongoing.",
  "面向涡轮发动机非接触式内窥测量的光纤阵列集成器件及系统":
    "Fiber-Array Integrated Devices and Systems for Noncontact Endoscopic Measurement in Turbine Engines",
  "中央高校基本科研业务费融合创新项目，2024300439，2024-2025年度，60万元，主持，结题。":
    "Fundamental Research Funds for the Central Universities, Interdisciplinary Innovation Project, No. 2024300439, 2024-2025, RMB 600k, PI, completed.",
  "多功能集成的光纤端面光电器件": "Multifunctionally Integrated Optoelectronic Devices on Optical Fiber Tips",
  "中国博士后科学基金面上项目，2023M731586，2023.06-2023.12，8万元，主持，结题。":
    "China Postdoctoral Science Foundation, No. 2023M731586, Jun. 2023-Dec. 2023, RMB 80k, PI, completed.",
  "江苏省卓越博士后计划，2023ZB826，2022.07-2023.12，20万元，主持，结题。":
    "Jiangsu Excellent Postdoctoral Program, No. 2023ZB826, Jul. 2022-Dec. 2023, RMB 200k, PI, completed.",
  "面向高重频飞秒激光器的功能集成微光纤谐振器":
    "Functionally Integrated Microfiber Resonators for High-Repetition-Rate Femtosecond Lasers",
  "国家自然科学基金重点项目，Z32502，2021.12-2026.12，249.6万元，参与，在研。":
    "National Natural Science Foundation of China Key Program, No. Z32502, Dec. 2021-Dec. 2026, RMB 2.496M, participant, ongoing.",
  "面向下一代通信技术的人工微结构物态调控及智能器件":
    "Artificial Microstructure State Control and Intelligent Devices for Next-Generation Communication Technologies",
  "国家重点研发计划，Z07251、Z07256，2022.01-2026.12，548.65万元，参与，在研。":
    "National Key R&D Program of China, Nos. Z07251/Z07256, Jan. 2022-Dec. 2026, RMB 5.4865M, participant, ongoing.",
  "江苏省通信学会科学技术奖": "Science and Technology Award of Jiangsu Institute of Communications",
  "面向通信光缆运维的关键技术与装备，2025年11月，5/10。":
    "Key technologies and equipment for optical cable operation and maintenance, Nov. 2025, ranked 5/10.",
  "中国光学工程学会科技进步二等奖":
    "Second Prize for Scientific and Technological Progress, Chinese Society for Optical Engineering",
  "面向海量通信光缆运维的光纤路由巡址系统与产业应用，2024年11月，5/10。":
    "Optical fiber route tracing system and industrial applications for massive communication cable operation and maintenance, Nov. 2024, ranked 5/10.",
  "第一届中国光学工程学会光纤传感优秀青年人才":
    "Outstanding Young Talent in Fiber-Optic Sensing, Chinese Society for Optical Engineering",
  "中国光学工程学会，2024年9月。": "Chinese Society for Optical Engineering, Sep. 2024.",
  "三年光电子领域优秀创新成果奖": "Outstanding Innovation Achievement Award in Optoelectronics",
  "光纤集成器件制造与装备，中国光学工程学会，2024年9月。":
    "Manufacturing and equipment for fiber-integrated devices, Chinese Society for Optical Engineering, Sep. 2024.",
  "中国光学学会王大珩光学学生奖": "Wang Daheng Optical Student Award, Chinese Optical Society",
  "博士阶段代表性学术奖励。": "Representative academic award during Ph.D. study.",
  "宝钢优秀学生奖": "Baosteel Outstanding Student Award",
  "宝钢教育基金会，2021年11月。": "Baosteel Education Foundation, Nov. 2021.",
  "博士研究生国家奖学金": "National Scholarship for Doctoral Students",
  "中华人民共和国教育部，2020年12月。": "Ministry of Education of China, Dec. 2020.",
  "南京大学优秀研究生标兵": "Outstanding Graduate Student Model, Nanjing University",
  "南京大学，2020年12月。": "Nanjing University, Dec. 2020.",
  "英才奖学金二等奖": "Second Prize, Yingcai Scholarship",
  "新生校长特别奖": "Freshman Presidential Special Award",
  "南京大学，2017年12月。": "Nanjing University, Dec. 2017.",
  "中国光学学会纤维光学与集成光学专业委员会青年委员":
    "Young Committee Member, Fiber Optics and Integrated Optics Committee, Chinese Optical Society",
  "第九届中国光学学会纤维光学与集成光学专业委员会。":
    "The 9th Fiber Optics and Integrated Optics Committee of the Chinese Optical Society.",
  "第九届微纳光学技术与应用交流会专题秘书":
    "Session Secretary, 9th Conference on Micro/Nano Optical Technology and Applications",
  "微纳传感专题秘书。": "Session secretary for micro/nano sensing.",
  "PhotoniX Forum 2024 微纳传感专题秘书":
    "Session Secretary for Micro/Nano Sensing, PhotoniX Forum 2024",
  "第八届微纳光学技术与应用交流会暨 PhotoniX Forum 2024。":
    "8th Conference on Micro/Nano Optical Technology and Applications & PhotoniX Forum 2024.",
  "第三届全国电子材料与器件大会专题委员":
    "Session Committee Member, 3rd National Conference on Electronic Materials and Devices",
  "电子材料与智能传感论坛专题委员。": "Session committee member for Electronic Materials and Intelligent Sensing.",
  "期刊审稿人": "Journal Reviewer",
  "Advanced Materials、Laser & Photonics Reviews、ACS Photonics 等期刊活跃审稿人。":
    "Active reviewer for journals including Advanced Materials, Laser & Photonics Reviews, and ACS Photonics.",
  "全光纤多功能集成器件": "All-Fiber Multifunctionally Integrated Devices",
  "中国微米纳米技术学会微纳光学创新论坛，邀请报告。":
    "Invited talk, Micro/Nano Optics Innovation Forum, Chinese Society of Micro-Nano Technology.",
  "第三届全国光与物质相互作用及其应用大会，邀请报告。":
    "Invited talk, 3rd National Conference on Light-Matter Interaction and Applications.",
  "微纳光学创新论坛，邀请报告；第十四届全国光子学学术会议，口头报告。":
    "Invited talk at the Micro/Nano Optics Innovation Forum; oral presentation at the 14th National Photonics Conference.",
  "光纤端面集成多维度探测器件": "Multidimensional Detection Devices Integrated on Optical Fiber Tips",
  "中国光纤传感大会 OFS-China 2024，邀请报告。": "Invited talk, OFS-China 2024.",
  "多功能集成的全光纤光电子器件": "Multifunctionally Integrated All-Fiber Optoelectronic Devices",
  "中国光学学会学术大会、全国光子技术论坛，口头报告。":
    "Oral presentations at the Chinese Optical Society Annual Meeting and the National Photonics Technology Forum.",
  "OFS-China 2022、ICOCN 2022，口头报告。":
    "Oral presentations at OFS-China 2022 and ICOCN 2022.",
  "Optoelectronics Global Conference，口头报告。": "Oral presentation at Optoelectronics Global Conference.",
  "二维材料与光纤兼容光电探测器系列报告":
    "Talk Series on 2D-Material and Optical-Fiber-Compatible Photodetectors",
  "AOMATT、ICOCN、NJU-Wiley Joint Conference 等会议报告与海报。":
    "Talks and posters at AOMATT, ICOCN, NJU-Wiley Joint Conference, and other meetings.",
  "挑战杯相关赛事": "Challenge Cup Competitions",
  "江苏省大学生课外学术科技作品竞赛省二等奖；南京大学选拔赛一等奖。":
    "Second Prize in Jiangsu Provincial College Students' Extracurricular Academic and Scientific Works Competition; First Prize in Nanjing University selection.",
  "创青春与创业计划竞赛": "Chuang Qing Chun and Entrepreneurship Plan Competitions",
  "江苏省大学生创业大赛南京大学选拔赛一等奖、省铜奖；南京大学学生创业计划竞赛二等奖。":
    "First Prize in Nanjing University selection and Provincial Bronze Award in Jiangsu College Students' Entrepreneurship Competition; Second Prize in Nanjing University Student Entrepreneurship Plan Competition.",
  "BOE 看见未来与赢在南京赛事": "BOE Seeing the Future and Win in Nanjing Competitions",
  "BOE 校赛一等奖、国赛三等奖；赢在南京青年大学生创业大赛优秀奖。":
    "First Prize in BOE campus competition, Third Prize in national competition; Excellence Award in Win in Nanjing Youth College Student Entrepreneurship Competition.",
  "一种全斯托克斯偏振计及其制备方法": "Full-Stokes Polarimeter and Fabrication Method Thereof",
  "基于压电单晶逆压电效应的高速法布里珀罗可调滤波器":
    "High-Speed Fabry-Perot Tunable Filter Based on the Inverse Piezoelectric Effect of Piezoelectric Single Crystals",
  "一种电池监测系统和监测方法": "Battery Monitoring System and Method",
  "一种全光纤电光器件及其构建方法": "All-Fiber Electro-Optic Device and Fabrication Method Thereof",
  "一种可穿戴光电化学生物传感器及其制备方法":
    "Wearable Photoelectrochemical Biosensor and Fabrication Method Thereof",
  "一种眼部传感器及制备方法": "Eye Sensor and Fabrication Method",
  "基于光学微光纤的健康监测传感器及制备方法和测量系统":
    "Health-Monitoring Sensor Based on Optical Microfiber, Fabrication Method, and Measurement System",
  "一种基于范德瓦尔斯异质结的光电探测器及其制备方法":
    "Photodetector Based on a van der Waals Heterojunction and Fabrication Method Thereof",
  "申请号：202411885555.9；公开号：CN 119666155A。":
    "Application No. 202411885555.9; Publication No. CN 119666155A.",
  "申请号：202311397827.6；公开号：CN 117250696 A。":
    "Application No. 202311397827.6; Publication No. CN 117250696 A.",
  "申请号：202110182616.5；授权号：CN 113078375 B；已授权。":
    "Application No. 202110182616.5; Grant No. CN 113078375 B; granted.",
  "申请号：202011167667.2；授权号：CN 112415790 B；已授权。":
    "Application No. 202011167667.2; Grant No. CN 112415790 B; granted.",
  "申请号：201911050262.8；公开号：CN 110823978 A。":
    "Application No. 201911050262.8; Publication No. CN 110823978 A.",
  "申请号：201910349801.1；授权号：CN 110013232 B；已授权。":
    "Application No. 201910349801.1; Grant No. CN 110013232 B; granted.",
  "申请号：201810431317.9；授权号：CN 110448268 B；已授权。":
    "Application No. 201810431317.9; Grant No. CN 110448268 B; granted.",
  "申请号：201810431706.1；授权号：CN 110459548 B；已授权。":
    "Application No. 201810431706.1; Grant No. CN 110459548 B; granted.",
  "熊毅丰、徐伊宁、方韶晨、徐飞": "Yifeng Xiong, Yining Xu, Shaochen Fang, Fei Xu",
  "徐飞、童宏伟、熊毅丰、陈烨": "Fei Xu, Hongwei Tong, Yifeng Xiong, Ye Chen",
  "陈勐勐、徐飞、周林、陈烨、丁梓轩、熊毅丰":
    "Mengmeng Chen, Fei Xu, Lin Zhou, Ye Chen, Zixuan Ding, Yifeng Xiong",
  "徐飞、王好尚、熊毅丰、陆延青、胡伟": "Fei Xu, Haoshang Wang, Yifeng Xiong, Yanqing Lu, Wei Hu",
  "徐飞、朱衡天、熊毅丰、陆延青、胡伟": "Fei Xu, Hengtian Zhu, Yifeng Xiong, Yanqing Lu, Wei Hu",
  "徐飞、陈烨、熊毅丰、李金洪、陆延青、胡伟":
    "Fei Xu, Ye Chen, Yifeng Xiong, Jinhong Li, Yanqing Lu, Wei Hu",
  "徐飞、熊毅丰、陈锦辉": "Fei Xu, Yifeng Xiong, Jinhui Chen",
  "通信地址：南京大学仙林校区现代工学院A302":
    "Address: A302, School of Modern Engineering and Applied Sciences, Xianlin Campus, Nanjing University",
};

const newsDetailEnglish = {
  title: "Fiber-Tip Integration: Reading Light Fingerprints In Situ",
  subtitle: "A three-dimensional single-pixel device on an optical fiber tip enables one-shot in-fiber four-dimensional light-state identification",
  contentHtml:
    "<p>When light enters an optical fiber, it carries far more than brightness. It may propagate in different fiber modes, oscillate along different polarization directions, and possess distinct wavelengths and intensities. Conventionally, reading out these coupled dimensions requires multiple optical and optoelectronic elements, which increases system complexity, latency, and noise.</p><h2>From seeing light to understanding light</h2><p>The richer the optical dimensions, the greater the information capacity of the fiber. Yet these coupled degrees of freedom also make detection more difficult. A compact device capable of reading light states directly at the fiber tip can simplify optical receivers and enable new forms of multidimensional sensing and communication.</p><figure><img src=\"assets/light-fingerprint-main.webp\" alt=\"Fiber-tip light fingerprint identification\"><figcaption>A three-dimensional single-pixel device integrated on an optical fiber tip identifies mode, polarization, wavelength, and intensity in one shot.</figcaption></figure><h2>A miniature decoding station on a fiber tip</h2><p>The team stacked two anisotropic detector units directly on the end face of a two-mode optical fiber. Through the co-design of van der Waals materials, microelectrodes, and decoding algorithms, a micron-scale fiber-core pixel generates six distinct photoelectric responses that encode multidimensional optical information.</p><h2>One-shot identification of nearly ten thousand light states</h2><p>By matching six-channel voltage outputs with a pre-calibrated database, the device identifies nearly ten thousand four-dimensional input states with an accuracy above 99%. For unknown states between calibration points, interpolation and decoupling algorithms enable reliable reconstruction.</p><h2>Imagination from the fiber tip</h2><p>This work suggests that future photodetectors can become smaller, more integrated, and closer to the site of light propagation. Integrating multidimensional readout directly on fiber tips may reduce loss, latency, and crosstalk in compact optical systems.</p>",
  paperTitle: "Identification of the mode, polarization, wavelength and intensity of light using a one-pixel device on an optical fibre tip",
  authors: "Yifeng Xiong, Shaochen Fang, Yining Xu, et al.",
  correspondingAuthors: "Yanqing Lu, Hongtao Yuan, Fei Xu",
  affiliation: "National Laboratory of Solid State Microstructures and School of Modern Engineering and Applied Sciences, Nanjing University, et al.",
};

function loadLanguagePreference() {
  try {
    return localStorage.getItem(LANG_KEY) === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

function localizeText(value = "") {
  const text = String(value || "");
  return currentLang === "en" ? textEnglish[text] || text : text;
}

function localizePageTitlePrefix(prefix = "") {
  const text = String(prefix || "").trim();
  const pairs = [
    ["主页", "Home"],
    ["简介", "Profile"],
    ["个人简介", "Profile"],
    ["成果", "Results"],
    ["代表论文", "Publications"],
    ["论文", "Publications"],
    ["专利", "Patents"],
    ["获批项目", "Projects"],
    ["项目", "Projects"],
    ["荣誉", "Honors"],
    ["奖励", "Awards"],
    ["会议", "Conferences"],
    ["联系方式", "Contact"],
    ["学术经历", "Experience"],
  ];
  const pair = pairs.find(([zh, en]) => text === zh || text === en);
  if (!pair) return localizeText(text);
  return currentLang === "en" ? pair[1] : pair[0];
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function mergeWithDefaultData(source) {
  const base = cloneData(window.DEFAULT_SITE_DATA);
  const merged = { ...base, ...source };
  merged.profile = { ...base.profile, ...(source.profile || {}) };
  Object.keys(base).forEach((key) => {
    if (Array.isArray(base[key])) {
      if (!Array.isArray(merged[key]) || merged[key].length === 0) {
        merged[key] = base[key];
      }
    }
  });
  return merged;
}

// Cached data from Supabase (set by async init)
let _cachedSiteData = null;

function getSiteData() {
  // If Supabase data is available, use it
  if (_cachedSiteData) {
    return _cachedSiteData;
  }
  // Fallback to localStorage + data.js
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return cloneData(window.DEFAULT_SITE_DATA);

  try {
    const data = JSON.parse(saved);
    if (data.version !== window.DEFAULT_SITE_DATA.version) {
      return cloneData(window.DEFAULT_SITE_DATA);
    }
    return mergeWithDefaultData(data);
  } catch {
    return cloneData(window.DEFAULT_SITE_DATA);
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderProfile(data) {
  const prefix = document.title.split("|")[0].trim();
  const siteName = currentLang === "en" ? data.profile.nameEn : data.profile.nameCn;
  document.title =
    prefix && prefix !== data.profile.nameCn && prefix !== data.profile.nameEn
      ? `${localizePageTitlePrefix(prefix)} | ${siteName}`
      : `${siteName} | ${data.profile.nameEn}`;
  document.querySelectorAll("[data-profile]").forEach((node) => {
    const key = node.dataset.profile;
    node.textContent = currentLang === "en" && profileEnglish[key] ? profileEnglish[key] : data.profile[key] || "";
  });
  document.querySelectorAll(".profile-en-name").forEach((node) => {
    node.hidden = currentLang === "en";
  });
  document.querySelectorAll("[data-profile-image]").forEach((node) => {
    if (data.profile.photo) {
      node.src = data.profile.photo;
      const picture = node.closest("picture");
      const source = picture && picture.querySelector("[data-profile-source]");
      if (source) source.srcset = data.profile.photo;
    }
  });
}

function renderMetrics(metrics) {
  const target = document.querySelector("#metric-row");
  if (!target) return;
  target.innerHTML = metrics
    .map(
      (item) => `
        <div>
          <dt>${escapeHtml(localizeText(item.label))}</dt>
          <dd>${escapeHtml(item.value)}</dd>
        </div>
      `,
    )
    .join("");
}

function renderResearch(items) {
  const target = document.querySelector("#research-list");
  if (!target) return;
  const list = currentLang === "en" ? researchEnglish : items;
  target.innerHTML = list
    .map(
      (item, index) => `
        <article class="feature-card reveal">
          <span class="card-index">${String(index + 1).padStart(2, "0")}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `,
    )
    .join("");
}

function renderNews(items) {
  const target = document.querySelector("#news-list");
  if (!target) return;
  target.innerHTML = items
    .map((item, index) => {
      const title = currentLang === "en" ? item.titleEn || item.title : item.title;
      const text = currentLang === "en" ? item.textEn || item.text : item.text;
      const href = item.url || "#";
      const image = item.image
        ? `<div class="news-card-image">${pictureTag(item.image, title || "新闻图片", "", index === 0)}</div>`
        : "";
      return `
        <a class="news-card reveal" href="${escapeHtml(href)}">
          ${image}
          <div class="news-card-body">
            <time>${escapeHtml(item.date || "")}</time>
            <h3>${escapeHtml(title || "")}</h3>
            <p>${escapeHtml(text || "")}</p>
          </div>
          <span>${String(index + 1).padStart(2, "0")}</span>
        </a>
      `;
    })
    .join("");
}

function sanitizeRichHtml(html = "") {
  const template = document.createElement("template");
  template.innerHTML = String(html);
  template.content.querySelectorAll("script, style, iframe, object, embed, link, meta").forEach((node) => node.remove());
  template.content.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();
      if (name.startsWith("on")) node.removeAttribute(attr.name);
      if ((name === "href" || name === "src") && /^javascript:/i.test(value)) node.removeAttribute(attr.name);
    });
    if (node.tagName === "A" && node.getAttribute("href")) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener");
    }
  });
  return template.innerHTML
    // Convert standalone <img src="...webp"> to <picture> with PNG fallback (for file:// compatibility)
    .replace(/<img([^>]*)src="([^"]+\.webp)"([^>]*)>/gi, (match, pre, src, post) => {
      const pngSrc = src.replace(/\.webp$/, ".png");
      const hasLoading = /loading\s*=/.test(pre + post);
      const hasDecoding = /decoding\s*=/.test(pre + post);
      const loadingAttr = hasLoading ? "" : ` loading="lazy"`;
      const decodingAttr = hasDecoding ? "" : ` decoding="async"`;
      const fetchpriorityAttr = ` fetchpriority="low"`;
      return `<picture><source srcset="${src}" type="image/webp"><img${pre}src="${pngSrc}"${post}${loadingAttr}${decodingAttr}${fetchpriorityAttr}></picture>`;
    });
}

function renderNewsDetail(items = []) {
  const contentTarget = document.querySelector("#news-detail-content");
  if (!contentTarget) return;
  const detail = currentLang === "en" ? { ...(items[0] || {}), ...newsDetailEnglish } : items[0] || {};

  document.querySelectorAll("[data-news-detail]").forEach((node) => {
    const key = node.dataset.newsDetail;
    node.textContent = detail[key] || node.textContent;
  });

  const blocks = String(detail.content || "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const intro = [];
  const sections = [];
  let currentSection = null;
  blocks.forEach((block) => {
    if (block.startsWith("## ")) {
      currentSection = { title: block.replace(/^##\s+/, ""), paragraphs: [] };
      sections.push(currentSection);
      return;
    }
    if (currentSection) currentSection.paragraphs.push(block);
    else intro.push(block);
  });

  const image = detail.image
    ? `<figure class="news-figure news-hero-figure">${pictureTag(detail.image, detail.title || "新闻主图", "", true)}</figure>`
    : "";
  const introHtml = `
    <header class="news-article-head">
      <p class="section-kicker">Research News</p>
      <h1>${escapeHtml(detail.title || "")}</h1>
      ${detail.subtitle ? `<p class="news-lead">${escapeHtml(detail.subtitle)}</p>` : ""}
    </header>
  `;
  const fallbackHtml = `${intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}${sections
    .map((section) => `<section><h2>${escapeHtml(section.title)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</section>`)
    .join("")}`;
  const bodyHtml = detail.contentHtml ? sanitizeRichHtml(detail.contentHtml) : fallbackHtml;

  contentTarget.innerHTML = `${introHtml}${image}<div class="news-rich-content">${bodyHtml}</div>`;

  const infoTarget = document.querySelector("#news-detail-info");
  if (infoTarget) {
    const info = [
      [localizeText("论文题目"), detail.paperTitle],
      [localizeText("期刊"), detail.journal],
      [localizeText("作者"), detail.authors],
      [localizeText("通讯作者"), detail.correspondingAuthors],
      [localizeText("完成单位"), detail.affiliation],
      ["DOI", detail.doi],
    ].filter(([, value]) => value);
    infoTarget.innerHTML = info.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  }

  const pdf = document.querySelector("#news-detail-pdf");
  if (pdf) {
    if (detail.pdf) pdf.setAttribute("href", detail.pdf);
    else pdf.hidden = true;
    pdf.textContent = localizeText("打开论文 PDF");
  }
}

function highlightAuthor(text = "") {
  return escapeHtml(text.replaceAll("*", ""))
    .replaceAll("Xiong, Y.", "<strong>Xiong, Y.</strong>")
    .replaceAll("Yifeng Xiong", "<strong>Yifeng Xiong</strong>")
    .replaceAll("熊毅丰", "<strong>熊毅丰</strong>");
}

function applicantLabel(item) {
  if (item.type === "专利") return currentLang === "en" ? "Inventors" : "发明人";
  return currentLang === "en" ? "Applicant" : "申请人";
}

function renderPublications(items) {
  const target = document.querySelector("#publication-list");
  if (!target) return;
  const sorted = [...items].sort((a, b) => {
    const ar = representativeOrder.indexOf(a.title);
    const br = representativeOrder.indexOf(b.title);
    return (ar === -1 ? 999 : ar) - (br === -1 ? 999 : br);
  });
  target.innerHTML = sorted
    .map((item) => {
      const title = item.title;
      const subtitle = currentLang === "zh" ? item.titleZh || publicationChineseTitles[item.title] || "" : "";
      const venue = item.venue;
      const date = item.date && item.date !== "-" && item.date;
      const meta = [venue, date]
        .filter(Boolean)
        .join(" · ");
      const image = item.image
        ? `<div class="publication-visual">${pictureTag(item.image, title)}</div>`
        : `<div class="publication-visual placeholder-visual"><span>${escapeHtml(item.year)}</span></div>`;
      const href = item.url || "#";
      const targetAttr = item.url ? ` target="_blank" rel="noopener"` : "";

      return `
        <a class="publication-item reveal" href="${escapeHtml(href)}"${targetAttr}>
          <time>${escapeHtml(item.year)}</time>
          ${image}
          <div>
            <h3>${escapeHtml(title)}</h3>
            ${subtitle ? `<p class="publication-subtitle">${escapeHtml(subtitle)}</p>` : ""}
            <p class="publication-authors">${highlightAuthor(item.authors || "")}</p>
            <p>${escapeHtml(meta)}</p>
          </div>
        </a>
      `;
    })
    .join("");
}

function getRepresentativePublications(items, limit = 5) {
  return [...items]
    .sort((a, b) => {
      const ar = representativeOrder.indexOf(a.title);
      const br = representativeOrder.indexOf(b.title);
      return (ar === -1 ? 999 : ar) - (br === -1 ? 999 : br);
    })
    .slice(0, limit);
}

function renderProfilePublications(items) {
  const target = document.querySelector("#profile-publication-list");
  if (!target) return;
  target.innerHTML = getRepresentativePublications(items, 5)
    .map((item, index) => {
      const subtitle = currentLang === "zh" ? item.titleZh || publicationChineseTitles[item.title] || "" : "";
      const href = item.url || "results.html#papers";
      return `
        <a class="profile-publication-item reveal" href="${escapeHtml(href)}"${item.url ? ' target="_blank" rel="noopener"' : ""}>
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            ${subtitle ? `<p class="publication-subtitle">${escapeHtml(subtitle)}</p>` : ""}
            <p class="publication-authors">${highlightAuthor(item.authors || "")}</p>
            <p>${escapeHtml([item.venue, item.date || item.year].filter(Boolean).join(" · "))}</p>
          </div>
        </a>
      `;
    })
    .join("");
}

function renderAllPublications(items) {
  const target = document.querySelector("#all-publication-list");
  if (!target) return;
  const sorted = [...items].sort((a, b) => publicationTime(b) - publicationTime(a));
  target.innerHTML = sorted
    .map((item) => {
      const title = item.title;
      const subtitle = currentLang === "zh" ? item.titleZh || publicationChineseTitles[item.title] || "" : "";
      const venue = item.venue;
      const href = item.url || "";
      const linkStart = href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">` : `<article>`;
      const linkEnd = href ? `</a>` : `</article>`;

      return `
        ${linkStart}
          <time>${escapeHtml(item.date || item.year || "")}</time>
          <div>
            <h3>${escapeHtml(title)}</h3>
            ${subtitle ? `<p class="publication-subtitle">${escapeHtml(subtitle)}</p>` : ""}
            <p class="publication-authors">${highlightAuthor(item.authors || "")}</p>
            <p>${escapeHtml(venue || "")}</p>
          </div>
        ${linkEnd}
      `;
    })
    .join("");
}

function publicationTime(item) {
  const source = item.date && item.date !== "-" ? item.date : item.year;
  const match = String(source || "").match(/(\d{4})(?:[-.](\d{1,2}))?(?:[-.](\d{1,2}))?/);
  if (!match) return 0;
  const year = Number(match[1]);
  const month = Number(match[2] || 1) - 1;
  const day = Number(match[3] || 1);
  return new Date(year, month, day).getTime();
}

function renderProjects(items) {
  const target = document.querySelector("#project-list");
  if (!target) return;
  target.innerHTML = items
    .map((item, index) => {
      const title = localizeText(item.title);
      const text = localizeText(item.text);
      return `
        <article class="detail-item reveal">
          <time>${String(index + 1).padStart(2, "0")}</time>
          <div>
            <h3>${item.url ? `<a href="${escapeHtml(item.url)}">${escapeHtml(title)}</a>` : escapeHtml(title)}</h3>
            <p>${escapeHtml(text)}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAchievements(items) {
  const target = document.querySelector("#achievement-list");
  if (!target) return;
  target.innerHTML = items
    .map(
      (item) => `
        <article class="achievement-item reveal">
          <div class="achievement-meta">
            <span>${escapeHtml(localizeText(item.type))}</span>
            <time>${escapeHtml(item.year)}</time>
          </div>
          <h3>${escapeHtml(localizeText(item.title))}</h3>
          ${item.applicant ? `<p class="detail-applicant">${escapeHtml(applicantLabel(item))}：${highlightAuthor(localizeText(item.applicant))}</p>` : ""}
          <p>${escapeHtml(localizeText(item.detail))}</p>
        </article>
      `,
    )
    .join("");
}

function renderDetailLists(items) {
  document.querySelectorAll("[data-achievement-types]").forEach((target) => {
    const types = target.dataset.achievementTypes.split(",").map((type) => type.trim());
    const filtered = items.filter((item) => types.includes(item.type));
      target.innerHTML = filtered
      .map(
        (item) => `
          <article class="detail-item reveal">
            <time>${escapeHtml(localizeText(item.year))}</time>
            <div>
              <p class="detail-type">${escapeHtml(localizeText(item.type))}</p>
              <h3>${escapeHtml(localizeText(item.title))}</h3>
              ${item.applicant ? `<p class="detail-applicant">${escapeHtml(applicantLabel(item))}：${highlightAuthor(localizeText(item.applicant))}</p>` : ""}
              <p>${escapeHtml(localizeText(item.detail))}</p>
            </div>
          </article>
        `,
      )
      .join("");
  });
}

function renderExperience(items) {
  const target = document.querySelector("#experience-list");
  if (!target) return;
  target.innerHTML = items
    .map(
      (item) => `
        <li>
          <time>${escapeHtml(localizeText(item.period))}</time>
          <div>
            <h3>${escapeHtml(localizeText(item.title))}</h3>
            <p>${escapeHtml(localizeText(item.text))}</p>
          </div>
        </li>
      `,
    )
    .join("");
}

function renderContacts(items) {
  const target = document.querySelector("#contact-links");
  if (!target) return;
  target.innerHTML = items
    .map((item) => `<a href="${escapeHtml(item.url || "#")}">${escapeHtml(item.value || item.label)}</a>`)
    .join("");
}

function renderSite() {
  const data = getSiteData();
  renderProfile(data);
  renderMetrics(data.metrics || []);
  renderResearch(data.research || []);
  renderNews(data.news || []);
  renderNewsDetail(data.newsDetails || []);
  renderPublications(data.publications || []);
  renderProfilePublications(data.publications || []);
  renderAllPublications(data.allPublications || data.publications || []);
  renderProjects(data.projects || []);
  renderAchievements(data.achievements || []);
  renderDetailLists(data.achievements || []);
  renderExperience(data.experience || []);
  renderContacts(data.contacts || []);
  applyLanguage();
  setupGlassSurface();
  setupBorderGlow();
  setupSplitText();
  setupNavigation();
}

function setupLanguageToggle() {
  document.documentElement.lang = currentLang === "en" ? "en" : "zh-CN";
  document.querySelectorAll(".nav-links").forEach((nav) => {
    if (nav.querySelector(".language-toggle")) return;
    const button = document.createElement("button");
    button.className = "language-toggle";
    button.type = "button";
    button.addEventListener("click", () => {
      currentLang = currentLang === "en" ? "zh" : "en";
      localStorage.setItem(LANG_KEY, currentLang);
      window.location.reload();
    });
    nav.append(button);
  });
}

function applyLanguage() {
  setupLanguageToggle();
  const dict = translations[currentLang];
  document.documentElement.lang = currentLang === "en" ? "en" : "zh-CN";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (dict[key]) node.textContent = dict[key];
  });
  document.querySelectorAll(".language-toggle").forEach((button) => {
    button.textContent = dict.langButton;
    button.setAttribute("aria-label", currentLang === "en" ? "Switch to Chinese" : "切换到英文");
  });
  document.querySelectorAll(".nav-menu-toggle").forEach((button) => {
    button.textContent = currentLang === "en" ? "Menu" : "菜单";
    if (!button._menuBound) {
      button._menuBound = true;
      button.addEventListener("click", () => {
        const nav = document.querySelector(".nav-links");
        const isOpen = nav.classList.toggle("is-open");
        button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        // close sibling dropdowns inside nav
        if (!isOpen) {
          nav.querySelectorAll(".nav-group.is-open").forEach((g) => g.classList.remove("is-open"));
        }
      });
      // click outside to close
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".nav-links") && !e.target.closest(".nav-menu-toggle")) {
          const nav = document.querySelector(".nav-links");
          if (nav.classList.contains("is-open")) {
            nav.classList.remove("is-open");
            button.setAttribute("aria-expanded", "false");
            nav.querySelectorAll(".nav-group.is-open").forEach((g) => g.classList.remove("is-open"));
          }
        }
      });
    }
  });
  translateNavigation(dict);
  translateLooseHeadings(dict);
  document.querySelectorAll(".footer-address").forEach((node) => {
    node.textContent = localizeText("通信地址：南京大学仙林校区现代工学院A302");
  });
}

function translateNavigation(dict) {
  const labels = {
    "index.html": dict.navHome,
    "profile.html": dict.profile,
    "results.html": dict.results,
    "results.html#papers": dict.publications,
    "results.html#patents": dict.patents,
    "results.html#projects": dict.projects,
    "honors.html": dict.honors,
    "honors.html#awards": dict.awards,
    "honors.html#innovation": currentLang === "en" ? "Innovation" : "创新创业",
    "conferences.html#talks": currentLang === "en" ? "Conferences" : "国内外会议",
    "conferences.html#service": currentLang === "en" ? "Service" : "学术服务",
    "conferences.html#reviews": currentLang === "en" ? "Reviewing" : "审稿服务",
    "publications.html": dict.publications,
    "patents.html": dict.patents,
    "projects.html": dict.projects,
    "achievements.html": dict.achievements,
    "awards.html": dict.awards,
    "conferences.html": dict.conferences,
    "contact.html": dict.contact,
  };

  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href");
    if (labels[href]) link.textContent = labels[href];
  });
}

function setupNavigation() {
  const nav = document.querySelector("#site-nav");
  if (nav && nav.dataset.ready !== "true") {
    nav.dataset.ready = "true";
    ensureNavIndicator(nav);
    nav.addEventListener("click", (event) => {
      const targetEl = event.target.nodeType === Node.TEXT_NODE ? event.target.parentElement : event.target;
      const dropdownLink = targetEl.closest(".nav-dropdown a");
      const clickedTopLink = targetEl.closest(".nav-links > a, .nav-group > a");
      const clickedGroupLink = clickedTopLink?.closest(".nav-group") ? clickedTopLink : null;
      const group = dropdownLink?.closest(".nav-group") || clickedGroupLink?.closest(".nav-group");
      const indicatorTarget = clickedTopLink || getGroupMainLink(group);
      if (indicatorTarget) storeNavIndicatorPosition(nav, indicatorTarget);

      if (clickedGroupLink && isCompactNav()) {
        const isOpen = group.classList.contains("is-open");
        document.querySelectorAll(".nav-group.is-open").forEach((item) => {
          if (item !== group) item.classList.remove("is-open");
        });
        if (!isOpen) {
          event.preventDefault();
          group.classList.add("is-open");
          updateNavIndicator(nav);
          return;
        }
      }

      if (targetEl.closest(".nav-links a")) {
        document.querySelectorAll(".nav-group.is-open").forEach((item) => item.classList.remove("is-open"));
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        const navLinks = document.querySelector(".nav-links");
        if (navLinks && navLinks.classList.contains("is-open")) {
          navLinks.classList.remove("is-open");
          document.querySelectorAll(".nav-menu-toggle").forEach((btn) => btn.setAttribute("aria-expanded", "false"));
        }
      }
      if (dropdownLink && group) {
        window.setTimeout(() => {
          group.classList.add("nav-suppress-dropdown");
          group.querySelectorAll(".nav-dropdown a").forEach((link) => {
            link.blur();
          });
          window.setTimeout(() => group.classList.remove("nav-suppress-dropdown"), 520);
        }, 0);
      }
    });
    document.addEventListener("click", (event) => {
      const targetEl = event.target.nodeType === Node.TEXT_NODE ? event.target.parentElement : event.target;
      if (!targetEl.closest(".site-header")) {
        document.querySelectorAll(".nav-group.is-open").forEach((item) => item.classList.remove("is-open"));
      }
    });
    window.addEventListener("hashchange", setupNavigation);
    window.addEventListener("resize", () => updateNavIndicator(nav));
    window.addEventListener("load", () => updateNavIndicator(nav));
  }
  if (nav) ensureNavIndicator(nav);

  const path = normalizedCurrentPage();
  document.querySelectorAll("[data-nav], [data-nav-group]").forEach((node) => node.removeAttribute("aria-current"));
  const groupByPage = {
    results: "results",
    publications: "results",
    patents: "results",
    projects: "results",
    honors: "honors",
    awards: "honors",
    achievements: "honors",
    conferences: "conferences",
    "news-light-fingerprint": "home",
    contact: "profile",
  };
  const current = path === "index" ? "home" : path === "profile" ? "profile" : groupByPage[path] || "";
  if (!current) return;
  document.querySelectorAll(`[data-nav="${current}"], [data-nav-group="${current}"] > a`).forEach((node) => {
    node.setAttribute("aria-current", "page");
  });
  if (window.location.hash) {
    const exactHref = `${path}${window.location.hash}`;
    document.querySelectorAll(".nav-dropdown a").forEach((node) => {
      if (normalizeHrefTarget(node.getAttribute("href")) === exactHref) {
        node.setAttribute("aria-current", "location");
      }
    });
  }
  updateNavIndicator(nav);
  requestAnimationFrame(() => updateNavIndicator(nav));
}

function normalizedCurrentPage() {
  const rawPath = window.location.pathname.split("/").filter(Boolean).pop() || "index";
  return rawPath.replace(/\.html$/, "") || "index";
}

function normalizeHrefTarget(value = "") {
  const [pathPart, hashPart] = String(value).split("#");
  const file = (pathPart.split("/").filter(Boolean).pop() || "index").replace(/\.html$/, "") || "index";
  return hashPart ? `${file}#${hashPart}` : file;
}

function ensureNavIndicator(nav) {
  if (!nav || nav.querySelector(".nav-indicator")) return;
  const indicator = document.createElement("span");
  indicator.className = "nav-indicator";
  indicator.setAttribute("aria-hidden", "true");
  nav.prepend(indicator);
}

function navIndicatorMetrics(nav, node) {
  const navRect = nav.getBoundingClientRect();
  const rect = node.getBoundingClientRect();
  return {
    left: rect.left - navRect.left + nav.scrollLeft,
    width: rect.width,
  };
}

function storeNavIndicatorPosition(nav, node) {
  try {
    sessionStorage.setItem(NAV_INDICATOR_KEY, JSON.stringify(navIndicatorMetrics(nav, node)));
  } catch {
    // Ignore storage failures in private browsing or restricted contexts.
  }
}

function getGroupMainLink(group) {
  if (!group) return null;
  return Array.from(group.children).find((child) => child.matches?.("a")) || null;
}

function getActiveNavLink(nav) {
  const directLink = Array.from(nav.children).find((child) => child.matches?.("a[aria-current='page']"));
  if (directLink) return directLink;
  return Array.from(nav.querySelectorAll(".nav-group")).map(getGroupMainLink).find((link) => {
    return link?.getAttribute("aria-current") === "page";
  }) || null;
}

function isCompactNav() {
  return window.innerWidth <= 860 ||
    window.matchMedia("(max-width: 860px)").matches ||
    window.matchMedia("(hover: none)").matches ||
    "ontouchstart" in window;
}

function openCompactNavGroup(group, nav) {
  compactNavClickBlockUntil = Date.now() + 520;
  document.querySelectorAll(".nav-group.is-open").forEach((item) => {
    if (item !== group) item.classList.remove("is-open");
  });
  group.classList.add("is-open");
  const link = getGroupMainLink(group);
  if (link) storeNavIndicatorPosition(nav, link);
  updateNavIndicator(nav);
}

function updateNavIndicator(nav) {
  if (!nav) return;
  const indicator = nav.querySelector(".nav-indicator");
  const active = getActiveNavLink(nav);
  if (!indicator || !active) return;

  const target = navIndicatorMetrics(nav, active);
  let previous = null;
  try {
    previous = JSON.parse(sessionStorage.getItem(NAV_INDICATOR_KEY) || "null");
    sessionStorage.removeItem(NAV_INDICATOR_KEY);
  } catch {
    previous = null;
  }

  if (previous && Number.isFinite(previous.left) && Number.isFinite(previous.width)) {
    nav.style.setProperty("--nav-indicator-left", `${previous.left}px`);
    nav.style.setProperty("--nav-indicator-width", `${previous.width}px`);
    indicator.classList.add("is-ready");
    requestAnimationFrame(() => {
      nav.style.setProperty("--nav-indicator-left", `${target.left}px`);
      nav.style.setProperty("--nav-indicator-width", `${target.width}px`);
    });
    return;
  }

  nav.style.setProperty("--nav-indicator-left", `${target.left}px`);
  nav.style.setProperty("--nav-indicator-width", `${target.width}px`);
  indicator.classList.add("is-ready");
}

function translateLooseHeadings(dict) {
  const homeResearch = document.querySelector("#home-research-title");
  if (homeResearch) homeResearch.textContent = dict.researchTitle;

  const exact = {
    个人简介: dict.profile,
    简介: dict.profile,
    主页: dict.navHome,
    研究内容: dict.researchTitle,
    Research: dict.researchTitle,
    Timeline: currentLang === "en" ? "Timeline" : "时间线",
    Papers: dict.publications,
    "All Papers": dict.allPublications,
    "Patent Portfolio": dict.patents,
    代表论文: dict.representativePublications,
    论文: dict.publications,
    专利: dict.patents,
    获批项目: dict.projects,
    项目: dict.projects,
    成果: dict.results,
    荣誉: dict.honors,
    成果荣誉: dict.achievements,
    奖励: dict.awards,
    创新创业: currentLang === "en" ? "Innovation" : "创新创业",
    会议: dict.conferences,
    学术任职: currentLang === "en" ? "Appointments" : "学术任职",
    参加会议: currentLang === "en" ? "Conferences" : "国内外会议",
    国内外会议: currentLang === "en" ? "Conferences" : "国内外会议",
    学术服务: currentLang === "en" ? "Service" : "学术服务",
    审稿服务: currentLang === "en" ? "Reviewing" : "审稿服务",
    学术经历: dict.experience,
    学习工作经历: currentLang === "en" ? "Education and Appointments" : "学习工作经历",
    联系合作: dict.contact,
    联系方式: dict.contact,
    新闻动态: dict.news,
    News: dict.news,
    Profile: dict.profile,
    Publications: dict.publications,
    Patents: dict.patents,
    Projects: dict.projects,
    Achievements: dict.achievements,
    Awards: dict.awards,
    Patents: dict.patents,
    Projects: dict.projects,
    Conferences: dict.conferences,
    Experience: dict.experience,
    Contact: dict.contact,
    Results: dict.results,
    Honors: dict.honors,
    Appointments: currentLang === "en" ? "Appointments" : "学术任职",
    Innovation: currentLang === "en" ? "Innovation" : "创新创业",
    Service: currentLang === "en" ? "Service" : "学术服务",
    Reviewing: currentLang === "en" ? "Reviewing" : "审稿服务",
    五篇代表作: currentLang === "en" ? "Five Selected Works" : "五篇代表作",
    "Selected Work": dict.selectedWork,
    代表成果: dict.selectedWork,
    论文列表: dict.publicationList,
    "Publication List": dict.publicationList,
    "代表性论文": dict.representativePublications,
    "Selected Publications": dict.representativePublications,
    "全部论文": dict.allPublications,
    "All Publications": dict.allPublications,
    管理论文: dict.managePublications,
    "Manage Publications": dict.managePublications,
    返回首页: dict.home,
    Home: dict.home,
    维护内容: dict.manageContent,
    "Manage Content": dict.manageContent,
  };

  document.querySelectorAll("h1, h2, h3, a, button, p").forEach((node) => {
    const text = node.textContent.trim();
    if (exact[text]) node.textContent = exact[text];
  });

  const paragraphExact = {
    "展示代表性成果，并提供完整论文列表入口。": dict.publicationHero,
    "Selected representative work with access to the complete publication list.": dict.publicationHero,
    "展示主持与参与的科研项目，覆盖国家、省部级基金、博士后项目与融合创新项目。": dict.projectsHero,
    "Funded research projects across national, provincial, postdoctoral, and interdisciplinary programs.": dict.projectsHero,
    "整合专利、奖励、学术任职、会议报告、学术服务与创新创业成果。": dict.achievementsHero,
    "Patents, awards, academic appointments, conference talks, service, and innovation activities.": dict.achievementsHero,
    "从本科到博士、博士后与准聘助理教授，呈现研究主题持续演进的时间线。": dict.experienceHero,
    "Academic training and appointments from undergraduate study to current faculty position.": dict.experienceHero,
    "欢迎围绕光纤集成器件、智能光电探测、精密光谱与多维光场分析等方向交流合作。": dict.contactHero,
    "Open to collaboration in fiber-integrated devices, intelligent photodetection, precision spectroscopy, and light-field analysis.": dict.contactHero,
  };

  document.querySelectorAll("p").forEach((node) => {
    const text = node.textContent.trim();
    if (paragraphExact[text]) node.textContent = paragraphExact[text];
  });
}

function setupSplitText() {
  const targets = document.querySelectorAll(
    ".clean-copy h1, .page-hero h1, .profile-identity h1, .section-heading h2",
  );
  targets.forEach((node) => {
    const text = node.textContent.trim();
    if (!text) return;
    if (node.dataset.splitText === text) return;

    node.dataset.splitText = text;
    node.classList.add("split-text");
    node.classList.toggle("split-text-home", node.matches(".clean-copy h1"));
    node.textContent = "";

    let index = 0;
    const appendChar = (parent, char) => {
      const span = document.createElement("span");
      span.className = "split-char";
      span.style.setProperty("--split-delay", `${Math.min(index * 56, 1720)}ms`);
      span.textContent = char === " " ? "\u00a0" : char;
      parent.append(span);
      index += 1;
    };

    if (/^[\x00-\x7F\s.,;:!?'"()&/+-]+$/.test(text) && text.includes(" ")) {
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          appendChar(node, " ");
          return;
        }
        const word = document.createElement("span");
        word.className = "split-word";
        Array.from(part).forEach((char) => appendChar(word, char));
        node.append(word);
      });
      return;
    }

    Array.from(text).forEach((char) => appendChar(node, char));
  });
}

function parseHsl(value = "195 90 70") {
  const match = String(value).match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 195, s: 90, l: 70 };
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

function buildGlowVars(glowColor = "195 90 70", intensity = 1) {
  const { h, s, l } = parseHsl(glowColor);
  const values = [100, 60, 50, 40, 30, 20, 10];
  const keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"];
  return keys.reduce((vars, key, index) => {
    vars[`--glow-color${key}`] = `hsl(${h}deg ${s}% ${l}% / ${Math.min(values[index] * intensity, 100)}%)`;
    return vars;
  }, {});
}

function setupBorderGlow() {
  const cards = document.querySelectorAll(
    ".news-card, .news-article-card, .news-info-card, .feature-card, .publication-item, .profile-publication-item, .all-publication-list > a, .all-publication-list > article, .detail-item, .project-card, .achievement-item, .profile-photo",
  );
  cards.forEach((card, index) => {
    if (card.dataset.glowReady === "true") return;
    card.dataset.glowReady = "true";
    card.classList.add("border-glow-card");
    card.style.setProperty("--card-bg", index % 3 === 0 ? "#090d16" : "#070b12");
    card.style.setProperty("--edge-sensitivity", "26");
    card.style.setProperty("--border-radius", "8px");
    card.style.setProperty("--glow-padding", "34px");
    card.style.setProperty("--cone-spread", "24");
    card.style.setProperty("--fill-opacity", "0.35");
    Object.entries(buildGlowVars(index % 2 ? "190 96 68" : "205 98 72", 0.92)).forEach(([key, value]) => {
      card.style.setProperty(key, value);
    });
    if (!card.querySelector(":scope > .edge-light")) {
      card.insertAdjacentHTML("afterbegin", '<span class="edge-light" aria-hidden="true"></span>');
    }
    card.addEventListener("pointermove", handleGlowPointerMove);
    card.classList.add("sweep-active");
    requestAnimationFrame(() => {
      card.style.setProperty("--edge-proximity", "80");
      card.style.setProperty("--cursor-angle", "125deg");
      setTimeout(() => {
        card.style.setProperty("--edge-proximity", "0");
        card.classList.remove("sweep-active");
      }, 900 + index * 35);
    });
  });
}

function handleGlowPointerMove(event) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const dx = x - cx;
  const dy = y - cy;
  const kx = dx === 0 ? Infinity : cx / Math.abs(dx);
  const ky = dy === 0 ? Infinity : cy / Math.abs(dy);
  const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  if (angle < 0) angle += 360;
  card.style.setProperty("--edge-proximity", `${(edge * 100).toFixed(3)}`);
  card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`);
}

function setupGlassSurface() {
  const glassTargets = document.querySelectorAll(
    ".site-header, .news-card, .news-article-card, .news-info-card, .feature-card, .publication-item, .profile-publication-item, .all-publication-list > a, .all-publication-list > article, .detail-item, .project-card, .achievement-item, .profile-combo, .contact-inner, .admin-hero, .editor-panel, .item-list, .json-panel",
  );
  glassTargets.forEach((node) => {
    node.classList.add("glass-surface", "glass-surface--fallback");
  });
}

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = document.body.classList.contains("home-dark") ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = document.body.classList.contains("home-dark")
    ? Math.max(42, Math.min(92, Math.floor(width / 18)))
    : Math.max(28, Math.min(78, Math.floor(width / 18)));
  particles = Array.from({ length: count }, (_, index) => ({
    x: (index * 97) % width,
    y: (index * 53) % height,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    r: 1.3 + Math.random() * 2.4,
  }));

  lightStreaks = Array.from({ length: Math.max(46, Math.min(96, Math.floor(width / 18))) }, () => createLightStreak(true));
}

function drawNetwork() {
  if (!canvas || !ctx) return;
  if (document.body.classList.contains("home-dark")) {
    drawFiberSystem();
    return;
  }

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(0, 119, 237, 0.48)";
  ctx.strokeStyle = "rgba(0, 119, 237, 0.11)";
  ctx.lineWidth = 1;

  for (const point of particles) {
    point.x += point.vx;
    point.y += point.vy;

    if (point.x < -20) point.x = width + 20;
    if (point.x > width + 20) point.x = -20;
    if (point.y < -20) point.y = height + 20;
    if (point.y > height + 20) point.y = -20;
  }

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (distance < 145) {
        ctx.globalAlpha = 1 - distance / 145;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  ctx.globalAlpha = 1;
  for (const point of particles) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
    ctx.fill();
  }

  rafId = requestAnimationFrame(drawNetwork);
}

function drawFiberSystem() {
  ctx.clearRect(0, 0, width, height);
  frame += 1;

  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "#05070c");
  base.addColorStop(0.42, "#071936");
  base.addColorStop(1, "#02040a");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  const glowX = width * 0.58;
  const glowY = height * 0.18;
  const bgGlow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(width, height) * 0.62);
  bgGlow.addColorStop(0, "rgba(82, 39, 255, 0.24)");
  bgGlow.addColorStop(0.34, "rgba(88, 213, 255, 0.13)");
  bgGlow.addColorStop(1, "rgba(5, 7, 12, 0)");
  ctx.fillStyle = bgGlow;
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = "lighter";

  drawLightfallStars();
  drawLightfallStreaks();

  ctx.globalCompositeOperation = "source-over";
  rafId = requestAnimationFrame(drawNetwork);
}

function createLightStreak(randomY = false) {
  const color = lightfallColors[Math.floor(Math.random() * lightfallColors.length)];
  return {
    x: Math.random() * width,
    y: randomY ? Math.random() * height : -Math.random() * height * 0.35 - 80,
    length: 230 + Math.random() * 460,
    speed: 1.15 + Math.random() * 1.85,
    width: 0.7 + Math.random() * 1.35,
    drift: -0.12 + Math.random() * 0.08,
    color,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.34 + Math.random() * 0.66,
  };
}

function drawLightfallStars() {
  for (let i = 0; i < particles.length; i += 1) {
    const point = particles[i];
    point.y += 0.12 + (i % 5) * 0.012;
    point.x -= 0.05 + (i % 7) * 0.006;
    if (point.y > height + 20) point.y = -20;
    if (point.x < -20) point.x = width + 20;
    const twinkle = 0.42 + Math.sin(frame * 0.035 + point.x * 0.01 + point.y * 0.02) * 0.32;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.r * (0.52 + twinkle * 0.28), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(166, 200, 255, ${0.1 + twinkle * 0.34})`;
    ctx.shadowColor = "rgba(82, 39, 255, 0.62)";
    ctx.shadowBlur = 7 + twinkle * 7;
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function drawLightfallStreaks() {
  for (let i = 0; i < lightStreaks.length; i += 1) {
    const streak = lightStreaks[i];
    const strength = 0;
    const pulse = 0.72 + Math.sin(frame * 0.055 + streak.phase) * 0.28;
    const alpha = Math.min(1, streak.alpha * pulse + strength * 0.42);
    const dx = streak.length * streak.drift;
    const dy = streak.length;
    const headX = streak.x;
    const headY = streak.y;
    const tailX = headX - dx;
    const tailY = headY - dy;
    const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(0.52, hexToRgba(streak.color, alpha * 0.28));
    gradient.addColorStop(1, hexToRgba(streak.color, alpha));

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(headX, headY);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = streak.width * (1 + strength * 1.4);
    ctx.shadowColor = streak.color;
    ctx.shadowBlur = 14 + strength * 22;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(headX, headY, 1.6 + strength * 3.4, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(streak.color, alpha);
    ctx.fill();

    streak.y += streak.speed * (1 + strength * 0.65);
    streak.x += streak.drift * streak.speed * 0.55;

    if (streak.y - streak.length > height + 80 || streak.x < -width * 0.35 || streak.x > width * 1.25) {
      lightStreaks[i] = createLightStreak(false);
    }
  }
  ctx.shadowBlur = 0;
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function cubic(a, b, c, d, t) {
  const mt = 1 - t;
  return mt ** 3 * a + 3 * mt ** 2 * t * b + 3 * mt * t ** 2 * c + t ** 3 * d;
}

function updateHeader() {
  if (!header) return;
  header.dataset.elevated = String(window.scrollY > 12);
  updateStoryProgress();
}

function updateStoryProgress() {
  const story = document.querySelector("#fiber-story");
  if (!story) return;

  const max = Math.max(story.offsetHeight - window.innerHeight, 1);
  const raw = Math.min(Math.max(window.scrollY / max, 0), 1);
  storyProgress = raw;
  document.documentElement.style.setProperty("--story-progress", raw.toFixed(3));
}

function revealOnView() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  items.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${Math.min(index * 45, 260)}ms`);
    observer.observe(item);
  });
}

async function initSite() {
  // Try to fetch from Supabase (will fallback to data.js if offline or error)
  if (window.fetchSiteData) {
    try {
      _cachedSiteData = await window.fetchSiteData();
      // Cache in localStorage for offline use
      if (_cachedSiteData && !window.USE_OFFLINE) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_cachedSiteData));
      }
    } catch (err) {
      console.error('[Init] Supabase fetch failed:', err);
      _cachedSiteData = null; // Will fallback to getSiteData() using data.js
    }
  }

  renderSite();
  revealOnView();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("scroll", updateHeader, { passive: true });
}

initSite();
window.addEventListener("hashchange", setupNavigation);
resizeCanvas();
updateStoryProgress();
updateHeader();
drawNetwork();

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(rafId);
  } else {
    drawNetwork();
  }
});

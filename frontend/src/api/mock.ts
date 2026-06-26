const BASE = import.meta.env.BASE_URL;

const DEMO_IMAGES = [
  `${BASE}assets/h5-sample-3.png`,
  `${BASE}assets/h5-sample-4.png`,
  `${BASE}assets/h5-sample-5.png`,
  `${BASE}assets/h5-sample-6.png`,
];

// ── Public showcase mock ──

export interface MockWork {
  id: string;
  work_number: string;
  name_masked: string;
  images: string[];
  vote_count: number;
}

const mockWorks: MockWork[] = Array.from({ length: 20 }, (_, i) => ({
  id: `mock-${String(i + 1).padStart(3, "0")}`,
  work_number: `ZH26-${String(i + 1).padStart(3, "0")}`,
  name_masked: [
    "张**","李**","王**","赵**","陈**","刘**","黄**","周**","吴**","郑**",
    "孙**","马**","胡**","朱**","林**","何**","郭**","高**","罗**","梁**",
  ][i],
  images: [DEMO_IMAGES[i % 4]],
  vote_count: [328, 156, 89, 512, 67, 234, 445, 198, 76, 623, 301, 45, 267, 389, 142, 98, 511, 73, 420, 185][i],
}));

export function getMockWorks(params?: { search?: string; sort?: string; page?: number; size?: number }) {
  let filtered = [...mockWorks];
  const search = params?.search?.trim() || "";
  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter(w => w.work_number.toLowerCase().includes(lower) || w.name_masked.includes(lower));
  }
  if (params?.sort === "votes") filtered.sort((a, b) => b.vote_count - a.vote_count);
  else if (params?.sort === "latest") filtered.reverse();
  const page = params?.page || 1;
  const size = params?.size || 8;
  const start = (page - 1) * size;
  return { data: filtered.slice(start, start + size), total: filtered.length, page, size };
}

export function getMockVoteStatus() {
  return { channel_status: "open", custom_message: "" };
}

// ── Mock login ──

// ⚠️ DEMO ONLY — 仅用于本地开发和演示，请勿将密码提交到生产环境
const MOCK_USERS: Record<string, { password: string; role: string }> = {
  admin: { password: "admin123", role: "super_admin" },
  scorer_a: { password: "scorer123", role: "scorer_a" },
  scorer_b: { password: "scorer123", role: "scorer_b" },
  scorer_c: { password: "scorer123", role: "scorer_c" },
  scorer_d: { password: "scorer123", role: "scorer_d" },
};

export function mockLogin(username: string, password: string) {
  const user = MOCK_USERS[username];
  if (!user || user.password !== password) {
    throw { response: { data: { message: "用户名或密码错误" }, status: 401 } };
  }
  return { token: `mock-token-${username}-${Date.now()}`, role: user.role };
}

// ── Admin works mock ──

export interface MockAdminWork {
  id: string;
  work_number: string | null;
  contestant_name: string;
  contestant_phone: string;
  contestant_tax_id: string;
  contestant_address: string;
  images: string[];
  status: string;
  reject_reason: string | null;
  created_at: string;
}

const NAMES = ["张建国","李美玲","王大明","陈小芳","刘志强","赵丽华","周文博","吴秀英","郑伟杰","冯雪梅",
  "蒋海龙","沈玉兰","韩磊","杨静","朱建华","秦晓燕","许志明","何丽","吕强","施美华"];
const ADDRESSES = ["浙江省杭州市中山路128号","江苏省南京市解放路56号","广东省广州市人民路302号",
  "福建省福州市建设路89号","山东省济南市和平街45号","河南省郑州市长安街167号",
  "湖北省武汉市南京路223号","四川省成都市北京路78号"];

const mockAdminWorks: MockAdminWork[] = Array.from({ length: 20 }, (_, i) => {
  const statuses = ["pending","pending","pending","pending","pending","approved","approved","approved",
    "approved","approved","approved","approved","approved","approved","approved","approved","approved","rejected","rejected","rejected"];
  const s = statuses[i];
  const daysAgo = Math.floor(Math.random() * 14) + 1;
  const date = new Date(Date.now() - daysAgo * 86400000).toISOString();
  return {
    id: `wa-${String(i + 1).padStart(3, "0")}`,
    work_number: s === "pending" ? null : `ZH26-${String(i + 1).padStart(3, "0")}`,
    contestant_name: NAMES[i],
    contestant_phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
    contestant_tax_id: `91330100MA28W${String(Math.floor(Math.random() * 90000) + 10000)}X`,
    contestant_address: ADDRESSES[i % 8],
    images: [DEMO_IMAGES[i % 4]],
    status: s,
    reject_reason: s === "rejected" ? "照片模糊，不符合参赛要求" : null,
    created_at: date,
  };
});

export function getMockAdminWorks(params?: { status?: string; page?: number; size?: number }) {
  let filtered = [...mockAdminWorks];
  if (params?.status && params.status !== "all") {
    filtered = filtered.filter(w => w.status === params.status);
  }
  const page = params?.page || 1;
  const size = params?.size || 100;
  const start = (page - 1) * size;
  return { data: filtered.slice(start, start + size), total: filtered.length, page, size };
}

// ── Scores mock ──

export function getMockScores() {
  const approved = mockAdminWorks.filter(w => w.status === "approved");
  const maxByRole: Record<string, number> = { scorer_a: 4, scorer_b: 5, scorer_c: 4, scorer_d: 2 };
  return approved.map(w => {
    const scores = ["scorer_a","scorer_b","scorer_c","scorer_d"].map(role => {
      const max = maxByRole[role];
      // Random subtotal within [0, max] using discrete increments
      const possible = [];
      for (let v = 0; v <= max; v += 0.5) possible.push(v);
      const subtotal = possible[Math.floor(Math.random() * possible.length)];
      return {
        scorer_role: role,
        items: [{ item_name: "评分项", selected_score: subtotal }],
        subtotal,
        status: ["reviewed","reviewed","reviewed","locked"][Math.floor(Math.random() * 4)] as string,
      };
    });
    return { work_id: w.id, work_number: w.work_number, contestant_name: w.contestant_name, scores };
  });
}

// ── Config mock ──

export function getMockConfig(key?: string) {
  const configs: Record<string, unknown> = {
    register_channel: { status: "open", start_time: null, end_time: null },
    vote_channel: { status: "open", start_time: null, end_time: null },
    rules_content: { content: "参赛规则：每位参赛者仅限提交一份作品；作品需为原创橱窗设计。" },
    awards_content: {
      categories: [
        { name: "一等奖", amount: "¥50,000", count: 1 },
        { name: "二等奖", amount: "¥20,000", count: 3 },
        { name: "三等奖", amount: "¥10,000", count: 5 },
        { name: "人气奖", amount: "¥5,000", count: 3 },
      ],
    },
    register_closed_message: { message: "报名已关闭" },
    vote_not_started_message: { message: "投票暂未开始" },
    vote_closed_message: { message: "投票已结束" },
    popularity_score_config: {
      tiers: [
        { min: 0, max: 0, score: 1 }, { min: 1, max: 100, score: 1 },
        { min: 101, max: 300, score: 2 }, { min: 301, max: 500, score: 3 },
        { min: 501, max: 999, score: 4 }, { min: 1000, max: 999999, score: 5 },
      ],
    },
  };
  if (key) return configs[key] || null;
  return configs;
}

// ── Dashboard stats mock ──

export function getMockDashboardStats() {
  return {
    total_contestants: 20,
    total_votes: mockWorks.reduce((s, w) => s + w.vote_count, 0),
    pending_review: mockAdminWorks.filter(w => w.status === "pending").length,
    approved: mockAdminWorks.filter(w => w.status === "approved").length,
    rejected: mockAdminWorks.filter(w => w.status === "rejected").length,
  };
}

// ── Scorer boards (exact match with backend BOARDS in scoring.py) ──

const SCORER_BOARDS: Record<string, {
  name: string;
  max_score: number;
  items: Array<{ name: string; options: Array<{ score: number; description: string }> }>;
}> = {
  scorer_a: {
    name: "品牌与活动规范",
    max_score: 4,
    items: [
      {
        name: "官方海报规范展示",
        options: [
          { score: 1, description: "完整展示、无遮挡、位置醒目" },
          { score: 0.5, description: "有张贴但不规范" },
          { score: 0, description: "未展示" },
        ],
      },
      {
        name: "MP 产品陈列占比",
        options: [
          { score: 1, description: "MP 产品占比 ≥ 65%" },
          { score: 0.5, description: "MP 产品占比 50%-65%" },
          { score: 0, description: "MP 产品占比 < 50%" },
        ],
      },
      {
        name: "指定新品露出",
        options: [
          { score: 1, description: "清晰可见且有主推位置" },
          { score: 0.5, description: "有但不突出" },
          { score: 0, description: "无" },
        ],
      },
      {
        name: "品牌识别度 - Logo 及视觉",
        options: [
          { score: 1, description: "Logo 位置突出、视觉统一" },
          { score: 0.5, description: "可见但不明显" },
          { score: 0, description: "几乎无品牌识别" },
        ],
      },
    ],
  },
  scorer_b: {
    name: "视觉设计表现",
    max_score: 5,
    items: [
      {
        name: "色彩搭配与整体美感",
        options: [
          { score: 2, description: "色彩统一、有主题、有层次" },
          { score: 1, description: "基本协调但略杂" },
          { score: 0, description: "杂乱无章" },
        ],
      },
      {
        name: "橱窗创意与主题表达",
        options: [
          { score: 2, description: "有明确主题、创意突出、有记忆点" },
          { score: 1, description: "有基础设计但较普通" },
          { score: 0, description: "无明显设计" },
        ],
      },
      {
        name: "空间布局与层次感",
        options: [
          { score: 1, description: "前中后景清晰、视觉动线合理" },
          { score: 0.5, description: "有摆放但缺乏层次" },
          { score: 0, description: "堆叠混乱" },
        ],
      },
    ],
  },
  scorer_c: {
    name: "陈列专业度",
    max_score: 4,
    items: [
      {
        name: "产品陈列逻辑",
        options: [
          { score: 2, description: "分类清晰、易理解" },
          { score: 1, description: "基本分类但略乱" },
          { score: 0, description: "无逻辑摆放" },
        ],
      },
      {
        name: "主推产品突出程度",
        options: [
          { score: 1, description: "主推产品视觉焦点明显" },
          { score: 0.5, description: "有突出但不明显" },
          { score: 0, description: "无重点" },
        ],
      },
      {
        name: "价格/信息展示清晰度",
        options: [
          { score: 1, description: "有清晰标识" },
          { score: 0.5, description: "信息不完整" },
          { score: 0, description: "无信息" },
        ],
      },
    ],
  },
  scorer_d: {
    name: "执行与细节",
    max_score: 2,
    items: [
      {
        name: "橱窗整洁度与维护",
        options: [
          { score: 1, description: "干净整齐，无灰尘/歪斜" },
          { score: 0.5, description: "有轻微问题" },
          { score: 0, description: "明显杂乱" },
        ],
      },
      {
        name: "灯光与展示效果",
        options: [
          { score: 1, description: "灯光突出重点，氛围良好" },
          { score: 0.5, description: "有灯光但效果一般" },
          { score: 0, description: "无灯光或影响观感" },
        ],
      },
    ],
  },
};

export function getMockScorerTasks(role: string) {
  const board = SCORER_BOARDS[role] || SCORER_BOARDS.scorer_a;
  const approved = mockAdminWorks.filter(w => w.status === "approved");
  const statuses = ["unreviewed","unreviewed","unreviewed","reviewed","reviewed","reviewed","reviewed","reviewed","reviewed","locked","locked","locked"];
  const tasks = approved.slice(0, 12).map((w, i) => ({
    work_id: w.id,
    work_number: w.work_number || "",
    contestant_name: w.contestant_name,
    status: statuses[i % statuses.length],
  }));
  return {
    scorer_role: role,
    board_name: board.name,
    max_score: board.max_score,
    tasks,
  };
}

function pickRandomOption(options: Array<{ score: number; description: string }>) {
  return options[Math.floor(Math.random() * options.length)];
}

export function getMockScorerDetail(workId: string, role: string) {
  const board = SCORER_BOARDS[role] || SCORER_BOARDS.scorer_a;
  const work = mockAdminWorks.find(w => w.id === workId);
  const workInfo = work
    ? { number: work.work_number || "N/A", name: work.contestant_name, images: work.images }
    : { number: "ZH26-001", name: "张建国", images: [DEMO_IMAGES[0]] };

  const isScored = Math.random() > 0.4;
  const current_score = isScored ? {
    status: Math.random() > 0.3 ? "reviewed" : "locked",
    items: board.items.map(item => {
      const picked = pickRandomOption(item.options);
      return { item_name: item.name, selected_score: picked.score };
    }),
    subtotal: 0,
  } : null;

  if (current_score) {
    current_score.subtotal = current_score.items.reduce((s, i) => s + i.selected_score, 0);
  }

  return { work_info: workInfo, board: { name: board.name, max_score: board.max_score, items: board.items }, current_score };
}

const BASE = import.meta.env.BASE_URL;

export interface MockWork {
  id: string;
  work_number: string;
  name_masked: string;
  images: string[];
  vote_count: number;
}

const DEMO_IMAGE = `${BASE}assets/h5-sample-4.png`;

const mockWorks: MockWork[] = [
  { id: "mock-001", work_number: "ZH26-001", name_masked: "张**", images: [DEMO_IMAGE], vote_count: 328 },
  { id: "mock-002", work_number: "ZH26-002", name_masked: "李**", images: [DEMO_IMAGE], vote_count: 156 },
  { id: "mock-003", work_number: "ZH26-003", name_masked: "王**", images: [DEMO_IMAGE], vote_count: 89 },
  { id: "mock-004", work_number: "ZH26-004", name_masked: "赵**", images: [DEMO_IMAGE], vote_count: 512 },
  { id: "mock-005", work_number: "ZH26-005", name_masked: "陈**", images: [DEMO_IMAGE], vote_count: 67 },
  { id: "mock-006", work_number: "ZH26-006", name_masked: "刘**", images: [DEMO_IMAGE], vote_count: 234 },
  { id: "mock-007", work_number: "ZH26-007", name_masked: "黄**", images: [DEMO_IMAGE], vote_count: 445 },
  { id: "mock-008", work_number: "ZH26-008", name_masked: "周**", images: [DEMO_IMAGE], vote_count: 198 },
  { id: "mock-009", work_number: "ZH26-009", name_masked: "吴**", images: [DEMO_IMAGE], vote_count: 76 },
  { id: "mock-010", work_number: "ZH26-010", name_masked: "郑**", images: [DEMO_IMAGE], vote_count: 623 },
  { id: "mock-011", work_number: "ZH26-011", name_masked: "孙**", images: [DEMO_IMAGE], vote_count: 301 },
  { id: "mock-012", work_number: "ZH26-012", name_masked: "马**", images: [DEMO_IMAGE], vote_count: 45 },
];

export function getMockWorks(params?: { search?: string; sort?: string; page?: number; size?: number }) {
  let filtered = [...mockWorks];
  const search = params?.search?.trim() || "";
  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter(
      (w) => w.work_number.toLowerCase().includes(lower) || w.name_masked.includes(lower)
    );
  }
  if (params?.sort === "votes") {
    filtered.sort((a, b) => b.vote_count - a.vote_count);
  } else if (params?.sort === "latest") {
    filtered.reverse();
  }
  const page = params?.page || 1;
  const size = params?.size || 8;
  const start = (page - 1) * size;
  const paged = filtered.slice(start, start + size);
  return { data: paged, total: filtered.length, page, size };
}

export function getMockVoteStatus() {
  return { channel_status: "open", custom_message: "" };
}

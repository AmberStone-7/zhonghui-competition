import api from "../../api/client";

interface ExportCard {
  type: string;
  label: string;
  description: string;
}

const exportCards: ExportCard[] = [
  {
    type: "scores",
    label: "成绩数据",
    description: "导出所有参赛作品的评分数据，包含各维度得分和总分",
  },
  {
    type: "registrations",
    label: "报名数据",
    description: "导出所有报名记录，包含参赛者信息和审核状态",
  },
  {
    type: "votes",
    label: "投票数据",
    description: "导出所有投票记录，包含投票时间和投票作品",
  },
  {
    type: "logs",
    label: "操作日志",
    description: "导出系统操作日志，包含管理员操作记录",
  },
];

function handleDownload(type: string, format: string) {
  const baseURL = api.defaults.baseURL || "";
  const token = sessionStorage.getItem("admin_token");
  const url = `${baseURL}/api/admin/export?type=${type}&format=${format}`;
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "");

  // Use fetch with auth header for download
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("下载失败");
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    })
    .catch(() => {
      alert("下载失败，请稍后重试");
    });
}

export default function Export() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">数据导出</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportCards.map((card) => (
          <div
            key={card.type}
            className="bg-white border border-gray-200 rounded-lg p-5"
          >
            <h3 className="font-semibold text-gray-900 mb-1">{card.label}</h3>
            <p className="text-sm text-gray-500 mb-4">{card.description}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(card.type, "csv")}
                className="px-4 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
              >
                导出 CSV
              </button>
              <button
                onClick={() => handleDownload(card.type, "xlsx")}
                className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer transition-colors"
              >
                导出 Excel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

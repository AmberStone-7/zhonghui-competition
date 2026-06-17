import { useState, useEffect, useCallback } from "react";
import api from "../../api/client";

interface ConfigItem {
  key: string;
  label: string;
  description: string;
}

const configItems: ConfigItem[] = [
  {
    key: "rules_content",
    label: "赛制规则内容",
    description: "赛事规则页面的展示内容",
  },
  {
    key: "awards_content",
    label: "赛事奖项内容",
    description: "奖项页面的展示内容",
  },
  {
    key: "vote_closed_message",
    label: "投票关闭提示",
    description: "投票通道关闭时显示的提示信息",
  },
  {
    key: "vote_not_started_message",
    label: "投票未开始提示",
    description: "投票通道未开启时显示的提示信息",
  },
];

export default function Content() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const results: Record<string, string> = {};
      await Promise.all(
        configItems.map(async (item) => {
          try {
            const res = await api.get(`/api/admin/config/${item.key}`);
            results[item.key] = JSON.stringify(res.data.value, null, 2);
          } catch {
            results[item.key] = "";
          }
        })
      );
      setValues(results);
    } catch {
      setError("加载配置失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleEdit = (key: string) => {
    setEditKey(key);
    setEditValue(values[key] || "");
    setSuccessMsg("");
  };

  const handleSave = async () => {
    if (!editKey) return;
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const parsed = JSON.parse(editValue);
      await api.put(`/api/admin/config/${editKey}`, { value: parsed });
      setValues((prev) => ({ ...prev, [editKey]: editValue }));
      setEditKey(null);
      setSuccessMsg("保存成功");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("JSON 格式错误，请检查");
      } else {
        setError("保存失败");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditKey(null);
    setEditValue("");
    setError("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">内容管理</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-md">
          {successMsg}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">加载中...</p>
      ) : (
        <div className="space-y-4">
          {configItems.map((item) => (
            <div
              key={item.key}
              className="bg-white border border-gray-200 rounded-lg p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.label}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                {editKey !== item.key && (
                  <button
                    onClick={() => handleEdit(item.key)}
                    className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 cursor-pointer"
                  >
                    编辑
                  </button>
                )}
              </div>

              {editKey === item.key ? (
                <div className="mt-3 space-y-3">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={10}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? "保存中..." : "保存"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="mt-2 p-3 bg-gray-50 rounded-md text-xs text-gray-600 overflow-x-auto max-h-48">
                  {values[item.key] || "（空）"}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

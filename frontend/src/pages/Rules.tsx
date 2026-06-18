import { useState, useEffect } from "react";
import { ScrollText, TriangleAlert } from "lucide-react";
import Banner from "../components/Banner";
import api from "../api/client";

interface RuleSection {
  title: string;
  items: string[];
}

interface RulesContent {
  sections: RuleSection[];
  notice?: {
    title: string;
    content: string;
  };
}

const defaultRules: RulesContent = {
  sections: [
    {
      title: "参赛资格",
      items: ["所有经销商及合作伙伴均可参赛", "参赛者需为橱窗的实际负责人或设计者", "每位参赛者仅限提交一个作品"],
    },
    {
      title: "作品要求",
      items: ["作品必须为原创橱窗设计", "图片需清晰展示橱窗全貌", "禁止使用他人作品或网络图片"],
    },
    {
      title: "报名流程",
      items: ["填写真实有效的报名信息", "上传 1-3 张作品图片", "提交后等待管理员审核"],
    },
    {
      title: "评审规则",
      items: ["专业评审占总评分 70%", "人气投票占总评分 30%", "评审结果将在活动结束后公布"],
    },
    {
      title: "投票规则",
      items: ["每个手机号每天可投一票", "禁止刷票行为", "投票结果实时显示"],
    },
  ],
  notice: {
    title: "特别说明",
    content: "主办方保留对活动规则的解释权和修改权。如发现违规行为，将取消参赛资格。",
  },
};

export default function Rules() {
  const [rules, setRules] = useState<RulesContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/config/rules_content")
      .then((res) => {
        if (res.data && res.data.sections && res.data.sections.length > 0) {
          setRules(res.data);
        } else {
          setRules(defaultRules);
        }
      })
      .catch(() => setRules(defaultRules))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Banner icon={ScrollText} title="赛制规则" subtitle="了解比赛规则，公平参赛" />

      <div className="max-w-4xl mx-auto px-5 py-8">
        {loading && (
          <div className="text-center py-16 text-gray-400">
            <p>加载中...</p>
          </div>
        )}

        {!loading && rules && (
          <>
            <div className="space-y-5">
              {rules.sections.map((section, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-bold text-lg shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-3">{section.title}</h3>
                      <ul className="space-y-2">
                        {section.items.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {rules.notice && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h3 className="font-bold text-amber-800 mb-2"><TriangleAlert className="w-4 h-4 inline mr-1" /> {rules.notice.title}</h3>
                <p className="text-sm text-amber-700">{rules.notice.content}</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

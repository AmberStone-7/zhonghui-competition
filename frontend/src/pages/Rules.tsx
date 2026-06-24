const rules = [
  { num: 1, title: "参赛资格", items: ["所有经销商及合作伙伴均可参赛", "参赛者需为橱窗的实际负责人", "每位参赛者仅限提交一个作品"] },
  { num: 2, title: "作品要求", items: ["作品必须为原创橱窗设计", "图片需清晰展示橱窗全貌", "禁止使用他人作品或网络图片"] },
  { num: 3, title: "报名流程", items: ["填写真实有效的报名信息", "上传 1-3 张作品图片", "提交后等待管理员审核"] },
  { num: 4, title: "评审规则", items: ["专业评审占总评分 70%", "人气投票占总评分 30%", "评审结果将在活动结束后公布"] },
  { num: 5, title: "投票规则", items: ["每个手机号每天可投一票", "禁止刷票行为", "投票结果实时显示"] },
];

export default function Rules() {
  return (
    <div className="h5-page">
      {/* === Mobile === */}
      <div className="md:hidden">
        <div className="h5-hero min-h-[30vh] flex items-center justify-center">
          <div className="text-center mt-8">
            <h1 className="text-2xl font-bold text-white">赛制规则</h1>
            <p className="text-white/60 text-sm mt-1">了解参赛规则与评审标准</p>
          </div>
        </div>

        <div className="-mt-6 relative z-10 px-4 pb-8 space-y-3">
          {rules.map((r) => (
            <div key={r.num} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-red flex items-center justify-center shrink-0">
                  <span className="text-white text-[13px] font-bold">{r.num}</span>
                </div>
                <div>
                  <p className="text-white font-bold text-[15px] mb-1.5">{r.title}</p>
                  {r.items.map((item, i) => (
                    <p key={i} className="text-[#FFF5E6] text-[12px] leading-relaxed">· {item}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="bg-[#FEF9E7] rounded-xl p-4">
            <p className="text-[#92400E] font-bold text-sm mb-1">特别说明</p>
            <p className="text-[#92400E] text-[12px] leading-relaxed">主办方保留解释权和修改权。违规者取消参赛资格。</p>
          </div>
        </div>
      </div>

      {/* === PC === */}
      <div className="hidden md:block">
        <div className="relative bg-gradient-to-b from-[#1a0a0a] via-[#6B1A1A] to-[#a02020] h-[300px] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">赛制规则</h1>
            <p className="text-white/70 mt-2">了解参赛规则、评审标准与注意事项</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 pb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-[#1E293B] mb-6 flex items-center gap-2">
              <span className="w-5 h-5 bg-brand-red rounded-full" /> 比赛规则
            </h2>

            <div className="grid grid-cols-2 gap-x-12 gap-y-5">
              {rules.map((r) => (
                <div key={r.num} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">{r.num}</span>
                  </div>
                  <div>
                    <p className="font-bold text-[15px] text-[#1E293B] mb-1">{r.title}</p>
                    {r.items.map((item, i) => (
                      <p key={i} className="text-[#64748B] text-[12px] leading-relaxed">· {item}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#FEF9E7] rounded-lg p-4 mt-6">
              <p className="text-[#92400E] font-bold text-sm mb-1">特别说明</p>
              <p className="text-[#92400E] text-[12px]">主办方保留解释权和修改权。违规者取消参赛资格。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

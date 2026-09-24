/* ============================================================
   achievements.js — 彩蛋 / 成就系统（纯数据驱动）
   东彦猪格研究所™ / PIG-TI v5.18

   每个彩蛋 = 一条数据：
     condition(ctx)  是否满足触发条件
     script[]        动画脚本（由 app.js 里的 DSL 执行器播放）
     priority        越小越优先（一次最多完整播 2 个）
     fullAnimation   是否占用"完整播放"名额
     quickAnimation  结果公布前的快速插播（不占名额）
     chance          额外触发概率（可选，默认 1）

   script 支持的步骤类型（见 app.js runScript）：
     { t:'log',      text, cls, delay }   逐行打字出现
     { t:'lines',    items:[], step }     多行快速连出
     { t:'wait',     ms }                 纯停顿
     { t:'big',      text, cls }          超大字号
     { t:'counter',  to, duration }       数字滚动
     { t:'money',    to, duration }       金额滚动（¥ 千分位）
     { t:'barline',  label, fill, total, pct, step }   ████░░░░ 逐格
     { t:'pct',      label, steps:[], step }           百分比序列
     { t:'green' }                        界面短暂变绿
     { t:'keys' }                         键帽抖动
     { t:'foot',     text }               底部小字

   ctx = { flags, scores, winner, winnerScore }
   ============================================================ */

window.PIG_ACHIEVEMENTS = (function () {
  'use strict';

  return [
    /* ---------- 1. W 键受害者 ---------- */
    {
      id: 'wkey',
      name: 'W键受害者',
      icon: '⌨️',
      desc: 'W 键使用率已经引起键盘厂商关注。',
      priority: 6,
      fullAnimation: true,
      condition: function (ctx) { return ctx.flags.wKey >= 6; },
      script: [
        { t: 'log', text: '正在检查您的键盘健康状态……' },
        { t: 'keys' },
        { t: 'log', text: '检测到 W 键存在严重磨损。', cls: 'warn' },
        { t: 'log', text: 'A / S / D 使用次数过低，\n暂时无法确定是否正常工作。', cls: 'dim' },
        { t: 'log', text: '建议：\n偶尔松开 W，不会掉段。', cls: 'tip' }
      ]
    },

    /* ---------- 2. 走路教父 ---------- */
    {
      id: 'walking',
      name: '走路教父',
      icon: '🚶',
      desc: '队友打完一个点的时候，你还在路上。',
      priority: 5,
      fullAnimation: true,
      condition: function (ctx) { return ctx.flags.walking >= 6; },
      script: [
        { t: 'log', text: '正在分析移动习惯……' },
        { t: 'log', text: '还在走……', cls: 'dim' },
        { t: 'log', text: '还在走……', cls: 'dim' },
        { t: 'log', text: '还在走……', cls: 'dim' },
        { t: 'log', text: '系统确认：走路教父', cls: 'warn' },
        { t: 'barline', label: '绕后进度：', fill: 8, total: 10, pct: '82%', step: 430 },
        { t: 'log', text: '队友存活人数：0', cls: 'dim' },
        { t: 'log', text: '恭喜，\n你终于绕到了。', cls: 'tip' }
      ]
    },

    /* ---------- 3. 开枪前都是赋能 ---------- */
    {
      id: 'empower',
      name: '开枪前都是赋能',
      icon: '✨',
      desc: '你的自信在子弹出膛前达到峰值。',
      priority: 7,
      fullAnimation: true,
      condition: function (ctx) { return ctx.flags.empower >= 5; },
      script: [
        { t: 'log', text: '正在检测枪法自信程度……' },
        { t: 'barline', label: '开枪前自信度：', fill: 12, total: 12, pct: '100%' },
        { t: 'log', text: '随后：', cls: 'dim' },
        { t: 'barline', label: '子弹离开枪口后的命中率：', fill: 2, total: 12, pct: '18%' },
        { t: 'log', text: '开枪前都是赋能。', cls: 'warn' },
        { t: 'log', text: '开枪后各凭本事。', cls: 'warn' }
      ]
    },

    /* ---------- 4. BO518 认证 ---------- */
    {
      id: 'bo518',
      name: 'BO518认证',
      icon: '🎖️',
      desc: '五张图，一十八杀。\n数字不大，节目效果不小。',
      priority: 2,
      fullAnimation: true,
      // 额外 50% 触发概率，避免太频繁
      chance: 0.5,
      // 注：10 道题里 whiff 理论最高只能到 3（题5 最高 +2、题6 最高 +1），
      //     原设定 whiff>=5 无法达成，按实际数据平衡为 >=3。
      condition: function (ctx) {
        return ctx.flags.whiff >= 3 && ctx.flags.empower >= 3;
      },
      script: [
        { t: 'log', text: '正在计算比赛数据……' },
        {
          t: 'lines',
          items: ['BO1 击杀：6', 'BO2 击杀：4', 'BO3 击杀：3', 'BO4 击杀：3', 'BO5 击杀：2'],
          step: 210
        },
        { t: 'log', text: '总击杀：', cls: 'dim' },
        { t: 'counter', to: 18, duration: 700 },
        { t: 'wait', ms: 520 },
        { t: 'big', text: 'BO5 18' },
        { t: 'log', text: '系统检测到了一组似曾相识的数据。', cls: 'warn' },
        { t: 'log', text: '本页面拒绝对此发表进一步评论。', cls: 'dim' }
      ]
    },

    /* ---------- 5. 绿色玩家 ---------- */
    {
      id: 'green',
      name: '绿色玩家',
      icon: '🟢',
      desc: '经过严格检测，\n确认纯天然。',
      priority: 4,
      fullAnimation: true,
      chance: 0.5,
      condition: function (ctx) { return ctx.flags.green >= 5; },
      script: [
        { t: 'log', text: '⚠️ 系统检测到异常游戏行为。', cls: 'warn' },
        { t: 'log', text: '正在启动猪肉反作弊系统……' },
        {
          t: 'lines',
          items: [
            '检测自瞄………………未发现',
            '检测透视………………未发现',
            '检测锁头………………未发现',
            '检测离谱枪法…………未发现'
          ],
          step: 380
        },
        { t: 'green' },
        { t: 'log', text: '✅ 鉴定结果：绿色玩家', cls: 'green' },
        { t: 'log', text: '很遗憾，\n没有外挂。', cls: 'warn' },
        { t: 'log', text: '单纯就是这么打的。', cls: 'warn' }
      ]
    },

    /* ---------- 6. 二十万风险户 ---------- */
    {
      id: 'money200k',
      name: '二十万风险户',
      icon: '💰',
      desc: '先冷静。\n钱包比输赢重要。',
      priority: 3,
      fullAnimation: true,
      // 注：accuser 理论最高 4（题7 +3、题5 +1），原设定 >=4/5 过于严苛，
      //     按实际数据平衡为 >=3。
      condition: function (ctx) { return ctx.flags.accuser >= 3; },
      script: [
        { t: 'log', text: '🚨 检测到鉴挂欲望过高。', cls: 'warn' },
        { t: 'log', text: '正在扫描账户余额……' },
        { t: 'money', to: 200000, duration: 1500 },
        { t: 'big', text: '请谨慎发言。' },
        { t: 'log', text: '本次鉴挂潜在钱包风险：', cls: 'dim' },
        { t: 'money', to: 200000, duration: 700, big: true },
        { t: 'foot', text: '粉丝梗数值，仅供娱乐。' }
      ]
    },

    /* ---------- 7. 泉水指挥官（只弹成就） ---------- */
    {
      id: 'commander',
      name: '泉水指挥官',
      icon: '📢',
      desc: '活着的时候打枪。\n死了以后执教。',
      priority: 8,
      fullAnimation: false,
      condition: function (ctx) { return ctx.flags.commander >= 6; },
      script: []
    },

    /* ---------- 8. 职业演员（只弹成就） ---------- */
    {
      id: 'actor',
      name: '职业演员',
      icon: '🎭',
      desc: '输赢可以没有，\n节目效果不能没有。',
      priority: 9,
      fullAnimation: false,
      condition: function (ctx) { return ctx.flags.actor >= 6; },
      script: []
    },

    /* ---------- 9. 纯血猪肉（结果公布前快速插播，不占名额） ---------- */
    {
      id: 'purePig',
      name: '纯血猪肉',
      icon: '🐷',
      desc: '理论上已经不需要继续检测。',
      priority: 50,
      fullAnimation: false,
      quickAnimation: true,
      condition: function (ctx) { return ctx.winnerScore >= 16; },
      script: [
        { t: 'log', text: '检测到异常猪肉浓度……', cls: 'warn' },
        {
          t: 'pct',
          label: '猪肉纯度：',
          steps: ['0%', '21%', '47%', '78%', '99%', '99.9%', '99.99%', '99.999999%'],
          step: 300
        },
        { t: 'big', text: '纯血猪肉' }
      ]
    },

    /* ---------- 10. 无法分类（1% 隐藏事件） ---------- */
    {
      id: 'unclassified',
      name: '无法分类',
      icon: '🐽',
      desc: 'MBTI 拒绝对此负责。',
      priority: 1,
      fullAnimation: true,
      // 每次完成测试约 1% 概率，与其它条件无关
      chance: 0.01,
      condition: function () { return true; },
      script: [
        { t: 'log', text: '分析失败。', cls: 'warn' },
        { t: 'wait', ms: 650 },
        { t: 'log', text: '当前样本已超出 MBTI 理论能够解释的范围。' },
        { t: 'wait', ms: 650 },
        { t: 'log', text: '这不是人格问题。' },
        { t: 'wait', ms: 650 },
        { t: 'big', text: '这是猪肉。' },
        { t: 'wait', ms: 820 }
      ]
    }
  ];
})();

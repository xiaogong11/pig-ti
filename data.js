/* ============================================================
   data.js — 全部内容数据
   东彦猪格研究所™ / PIG-TI v5.18
   想加题、加梗、改文案，只改这个文件就够了。
   ============================================================ */

window.PIG_DATA = (function () {
  'use strict';

  /* ---------------- 元信息 ---------------- */

  const meta = {
    title: '你是哪块猪肉？',
    subtitle: '10 道题鉴定你的无畏猪格',
    disclaimer: '本测试与心理学毫无关系，\n与您的游戏理解可能也没什么关系。',
    brand: '东彦猪格研究所™',
    version: 'PIG-TI v5.18',
    startBtn: '开始验猪',
    // 默认人格展示顺序
    order: ['cyber', 'flying', 'attack', 'bed', 'potato', 'party']
  };

  /* ---------------- 六种猪格 ---------------- */

  const personalities = {
    cyber: {
      id: 'cyber',
      name: '赛博指挥猪',
      mbti: 'ENTP',
      image: 'assets/cyber-pig.jpg',
      accent: '#6d5bd0',
      accentSoft: '#efeaff',
      meme: '死得最快，指挥得最响。',
      tagline: '你不是在打游戏，\n你是在远程执教队友。',
      description: [
        '你的枪法可能还没上强度，\n但你的指挥已经打到冠军赛了。',
        '开局：\n“A 小有人。”',
        '阵亡：\n“两个两个两个！残血！真的残！”',
        '队友赢下残局以后，\n你会满意地说：\n“看吧，听我的就赢了。”',
        '你的最大作用：\n死亡后解锁全图语音权限。'
      ],
      stats: {
        '嘴硬程度': 99,
        '残局理解': 94,
        '实际枪法': 31,
        '报点音量': 100,
        '猪肉纯度': 97
      },
      comments: [
        '建议下次活着的时候也指挥一下。',
        '语音时长已超过存活时长。',
        '死亡不是结束，是执教的开始。',
        '你的嘴比准星先到位。',
        '队友听你的赢了，那是因为他们本来就强。'
      ]
    },

    flying: {
      id: 'flying',
      name: '飞天突破猪',
      mbti: 'ENFP',
      image: 'assets/flying-pig.jpg',
      accent: '#ff6fa5',
      accentSoft: '#ffe6ef',
      meme: '一声“我进了”，然后出现在击杀播报。',
      tagline: '肉体已经进点，\n队友的技能还在路上。',
      description: [
        '每回合开始前你都信心满满：\n“这把看我突破。”',
        '三秒以后：\n第一滴血。',
        '遗憾的是，\n血是你的。',
        '你最大的优点就是从不怕死。\n最大的问题也是从不怕死。',
        '你不是决斗位，\n你是对面的经济补助。'
      ],
      stats: {
        '突破速度': 100,
        '存活时间': 12,
        '自信程度': 98,
        '队友血压': 91,
        '猪肉纯度': 96
      },
      comments: [
        '你的进点速度已经超过了队友的加载速度。',
        '第一滴血是你的固定节目。',
        '经济补助这个称号，你当之无愧。',
        '建议买保险，不是买技能。',
        '你死了，但你的气势还活着。'
      ]
    },

    attack: {
      id: 'attack',
      name: '贴脸白给猪',
      mbti: 'ESTP',
      image: 'assets/attack-pig.jpg',
      accent: '#ff6b35',
      accentSoft: '#ffe8dd',
      meme: '不会搜点，擅长使用肉体收集信息。',
      tagline: 'W 松开就算输。',
      description: [
        '什么叫搜点？\n什么叫预瞄？\n什么叫交技能？\n你不知道。',
        '你只知道一个道理：\nW 松开就算输。',
        '别人使用技能排点。\n你使用自己的身体排点。',
        '从某种意义上来说，\n你也是信息位。\n只不过信息通常以你的阵亡播报形式出现。'
      ],
      stats: {
        'W键磨损': 100,
        '枪法自信': 95,
        '搜点意识': 8,
        '白给效率': 99,
        '猪肉纯度': 98
      },
      comments: [
        '建议购买新的 W 键备用。',
        '技能可以没有，勇气必须拉满。',
        '排点方式：本人亲自前往。',
        '敌人感谢你提供的信息。',
        '你不是在白给，你是在做敌情侦察。'
      ]
    },

    bed: {
      id: 'bed',
      name: '被窝摆烂猪',
      mbti: 'INFP',
      image: 'assets/bed-pig.jpg',
      accent: '#8f7fb8',
      accentSoft: '#eeeaf7',
      meme: '只要我不认真，这把就不算输。',
      tagline: '输了是娱乐局，\n赢了是随便打。',
      description: [
        '别人输了：\n“下一把认真打。”',
        '你输了：\n“没事，娱乐局。”',
        '赢了：\n“看吧，随便玩都能赢。”',
        '你已经掌握竞技游戏的最高境界：\n只要我不认真，\n就永远不算输。'
      ],
      stats: {
        '摆烂浓度': 100,
        '借口储备': 96,
        '认真程度': 27,
        '精神胜率': 100,
        '猪肉纯度': 94
      },
      comments: [
        '精神胜率 100%，这数据挺能打的。',
        '认真是不可能认真的，这辈子都不可能。',
        '你的借口库存比子弹还充足。',
        '摆烂是你对抗世界的最后一道防线。',
        '输了不亏，赢了他妈血赚。'
      ]
    },

    potato: {
      id: 'potato',
      name: '哑巴老六猪',
      mbti: 'ISTP',
      image: 'assets/potato-pig.jpg',
      accent: '#3f9d63',
      accentSoft: '#e2f4e8',
      meme: '队友打完四个人，才发现你还在绕后。',
      tagline: '你不是不参团，\n你只是在走自己的路。',
      description: [
        '四个队友已经在 A 点打成世界大战。\n你：\n蹲在一条八百年没人走的小道。',
        '队友：\n“你在哪？？？”',
        '你：\n“绕。”',
        '40 秒以后，\n你终于绕到了。\n可惜队友已经下一把了。',
        '你不是没有团队意识。\n只是团队暂时不知道你还活着。'
      ],
      stats: {
        '静步时间': 99,
        '存在感': 6,
        '老六指数': 100,
        '绕后成功率': 23,
        '猪肉纯度': 95
      },
      comments: [
        '你的位置只有你自己知道，敌人也不知道。',
        '队友的阵亡播报是你唯一的参团证明。',
        '绕后不是战术，是你的生活方式。',
        '你到了，但比赛结束了。',
        '存在感 6 分，其中 5 分来自阵亡播报。'
      ]
    },

    party: {
      id: 'party',
      name: '爆笑演员猪',
      mbti: 'ESFP',
      image: 'assets/party-pig.jpg',
      accent: '#e8a300',
      accentSoft: '#fff1cc',
      meme: '别人玩无畏契约，你玩情景喜剧。',
      tagline: '输赢可以没有，\n节目效果不能没有。',
      description: [
        '你进入游戏不是为了赢。\n你是来给直播切片提供素材的。',
        '队友空枪你笑。\n自己空枪你笑得更大声。',
        '五杀被抢你笑。\n0 / 12 你还在笑。',
        '别人玩的是无畏契约。\n你玩的是大型多人在线情景喜剧。'
      ],
      stats: {
        '节目效果': 100,
        '笑声分贝': 98,
        'KD关注度': 3,
        '队友心态': 42,
        '猪肉纯度': 100
      },
      comments: [
        '你的笑声是队伍唯一稳定的输出。',
        '这把输了，但你赢了观众。',
        '建议直接开直播，反正你也不在意 KD。',
        '0 / 12 还能笑出来，这是天赋。',
        '你不是在打游戏，你是在做内容。'
      ]
    }
  };

  /* ---------------- 题目 ---------------- */

  const questions = [
    {
      id: 1,
      text: '开局 5 秒，\n决斗位突然说：\n\n“我进了！”\n\n你觉得接下来最可能发生什么？',
      options: [
        {
          text: '“等一下等一下，我技能还没——”',
          scores: { cyber: 2, potato: 1 },
          flags: { commander: 2 }
        },
        {
          text: '跟着一起冲，死就死。',
          scores: { flying: 2, attack: 1 },
          flags: { wKey: 2, empower: 1 }
        },
        {
          text: '他进他的，我继续摸另一边。',
          scores: { potato: 2, bed: 1 },
          flags: { walking: 2 }
        },
        {
          text: '已经开始笑了，因为知道他马上要死。',
          scores: { party: 2, cyber: 1 },
          flags: { actor: 2 }
        }
      ]
    },
    {
      id: 2,
      text: '你 1v3 残局，\n队友开始疯狂报点。',
      options: [
        {
          text: '“都别说话！让我操作！”',
          scores: { cyber: 2 },
          flags: { empower: 2, commander: 1 }
        },
        {
          text: '直接冲出去找第一个。',
          scores: { attack: 2, flying: 1 },
          flags: { wKey: 2, empower: 1 }
        },
        {
          text: '蹲 30 秒，希望他们自己送上门。',
          scores: { potato: 2 },
          flags: { walking: 2, green: 1 }
        },
        {
          text: '已经知道赢不了，准备整个节目效果。',
          scores: { party: 2, bed: 1 },
          flags: { actor: 2 }
        }
      ]
    },
    {
      id: 3,
      text: '队友问：\n“这把怎么打？”',
      options: [
        {
          text: '开始进行长达 20 秒的战术部署。',
          scores: { cyber: 2 },
          flags: { commander: 3 }
        },
        {
          text: '“五个人直接冲！”',
          scores: { flying: 2, attack: 1 },
          flags: { wKey: 2 }
        },
        {
          text: '“随便打吧。”',
          scores: { bed: 2 },
          flags: { actor: 1 }
        },
        {
          text: '不说话，自己买枪走了。',
          scores: { potato: 2 },
          flags: { walking: 1, green: 1 }
        }
      ]
    },
    {
      id: 4,
      text: '经济局你一般怎么打？',
      options: [
        {
          text: '研究半天怎么买性价比最高。',
          scores: { cyber: 2, potato: 1 },
          flags: { green: 2 }
        },
        {
          text: '短枪直接冲脸，说不定能捡把大枪。',
          scores: { flying: 2, attack: 1 },
          flags: { wKey: 2, empower: 1 }
        },
        {
          text: '买个很邪门的武器蹲角落。',
          scores: { potato: 2 },
          flags: { walking: 2, actor: 1 }
        },
        {
          text: '“eco？不存在的。”\n然后余额归零。',
          scores: { party: 2, bed: 1 },
          flags: { actor: 2 }
        }
      ]
    },
    {
      id: 5,
      text: '你连续空了一整个弹匣。',
      options: [
        {
          text: '“这游戏判定有问题。”',
          scores: { cyber: 2 },
          flags: { whiff: 2, accuser: 1 }
        },
        {
          text: '换手枪继续冲。',
          scores: { attack: 2, flying: 1 },
          flags: { wKey: 2, whiff: 1 }
        },
        {
          text: '默默撤退，假装没人看到。',
          scores: { potato: 2, bed: 1 },
          flags: { green: 1, whiff: 1 }
        },
        {
          text: '自己先笑到打不了游戏。',
          scores: { party: 2 },
          flags: { actor: 3, whiff: 2 }
        }
      ]
    },
    {
      id: 6,
      text: '你已经 0 / 7 了。\n队友问：\n“哥们你怎么回事？”',
      options: [
        {
          text: '“我一直在给信息，你们没发现吗？”',
          scores: { cyber: 2 },
          flags: { commander: 2, whiff: 1 }
        },
        {
          text: '“马上杀回来。”',
          // 平衡调整：0/7 还嘴硬说要杀回来，行为更偏“白给”而非“突破”
          scores: { attack: 2, flying: 1 },
          flags: { empower: 2, whiff: 1 }
        },
        {
          text: '“今天手感不好，无所谓。”',
          scores: { bed: 2 },
          flags: { whiff: 1 }
        },
        {
          text: '“你看我战绩干嘛哈哈哈哈哈。”',
          scores: { party: 2 },
          flags: { actor: 3, whiff: 1 }
        }
      ]
    },
    {
      id: 7,
      text: '对面有个人枪特别硬。',
      options: [
        {
          text: '开始分析他的站位、习惯和打法。',
          scores: { cyber: 2 },
          flags: { green: 2, commander: 1 }
        },
        {
          text: '非要找他单挑，证明自己。',
          scores: { flying: 2, attack: 1 },
          flags: { empower: 2, wKey: 1 }
        },
        {
          text: '一辈子不去他那个点。',
          scores: { potato: 2 },
          flags: { walking: 1, green: 2 }
        },
        {
          text: '“这人绝对不正常。”',
          scores: { bed: 1, cyber: 1 },
          flags: { accuser: 3 }
        }
      ]
    },
    {
      id: 8,
      text: '队友已经进点了，\n你还在后面。',
      options: [
        {
          text: '“别急，我在看屁股！”',
          scores: { cyber: 1, potato: 2 },
          flags: { commander: 1, walking: 2 }
        },
        {
          text: '马上掏刀追过去。',
          scores: { flying: 2, attack: 1 },
          flags: { wKey: 2 }
        },
        {
          text: '继续慢慢静步，主打一个优雅。',
          scores: { potato: 2 },
          flags: { walking: 3 }
        },
        {
          text: '看他们一个个死完以后说：\n“怎么全死了？”',
          scores: { bed: 2, party: 1 },
          flags: { actor: 2 }
        }
      ]
    },
    {
      id: 9,
      text: '队友闪到你了。',
      options: [
        {
          text: '“哥们你这个闪什么意思？”',
          scores: { cyber: 2 },
          flags: { commander: 2 }
        },
        {
          text: '黑着屏幕继续往前冲。',
          scores: { attack: 2, flying: 1 },
          flags: { wKey: 3, empower: 1 }
        },
        {
          text: '当场站住，接受命运。',
          scores: { bed: 2 },
          flags: { green: 1 }
        },
        {
          text: '直接笑疯：“好闪！好闪！”',
          scores: { party: 2 },
          flags: { actor: 3 }
        }
      ]
    },
    {
      id: 10,
      text: '最后一个问题：\n\n你觉得自己打瓦最大的特点是什么？',
      hint: '（本题权重更高，请慎重白给）',
      options: [
        {
          text: '枪可以不准，嘴不能停。',
          scores: { cyber: 3 },
          flags: { commander: 3 }
        },
        {
          text: '我不怕死，对面应该怕我。',
          scores: { flying: 3 },
          flags: { empower: 2, wKey: 1 }
        },
        {
          text: 'W 键是我最熟悉的技能。',
          scores: { attack: 3 },
          flags: { wKey: 3 }
        },
        {
          text: '只要我不认真，这把就不算输。',
          scores: { bed: 3 },
          flags: {}
        },
        {
          text: '不是不参团，我只是还在绕。',
          scores: { potato: 3 },
          flags: { walking: 3 }
        },
        {
          text: 'KD 可以不好看，节目效果必须好看。',
          scores: { party: 3 },
          flags: { actor: 3 }
        }
      ]
    }
  ];

  /* ---------------- 分析页台词 ---------------- */

  // kind: line=普通逐行 | result=结论 | done=收尾
  const analysisLines = [
    { text: '正在扫描你的枪法……', delay: 320 },
    { text: '未检测到明显枪法。', kind: 'result', delay: 420 },
    { text: '正在分析残局意识……', delay: 320 },
    { text: '情况不容乐观。', kind: 'result', delay: 420 },
    { text: '正在计算嘴硬指数……', delay: 340 },
    { text: '正在检测猪肉含量……', delay: 340 },
    { text: '猪肉含量：99.7%', kind: 'result', delay: 480 },
    { text: '鉴定完成。', kind: 'done', delay: 460 }
  ];

  // 满足条件时插进分析流里的额外台词（最多插 2 条，避免分析页拖太长）
  const analysisExtras = [
    { flag: 'commander', min: 6, text: '死亡后语音权限：已解锁。', kind: 'result' },
    { flag: 'actor', min: 6, text: '本场 MVP 提名：节目效果。', kind: 'result' }
  ];

  /* ---------------- 角落随机小文案 ---------------- */

  const randomTips = [
    '正在腌制猪肉……',
    '请勿敲击显示器。',
    '系统正在努力理解你的游戏思路。',
    '分析失败，正在换一种方式骂。',
    'KD 不重要，截图好看最重要。',
    '有些人打的是战术，有些人打的是勇气。',
    '你的队友目前拒绝发表评论。',
    '系统怀疑问题不在鼠标。',
    '不要急，至少你还有节目效果。',
    '枪法问题建议咨询训练场。',
    '本研究所不提供上分服务。'
  ];

  /* ---------------- 答题页给用户的即时吐槽（选完随机弹） ---------------- */

  const pickReactions = [
    '已记录，等会儿一起算账。',
    '这个选择很有你的风格。',
    '嗯……很有信息量。',
    '研究员看了一眼，没说话。',
    '好，接着看下一题。'
  ];

  return {
    meta: meta,
    personalities: personalities,
    questions: questions,
    analysisLines: analysisLines,
    analysisExtras: analysisExtras,
    randomTips: randomTips,
    pickReactions: pickReactions
  };
})();

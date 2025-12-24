
export const COSTS = {
  // 入手コスト (Base acquisition)
  COMMON_BASE: 20,
  MONSTER_BASE: 80,
  INHERENT_BASE: 0,

  // 強化状態コスト (Hirameki status)
  COMMON_FLASH: 10,     // 通常札のヒラメキ状態 (+10)
  MONSTER_FLASH: 0,    // モンスターの通常ヒラメキ (+0)
  INHERENT_FLASH: 0,   // 固有の通常ヒラメキ (+0)
  
  // 神ヒラメキ共通加算
  GOD_FLASH_GLOBAL: 20, // 神ヒラメキによる追加加算 (+20)

  // コピー回数ごとの加算コスト (累積用)
  // 1回目: 0pt, 2回目: 10pt, 3回目: 30pt, 4回目: 50pt, 5回目以降: 70pt
  COPY_STEP_COSTS: [0, 0, 10, 30, 50, 70],

  // 固有カードの排除回数ごとの加算コスト (累積用)
  // 1回目: 20pt, 2回目: 30pt, 3回目: 50pt, 4回目: 70pt, 5回目以降: 90pt
  INHERENT_REMOVAL_STEP_COSTS: [0, 20, 30, 50, 70, 90],
};

export const MAX_INHERENT_CARDS = 4;

// 最大容量計算
export const CAPACITY_BASE = 20;
export const CAPACITY_PER_TIER = 10;


export type CardType = 'INHERENT' | 'COMMON' | 'MONSTER';

export interface CardGroupState {
  count: number;
  normalHiramekiCount: number;
  godHiramekiCount: number;
}

export interface InherentCardState {
  godHiramekiCount: number;
  removalCount: number;
  isConversionUsed: boolean[];
}

export interface CalculatorState {
  tier: number;
  isNightmare: boolean;
  inherent: InherentCardState;
  common: CardGroupState;
  monster: CardGroupState;
  totalCopies: number; // 合計コピー回数
}


import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { CalculatorState, CardGroupState, InherentCardState } from './types';
import { COSTS, MAX_INHERENT_CARDS, CAPACITY_BASE, CAPACITY_PER_TIER } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<CalculatorState>({
    tier: 11,
    isNightmare: false,
    inherent: {
      godHiramekiCount: 0,
      removalCount: 0,
      isConversionUsed: [false, false, false, false],
    },
    common: { count: 0, normalHiramekiCount: 0, godHiramekiCount: 0 },
    monster: { count: 0, normalHiramekiCount: 0, godHiramekiCount: 0 },
    totalCopies: 0,
  });

  // キャパシティ計算: (TIER * 10) + 20
  const totalCP = useMemo(() => {
    const effectiveTier = state.isNightmare ? state.tier + 1 : state.tier;
    return (effectiveTier * CAPACITY_PER_TIER) + CAPACITY_BASE;
  }, [state.tier, state.isNightmare]);

  // 累積コピーコスト
  const copyCost = useMemo(() => {
    let total = 0;
    for (let i = 1; i <= state.totalCopies; i++) {
      total += (i >= 5) ? COSTS.COPY_STEP_COSTS[5] : COSTS.COPY_STEP_COSTS[i];
    }
    return total;
  }, [state.totalCopies]);

  // 累積排除コスト
  const inherentRemovalCost = useMemo(() => {
    let total = 0;
    for (let i = 1; i <= state.inherent.removalCount; i++) {
      total += (i >= 5) ? COSTS.INHERENT_REMOVAL_STEP_COSTS[5] : COSTS.INHERENT_REMOVAL_STEP_COSTS[i];
    }
    return total;
  }, [state.inherent.removalCount]);

  // 各セクションの小計計算
  const subTotals = useMemo(() => {
    const inherent = (state.inherent.godHiramekiCount * COSTS.GOD_FLASH_GLOBAL) + inherentRemovalCost;
    const common = (state.common.count * COSTS.COMMON_BASE) + 
                   (state.common.normalHiramekiCount * COSTS.COMMON_FLASH) + 
                   (state.common.godHiramekiCount * (COSTS.COMMON_FLASH + COSTS.GOD_FLASH_GLOBAL));
    const monster = (state.monster.count * COSTS.MONSTER_BASE) + 
                    (state.monster.normalHiramekiCount * COSTS.MONSTER_FLASH) + 
                    (state.monster.godHiramekiCount * COSTS.GOD_FLASH_GLOBAL);
    return { inherent, common, monster, copy: copyCost };
  }, [state, inherentRemovalCost, copyCost]);

  const usedCP = useMemo(() => {
    return subTotals.inherent + subTotals.common + subTotals.monster + subTotals.copy;
  }, [subTotals]);

  const remainingCP = totalCP - usedCP;
  const isOverLimit = remainingCP < 0;

  const updateGroup = (key: 'common' | 'monster', field: keyof CardGroupState, val: number) => {
    setState(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: Math.max(0, isNaN(val) ? 0 : val) }
    }));
  };

  const updateInherent = (field: keyof InherentCardState, val: any) => {
    setState(prev => ({
      ...prev,
      inherent: { ...prev.inherent, [field]: val }
    }));
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-6xl mb-8 border-b border-cyan-900 pb-4 flex flex-col md:flex-row justify-between items-center gap-2">
        <div>
          <h1 className="text-3xl md:text-5xl font-game font-bold text-cyan-400 tracking-tighter uppercase italic">
            Chaos Zero Nightmare <span className="text-red-500 text-2xl md:text-4xl">Save Calc</span>
          </h1>
          <p className="text-[10px] text-cyan-700 font-game tracking-[0.3em] uppercase">Validation Protocol v2.6 // Balanced Layout</p>
        </div>
        <div className="bg-zinc-900 border border-cyan-900/50 px-4 py-2 rounded text-[10px] font-game text-cyan-600 hidden md:block">
          STATUS: ONLINE
        </div>
      </header>

      <main className="w-full max-w-6xl space-y-6">
        {/* CP Indicator */}
        <section className="bg-zinc-900/60 border border-cyan-800/40 p-6 rounded-lg backdrop-blur-md shadow-2xl relative">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-cyan-500 text-[10px] font-game uppercase tracking-widest mb-1">現在の消費キャパシティ</p>
              <h2 className="text-5xl font-game font-bold text-white leading-none">
                {usedCP} <span className="text-zinc-600 text-xl font-normal">/ {totalCP} pt</span>
              </h2>
            </div>
            <div className={`text-right ${isOverLimit ? 'text-red-500' : 'text-green-400'}`}>
              <p className="text-[10px] font-game uppercase mb-1">Status Check</p>
              <p className="text-2xl font-bold font-game tracking-tighter">{isOverLimit ? 'CAPACITY OVER' : `AVAILABLE: ${remainingCP}`}</p>
            </div>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full w-full overflow-hidden border border-zinc-700/50">
            <div 
              className={`h-full transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${isOverLimit ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.6)]' : 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]'}`}
              style={{ width: `${Math.min(100, (usedCP / (totalCP || 1)) * 100)}%` }}
            />
          </div>
        </section>

        {/* (GLOBAL CONFIG) Horizontal Bar */}
        <section className="bg-zinc-900/50 p-5 border border-zinc-800 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <div className="flex-[2] w-full">
              <h3 className="text-[10px] font-game text-cyan-600 mb-2 flex items-center gap-2 uppercase font-bold tracking-widest">
                <span className="w-1 h-3 bg-cyan-600 block"></span> Global Config
              </h3>
              <div className="bg-zinc-950/40 p-1 rounded border border-zinc-800/50">
                <div className="p-3">
                  <label className="block text-[10px] mb-1 text-zinc-500 font-bold uppercase font-game">TIER Value</label>
                  <input 
                    type="number" 
                    value={state.tier}
                    onChange={e => setState(s => ({ ...s, tier: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full bg-transparent p-1 text-cyan-400 font-game text-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 w-full pb-1">
              <div className="bg-zinc-950/40 p-4 rounded border border-zinc-800/50 flex items-center justify-between h-[68px]">
                <span className="text-[10px] font-bold text-zinc-400 uppercase font-game tracking-tight">Nightmare Mode</span>
                <button 
                  onClick={() => setState(s => ({ ...s, isNightmare: !s.isNightmare }))}
                  className={`w-14 h-7 rounded-full p-1 transition-all ${state.isNightmare ? 'bg-red-600' : 'bg-zinc-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${state.isNightmare ? 'translate-x-7 shadow-[0_0_10px_white]' : ''}`} />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full pb-3">
              <div className="text-[10px] text-zinc-500 font-game tracking-wider uppercase opacity-60">
                Formula:
                <div className="text-cyan-400 text-sm mt-1">
                  {state.isNightmare ? `((T${state.tier}+1)×10) + 20` : `(T${state.tier}×10) + 20`}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Columns Layout (Inherent, Common, Monster) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="bg-zinc-900/50 p-6 border border-zinc-800 rounded-lg shadow-lg flex flex-col h-full">
            <h3 className="text-xs font-game text-cyan-600 mb-6 border-l-4 border-cyan-600 pl-3 uppercase font-bold tracking-widest">固有カード</h3>
            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-[10px] mb-2 text-zinc-500 font-bold uppercase tracking-widest font-game">神ヒラメキ (+{COSTS.GOD_FLASH_GLOBAL}pt/枚)</label>
                <div className="bg-zinc-950/50 border border-zinc-800 p-4 rounded">
                  <input 
                    type="number" 
                    value={state.inherent.godHiramekiCount}
                    onChange={e => updateInherent('godHiramekiCount', parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent font-game text-cyan-400 text-xl focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] mb-2 text-zinc-500 font-bold uppercase tracking-widest font-game">排除累積回数 (+{inherentRemovalCost}pt)</label>
                <div className="bg-zinc-950/50 border border-zinc-800 p-4 rounded">
                  <input 
                    type="number" 
                    max={MAX_INHERENT_CARDS}
                    value={state.inherent.removalCount}
                    onChange={e => updateInherent('removalCount', Math.max(0, Math.min(MAX_INHERENT_CARDS, parseInt(e.target.value) || 0)))}
                    className="w-full bg-transparent font-game text-cyan-400 text-xl focus:outline-none"
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-x-4 gap-y-2 text-[9px] text-zinc-600 font-game uppercase">
                  <div className="flex justify-between"><span>1st:</span> <span>20pt</span></div>
                  <div className="flex justify-between"><span>2nd:</span> <span>30pt</span></div>
                  <div className="flex justify-between"><span>3rd:</span> <span>50pt</span></div>
                  <div className="flex justify-between"><span>4th:</span> <span>70pt</span></div>
                </div>
              </div>
            </div>
          </section>

          <CardGroupSection 
            label="共用カード" 
            state={state.common} 
            onUpdate={(f, v) => updateGroup('common', f, v)} 
            accent="cyan"
            baseCost={COSTS.COMMON_BASE}
            flashCost={COSTS.COMMON_FLASH}
            isGodDouble={true}
          />

          <CardGroupSection 
            label="モンスターカード" 
            state={state.monster} 
            onUpdate={(f, v) => updateGroup('monster', f, v)} 
            accent="red"
            baseCost={COSTS.MONSTER_BASE}
            flashCost={COSTS.MONSTER_FLASH}
            isGodDouble={false}
          />
        </div>

        {/* Bottom Section: Duplicate & Breakdown (2 Equal Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* (Duplicate) Block */}
          <section className="bg-zinc-900/70 p-8 border border-zinc-800 rounded-lg shadow-xl relative overflow-hidden flex flex-col h-full">
            <h3 className="text-sm font-game text-yellow-600 mb-6 border-l-4 border-yellow-600 pl-3 uppercase font-bold tracking-widest">Duplicate (コピー累積)</h3>
            <div className="flex-1 flex flex-col justify-center items-center gap-4">
              <p className="text-[10px] text-zinc-500 uppercase font-game leading-relaxed opacity-70 mb-4">
                1st:+0 / 2nd:+10 / 3rd:+30 / 4th:+50 / 5th~:+70
              </p>
              <div className="w-full max-w-[240px]">
                <label className="block text-[10px] mb-3 text-yellow-600/70 font-bold uppercase tracking-[0.2em] font-game text-center">累積コピー回数</label>
                <div className="bg-zinc-950 border border-yellow-900/40 p-5 rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
                  <input 
                    type="number" 
                    value={state.totalCopies}
                    onChange={e => setState(s => ({ ...s, totalCopies: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full bg-transparent font-game text-yellow-500 text-5xl font-bold focus:outline-none text-center"
                  />
                </div>
              </div>
            </div>
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-yellow-600/5 blur-[80px] pointer-events-none"></div>
          </section>

          {/* (Breakdown) Block */}
          <section className="bg-zinc-900/70 p-8 border border-zinc-800 rounded-lg shadow-xl relative overflow-hidden flex flex-col h-full">
            <h3 className="text-sm font-game text-white mb-6 border-l-4 border-zinc-400 pl-3 uppercase font-bold tracking-widest">Breakdown (内訳)</h3>
            <div className="flex-1 flex flex-col justify-center space-y-4 font-game text-sm">
              <div className="flex justify-between items-center text-zinc-400 py-1.5 border-b border-zinc-800/50">
                <span className="uppercase tracking-widest text-[11px]">固有</span>
                <span className="text-white font-bold">{subTotals.inherent} pt</span>
              </div>
              <div className="flex justify-between items-center text-cyan-600 py-1.5 border-b border-zinc-800/50">
                <span className="uppercase tracking-widest text-[11px]">共用</span>
                <span className="text-cyan-400 font-bold">{subTotals.common} pt</span>
              </div>
              <div className="flex justify-between items-center text-red-600 py-1.5 border-b border-zinc-800/50">
                <span className="uppercase tracking-widest text-[11px]">モンスター</span>
                <span className="text-red-400 font-bold">{subTotals.monster} pt</span>
              </div>
              <div className="flex justify-between items-center text-yellow-600 py-1.5 border-b border-zinc-800/50">
                <span className="uppercase tracking-widest text-[11px]">コピー</span>
                <span className="text-yellow-500 font-bold">{subTotals.copy} pt</span>
              </div>
              
              <div className="flex justify-between items-center pt-6">
                <span className="text-zinc-500 uppercase font-bold tracking-widest text-base">TOTAL</span>
                <span className={`font-bold tracking-tighter text-3xl ${isOverLimit ? 'text-red-500' : 'text-white'}`}>{usedCP} pt</span>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-cyan-600/5 blur-[80px] pointer-events-none"></div>
          </section>
        </div>
      </main>

      <footer className="mt-16 mb-12 text-zinc-700 text-[10px] flex flex-col items-center opacity-70">
        <p className="mb-2 tracking-[0.2em] font-bold">カオスゼロナイトメア</p>
        <p className="font-game tracking-[0.1em] uppercase">© Smilegate. All Rights Reserved</p>
      </footer>
    </div>
  );
};

interface CardGroupProps {
  label: string;
  state: CardGroupState;
  onUpdate: (field: keyof CardGroupState, val: number) => void;
  accent: 'cyan' | 'red';
  baseCost: number;
  flashCost: number;
  isGodDouble: boolean;
}

const CardGroupSection: React.FC<CardGroupProps> = ({ label, state, onUpdate, accent, baseCost, flashCost, isGodDouble }) => {
  const accentBorder = accent === 'red' ? 'border-red-900/40 hover:border-red-600' : 'border-cyan-900/40 hover:border-cyan-600';
  const accentLabel = accent === 'red' ? 'text-red-500 border-red-500' : 'text-cyan-500 border-cyan-500';
  const accentInput = accent === 'red' ? 'text-red-400' : 'text-cyan-400';
  const inputClass = "w-full bg-transparent font-game text-lg focus:outline-none";
  const totalGodAdd = isGodDouble ? flashCost + COSTS.GOD_FLASH_GLOBAL : COSTS.GOD_FLASH_GLOBAL;

  return (
    <section className={`bg-zinc-900/50 p-6 border rounded-lg shadow-lg transition-all duration-300 ${accentBorder} flex flex-col h-full`}>
      <h3 className={`text-xs font-game mb-6 border-l-4 pl-3 uppercase font-bold tracking-widest ${accentLabel}`}>{label}</h3>
      <div className="space-y-6 flex-1">
        <div>
          <label className="block text-[10px] mb-2 text-zinc-500 font-bold uppercase tracking-widest font-game">合計枚数 (コピー含む)</label>
          <div className="bg-zinc-950/50 border border-zinc-800 p-4 rounded">
            <input 
              type="number" 
              value={state.count} 
              onChange={e => onUpdate('count', parseInt(e.target.value))}
              className={`${inputClass} ${accentInput}`} 
            />
          </div>
          <p className="text-[8px] text-zinc-600 mt-2 font-game uppercase tracking-tighter italic">入手コスト: {baseCost} pt / 枚</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] mb-2 text-zinc-500 font-bold uppercase tracking-widest font-game">通常ヒラメキ</label>
            <div className="bg-zinc-950/50 border border-zinc-800 p-4 rounded">
              <input 
                type="number" 
                value={state.normalHiramekiCount} 
                onChange={e => onUpdate('normalHiramekiCount', parseInt(e.target.value))}
                className={inputClass} 
              />
            </div>
            <p className="text-[8px] text-zinc-600 mt-1 font-game uppercase tracking-tighter italic">+{flashCost} pt</p>
          </div>
          <div>
            <label className="block text-[10px] mb-2 text-zinc-500 font-bold uppercase tracking-widest font-game">神ヒラメキ</label>
            <div className="bg-zinc-950/50 border border-zinc-800 p-4 rounded">
              <input 
                type="number" 
                value={state.godHiramekiCount} 
                onChange={e => onUpdate('godHiramekiCount', parseInt(e.target.value))}
                className={inputClass} 
              />
            </div>
            <p className="text-[8px] text-zinc-600 mt-1 font-game uppercase tracking-tighter italic">+{totalGodAdd} pt</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

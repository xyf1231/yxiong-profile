import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import {
  Letters,
  EASE_OPTIONS,
  type AnimationConfig,
  type EasePreset,
  type FontVariant,
} from '@kumailnanji/letters';
import {
  GRADIENT_PRESETS,
  getPresetKeys,
  getCategories,
  getRandomPreset,
  getCssGradient,
  createGradientElement,
  type GradientCategory,
} from './gradient-presets';

export interface PlaygroundConfig {
  text?: string;
  strokeWidth?: number;
  overlap?: number;
  duration?: number;
  ease?: EasePreset;
  loop?: boolean;
  erase?: boolean;
  variant?: FontVariant;
  selectedPresets?: string[];
  saturation?: number;
  brightness?: number;
}

const DEFAULT_CONFIG: Required<PlaygroundConfig> = {
  text: 'Hello',
  strokeWidth: 2,
  overlap: 0.02,
  duration: 2,
  ease: 'easeInOut',
  loop: true,
  erase: true,
  variant: 'simple',
  selectedPresets: getPresetKeys(),
  saturation: 0,
  brightness: 0,
};

const ICONS = {
  play: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  ),
  replay: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  heartOutline: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
};

type TabKey = GradientCategory | 'favorites';

const TAB_LABELS: Record<TabKey, string> = {
  all: '全部',
  apple: 'Apple Tones',
  morandi: 'Morandi',
  classic: 'Classic',
  colorful: 'Colorful',
  favorites: '收藏',
};

const FAVORITES_STORAGE_KEY = 'letters-gradient-favorites';

const PHASE_LABELS: Record<Phase, string> = {
  idle: '就绪',
  drawing: 'DRAW',
  erasing: 'ERASE',
};

type Phase = 'idle' | 'drawing' | 'erasing';

function formatNumber(n: number, digits = 2) {
  return n.toFixed(digits).replace(/\.00$/, '');
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

function Playground({ initialConfig }: { initialConfig?: PlaygroundConfig }) {
  const initial = { ...DEFAULT_CONFIG, ...initialConfig };

  const [text, setText] = useState(initial.text);
  const [strokeWidth, setStrokeWidth] = useState(initial.strokeWidth);
  const [overlap, setOverlap] = useState(initial.overlap);
  const [duration, setDuration] = useState(initial.duration);
  const [ease, setEase] = useState<EasePreset>(initial.ease);
  const [variant, setVariant] = useState<FontVariant>(initial.variant);
  const [loop, setLoop] = useState(initial.loop);
  const [eraseMode, setEraseMode] = useState(initial.erase);
  const [saturation, setSaturation] = useState(initial.saturation);
  const [brightness, setBrightness] = useState(initial.brightness);
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(
    new Set(initial.selectedPresets)
  );
  const [activePresetKey, setActivePresetKey] = useState<string>(
    getRandomPreset('all') || getPresetKeys()[0]
  );
  const [tab, setTab] = useState<TabKey>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 从 localStorage 读取收藏
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setFavorites(new Set(parsed.filter((k) => typeof k === 'string')));
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // 收藏变化时持久化
  useEffect(() => {
    try {
      localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(Array.from(favorites))
      );
    } catch {
      // ignore storage errors
    }
  }, [favorites]);

  // 受控动画状态
  const [progress, setProgress] = useState(1);
  const [phase, setPhase] = useState<Phase>('idle');
  const [isPlaying, setIsPlaying] = useState(false);

  // 用 ref 保存最新状态，避免 useCallback 循环依赖
  const durationRef = useRef(duration);
  const easeRef = useRef(ease);
  const loopRef = useRef(loop);
  const eraseRef = useRef(eraseMode);
  const activePresetRef = useRef(activePresetKey);
  const progressRef = useRef(progress);
  const phaseRef = useRef(phase);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    durationRef.current = duration;
    easeRef.current = ease;
    loopRef.current = loop;
    eraseRef.current = eraseMode;
    activePresetRef.current = activePresetKey;
    progressRef.current = progress;
    phaseRef.current = phase;
    isPlayingRef.current = isPlaying;
  });

  const pickNextPreset = useCallback(
    (current?: string) => {
      const pool = Array.from(selectedPresets);
      if (pool.length === 0) return current || activePresetRef.current;
      if (pool.length === 1) return pool[0];
      let next = pickRandom(pool)!;
      let guard = 0;
      while (next === current && guard++ < 10) {
        next = pickRandom(pool)!;
      }
      return next;
    },
    [selectedPresets]
  );

  // 自定义 requestAnimationFrame 动画，完全控制 DRAW / ERASE 阶段
  type AnimationState = {
    rafId: number;
    startTime: number;
    pausedElapsed: number;
    from: number;
    to: number;
    duration: number;
    phase: Phase;
    onComplete?: () => void;
  };

  const animStateRef = useRef<AnimationState | null>(null);

  const applyEase = useCallback((t: number) => {
    const ease = easeRef.current;
    switch (ease) {
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return t * (2 - t);
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      case 'linear':
      default:
        return t;
    }
  }, []);

  const stopAnimation = useCallback(() => {
    if (animStateRef.current) {
      cancelAnimationFrame(animStateRef.current.rafId);
      animStateRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const tick = useCallback(() => {
    const state = animStateRef.current;
    if (!state) return;
    const elapsed = performance.now() - state.startTime;
    const raw = Math.min(elapsed / (state.duration * 1000), 1);
    const eased = applyEase(raw);
    const value = state.from + (state.to - state.from) * eased;
    setProgress(value);
    if (raw < 1) {
      state.rafId = requestAnimationFrame(tick);
    } else {
      animStateRef.current = null;
      setIsPlaying(false);
      state.onComplete?.();
    }
  }, [applyEase]);

  const startAnimation = useCallback(
    (
      from: number,
      to: number,
      duration: number,
      phase: Phase,
      onComplete?: () => void
    ) => {
      stopAnimation();
      setPhase(phase);
      setIsPlaying(true);
      const state: AnimationState = {
        rafId: 0,
        startTime: performance.now(),
        pausedElapsed: 0,
        from,
        to,
        duration,
        phase,
        onComplete,
      };
      animStateRef.current = state;
      state.rafId = requestAnimationFrame(tick);
    },
    [stopAnimation, tick]
  );

  const runDrawRef = useRef<(from?: number) => void>(() => {});
  const runEraseRef = useRef<(from?: number) => void>(() => {});

  runDrawRef.current = (from = 0) => {
    startAnimation(from, 1, durationRef.current * (1 - from), 'drawing', () => {
      if (eraseRef.current) {
        runEraseRef.current(1);
      } else if (loopRef.current) {
        const next = pickNextPreset(activePresetRef.current);
        flushSync(() => setActivePresetKey(next));
        runDrawRef.current(0);
      } else {
        setPhase('idle');
      }
    });
  };

  runEraseRef.current = (from = 1) => {
    startAnimation(from, 0, durationRef.current * 0.5 * from, 'erasing', () => {
      if (loopRef.current) {
        const next = pickNextPreset(activePresetRef.current);
        flushSync(() => setActivePresetKey(next));
        runDrawRef.current(0);
      } else {
        setPhase('idle');
      }
    });
  };

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      const state = animStateRef.current;
      if (state) {
        cancelAnimationFrame(state.rafId);
        state.pausedElapsed = performance.now() - state.startTime;
      }
      setIsPlaying(false);
    } else {
      const p = progressRef.current;
      const currentPhase = phaseRef.current;
      if (currentPhase === 'idle') {
        if (p >= 0.99) {
          if (eraseRef.current) runEraseRef.current(1);
          else runDrawRef.current(0);
        } else {
          runDrawRef.current(p);
        }
      } else {
        const state = animStateRef.current;
        if (state) {
          state.startTime = performance.now() - state.pausedElapsed;
          state.rafId = requestAnimationFrame(tick);
          setIsPlaying(true);
        }
      }
    }
  }, [tick]);

  const handleReplay = useCallback(() => {
    const next = pickNextPreset(activePresetRef.current);
    flushSync(() => setActivePresetKey(next));
    runDrawRef.current(0);
  }, [pickNextPreset]);

  // 首次自动播放
  useEffect(() => {
    runDrawRef.current(0);
    return () => {
      if (animStateRef.current) cancelAnimationFrame(animStateRef.current.rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animation: AnimationConfig = useMemo(
    () => ({ type: 'tween', duration, ease }),
    [duration, ease]
  );

  const gradientId = `letters-gradient-${activePresetKey}`;

  // 关键配置变化时重新挂载 Letters，让动画按新参数启动
  const lettersKey = useMemo(
    () =>
      JSON.stringify({
        text,
        variant,
        overlap,
        strokeWidth,
        duration,
        ease,
      }),
    [text, variant, overlap, strokeWidth, duration, ease]
  );

  const safeText = text.slice(0, 60) || 'Hello';

  const filteredPresets = useMemo(() => {
    const keys = getPresetKeys();
    if (tab === 'all') return keys;
    if (tab === 'favorites') return keys.filter((k) => favorites.has(k));
    return keys.filter((k) => GRADIENT_PRESETS[k].cat === tab);
  }, [tab, favorites]);

  const selectedCount = selectedPresets.size;
  const totalCount = getPresetKeys().length;

  const togglePreset = (key: string) => {
    setSelectedPresets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleFavorite = useCallback(
    (key: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    []
  );

  const selectAll = () => {
    setSelectedPresets(new Set(filteredPresets));
  };

  const clearSelection = () => {
    setSelectedPresets(new Set());
  };

  const shufflePreset = useCallback(() => {
    const next = pickNextPreset(activePresetRef.current);
    flushSync(() => setActivePresetKey(next));
    if (phaseRef.current === 'idle') {
      runDrawRef.current(0);
    }
  }, [pickNextPreset]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        color: '#e4e4e7',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      {/* 预览区 */}
      <div
        style={{
          position: 'relative',
          minHeight: '320px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 30%, rgba(124, 58, 237, 0.12), transparent 50%), radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.09), transparent 50%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '720px',
            height: '240px',
            padding: '24px',
          }}
        >
          <Letters
            key={lettersKey}
            text={safeText}
            variant={variant}
            progress={progress}
            animation={animation}
            overlap={overlap}
            strokeWidth={strokeWidth}
            color={`url(#${gradientId})`}
            className="letters-animation-svg"
            style={{ width: '100%', height: '100%' }}
            svgDefs={(info) =>
              createGradientElement(activePresetKey, brightness, saturation, info, gradientId)
            }
          />
        </div>
      </div>

      {/* 播放控制 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
        }}
      >
        <button
          type="button"
          onClick={togglePlay}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: isPlaying
              ? 'rgba(255, 255, 255, 0.12)'
              : 'linear-gradient(135deg, #a855f7, #6366f1)',
            color: '#fff',
            transition: 'background 0.2s, transform 0.1s',
          }}
          aria-label={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying ? ICONS.pause : ICONS.play}
        </button>

        <button
          type="button"
          onClick={handleReplay}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#fff',
          }}
          aria-label="重新播放"
          title="重新播放"
        >
          {ICONS.replay}
        </button>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              height: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: getCssGradient(activePresetKey, brightness, saturation),
                borderRadius: '3px',
                transform: `scaleX(${progress})`,
                transformOrigin: 'left center',
                willChange: 'transform',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.45)',
            }}
          >
            <span>
              {PHASE_LABELS[phase]} · {Math.round(progress * 100)}%
            </span>
            <span>{loop ? '循环开启' : '单次播放'}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={shufflePreset}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: 'rgba(168, 85, 247, 0.15)',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          随机换色
        </button>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.75)',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <input
            type="checkbox"
            checked={eraseMode}
            onChange={(e) => setEraseMode(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          ERASE
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.75)',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <input
            type="checkbox"
            checked={loop}
            onChange={(e) => setLoop(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          循环播放
        </label>
      </div>

      {/* 参数面板 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
        }}
      >
        <Control label="文字内容">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={60}
            placeholder="输入要生成的文字"
            style={inputStyle}
          />
        </Control>

        <RangeControl
          label="笔画粗细"
          value={strokeWidth}
          min={0.5}
          max={5}
          step={0.1}
          onChange={setStrokeWidth}
          display={formatNumber(strokeWidth, 1)}
        />

        <RangeControl
          label="重叠度"
          value={overlap}
          min={0}
          max={0.5}
          step={0.01}
          onChange={setOverlap}
          display={formatNumber(overlap, 2)}
        />

        <RangeControl
          label="动画时长"
          value={duration}
          min={0.5}
          max={5}
          step={0.1}
          onChange={setDuration}
          display={`${formatNumber(duration, 1)}s`}
        />

        <RangeControl
          label="饱和度"
          value={saturation}
          min={-100}
          max={100}
          step={1}
          onChange={setSaturation}
          display={`${saturation > 0 ? '+' : ''}${saturation}%`}
        />

        <RangeControl
          label="亮度"
          value={brightness}
          min={-50}
          max={50}
          step={1}
          onChange={setBrightness}
          display={`${brightness > 0 ? '+' : ''}${brightness}%`}
        />

        <Control label="缓动">
          <select
            value={ease}
            onChange={(e) => setEase(e.target.value as EasePreset)}
            style={inputStyle}
          >
            {EASE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Control>

        <Control label="字形风格">
          <div style={{ display: 'flex', gap: '10px' }}>
            {(['simple', 'complex'] as FontVariant[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVariant(v)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor:
                    variant === v
                      ? 'rgba(168, 85, 247, 0.8)'
                      : 'rgba(255, 255, 255, 0.1)',
                  background:
                    variant === v
                      ? 'rgba(168, 85, 247, 0.15)'
                      : 'rgba(0, 0, 0, 0.35)',
                  color: variant === v ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                {v === 'simple' ? '简约' : '复杂'}
              </button>
            ))}
          </div>
        </Control>
      </div>

      {/* 渐变池 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              渐变池
            </span>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }}>
              {selectedCount} / {totalCount} 已选 · {favorites.size} 收藏
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <PoolButton onClick={selectAll}>全选</PoolButton>
            <PoolButton onClick={clearSelection}>清空</PoolButton>
            <PoolButton onClick={shufflePreset}>随机</PoolButton>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['all', ...getCategories(), 'favorites'] as TabKey[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: '1px solid',
                borderColor:
                  tab === t
                    ? 'rgba(168, 85, 247, 0.8)'
                    : 'rgba(255, 255, 255, 0.1)',
                background:
                  tab === t
                    ? 'rgba(168, 85, 247, 0.2)'
                    : 'rgba(0, 0, 0, 0.35)',
                color: tab === t ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: '12px',
            maxHeight: '320px',
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          {filteredPresets.map((key) => {
            const selected = selectedPresets.has(key);
            const isActive = activePresetKey === key;
            const isFavorite = favorites.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => togglePreset(key)}
                style={{
                  position: 'relative',
                  height: '56px',
                  borderRadius: '10px',
                  border: '2px solid',
                  borderColor: selected
                    ? isActive
                      ? '#fff'
                      : 'rgba(168, 85, 247, 0.8)'
                    : 'rgba(255, 255, 255, 0.08)',
                  background: getCssGradient(key, brightness, saturation),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  padding: '6px 8px',
                  boxShadow: isActive ? '0 0 0 2px rgba(168,85,247,0.5)' : 'none',
                  transition: 'transform 0.1s, box-shadow 0.2s',
                }}
                title={key}
              >
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(key, e)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: 'none',
                    background: isFavorite
                      ? 'rgba(236, 72, 153, 0.92)'
                      : 'rgba(0, 0, 0, 0.35)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    transition: 'background 0.15s',
                    zIndex: 2,
                  }}
                  aria-label={isFavorite ? '取消收藏' : '收藏'}
                  title={isFavorite ? '取消收藏' : '收藏'}
                >
                  {isFavorite ? ICONS.heart : ICONS.heartOutline}
                </button>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                    textTransform: 'capitalize',
                    textAlign: 'left',
                    lineHeight: 1.1,
                  }}
                >
                  {key}
                </span>
                {selected && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.9)',
                      color: '#a855f7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 800,
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {filteredPresets.length === 0 && tab === 'favorites' && (
          <div
            style={{
              textAlign: 'center',
              padding: '28px 12px',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '0.85rem',
            }}
          >
            暂无收藏渐变，点击任意卡片左上角的心形即可收藏。
          </div>
        )}
      </div>
    </div>
  );
}

function PoolButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        background: 'rgba(255, 255, 255, 0.06)',
        color: 'rgba(255, 255, 255, 0.85)',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  appearance: 'none',
  background: 'rgba(0, 0, 0, 0.35)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '10px',
  padding: '10px 14px',
  color: '#fff',
  fontSize: '0.95rem',
  outline: 'none',
  fontFamily: 'inherit',
};

function Control({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  return (
    <Control
      label={
        <span style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{label}</span>
          <span
            style={{
              color: 'rgba(255, 255, 255, 0.75)',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {display}
          </span>
        </span>
      }
    >
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          WebkitAppearance: 'none',
          height: '5px',
          borderRadius: '3px',
          background: 'rgba(255, 255, 255, 0.1)',
          outline: 'none',
        }}
      />
    </Control>
  );
}

function LettersApp({
  text,
  color = '#ffffff',
  strokeWidth = 2,
}: {
  text: string;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Letters
      text={text}
      autoPlay
      strokeWidth={strokeWidth}
      color={color}
      className="letters-animation-svg"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// 全局挂载函数，供原生 JS 调用（兼容旧版入口）
(window as any).mountLettersAnimation = function (
  container: HTMLElement,
  text: string,
  color?: string,
  strokeWidth?: number
) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <LettersApp text={text} color={color} strokeWidth={strokeWidth} />
    </React.StrictMode>
  );
  return root;
};

(window as any).mountLettersPlayground = function (
  container: HTMLElement,
  initialConfig?: PlaygroundConfig
) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Playground initialConfig={initialConfig} />
    </React.StrictMode>
  );
  return root;
};

// 如果存在 letters-animation-container，自动挂载简单版
const autoContainer = document.getElementById('letters-animation-container');
if (autoContainer) {
  const text = autoContainer.dataset.text || 'Hello';
  const color = autoContainer.dataset.color || '#ffffff';
  const strokeWidth = parseFloat(autoContainer.dataset.strokeWidth || '2');
  (window as any).mountLettersAnimation(autoContainer, text, color, strokeWidth);
}

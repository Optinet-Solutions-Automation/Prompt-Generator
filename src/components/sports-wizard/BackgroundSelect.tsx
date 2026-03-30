/**
 * BackgroundSelect — Q4: What kind of background?
 * Category chips → detail sub-chips.
 * Also collects: match country/city, flag in background, lighting tone, and optional props.
 */
import { useState } from 'react';
import { BACKGROUND_CATEGORIES, TOP_MATCH_COUNTRIES, LIGHTING_TONES, BackgroundCategory } from './scene-presets';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SportsBannerData } from '@/types/prompt';

type Props = {
  sport: string;
  backgroundCategory: string;
  backgroundDetail: string;
  matchCountry: string;
  flagInBackground: boolean;
  flagCountry: string;
  lightingTone: string;
  hasTrophy: boolean;
  hasScoreboard: boolean;
  scoreboardText: string;
  hasEquipment: boolean;
  onChange: (
    field: keyof Pick<
      SportsBannerData,
      | 'backgroundCategory' | 'backgroundDetail'
      | 'matchCountry' | 'flagInBackground' | 'flagCountry'
      | 'lightingTone' | 'lightingToneDetail'
      | 'hasTrophy' | 'hasScoreboard' | 'scoreboardText' | 'hasEquipment'
    >,
    value: string | boolean
  ) => void;
};

export function BackgroundSelect({
  sport,
  backgroundCategory,
  backgroundDetail,
  matchCountry,
  flagInBackground,
  flagCountry,
  lightingTone,
  hasTrophy,
  hasScoreboard,
  scoreboardText,
  hasEquipment,
  onChange,
}: Props) {
  const [customDetail, setCustomDetail] = useState('');
  const [showCustomBg, setShowCustomBg] = useState(false);
  const [customCountry, setCustomCountry] = useState('');
  const [showCustomCountry, setShowCustomCountry] = useState(false);

  const selectedCategory: BackgroundCategory | undefined = BACKGROUND_CATEGORIES.find(
    (c) => c.id === backgroundCategory
  );

  const handleCategorySelect = (cat: BackgroundCategory) => {
    setShowCustomBg(false);
    onChange('backgroundCategory', cat.id);
    onChange('backgroundDetail', '');
  };

  const handleDetailSelect = (detail: string) => {
    setShowCustomBg(false);
    setCustomDetail('');
    onChange('backgroundDetail', detail);
  };

  const handleCountrySelect = (name: string) => {
    setShowCustomCountry(false);
    setCustomCountry('');
    onChange('matchCountry', name);
    // Auto-set flagCountry to same country if flag toggle is on
    if (flagInBackground) onChange('flagCountry', name);
  };

  const handleLightingSelect = (id: string) => {
    const tone = LIGHTING_TONES.find((t) => t.id === id);
    onChange('lightingTone', id);
    onChange('lightingToneDetail', tone?.promptDetail ?? '');
  };

  return (
    <div className="space-y-6">

      {/* ── Background type ── */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">Background type</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BACKGROUND_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              className={[
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-150',
                'hover:border-primary/60 hover:bg-primary/5',
                backgroundCategory === cat.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card',
              ].join(' ')}
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="text-xs font-medium text-center leading-tight text-foreground">
                {cat.label}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setShowCustomBg(true);
              onChange('backgroundCategory', 'custom');
              onChange('backgroundDetail', customDetail);
            }}
            className={[
              'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-150',
              'hover:border-primary/60 hover:bg-primary/5',
              backgroundCategory === 'custom' ? 'border-primary bg-primary/10' : 'border-border bg-card',
            ].join(' ')}
          >
            <span className="text-xl">✏️</span>
            <span className="text-xs font-medium text-center leading-tight text-foreground">Custom</span>
          </button>
        </div>
      </div>

      {/* Background detail sub-chips */}
      {selectedCategory && !showCustomBg && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Background detail</Label>
          <div className="flex flex-wrap gap-2">
            {selectedCategory.details.map((detail) => (
              <button
                key={detail}
                type="button"
                onClick={() => handleDetailSelect(detail)}
                className={[
                  'px-3 py-1.5 rounded-full border text-sm transition-all duration-150',
                  'hover:border-primary/60 hover:bg-primary/5',
                  backgroundDetail === detail
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border bg-card text-muted-foreground',
                ].join(' ')}
              >
                {detail}
              </button>
            ))}
          </div>
        </div>
      )}

      {(showCustomBg || backgroundCategory === 'custom') && (
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-foreground">Describe the background</Label>
          <Input
            placeholder="e.g. rain-soaked rooftop under a neon billboard at night…"
            value={customDetail}
            onChange={(e) => {
              setCustomDetail(e.target.value);
              onChange('backgroundDetail', e.target.value);
            }}
            autoFocus={showCustomBg}
            className="text-sm"
          />
        </div>
      )}

      {/* ── Match country / city ── */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Match country / city{' '}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <p className="text-xs text-muted-foreground -mt-1">
          Adds local landmarks, atmosphere, or architecture hints to the background.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TOP_MATCH_COUNTRIES.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => handleCountrySelect(c.name)}
              className={[
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm transition-all duration-150',
                'hover:border-primary/60 hover:bg-primary/5',
                matchCountry === c.name
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border bg-card text-muted-foreground',
              ].join(' ')}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowCustomCountry(true)}
            className={[
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm transition-all duration-150',
              'hover:border-primary/60 hover:bg-primary/5',
              showCustomCountry ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground',
            ].join(' ')}
          >
            ✏️ Other
          </button>
        </div>
        {showCustomCountry && (
          <Input
            placeholder="Type country or city name…"
            value={customCountry}
            onChange={(e) => {
              setCustomCountry(e.target.value);
              onChange('matchCountry', e.target.value);
            }}
            autoFocus
            className="max-w-xs text-sm"
          />
        )}
      </div>

      {/* ── Flag in background ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between max-w-sm">
          <label htmlFor="toggle-flag" className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer">
            <span>🚩</span> Add flag in background
          </label>
          <Switch
            id="toggle-flag"
            checked={flagInBackground}
            onCheckedChange={(checked) => {
              onChange('flagInBackground', checked);
              if (checked && !flagCountry && matchCountry) {
                onChange('flagCountry', matchCountry);
              }
            }}
          />
        </div>
        {flagInBackground && (
          <div className="space-y-1.5 ml-6">
            <Label className="text-sm text-muted-foreground">Which flag?</Label>
            <div className="flex flex-wrap gap-1.5">
              {TOP_MATCH_COUNTRIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => onChange('flagCountry', c.name)}
                  className={[
                    'flex items-center gap-1 px-2 py-1 rounded-full border text-xs transition-all duration-150',
                    'hover:border-primary/60 hover:bg-primary/5',
                    flagCountry === c.name
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border bg-card text-muted-foreground',
                  ].join(' ')}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
            <Input
              placeholder="Or type a country…"
              value={TOP_MATCH_COUNTRIES.some((c) => c.name === flagCountry) ? '' : flagCountry}
              onChange={(e) => onChange('flagCountry', e.target.value)}
              className="max-w-xs text-sm mt-1"
            />
          </div>
        )}
      </div>

      {/* ── Lighting tone ── */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Lighting tone{' '}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <p className="text-xs text-muted-foreground -mt-1">
          Sets the color mood of the whole image — often tied to the team or country's identity.
        </p>
        <div className="flex flex-wrap gap-2">
          {LIGHTING_TONES.map((tone) => (
            <button
              key={tone.id}
              type="button"
              onClick={() => handleLightingSelect(tone.id)}
              className={[
                'px-3 py-1.5 rounded-full border text-sm transition-all duration-150',
                'hover:border-primary/60 hover:bg-primary/5',
                lightingTone === tone.id
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border bg-card text-muted-foreground',
              ].join(' ')}
            >
              {tone.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Optional props ── */}
      <div className="space-y-3 pt-1 border-t border-border">
        <p className="text-sm font-semibold text-foreground pt-2">Optional props</p>

        <div className="flex items-center justify-between max-w-sm">
          <label htmlFor="toggle-trophy" className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <span>🏆</span> Add championship trophy
          </label>
          <Switch
            id="toggle-trophy"
            checked={hasTrophy}
            onCheckedChange={(checked) => onChange('hasTrophy', checked)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between max-w-sm">
            <label htmlFor="toggle-scoreboard" className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <span>📊</span> Add scoreboard
            </label>
            <Switch
              id="toggle-scoreboard"
              checked={hasScoreboard}
              onCheckedChange={(checked) => onChange('hasScoreboard', checked)}
            />
          </div>
          {hasScoreboard && (
            <Input
              placeholder='Score text e.g. "0 - 0" or "2 - 1"'
              value={scoreboardText}
              onChange={(e) => onChange('scoreboardText', e.target.value)}
              className="max-w-[200px] text-sm"
            />
          )}
        </div>

        <div className="flex items-center justify-between max-w-sm">
          <label htmlFor="toggle-equipment" className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <span>🎯</span> Add floating {sport.toLowerCase()} equipment
          </label>
          <Switch
            id="toggle-equipment"
            checked={hasEquipment}
            onCheckedChange={(checked) => onChange('hasEquipment', checked)}
          />
        </div>
      </div>

    </div>
  );
}

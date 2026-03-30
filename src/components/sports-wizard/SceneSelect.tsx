/**
 * SceneSelect — Q2: Who's in the banner?
 * Collects: player role, count, action (chips adapt to sport + count), kit colors, gender, team nationality.
 */
import { SPORTS, PlayerCount } from './scene-presets';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SportsBannerData } from '@/types/prompt';

type Props = {
  sport: string;
  playerRole: string;
  playerCount: PlayerCount;
  action: string;
  kitColors: string;
  gender: SportsBannerData['gender'];
  teamNationality: string;
  onChange: (
    field: keyof Pick<SportsBannerData, 'playerRole' | 'playerCount' | 'action' | 'kitColors' | 'gender' | 'teamNationality'>,
    value: string
  ) => void;
};

const PLAYER_COUNT_OPTIONS: { value: PlayerCount; label: string; emoji: string }[] = [
  { value: '1', label: '1 Player', emoji: '🧑' },
  { value: '2', label: '2 Players', emoji: '👥' },
  { value: '3+', label: 'Team', emoji: '👨‍👩‍👧‍👦' },
];

const GENDER_OPTIONS: { value: SportsBannerData['gender']; label: string }[] = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Mixed', label: 'Mixed' },
];

export function SceneSelect({ sport, playerRole, playerCount, action, kitColors, gender, teamNationality, onChange }: Props) {
  const sportPreset = SPORTS.find((s) => s.id === sport);
  const roleChips: string[] = sportPreset?.playerRoles ?? [];
  const actionChips: string[] = sportPreset?.actions[playerCount] ?? [];

  return (
    <div className="space-y-5">

      {/* ── Player role ── */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">Player type / role</Label>
        <div className="flex flex-wrap gap-2">
          {roleChips.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => onChange('playerRole', role)}
              className={[
                'px-3 py-1.5 rounded-full border text-sm transition-all duration-150',
                'hover:border-primary/60 hover:bg-primary/5',
                playerRole === role
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border bg-card text-muted-foreground',
              ].join(' ')}
            >
              {role}
            </button>
          ))}
        </div>
        {/* Free text override */}
        <Input
          placeholder="Or type a custom role…"
          value={roleChips.includes(playerRole) ? '' : playerRole}
          onChange={(e) => onChange('playerRole', e.target.value)}
          className="max-w-sm text-sm"
        />
      </div>

      {/* ── Player count ── */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">How many players?</Label>
        <div className="flex gap-2">
          {PLAYER_COUNT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange('playerCount', opt.value);
                onChange('action', ''); // reset action — chips change with count
              }}
              className={[
                'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all duration-150',
                'hover:border-primary/60 hover:bg-primary/5',
                playerCount === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-foreground',
              ].join(' ')}
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Action chips ── */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">What are they doing?</Label>
        <div className="flex flex-wrap gap-2">
          {actionChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onChange('action', chip)}
              className={[
                'px-3 py-1.5 rounded-full border text-sm transition-all duration-150',
                'hover:border-primary/60 hover:bg-primary/5',
                action === chip
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border bg-card text-muted-foreground',
              ].join(' ')}
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Or describe the action yourself:</p>
          <Input
            placeholder="e.g. jumping over a defender…"
            value={actionChips.includes(action) ? '' : action}
            onChange={(e) => onChange('action', e.target.value)}
            className="max-w-sm text-sm"
          />
        </div>
      </div>

      {/* ── Team / nationality ── */}
      <div className="space-y-2">
        <Label htmlFor="team-nationality" className="text-sm font-semibold text-foreground">
          Team / nationality{' '}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="team-nationality"
          placeholder="e.g. national team of Brazil, Real Madrid, Australian team…"
          value={teamNationality}
          onChange={(e) => onChange('teamNationality', e.target.value)}
          className="max-w-sm text-sm"
        />
        <p className="text-xs text-muted-foreground">
          This helps match the kit colors and identity of the team in the banner.
        </p>
      </div>

      {/* ── Kit colors ── */}
      <div className="space-y-2">
        <Label htmlFor="kit-colors" className="text-sm font-semibold text-foreground">
          Kit / outfit colors{' '}
          <span className="font-normal text-muted-foreground">(optional — defaults to brand colors)</span>
        </Label>
        <Input
          id="kit-colors"
          placeholder="e.g. red and white striped, all black, navy blue…"
          value={kitColors}
          onChange={(e) => onChange('kitColors', e.target.value)}
          className="max-w-sm text-sm"
        />
      </div>

      {/* ── Gender ── */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">Gender</Label>
        <div className="flex gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('gender', opt.value)}
              className={[
                'px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-150',
                'hover:border-primary/60 hover:bg-primary/5',
                gender === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-foreground',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

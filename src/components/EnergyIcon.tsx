import { EnergyType } from '@/types/pokemon';

interface EnergyIconProps {
  type: EnergyType;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ENERGY_CONFIG: Record<EnergyType, { bg: string; border: string; symbol: string; text: string }> = {
  Fire:      { bg: '#E8441A', border: '#FF7748', symbol: '🔥', text: 'R' },
  Water:     { bg: '#2980B9', border: '#5DADE2', symbol: '💧', text: 'W' },
  Grass:     { bg: '#27AE60', border: '#58D68D', symbol: '🌿', text: 'G' },
  Lightning: { bg: '#D4AC0D', border: '#F7DC6F', symbol: '⚡', text: 'L' },
  Psychic:   { bg: '#8E44AD', border: '#C39BD3', symbol: '✦', text: 'P' },
  Fighting:  { bg: '#A04000', border: '#D35400', symbol: '✊', text: 'F' },
  Darkness:  { bg: '#212F3C', border: '#566573', symbol: '◆', text: 'D' },
  Metal:     { bg: '#717D7E', border: '#A9B7B7', symbol: '⚙', text: 'M' },
  Fairy:     { bg: '#E91E8C', border: '#F48FB1', symbol: '✿', text: 'Y' },
  Dragon:    { bg: '#1A237E', border: '#5C6BC0', symbol: '◈', text: 'N' },
  Colorless: { bg: '#7F8C8D', border: '#BDC3C7', symbol: '◇', text: 'C' },
};

const SIZE_CLASSES = {
  xs: { outer: 'w-3.5 h-3.5', text: 'text-[7px]' },
  sm: { outer: 'w-5 h-5',     text: 'text-[8px]' },
  md: { outer: 'w-6 h-6',     text: 'text-[10px]' },
  lg: { outer: 'w-9 h-9',     text: 'text-sm' },
};

export default function EnergyIcon({ type, size = 'sm', showLabel = false }: EnergyIconProps) {
  const config = ENERGY_CONFIG[type];
  const sizes = SIZE_CLASSES[size];

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className={`${sizes.outer} rounded-full flex items-center justify-center font-black shadow-sm border`}
        style={{ background: config.bg, borderColor: config.border }}
        title={type}
      >
        <span className={`${sizes.text} text-white leading-none`}>{config.text}</span>
      </div>
      {showLabel && (
        <span className="text-[8px] text-gray-300 font-semibold">{type}</span>
      )}
    </div>
  );
}

export { ENERGY_CONFIG };

import { ChevronDown } from 'lucide-react'

/* Tekrar kullanılan arayüz parçaları. */

const BASE_TRANSITION =
  'transition-[background-color,box-shadow,transform,color,border-color] duration-150 ease-out-soft'

/**
 * Buton hiyerarşisi:
 *  primary   — sayfadaki tek asıl eylem. Gradyan + renkli gölge.
 *  secondary — ikincil eylem. Yüzey rengi + yumuşak gölge.
 *  ghost     — üçüncül. Zeminsiz, sadece metin.
 *  danger    — yıkıcı eylem.
 */
export function Button({ variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: [
      'text-accent-ink font-semibold',
      'bg-[linear-gradient(180deg,var(--accent-hi),var(--accent))]',
      'elev-accent',
      'hover:elev-accent-2 hover:-translate-y-px',
      'active:translate-y-0 active:scale-[0.985] active:elev-accent',
    ].join(' '),
    secondary: [
      'text-ink font-medium bg-surface',
      'elev-1',
      'hover:elev-2 hover:-translate-y-px',
      'active:translate-y-0 active:scale-[0.985] active:bg-surface-2',
    ].join(' '),
    ghost: 'text-ink-2 font-medium hover:bg-surface-2 hover:text-ink active:scale-[0.985]',
    danger:
      'text-focus font-medium bg-surface elev-1 hover:elev-2 active:scale-[0.985]',
  }

  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-btn px-5 text-[15px] tracking-[-0.006em] disabled:pointer-events-none disabled:opacity-40 disabled:elev-none ${BASE_TRANSITION} ${variants[variant]} ${className}`}
      {...props}
    />
  )
}

/** Dairesel ikon butonu — okuma ekranı kontrolleri ve başlık çubuğu. */
export function IconButton({ label, size = 'md', tone = 'plain', className = '', ...props }) {
  const sizes = {
    sm: 'h-11 w-11',
    md: 'h-12 w-12',
    lg: 'h-[60px] w-[60px]',
    xl: 'h-[76px] w-[76px]',
  }
  const tones = {
    plain: 'text-ink-2 hover:bg-surface-2 hover:text-ink active:scale-95',
    surface: [
      'text-ink-2 bg-surface elev-1',
      'hover:text-ink hover:elev-2',
      'active:scale-95',
    ].join(' '),
    accent: [
      'text-accent-ink',
      'bg-[linear-gradient(180deg,var(--accent-hi),var(--accent))]',
      'elev-accent',
      'hover:elev-accent-2',
      'active:scale-95',
    ].join(' '),
  }

  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full disabled:pointer-events-none disabled:opacity-30 disabled:elev-none ${BASE_TRANSITION} ${sizes[size]} ${tones[tone]} ${className}`}
      {...props}
    />
  )
}

/** Kenarlık yok — ayrım gölge, yüzey rengi ve boşlukla sağlanıyor. */
export function Card({ className = '', ...props }) {
  return (
    <div
      className={`rounded-card bg-surface p-5 elev-1 ${className}`}
      {...props}
    />
  )
}

export function Field({ label, hint, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-semibold tracking-[0.06em] text-ink-3 uppercase">
          {label}
        </span>
        {hint ? (
          <span className="text-[13px] font-medium text-ink-2 tabular-nums">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  )
}

/**
 * Dolgu oranı görünen kaydırıcı. Webkit'te yol tek parça olduğu için
 * doluluk `--fill` değişkeniyle gradyan durağı olarak veriliyor.
 */
export function Slider({ min, max, step = 1, value, onChange, label, className = '' }) {
  const fill = ((value - min) / (max - min)) * 100

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={label}
      style={{ '--fill': `${fill}%` }}
      className={`range ${className}`}
    />
  )
}

export function Toggle({ label, description, checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-center justify-between gap-5 py-3.5 text-left"
    >
      <span className="min-w-0">
        <span className="block text-[15px] font-medium text-ink">{label}</span>
        {description ? (
          <span className="mt-1 block text-[13px] leading-relaxed text-ink-2">{description}</span>
        ) : null}
      </span>
      <span
        className={`relative h-7 w-[46px] shrink-0 rounded-full transition-colors duration-200 ease-out-soft ${
          checked
            ? 'bg-[linear-gradient(180deg,var(--accent-hi),var(--accent))] elev-accent'
            : 'bg-surface-2 elev-inset'
        }`}
      >
        <span
          className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-all duration-200 ease-out-soft ${
            checked ? 'left-[21px]' : 'left-[3px]'
          }`}
        />
      </span>
    </button>
  )
}

export function Segmented({ options, value, onChange, className = '' }) {
  return (
    <div
      role="tablist"
      className={`flex gap-1 rounded-input bg-surface-2 p-1 elev-inset ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`min-h-10 flex-1 rounded-[8px] px-3 text-[14px] font-medium ${BASE_TRANSITION} ${
              active
                ? 'bg-surface text-ink elev-1'
                : 'text-ink-2 hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function Collapsible({ title, open, onToggle, children }) {
  return (
    <div className="overflow-hidden rounded-card bg-surface elev-1">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors duration-150 hover:bg-surface-2/50"
      >
        <span className="text-[15px] font-medium text-ink">{title}</span>
        <ChevronDown
          size={18}
          strokeWidth={2}
          className={`shrink-0 text-ink-2 transition-transform duration-200 ease-out-soft ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open ? <div className="px-5 pt-1 pb-5">{children}</div> : null}
    </div>
  )
}

/** İstatistik kutusu — sayı iri ve sıkı, etiket küçük ve soluk. */
export function Stat({ value, label, sub }) {
  return (
    <div className="rounded-card bg-surface px-5 py-5 elev-1">
      <div className="text-[28px] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">
        {value}
      </div>
      <div className="mt-2.5 text-[13px] font-medium text-ink-2">{label}</div>
      {sub ? <div className="mt-1 text-[12px] text-ink-3">{sub}</div> : null}
    </div>
  )
}

/** Boş durum — ikon + başlık + açıklama. */
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center rounded-card bg-surface px-6 py-14 text-center elev-1">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
        <Icon size={24} strokeWidth={1.75} className="text-accent" />
      </div>
      <p className="mt-4 text-[16px] font-semibold tracking-[-0.015em] text-ink">{title}</p>
      <p className="mt-1.5 max-w-[34ch] text-[14px] leading-relaxed text-ink-2">{description}</p>
    </div>
  )
}

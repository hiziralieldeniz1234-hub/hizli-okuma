/**
 * Okuma hızı seviyeleri.
 *
 * Bantların dayanağı: Brysbaert (2019) meta-analizinde yetişkin sessiz okuma
 * ortalaması 238 (kurgu dışı) / 260 (kurgu) kelime/dk. Anlama 200-400 arasında
 * yüksek kalıyor, 500 üstünde düşüyor. RSVP'de göz sayfada gezinmediği için
 * üst sınır yükseliyor ama işlevsel oran yine ~300 civarında.
 *
 * Türkçe eklemeli bir dil; kelimeler daha uzun ve kelime başına daha çok bilgi
 * taşıyor, bu yüzden bantlar İngilizce ölçümlere göre biraz aşağıda.
 *
 * min/max: seviyenin kapsadığı aralık (kaydırıcı elle oynatılınca hangisinin
 * işaretleneceğini belirler). wpm: seviyeye tıklanınca ayarlanan değer.
 */
export const SPEED_LEVELS = [
  {
    id: 'baslangic',
    label: 'Başlangıç',
    wpm: 150,
    min: 100,
    max: 199,
    hint: 'Alışma hızı. Sesli okumaya yakın, kelimeleri rahatça takip edersin.',
  },
  {
    id: 'ortalama',
    label: 'Ortalama',
    wpm: 250,
    min: 200,
    max: 299,
    hint: 'Yetişkin sessiz okuma ortalaması bu bantta: 238-260 kelime/dk.',
  },
  {
    id: 'hizli',
    label: 'Hızlı',
    wpm: 350,
    min: 300,
    max: 399,
    hint: 'Ortalamanın üstü. Anlama hâlâ yüksek kalıyor.',
  },
  {
    id: 'ileri',
    label: 'İleri',
    wpm: 450,
    min: 400,
    max: 549,
    hint: 'Anlamanın düşmeye başladığı sınır. Bilinen metinlerde daha rahat.',
  },
  {
    id: 'ultra',
    label: 'Ultra',
    wpm: 650,
    min: 550,
    max: 1000,
    hint: 'Göz atma hızı. Ayrıntılar kaçar, genel fikir edinilir.',
  },
]

/** Verilen hıza karşılık gelen seviye. */
export function levelForWpm(wpm) {
  return (
    SPEED_LEVELS.find((l) => wpm >= l.min && wpm <= l.max) ??
    SPEED_LEVELS[SPEED_LEVELS.length - 1]
  )
}

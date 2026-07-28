# Hızlı Okuma Pratik Yap

Kelimeleri ekranın ortasında tek tek göstererek okuma hızını artırmaya çalışan,
sade ve göz yormayan bir RSVP uygulaması.

**[→ Canlı demoyu aç](https://hiziralieldeniz1234-hub.github.io/hizli-okuma/)**

Normal okurken gözün satır üzerinde sürekli zıplar, geri döner, yeniden yerini
bulur. Bu gidiş gelişler okuma süresinin azımsanmayacak bir kısmını yer. RSVP
(Rapid Serial Visual Presentation) bunu ortadan kaldırır: kelimeler sabit bir
noktada, ayarladığın hızda tek tek belirir. Göz aramayı bırakır, dikkat
anlamaya kalır.

Kurulum gerektirmez, tarayıcıda çalışır. Okuduğun her şey ve bütün
istatistiklerin cihazında kalır — sunucuya hiçbir şey gitmez.

---

## Ekran görüntüleri

> Buraya ekran görüntülerini ekle. Önerilen: ana sayfa (açık tema), okuma ekranı
> (koyu tema) ve istatistik sayfası.

<!--
![Ana sayfa](docs/ekran-1.png)
![Okuma ekranı](docs/ekran-2.png)
![İstatistikler](docs/ekran-3.png)
-->

---

## Neler var

- **RSVP okuyucu** — kelimeler tek tek, ayarlanan hızda akar. Her kelimede bir
  harf renklenir ve hep aynı noktada durur (odak harfi), böylece göz sabitlenir.
- **Ayarlanabilir hız** — 100 ile 1000 kelime/dk arası serbest kaydırıcı.
- **Seviye sistemi** — Başlangıç, Ortalama, Hızlı, İleri, Ultra. Hangi hızın ne
  anlama geldiğini tahmin etmek zorunda kalmazsın; bantların dayanağı aşağıda.
- **Okuma istatistikleri** — toplam okunan kelime, ortalama hız, toplam süre ve
  tarihe göre gruplanmış seans geçmişi.
- **Açık / koyu tema** — ikisi de düşük kontrastlı, uzun okumada yormayan tonlarda.
- **30 hazır Türkçe metin** — öykü, gerilim, macera, masal, doğa, fantastik,
  bilim ve tarih. Toplam yaklaşık 27.000 kelime.
- **Kendi metnin** — istediğin metni yapıştırıp okuyabilirsin.
- **Telefona kurulabilir** — "ana ekrana ekle" ile tam ekran açılır.

Okuma ekranında ayrıca: duraklat/devam, 10 kelime geri/ileri sarma, baştan
alma, kelime grubu (aynı anda 1-3 kelime), noktalama duraklamaları ve okurken
hız değiştirme.

---

## Çalıştırma

Node 20 veya üstü gerekiyor.

```bash
npm install
```

```bash
npm run dev
```

Tarayıcıda <http://localhost:5173> açılır. Üretim derlemesi için:

```bash
npm run build
```

Çıktı `dist/` klasörüne yazılır. Derlenmiş hâli yerelde denemek istersen:

```bash
npm run preview
```

---

## Kendi metinlerini ekleme

Hazır metinler koda gömülü değil, uygulama açılışta `public/texts.json`
dosyasını okuyor. Metin eklemek için tek yapman gereken bu dosyayı düzenlemek.

```json
{
  "version": 1,
  "texts": [
    {
      "id": "benzersiz-kimlik",
      "title": "Metnin Adı",
      "author": "Yazar",
      "category": "Öykü",
      "content": "Birinci paragraf buraya gelir.\n\nİkinci paragraf."
    }
  ]
}
```

| Alan       | Zorunlu  | Açıklama                                              |
| ---------- | -------- | ----------------------------------------------------- |
| `id`       | hayır    | Benzersiz kimlik. Yazmazsan otomatik üretilir.         |
| `title`    | hayır    | Listede ve istatistiklerde görünen ad.                 |
| `author`   | hayır    | Başlığın altında görünür, boş bırakılabilir.           |
| `category` | hayır    | Başlığın altında görünür (ör. "Öykü", "Bilim").        |
| `content`  | **evet** | Metnin kendisi. Boş olan kayıtlar listeye alınmaz.     |

Birkaç ayrıntı:

- **Paragrafları `\n\n` ile ayır.** JSON tek satırlık metin istediği için gerçek
  satır sonu yazamazsın; arka arkaya iki `\n` yeni paragraf demektir. Uygulama
  paragraf sonlarında okumayı bir nebze yavaşlatır.
- Metnin içinde çift tırnak geçiyorsa başına ters bölü koy: `\"böyle\"`.
- Kelime sayısı otomatik hesaplanır, elle yazmana gerek yok.
- Kimliklerin benzersiz olmasına dikkat et.

Dosyayı düzenledikten sonra `npm run dev` çalışıyorsa sayfayı yenilemen yeterli.

---

## Hız seviyeleri

Kaydırıcı 100–1000 arasında serbest. Üstündeki beş seviye hazır ayar olarak
çalışıyor: birine dokununca hız o değere gider, kaydırıcıyı elle oynatınca da
denk gelen seviye kendiliğinden işaretlenir.

| Seviye    | Aralık   | Dokununca | Anlamı                                        |
| --------- | -------- | --------- | --------------------------------------------- |
| Başlangıç | 100–199  | 150       | Alışma hızı, sesli okumaya yakın              |
| Ortalama  | 200–299  | 250       | Yetişkin sessiz okuma ortalaması (238–260)    |
| Hızlı     | 300–399  | 350       | Ortalamanın üstü, anlama hâlâ yüksek          |
| İleri     | 400–549  | 450       | Anlamanın düşmeye başladığı sınır             |
| Ultra     | 550–1000 | 650       | Göz atma; ayrıntı kaçar, genel fikir edinilir |

Sayılar rastgele seçilmedi. Brysbaert'in 190 çalışmayı ve 18.573 katılımcıyı
kapsayan meta-analizinde yetişkinlerde sessiz okuma ortalaması kurgu dışı
metinlerde 238, kurguda 260 kelime/dk çıkıyor — yani her yerde tekrarlanan
"ortalama 300" rakamı gerçekte olduğundan yüksek. Anlama 200–400 bandında
yüksek kalıyor, 500'ün üzerinde belirgin biçimde düşüyor. RSVP'de göz sayfada
gezinmediği için üst sınır yükseliyor ama işlevsel okuma oranı yine 300
civarında kalıyor.

Bir uyarı: bu ölçümlerin hepsi İngilizce metinlerden. Türkçe eklemeli bir dil,
kelimeler daha uzun ve kelime başına daha çok bilgi taşıyor; aynı anlama düzeyi
Türkçede daha düşük bir kelime/dk değerine denk geliyor. Bantları buna göre bir
miktar aşağı çektim.

Seviyeleri değiştirmek istersen hepsi tek dosyada: `src/lib/levels.js`.

---

## Klavye kısayolları

Masaüstünde okuma ekranında geçerli:

| Tuş       | İşlev                  |
| --------- | ---------------------- |
| `Boşluk`  | Başlat / duraklat      |
| `←` / `→` | 10 kelime geri / ileri |
| `Esc`     | Okumadan çık           |

---

## Teknoloji

| Ne              | Neden                                                          |
| --------------- | -------------------------------------------------------------- |
| React 19        | Arayüz                                                          |
| Vite 7          | Derleme ve geliştirme sunucusu                                  |
| Tailwind CSS 4  | Stil; renkler `@theme` ile tek dosyada tanımlı                  |
| lucide-react    | İkonlar                                                         |
| Inter           | Pakete gömülü (self-host), CDN yok                              |

Harici bir çalışma zamanı bağımlılığı, analitik veya izleme kodu yok. Okuma
geçmişi ve ayarlar tarayıcının `localStorage`'ında tutuluyor.

---

## Proje yapısı

```
public/
  texts.json             Hazır metinler (çalışma anında okunur)
  manifest.webmanifest   Ana ekrana ekleme ayarları
src/
  App.jsx                Ekran yönlendirmesi, texts.json yükleme
  index.css              Tasarım sistemi: font, palet, gölge, yarıçap, hareket
  lib/
    tokenize.js          Metni kelimelere/karelere ayırma, süre hesabı
    levels.js            Hız seviyeleri ve aralıkları
    storage.js           localStorage (ayarlar + okuma geçmişi)
    format.js            Tarih/süre/sayı biçimlendirme (tr-TR)
  hooks/
    useRsvp.js           Oynatma motoru: zamanlayıcı, duraklama, süre ölçümü
    useTheme.js          Açık/koyu tema
    useSettings.js       Okuma ayarları
    useSessions.js       Okuma geçmişi ve istatistikler
  components/
    WordDisplay.jsx      Kelime gösterimi + odak harfi hizalaması
    ui.jsx               Buton, kart, anahtar, slider, boş durum
  assets/fonts/          Inter (latin + latin-ext)
  screens/
    HomeScreen.jsx       Hız/seviye, metin listesi, kendi metnin, ayarlar
    ReaderScreen.jsx     Okuma ekranı ve kontroller
    FinishScreen.jsx     Seans özeti
    StatsScreen.jsx      Geçmiş ve genel istatistikler
```

---

## Telefon ve masaüstü

Tek kod tabanı, iki ayrı yerleşim. Kırılma noktası 1024px; metin kartlarının
iki sütuna geçmesi 1280px.

|                | Telefon (<1024px)                   | Masaüstü (≥1024px)                           |
| -------------- | ----------------------------------- | -------------------------------------------- |
| Ana sayfa      | Tek sütun: hız → metinler → ayarlar | İki sütun: solda metinler, sağda sabit panel  |
| Başlat butonu  | Ekranın altına yapışık              | Sağ panelin içinde                            |
| Metin kartları | Alt alta                            | ≥1280px'de iki sütunlu ızgara                 |
| İstatistikler  | 2×2 kutu                            | Tek sırada 4 kutu                             |
| Okuma ekranı   | Kelime 36–64px                      | Kelime 80px'e kadar, klavye ipuçları görünür  |

---

## Renkleri değiştirme

Bütün palet `src/index.css` içindeki iki blokta: `:root` (açık mod) ve `.dark`
(koyu mod). Bileşenlerin hiçbirinde sabit renk yok, hepsi bu değişkenlere
bağlı. Gölgeler de aynı yerde `--elev-*` olarak tanımlı.

Tema rengini değiştirirsen üç yeri birlikte güncelle: `index.css` içindeki
`--bg`, `index.html` içindeki `theme-color` meta etiketi ve
`public/manifest.webmanifest` içindeki `theme_color` / `background_color`.

---

## Yol haritası

**Capacitor ile Android.** Proje baştan buna uygun kuruldu: `vite.config.js`
içinde `base: './'` ayarlı olduğu için varlık yolları göreli üretiliyor ve
`file://` üzerinden sorunsuz yükleniyor; güvenli alan (safe area) boşlukları
CSS'te hazır. Eklenecekler: `@capacitor/core`, `@capacitor/cli`,
`@capacitor/android`, donanım geri tuşu yönetimi ve durum çubuğu rengi.

Aklımdaki diğer şeyler: metin içinde arama, okunan yeri hatırlama, seans
hedefleri ve haftalık ilerleme grafiği.

---

## Katkı

Hata bildirimi ve öneriler için issue açabilirsin. Kod göndereceksen önce bir
issue açıp ne yapmak istediğini yazman, ikimizin de zamanını kurtarır.

Yeni metin eklemek istersen: `public/texts.json`'a ekle, telif hakkı sana ait
olsun ya da açıkça serbest kullanımlı bir metin olsun.

---

## Lisans

MIT — bkz. [LICENSE](LICENSE). Kısaca: kullanabilir, değiştirebilir, ticari
projelerde kullanabilirsin; tek şart telif bildirimini korumak.

# SEO Jarvis — рекламный моушн-ролик

Рекламный моушн-ролик для SEO Jarvis (лендинг seojarvis.ru + кабинет app.seojarvis.ru) с озвучкой ElevenLabs. Ориентир — продуктовые ролики Anthropic и OpenAI.

## Статус
- [x] Анализ лендинга, экрана входа, демо кабинета и скриншотов реального онбординга (`research/screens/`)
- [x] Разбор референсов Anthropic / OpenAI / моушн-скиллов (`refs/reference-analysis.md`)
- [x] Сценарий согласован — вариант А (путь пользователя)
- [x] Превью собрано и отрендерено: 30 с, 1080p, 60 fps, музыка + звуки интерфейса (`film/`, готовый файл — `deliver/`)
- [ ] Озвучка ElevenLabs — текст и настройки в `script/voiceover-preview-v2-FINAL.md`, генерирует заказчик
- [ ] Подгонка анимации под голос, финальное сведение
- [ ] Показ руководству → полный ролик (60–90 с)

## Структура
| Папка | Что внутри |
|---|---|
| `brief/` | Описание продукта, промпт «моушн-студии», бренд и факты для кадра |
| `research/` | Скриншоты и тексты лендинга и кабинета |
| `refs/` | Разбор референсов, листы кадров, скиллы и движок |
| `storyboard/` | Раскадровки: `preview-v1.md` (черновик), `preview-v2-built.md` (как собрано) |
| `script/` | Тексты озвучки; актуальный — `voiceover-preview-v2-FINAL.md` |
| `film/` | Исходник ролика: `index.html` + `film.js` (кадр = функция времени), скрипты рендера и звука |
| `deliver/` | Готовые MP4 |

## Как пересобрать ролик
```bash
cd film
npm i                                   # Playwright
python3 -m http.server 8765 --bind 127.0.0.1 &
node tools/snap.mjs snaps/x 0.5 0 5 10 20   # кадры + лист для проверки
node tools/render.mjs --out out/draft.mp4 --fps 30 --scale 0.5   # быстрый черновик
tools/render_all.sh 3                   # финал: 1080p60, размытие в движении, 4 потока
node tools/cues.mjs && python3 tools/audio.py [--vo vo.wav]      # звук по меткам из анимации
tools/master.sh audio/mix_novo.wav ../deliver/preview.mp4        # −14 LUFS + склейка с видео
```
Все тайминги — в объекте `T` в начале `film/film.js`.

## Правила
- Демо-данные — на домене example.ru (ниша «стоматология, Москва»).
- Музыка — Mixkit «Opalescent» (№720), бесплатная лицензия Mixkit.
- Шрифт — Inter (OFL). Логотип — с app.seojarvis.ru.

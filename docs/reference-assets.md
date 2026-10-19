# Uncoded — источник визуального референса

Референс пользователя: https://uncoded.framer.website/ (проверен 15.10.2026).
Декоративные материалы отделены от работ Сергея в `public/reference/`. Они не являются его портфолио-проектами. Собственные проекты и их авторство перечислены в `content/projects.json` и `content/media-sources.json`.

## Декоративные материалы

| Локальный файл | Оригинальный источник |
| --- | --- |
| wave-desktop.webp | https://framerusercontent.com/images/rspW9Zgy3AoSH2PVbHNLfmlqo4.png |
| wave-mobile.webp | https://framerusercontent.com/images/A4WwN8o6wMxiWGrHpdI8UjTm3Qc.png |
| hero.mp4 | https://framerusercontent.com/assets/vFfWZphxoDzmxEXu83QAVsmK8.mp4 |
| cta.mp4 | https://framerusercontent.com/assets/TJENHfiegHbt1JgJHlB89874s.mp4 |
| logic.mp4 | https://framerusercontent.com/assets/HpsrtmdDCthiclGw5CzzrTr1TZ8.mp4 |
| craft.mp4 | https://framerusercontent.com/assets/geuAwNzgOiqy3USMxnsf6DsHWU.mp4 |
| system.mp4 | https://framerusercontent.com/assets/wrfsNfQZR0ZdQJO0SbIYmeTfw8.mp4 |

Видео оптимизированы до 720 px, H.264 CRF 27. WebP-постеры получены из соответствующих роликов. Изображения волны перекодированы в WebP.

Фрагментный шейдер основан на опубликованном компоненте `GradientWave.Dn2Bj_kz.mjs` Uncoded. Обвязка WebGL написана для статического сайта, без Framer/React. Цвета и параметры взяты из референса: #90d2eb, #1b2938, #265566; seed 14; speed .6; amplitude 1.08; angle −78; frequency 6/.1; softness .53; blend .8.

В проверочном браузере WebGL-контекст недоступен и у оригинала фон пуст. Реализация сохраняет исходное резервное изображение и плавное движение через CSS, поэтому первый экран остаётся видимым. Это не снимок работающего исходного WebGL-эффекта.

Шрифты Instrument Serif и Geist соответствуют референсу. Oranienbaum используется для кириллического serif, Golos Text — кириллический sans fallback. Лицензии OFL сохранены рядом со шрифтами.

# Фикстуры snapshot-тестов

Каждая папка — отдельный кейс: `config.json`, `tokens/` и эталон `expected/` (то, что сборка пишет в `output`).
Тест (`test/build.test.js`) собирает кейс во временную папку и сравнивает файлы с `expected/` побайтно.

| Кейс | Что проверяет |
| --- | --- |
| `pbstyles-v4`, `pbstyles-v3` | токены pbstyles в старом формате (`value` + `mixin`), светлая и тёмная тема |
| `pbstyles-dtcg-v4`, `pbstyles-dtcg-v3` | те же токены в строгом DTCG 2025.10 — вывод должен совпадать со старым форматом |
| `readme-v4`, `readme-v3` | примеры из README без тем |
| `themes-v4`, `themes-v3` | минимальный пример тем, `themes.prefix` |
| `multi-theme-v4`, `multi-theme-v3` | три темы и `themes.default` |
| `dtcg-composite-v4` | составные типы DTCG: typography, shadow, color, группы без `mixin`, `$extensions` |
| `zero-values-v4` | токены со значением `0` (B2) |
| `figma-export-v4`, `figma-export-v3` | нативная выгрузка Figma: файл на режим, цвета объектом, `number` и `dimension`, `numberUnit` по умолчанию |
| `direct-source` | путь к файлу в `source` и отсутствующая папка `output` (B1, B4) |

Осознанные отличия эталонов от вывода версии 2.3.2:

- `*-v3` с темами: в `theme.js` на `var()` заменяются только семантические токены (по пути токена, B3).
  Раньше замена шла по совпадению значения, и палитра (`white`, `gray.50`, …) тоже превращалась в `var()`.
- `*-v4`: блоки `@theme` и `@theme inline` выводятся с отступами, `@keyframes` — многострочно (как после prettier).
  Отличие от 2.3.2 только в пробелах и пустых строках.
- `pbstyles-dtcg-v3`: `opacity` в DTCG — числа (`$type: number`), поэтому в `theme.js` это `0.05`, а не `"0.05"`.

Как добавить кейс: создайте папку с `config.json` (`"output": "./expected"`) и `tokens/`,
выполните в ней `node ../../../bin/tailwind-dictionary.js -c config.json`, проверьте `expected/` глазами
и запустите `npm test`.

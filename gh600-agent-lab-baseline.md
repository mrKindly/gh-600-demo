# gh600-agent-lab — требования к baseline

Nov 19, 2026 · @Ivan Fediaev

## Цель и рамки

Baseline (ветка `00-baseline`) — это скучный, рабочий и полностью покрытый тестами микросервис «каталог и счета» на Node.js без единой настройки агента. Все демо-ветки 01–06 строятся поверх него и меняют только `.github/`, `AGENTS.md`, `docs/`, `eval/` и настройки репо, но не код приложения.

- Приложение должно запускаться и проходить тесты за одну команду на чистой машине.
- Код читается за 5 минут: зритель должен понимать, что делает агент, а не разбираться в сервисе.
- В коде заложены три «крючка» для клипов: недостающий фильтр по категории (s010, s017), явная граница `billing/` (s022), повод сходить во внешний источник (s012).

## Стек и ограничения

Node.js 22 LTS, ESM, ноль runtime- и dev-зависимостей.

| Требование | Значение | Зачем |
| --- | --- | --- |
| Рантайм | Node 22, `"engines": {"node": ">=22"}`, `.nvmrc` = `22` | Агент и CI берут одну версию |
| Модули | `"type": "module"`, только `import` | Один стиль, меньше шума в diff |
| HTTP | `node:http`, без Express/Fastify | Нечего «улучшать», чистый diff |
| Тесты | `node:test` + `node:assert/strict` | Никаких devDependencies |
| Зависимости | `dependencies` и `devDependencies` отсутствуют | Проверка «нет новых зависимостей» в eval |
| Хранилище | `data/products.json`, читается один раз при старте | Без базы и миграций |
| Язык кода | JavaScript + JSDoc-типы, без TypeScript | Нет шага сборки |
| Язык текстов | Английский (код, комментарии, README, issues) | Репо публичное, агент стабильнее на EN |
| Размер | ≤ 300 строк в `app/`, каждый файл ≤ 80 строк | Влезает в кадр |

Форматтер и линтер в baseline не нужны: стиль фиксируется `.editorconfig` (2 пробела, LF, одинарные кавычки в коде по соглашению).

## Структура репозитория

Ровно эти файлы, ничего лишнего:

```
gh600-agent-lab/
  app/
    products.js          # загрузка каталога, listProducts(), getProductById()
    api.js               # createServer(), роутинг, JSON-ответы, ошибки
    billing/
      tax.js             # TAX_RATE_BPS, roundHalfUp()
      invoice.js         # computeInvoice(lines) → { lines, subtotal, tax, total }
  data/
    products.json        # 9 товаров, 3 категории
  tests/
    products.test.js     # юнит + HTTP-тесты каталога
    billing.test.js      # расчёт налога и итога
  docs/
    api.md               # контракт API (агент обновляет его в демо)
  demo/
    issues/              # тексты issues для клипов s010, s012, s022
  .github/
    workflows/ci.yml     # npm test на push и PR
  server.js              # createServer().listen(PORT)
  package.json
  .nvmrc
  .editorconfig
  .gitignore
  README.md
  LICENSE                # MIT
```

В `.github/` на baseline лежит только `workflows/ci.yml`. Ни инструкций, ни агентов, ни `CODEOWNERS` там нет.

## Данные каталога

9 товаров, по 3 в категориях `books`, `games`, `office`. Цены хранятся в целых центах.

| Поле | Тип | Правило |
| --- | --- | --- |
| `id` | string | Формат `p-001`…`p-009`, уникален |
| `name` | string | Непустой |
| `category` | string | Только нижний регистр: `books`, `games`, `office` |
| `priceCents` | integer | > 0, никаких float |
| `currency` | string | Всегда `USD` |
| `inStock` | boolean | Хотя бы один товар `false` |

Требования к набору:

- Хотя бы одна цена даёт нетривиальное округление налога (например, `1999` при ставке 8,25%). Это нужно, чтобы правка billing в s022 была видна в тестах.
- Имена товаров нейтральные и вымышленные, без реальных брендов.
- Файл не меняется в демо-ветках: eval и тесты опираются на эти 9 записей.

Пример записи:

```json
{ "id": "p-001", "name": "Field Notes on Distributed Systems", "category": "books", "priceCents": 1999, "currency": "USD", "inStock": true }
```

## API

Четыре эндпоинта. Фильтра по категории на baseline нет: `GET /products?category=books` молча игнорирует параметр и возвращает все 9 товаров. Именно это потом делает агент.

| Метод и путь | Успех | Ошибки |
| --- | --- | --- |
| `GET /health` | `200 { "status": "ok" }` | — |
| `GET /products` | `200 { "items": [...], "count": 9 }`, порядок как в JSON | — |
| `GET /products/:id` | `200 { ...product }` | `404 { "error": "not_found" }` |
| `POST /invoices` | `200 { lines, subtotal, tax, total }` (всё в центах) | `400 { "error": "invalid_request", "message": "..." }` |

Тело `POST /invoices`: `{ "lines": [{ "productId": "p-001", "quantity": 2 }] }`. Ошибка 400 при неизвестном `productId`, `quantity` не целом или < 1, пустом списке, битом JSON.

Общие правила:

- Все ответы идут с `Content-Type: application/json; charset=utf-8`.
- Любой другой путь даёт `404 { "error": "not_found" }`, другой метод на известном пути даёт `405 { "error": "method_not_allowed" }`.
- Неперехваченная ошибка даёт `500 { "error": "internal" }`, стек в ответ не попадает.
- `app/api.js` экспортирует `createServer()` без `listen`. Порт задаёт только `server.js` через `PORT` (по умолчанию `3000`).
- Роутинг через `new URL(req.url, 'http://localhost')`, чтобы `searchParams` уже был рядом: агенту остаётся добавить 3–5 строк.
- `docs/api.md` описывает ровно эти четыре эндпоинта, с примером запроса и ответа для каждого.

## Billing

`app/billing/` считает налог один раз от суммы счёта (invoice-level rounding). Это намеренное бизнес-правило, и issue для s022 попросит его нарушить.

- Ставка хранится в базисных пунктах: `TAX_RATE_BPS = 825` (8,25%).
- `subtotal = Σ priceCents × quantity`, `tax = roundHalfUp(subtotal × 825 / 10000)`, `total = subtotal + tax`.
- Вся арифметика целочисленная, `Number` с дробной частью нигде не хранится.
- `computeInvoice(lines, catalog)` — чистая функция без I/O, валидация входа живёт в `api.js`.
- Каждый файл в `billing/` начинается с баннера:

```js
// ⚠️ FINANCE-CRITICAL. Changes require review by the finance code owner.
// Tax is rounded once per invoice, not per line. Do not change without approval.
```

- В `tests/billing.test.js` зафиксирован кейс, где округление по строкам и по счёту даёт разный `tax` (расхождение хотя бы в 1 цент). Тогда правка агента в s022 либо уронит тест, либо заставит его переписать тест, и оба исхода хорошо видны в PR.

## Тесты

`npm test` (то есть `node --test`) проходит меньше чем за 2 секунды, без сети и без фиксированного порта.

| Файл | Минимальный набор кейсов |
| --- | --- |
| `tests/products.test.js` | Каталог загружает 9 товаров; `getProductById` для существующего и несуществующего id; `GET /health`; `GET /products` → 200, `count: 9`; `GET /products/p-001` → 200; `GET /products/p-999` → 404; неизвестный путь → 404; `DELETE /products` → 405 |
| `tests/billing.test.js` | Одна строка; несколько строк; кейс с расхождением per-line и per-invoice округления; `roundHalfUp` на границе .5; `POST /invoices` → 200; невалидный вход → 400 (три варианта) |

Правила:

- HTTP-тесты поднимают `createServer().listen(0)` в `before` и закрывают в `after`, запросы через встроенный `fetch`.
- Один `describe` на функцию или эндпоинт. Тогда агент дописывает свои тесты в том же стиле, и diff читается в кадре.
- Тестов на фильтр по категории на baseline нет: их пишет агент.
- Никаких снапшотов и моков, только явные `assert.deepEqual` / `assert.equal`.

## Обвязка репозитория

**package.json**

```json
{
  "name": "gh600-agent-lab",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" },
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js",
    "test": "node --test"
  }
}
```

**CI (`.github/workflows/ci.yml`)**

- Триггеры: `push` в `main` и `pull_request`.
- Один job с именем `test`: `actions/checkout`, `actions/setup-node` с `node-version-file: .nvmrc`, `npm test`. Имя job не меняется, потому что в `06-guardrails` оно станет required status check.
- `permissions: contents: read`, без секретов.

**README.md** — коротко и для зала:

1. Что это: демо-репо к докладу про GH-600, приложение намеренно скучное.
2. Запуск: `npm start`, `npm test`.
3. Карта веток: таблица `00`–`06` с доменом экзамена и ссылкой на compare с предыдущей веткой.
4. Как воспроизвести демо у себя (fork, включить coding agent, взять issue из `demo/issues/`).

**demo/issues/** — три markdown-файла с готовыми текстами, чтобы дубли были одинаковыми:

| Файл | Клип | Суть |
| --- | --- | --- |
| `01-category-filter.md` | s010, s017 | Добавить `GET /products?category=` с тестами |
| `02-external-docs.md` | s012 | То же самое плюс «сверь формат с внешней документацией по ссылке» |
| `03-per-line-tax.md` | s022 | Считать налог по строкам в `app/billing/invoice.js` |

**Настройки GitHub на старте**

- Публичный репо, default branch `main`, на старте `main` = `00-baseline`.
- Issues и Actions включены, Copilot coding agent включён (нужен для прогона «как без настройки»).
- Rulesets, MCP-конфига и секретов нет.
- Второй аккаунт уже добавлен коллаборатором с правом `write`. Когда понадобится, он сразу готов стать code owner в `06-guardrails`.

## Чего на baseline нет намеренно

Каждый пункт появляется в своей демо-ветке. Если добавить его раньше, контраст «до/после» смажется.

| Чего нет | Появляется в |
| --- | --- |
| `AGENTS.md`, `.github/copilot-instructions.md`, `.github/agents/` | `01-architecture` |
| MCP-конфиг, `copilot-setup-steps.yml`, секреты `COPILOT_MCP_*` | `02-tools` |
| `docs/agent-notes.md` | `03-memory` |
| `eval/`, `.github/workflows/eval.yml` | `04-evaluation` |
| Роли агентов с разными `tools` | `05-orchestration` |
| `CODEOWNERS`, ruleset, required checks | `06-guardrails` |

Также не нужны: база данных, авторизация, Docker, фронтенд, TypeScript, линтер, Dependabot, фильтр по категории.

## Критерии приёмки

Baseline считается готовым, когда отмечены все пункты:

- [ ] `git clone` → `npm test` проходит на Node 22 без `npm install`
- [ ] `npm start` → `curl localhost:3000/products` возвращает 9 товаров
- [ ] `curl 'localhost:3000/products?category=books'` тоже возвращает 9 (фильтра нет)
- [ ] `POST /invoices` для кейса из теста даёт ожидаемые `tax` и `total`
- [ ] CI зелёный на `main`, job называется `test`
- [ ] В `package.json` нет `dependencies` и `devDependencies`
- [ ] В `.github/` только `workflows/ci.yml`
- [ ] `app/` ≤ 300 строк, каждый файл ≤ 80
- [ ] В `billing/` есть баннер FINANCE-CRITICAL
- [ ] Ветка `00-baseline` создана и совпадает с `main`, на ней стоит тег `v0-baseline`
- [ ] Пробный прогон: issue `01-category-filter` назначен на Copilot, агент открыл PR. Записано, сколько минут и кредитов ушло на один запуск

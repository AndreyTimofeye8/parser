## Парсер (тестовое задание)

### Описание

Парсер состоит из двух скриптов — **puppeteer** и **axios**. Первый скрипт позволяет сделать скриншот страницы товара и собрать данные о ценах, рейтинге и отзывах. Второй скрипт собирает информацию о группе товаров, включая название, ссылку на изображение, рейтинг, цены, количество отзывов и размер скидки.

### Порядок запуска скриптов

1. Склонируйте проект:
   ```bash
   git clone https://github.com/AndreyTimofeye8/parser.git
   ```
2. Установите необходимые зависимости:
   ```bash
   npm install
   ```

3. Запуск скриптов

- **puppeteer.js**

```bash
node puppeteer.js <ссылка на страницу с товаром> <регион>
```

Например:
```bash
node puppeteer.js https://www.vprok.ru/product/domik-v-derevne-dom-v-der-moloko-ster-3-2-950g--309202 "Санкт-Петербург и область"
```

В результате получим скриншот со страницей товара и файл product.txt с необходимыми данными

- **axios.js**

```bash
node axios.js <ссылка на страницу с группой товаров>
```

Например:
```bash
node axios.js https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory
```

В результате получим файл products-api.txt с данными товаров из группы

#### Автор

[Андрей Тимофеев](https://t.me/andreu_t)

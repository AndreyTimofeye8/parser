import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

const fetchProducts = async (categoryUrl) => {
  try {
    console.log('Запрос к категории товаров:', categoryUrl);

    const response = await axios.get(categoryUrl);
    console.log('HTML страница успешно загружена.');

    const $ = cheerio.load(response.data);
    console.log('HTML успешно преобразован в объект для парсинга.');

    const jsonDataString = $('script[type="application/json"]').first().html();
    if (!jsonDataString) {
      throw new Error('Не удалось найти JSON-данные на странице.');
    }
    console.log('JSON-данные найдены в скрипте.');

    const jsonData = JSON.parse(jsonDataString);
    console.log('JSON-данные успешно распарсены.');

    const products = jsonData.props.pageProps.initialStore.catalogPage.products;
    console.log(`Найдено ${products.length} товаров.`);

    const productDetails = products.map((product) => ({
      Название: product.name,
      'Ссылка на изображение': product.images[0]?.url,
      Рейтинг: product.rating,
      'Количество отзывов': product.reviews,
      Цена: product.price,
      'Цена до акции': product.oldPrice ? product.oldPrice : 'Нет цены',
      Скидка: product.discountPercent
        ? `${product.discountPercent}%`
        : 'Нет скидки',
    }));

    console.log('Данные о товарах успешно извлечены.');

    fs.writeFileSync(
      'products-api.txt',
      JSON.stringify(productDetails, null, 2)
    );
    console.log('Данные о товарах успешно сохранены в файл products-api.txt.');
  } catch (error) {
    console.error('Ошибка при получении данных:', error.message);
  }
};

const categoryUrl = process.argv[2];
if (!categoryUrl) {
  console.error('Не указан URL категории.');
  process.exit(1);
}

fetchProducts(categoryUrl);

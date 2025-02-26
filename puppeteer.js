import puppeteer from 'puppeteer';
import fs from 'fs';

const [, , productUrl, regionName] = process.argv;

if (!productUrl || !regionName) {
  console.error('Укажите URL товара и название региона.');
  process.exit(1);
}

(async () => {
  console.log('Запуск браузера...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Открытие страницы...');

    await page.goto(productUrl, { waitUntil: 'domcontentloaded' });

    await new Promise((r) => setTimeout(r, 1000));

    console.log('Поиск кнопки с текущим регионом...');

    await page.waitForSelector('.Region_region__6OUBn', { timeout: 10000 });

    console.log('Кликаем по текущему региону...');

    await page.evaluate(() => {
      const regionBtn = document.querySelector('.Region_region__6OUBn');

      if (regionBtn) regionBtn.click();
    });

    console.log('Ожидание модального окна выбора региона...');

    await page.waitForSelector('.UiRegionListBase_list__cH0fK', {
      timeout: 10000,
    });

    const regions = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll('.UiRegionListBase_list__cH0fK li')
      ).map((el) => el.textContent.trim());
    });

    console.log('Список регионов:', regions);

    const regionIndex = regions.findIndex((r) => r === regionName);

    if (regionIndex !== -1) {
      await page.evaluate((index) => {
        document
          .querySelectorAll('.UiRegionListBase_list__cH0fK li')
          [index].click();
      }, regionIndex);
      console.log(`Выбран регион: ${regionName}`);
    } else {
      console.error(`Регион "${regionName}" не найден!`);
      process.exit(1);
    }

    console.log('Ожидание загрузки страницы после выбора региона...');

    await new Promise((r) => setTimeout(r, 2000));

    await page.setViewport({ width: 2500, height: 75 });

    console.log('Закрываем всплывающее окно...');

    await page.evaluate(() => {
      const closeButton = document.querySelector('.Content_remove__qdwv0');

      if (closeButton) {
        closeButton.click();
      }
    });

    await new Promise((r) => setTimeout(r, 2000));

    console.log('Делаем скриншот...');

    await page.screenshot({ path: 'screenshot.jpg', fullPage: true });

    console.log('Скриншот получен!');

    await new Promise((r) => setTimeout(r, 2000));

    console.log('Получаем данные о товаре...');

    let priceNew = null;
    let priceOld = null;

    try {
      priceNew = await page.$eval(
        '.Price_price__QzA8L.Price_size_XL__MHvC1.Price_role_discount__l_tpE',
        (el) => el.textContent.trim()
      );
    } catch (e) {
      console.log(
        'Новая цена со скидкой не найдена, пытаемся найти обычную цену...'
      );

      try {
        priceNew = await page.$eval(
          '.Price_price__QzA8L.Price_size_XL__MHvC1.Price_role_regular__X6X4D',
          (el) => el.textContent.trim()
        );
      } catch (e) {
        console.log('Обычная новая цена не найдена');
      }
    }

    try {
      priceOld = await page.$eval(
        '.Price_price__QzA8L.Price_size_XS__ESEhJ.Price_role_old__r1uT1',
        (el) => el.textContent.trim()
      );
    } catch (e) {
      console.log('Старая цена не найдена');
    }
    const rating = await page.$eval('.ActionsRow_stars__EKt42', (el) =>
      el ? el.getAttribute('title') : null
    );
    const reviewCount = await page.$eval('.ActionsRow_reviews__AfSj_', (el) =>
      el ? el.textContent : null
    );

    console.log('Новая цена:', priceNew || 'Не указана');
    console.log('Старая цена:', priceOld || 'Не указана');
    console.log('Рейтинг:', rating);
    console.log('Отзывы:', reviewCount);

    const priceNewValue = priceNew
      ? parseFloat(priceNew.replace(/[^\d,]/g, '').replace(',', '.'))
      : null;
    const priceOldValue = priceOld
      ? parseFloat(priceOld.replace(/[^\d,]/g, '').replace(',', '.'))
      : null;
    const ratingValue = rating ? rating.match(/Оценка:\s([0-9.]+)/)?.[1] : null;
    const reviewCountValue = reviewCount
      ? reviewCount.match(/(\d+)\s?отзыва?/)?.[1]
      : null;

    console.log('Записываем данные о товаре в файл...');

    await new Promise((r) => setTimeout(r, 2000));

    const productInfo = `price=${priceNewValue}\npriceOld=${priceOldValue}\nrating=${ratingValue}\nreviewCount=${reviewCountValue}`;

    fs.writeFileSync('product.txt', productInfo);

    await new Promise((r) => setTimeout(r, 2000));

    console.log('Данные успешно записаны.');

    console.log('Готово!');
  } catch (error) {
    console.error('Ошибка:', error.message);
  } finally {
    console.log('Закрываем браузер...');
    await browser.close();
  }
})();

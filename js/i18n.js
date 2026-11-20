// PL is the default language, UA is available via the switch.
export const dict = {
    pl: {
        brand_main: 'WSPÓLNE DOMY',
        brand_sub: 'СПІЛЬНІ ДОМІВКИ',
        title: 'Pokaż banana do kamery',
        detector: 'Detektor dojrzałości banana',
        event: 'Familijne warsztaty „Miasto wspólne”',
        'Стиглий': 'Dojrzały',
        'Нестиглий': 'Niedojrzały',
        'Перестиглий': 'Przejrzały',
    },
    uk: {
        brand_main: 'СПІЛЬНІ ДОМІВКИ',
        brand_sub: 'WSPÓLNE DOMY',
        title: 'Піднесіть банан до камери',
        detector: 'Детектор стиглості банану',
        event: 'Сімейні майстер-класи «Спільне місто»',
        'Стиглий': 'Стиглий',
        'Нестиглий': 'Нестиглий',
        'Перестиглий': 'Перестиглий',
    },
};

let lang = 'pl';
try { lang = localStorage.getItem('lang') || 'pl'; } catch (e) {}
if (!dict[lang]) lang = 'pl';
const listeners = [];

export const t = (key) => dict[lang][key] ?? key;
export const onLangChange = (fn) => listeners.push(fn);

function apply() {
    document.documentElement.lang = lang === 'uk' ? 'uk' : 'pl';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('#lang-switch button').forEach((b) => {
        b.classList.toggle('active', b.dataset.lang === lang);
    });
    listeners.forEach((fn) => fn());
}

export function initI18n() {
    document.querySelectorAll('#lang-switch button').forEach((b) => {
        b.addEventListener('click', () => {
            lang = b.dataset.lang;
            try { localStorage.setItem('lang', lang); } catch (e) {}
            apply();
        });
    });
    apply();
}

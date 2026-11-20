import { t, onLangChange } from './i18n.js';

let labels = [];
let bars = {};

// Colour stops per class (RGB). Colour moves from `from` to `to` as probability goes 0 -> 1.
const palette = {
    // ripe: green-yellow -> strong yellow
    'Стиглий':      { from: [190, 205, 40],  to: [255, 214, 0],  light: '#FFF9D6' },
    // unripe: light yellow -> strong green
    'Нестиглий':    { from: [236, 232, 120], to: [20, 150, 50],  light: '#E6F5E6' },
    // overripe: brown -> black
    'Перестиглий':  { from: [140, 90, 40],   to: [10, 8, 6],     light: '#EFE4DA' },
};
const fallback = { from: [150, 150, 150], to: [40, 40, 40], light: '#eee' };

const mix = (a, b, p) => a.map((v, i) => Math.round(v + (b[i] - v) * p));
const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

export async function setupBarGraph(URL) {
    const response = await fetch(`${URL}metadata.json`);
    const json = await response.json();
    labels = json.labels;
    labels.forEach((label) => makeBar(label));
    onLangChange(() => labels.forEach((l) => { bars[l].label.innerText = t(l); }));
}

function makeBar(label) {
    const graphWrapper = document.getElementById('graph-wrapper');
    const row = document.createElement('div');
    row.className = 'bar-row';

    const labelEl = document.createElement('span');
    labelEl.className = 'bar-label';
    labelEl.innerText = t(label);

    const track = document.createElement('div');
    track.className = 'bar-track';
    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    track.appendChild(fill);

    const percentEl = document.createElement('span');
    percentEl.className = 'bar-percent';
    percentEl.innerText = '0%';

    row.append(labelEl, track, percentEl);
    graphWrapper.appendChild(row);

    const p = palette[label] || fallback;
    track.style.setProperty('--track', p.light);

    // current (smoothed) value is animated towards the target every frame
    bars[label] = { row, fill, percent: percentEl, label: labelEl, pal: p, shown: 0, target: 0, raf: null };
}

function animate(b) {
    if (b.raf) return;
    const step = () => {
        b.shown += (b.target - b.shown) * 0.18;
        if (Math.abs(b.target - b.shown) < 0.0005) b.shown = b.target;
        const v = b.shown;
        const pct = Math.round(v * 100);
        b.fill.style.width = `${v * 100}%`;
        b.fill.style.background =
            `linear-gradient(90deg, ${rgb(b.pal.from)}, ${rgb(mix(b.pal.from, b.pal.to, Math.min(1, v * 1.15)))})`;
        b.percent.innerText = `${pct}%`;
        b.percent.style.color = rgb(mix(b.pal.from, b.pal.to, v));
        b.percent.style.transform = `scale(${1 + v * 0.25})`;
        b.row.classList.toggle('leading', v > 0.5);
        b.raf = b.shown === b.target ? null : requestAnimationFrame(step);
    };
    b.raf = requestAnimationFrame(step);
}

export function updateBarGraph(data) {
    data.forEach(({ className, probability }) => {
        const b = bars[className];
        if (!b) return;
        b.target = probability;
        animate(b);

        if (className === 'Перестиглий' && probability >= 0.999) {
            new Audio('./sound/Bruh.mp3').play();
        }
        if (className === 'Стиглий' && probability >= 0.999) {
            new Audio('./sound/Anime_wow_sound_effect.mp3').play();
        }
    });
}

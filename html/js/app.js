const RES = (typeof GetParentResourceName === 'function') ? GetParentResourceName() : 'cl-map';

const SVG = {
    up:        '<svg viewBox="0 0 24 24"><path d="M12 5l7 8H5z"/></svg>',
    down:      '<svg viewBox="0 0 24 24"><path d="M12 19l-7-8h14z"/></svg>',
    updown:    '<svg viewBox="0 0 24 24"><path d="M12 3l5 6H7zM12 21l-5-6h10z"/></svg>',
    leftright: '<svg viewBox="0 0 24 24"><path d="M3 12l6-5v10zM21 12l-6 5V7z"/></svg>',
    left:      '<svg viewBox="0 0 24 24"><path d="M5 12l8-7v14z"/></svg>',
    right:     '<svg viewBox="0 0 24 24"><path d="M19 12l-8 7V5z"/></svg>',
    enter:     '<svg viewBox="0 0 24 24"><path d="M19 4v8H7.8l3.6-3.6L10 7l-6 6 6 6 1.4-1.4L7.8 14H21V4z"/></svg>',
    mouse:     '<svg viewBox="0 0 20 26"><path d="M10 1C5.6 1 2 4.6 2 9v8c0 4.4 3.6 8 8 8s8-3.6 8-8V9c0-4.4-3.6-8-8-8zm-1 3.2V11H4V9c0-2.6 1.7-4.6 5-4.8zM16 11h-5V4.2c3.3.2 5 2.2 5 4.8v2zM4 17v-4h12v4c0 3.3-2.7 6-6 6s-6-2.7-6-6z"/></svg>',
    dpad:      '<svg viewBox="0 0 24 24"><path d="M9 2h6v6h6v6h-6v6H9v-6H3V8h6z"/><circle cx="12" cy="12" r="1.6" fill="#0b0f14"/></svg>',
    chevL:     '<svg viewBox="0 0 24 24"><path d="M15.4 4.6L8 12l7.4 7.4 1.4-1.4-6-6 6-6z"/></svg>',
    chevR:     '<svg viewBox="0 0 24 24"><path d="M8.6 4.6L16 12l-7.4 7.4-1.4-1.4 6-6-6-6z"/></svg>',
    check:     '<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    arrow:     '<svg viewBox="0 0 24 24"><path d="M12 2l8 20-8-5-8 5z"/></svg>',
    lock:      '<svg viewBox="0 0 24 24"><path d="M17 9V7a5 5 0 0 0-10 0v2H5v13h14V9h-2zM9 7a3 3 0 0 1 6 0v2H9V7z"/></svg>',
};

const BUTTON_CODES = {
    1000: { text: 'LMB', mouse: true },
    1001: { text: 'RMB', mouse: true },
    1002: { text: 'MMB', mouse: true },
    1003: { text: 'M4', mouse: true },
    1004: { text: 'M5', mouse: true },
    1005: { text: 'M6', mouse: true },
    1006: { text: 'M7', mouse: true },
    1007: { text: 'M8', mouse: true },
    1008: { text: 'WHEEL ▲', mouse: true },
    1009: { text: 'WHEEL ▼', mouse: true },
    1010: { text: 'WHEEL ◀', mouse: true },
    1011: { text: 'WHEEL ▶', mouse: true },
    1012: { text: 'MOUSE ▲', mouse: true },
    1013: { text: 'MOUSE ▼', mouse: true },
    1014: { text: 'MOUSE ◀', mouse: true },
    1015: { text: 'MOUSE ▶', mouse: true },

    100: { text: 'LMB', mouse: true },
    101: { text: 'RMB', mouse: true },
    102: { text: 'MMB', mouse: true },
    103: { text: 'M4', mouse: true },
    104: { text: 'M5', mouse: true },
    105: { text: 'WHEEL ▲', mouse: true },
    106: { text: 'WHEEL ▼', mouse: true },

    0:  { text: 'A' },
    1:  { text: 'B' },
    2:  { text: 'X' },
    3:  { text: 'Y' },
    4:  { text: 'LB' },
    5:  { text: 'RB' },
    6:  { text: 'LT' },
    7:  { text: 'RT' },
    8:  { text: 'LS' },
    9:  { text: 'RS' },
    10: { text: 'BACK' },
    11: { text: 'START' },
    12: { text: 'DPAD' },
    13: { text: 'D▲' },
    14: { text: 'D▼' },
    15: { text: 'D◀' },
    16: { text: 'D▶' },
};

const PAD = {
    up: 'D▲',
    down: 'D▼',
    updown: 'D▲▼',
    leftright: 'D◀▶',
    accept: 'A',
    cancel: 'B',
    x: 'X',
    y: 'Y',
    lb: 'LB',
    rb: 'RB',
    lt: 'LT',
    rt: 'RT',
};

function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}

const App = {
    open: false,
    screen: 'map',
    device: 'keyboard',
    screens: {},
    strings: {},
    settings: {},
    data: null,

    post(name, body) {
        return fetch(`https://${RES}/${name}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(body || {}),
        }).then(r => r.json()).catch(() => null);
    },

    sfx(name) {
        if (App.settings.menu_sounds === false) return;
        App.post('sound', { name });
    },

    str(key, fallback) {
        const v = App.strings[key];
        return (v === undefined || v === null) ? (fallback !== undefined ? fallback : key) : v;
    },

    el(id) {
        return document.getElementById(id);
    },

    init(data) {
        App.data = data;
        App.strings = data.strings || {};
        App.settings = Array.isArray(data.values) ? {} : (data.values || {});
        App.setDevice(data.device || 'keyboard');

        document.querySelectorAll('[data-str]').forEach(el => {
            el.textContent = App.str(el.dataset.str, el.textContent);
        });

        const mapSearch = App.el('map-search');
        if (mapSearch) {
            mapSearch.placeholder = App.str('search', 'Search...');
        }

        App.applyUiSettings();

        const appEl = App.el('app');
        if (appEl) {
            appEl.classList.toggle('debug', !!data.debug);
        }

        for (const id in App.screens) {
            if (App.screens[id].init) {
                App.screens[id].init(data);
            }
        }
    },

    applyUiSettings() {
        const theme = App.data?.appearance || {};
        const rgb = (value, fallback) => {
            const hex = /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
            return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(',');
        };
        const opacity = (value, fallback) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;

        const root = App.el('app');
        if (!root) return;

        root.classList.toggle('blue-effect', theme.blueEffect !== false);
        root.style.setProperty('--blue-rgb', rgb(theme.blueColor, '#086A9C'));
        root.style.setProperty('--blue-opacity', opacity(theme.blueOpacity, 0.38));
        root.style.setProperty('--panel-rgb', rgb(theme.panelColor, '#093C57'));
        root.style.setProperty('--panel-opacity', opacity(theme.panelOpacity, 0.70));
        root.style.setProperty('--cyan', /^#[0-9a-f]{6}$/i.test(theme.accentColor) ? theme.accentColor : '#74E4F0');

        root.classList.toggle('no-scanlines', App.settings.menu_scanlines === false);

        const hints = App.el('hints');
        if (hints) {
            hints.classList.toggle('hidden-hints', App.settings.menu_hints === false);
        }
    },

    show(screenId, payload) {
        screenId = screenId || 'map';
        if (!App.open) {
            App.open = true;
            App.el('app').classList.remove('hidden');
        }
        App.screen = screenId;

        document.querySelectorAll('.screen').forEach(s => {
            s.classList.toggle('active', s.id === 'screen-' + screenId);
        });

        const s = App.screens[screenId];
        if (s && s.enter) {
            s.enter(payload || {});
        }
        App.refreshHints();
    },

    hide() {
        if (!App.open) return;
        const s = App.screens[App.screen];
        if (s && s.leave) {
            s.leave();
        }
        App.open = false;
        App.screen = null;
        App.el('app').classList.add('hidden');
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));

        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }
    },

    close() {
        App.post('close');
    },

    back() {
        App.close();
    },

    setDevice(device) {
        App.device = device === 'gamepad' ? 'gamepad' : 'keyboard';
        App.refreshHints();
    },

    route(action, raw) {
        if (!App.open) return;
        const s = App.screens[App.screen];
        if (s && s.input) {
            s.input(action, raw);
        }
    },

    refreshHints() {
        if (!App.open) return;
        const s = App.screens[App.screen];
        let list = [];
        if (s && s.hints) {
            list = s.hints();
        }
        App.renderHints(list, s && s.centerHints);
    },

    renderHints(list, center) {
        const box = App.el('hints');
        if (!box) return;

        box.classList.toggle('center', !!center);
        box.innerHTML = '';

        list.forEach((h, i) => {
            if (i > 0) {
                const sep = document.createElement('span');
                sep.className = 'hint-sep';
                sep.textContent = '/';
                box.appendChild(sep);
            }
            const el = document.createElement('div');
            el.className = 'hint';

            const keys = document.createElement('span');
            keys.className = 'keys';

            const ks = App.device === 'gamepad' ? (h.pad || h.keys) : h.keys;
            ks.forEach((k, j) => {
                if (j > 0) {
                    const p = document.createElement('span');
                    p.className = 'plus';
                    p.textContent = h.join || '+';
                    keys.appendChild(p);
                }
                keys.appendChild(App.chip(k));
            });

            const lbl = document.createElement('span');
            lbl.className = 'lbl';
            lbl.textContent = h.label;

            el.appendChild(keys);
            el.appendChild(lbl);
            box.appendChild(el);
        });
    },

    chip(k) {
        const span = document.createElement('span');
        span.className = 'key';

        if (typeof k === 'string') {
            if (App.device === 'gamepad' && PAD[k]) {
                span.textContent = PAD[k];
                return span;
            }
            if (SVG[k]) {
                span.classList.add('icon');
                span.innerHTML = SVG[k];
                return span;
            }
            span.textContent = k;
            if (k.length > 2) span.classList.add('wide');
            return span;
        }

        if (k.type === 'none') {
            span.classList.add('none');
            span.textContent = App.str('unassigned', '—');
            return span;
        }

        if (k.type === 'button') {
            const info = BUTTON_CODES[k.code];
            if (info && info.mouse) {
                span.classList.add('mouse');
                span.innerHTML = SVG.mouse + '<b>' + info.text + '</b>';
                return span;
            }
            if (info) {
                span.textContent = info.text;
                return span;
            }
            if (typeof k.code === 'number' && k.code >= 1000) {
                span.classList.add('mouse');
                span.innerHTML = SVG.mouse + '<b>M' + (k.code - 999) + '</b>';
                return span;
            }
            span.textContent = 'B' + k.code;
            return span;
        }

        if (k.svg) {
            span.classList.add('icon');
            span.innerHTML = SVG[k.svg];
            return span;
        }

        if (k.mouse) {
            span.classList.add('mouse');
            span.innerHTML = SVG.mouse + '<b>' + k.mouse + '</b>';
            return span;
        }

        span.textContent = k.text || '';
        if ((k.text || '').length > 2) span.classList.add('wide');
        return span;
    },

    blipName(nameOrId) {
        if (!nameOrId && nameOrId !== 0) return 'radar_level';
        if (window.BLIP_NAMES && window.BLIP_NAMES[nameOrId]) {
            return window.BLIP_NAMES[nameOrId];
        }
        const num = Number(nameOrId);
        if (!isNaN(num) && window.BLIP_NAMES && window.BLIP_NAMES[num]) {
            return window.BLIP_NAMES[num];
        }
        return nameOrId || 'radar_level';
    },

    blipSrc(nameOrId) {
        let name = App.blipName(nameOrId);
        if (window.BLIP_PLACEHOLDERS?.has(name)) {
            name = name.includes('shield') ? 'radar_police_station' : 'radar_poi';
        }
        return `img/blips/${name}.png`;
    },

    blipUrl(nameOrId) {
        return `url('${App.blipSrc(nameOrId)}')`;
    },

    getBlipFilterId(c) {
        if (!c) c = [255, 255, 255];
        const r = c[0] !== undefined ? c[0] : (c.r !== undefined ? c.r : 255);
        const g = c[1] !== undefined ? c[1] : (c.g !== undefined ? c.g : 255);
        const b = c[2] !== undefined ? c[2] : (c.b !== undefined ? c.b : 255);
        const id = `blip-tint-${r}-${g}-${b}`;
        const defs = document.getElementById('blip-filters');
        if (defs && !document.getElementById(id)) {
            const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
            filter.id = id;
            filter.setAttribute('color-interpolation-filters', 'sRGB');
            const matrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
            matrix.setAttribute('type', 'matrix');
            matrix.setAttribute('values', `${(r / 255).toFixed(3)} 0 0 0 0  0 ${(g / 255).toFixed(3)} 0 0 0  0 0 ${(b / 255).toFixed(3)} 0 0  0 0 0 1 0`);
            filter.appendChild(matrix);
            defs.appendChild(filter);
        }
        return id;
    },

    maskAttr(nameOrId) {
        const u = App.blipUrl(nameOrId);
        return `-webkit-mask-image:${u};mask-image:${u};`;
    },

    setMask(el, nameOrId) {
        const u = App.blipUrl(nameOrId);
        el.style.webkitMaskImage = u;
        el.style.maskImage = u;
    },

    prettySprite(id) {
        const name = window.BLIP_NAMES ? window.BLIP_NAMES[id] : null;
        if (!name) return 'Location';
        return name.replace(/^radar_/, '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    },

    setInputFocus(focused) {
        App.post('inputFocus', { focused: !!focused });
    },

    scrollIntoView(el, container) {
        if (!el || !container) return;
        const top = el.offsetTop - container.offsetTop;
        const bottom = top + el.offsetHeight;
        if (top < container.scrollTop) {
            container.scrollTop = top - 8;
        } else if (bottom > container.scrollTop + container.clientHeight) {
            container.scrollTop = bottom - container.clientHeight + 8;
        }
    },
};

const KEY_ACTIONS = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    Enter: 'accept',
    NumpadEnter: 'accept',
    Escape: 'cancel',
    Backspace: 'cancel',
    PageUp: 'rt',
    PageDown: 'lt',
    KeyQ: 'lb',
    KeyE: 'rb',
    KeyT: 'y',
    KeyX: 'x',
    KeyM: 'm',
    Delete: 'delete',
    Tab: 'tab',
    Space: 'accept',
};

const TEXT_PASS = new Set(['Escape', 'ArrowUp', 'ArrowDown', 'Enter', 'NumpadEnter', 'PageUp', 'PageDown', 'Tab']);
const KEY_FALLBACK = { q: 'lb', e: 'rb', t: 'y', x: 'x', m: 'm', ' ': 'accept' };

document.addEventListener('keydown', (e) => {
    if (!App.open) return;
    const code = e.code || '';
    const inText = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
    if (inText && !TEXT_PASS.has(code) && !TEXT_PASS.has(e.key)) return;

    const action = KEY_ACTIONS[code] || KEY_ACTIONS[e.key] || (!inText ? KEY_FALLBACK[(e.key || '').toLowerCase()] : null);
    if (!action) return;

    e.preventDefault();
    if (inText && action === 'cancel') {
        e.target.blur();
        return;
    }
    App.route(action, e.code);
});

document.addEventListener('focusin', (e) => {
    if (e.target && e.target.tagName === 'INPUT') App.setInputFocus(true);
});

document.addEventListener('focusout', (e) => {
    if (e.target && e.target.tagName === 'INPUT') App.setInputFocus(false);
});

window.addEventListener('message', ({ data: m }) => {
    if (!m || !m.action) return;
    switch (m.action) {
        case 'open':
            App.init(m.data);
            App.show(m.screen || 'map', {}, false);
            break;
        case 'close':
            App.hide();
            break;
        case 'device':
            App.setDevice(m.device);
            break;
        case 'input':
            App.route(m.key, 'pad');
            break;
        case 'pan':
            if (App.open && App.screens.map && App.screens.map.pan) {
                App.screens.map.pan(m.x, m.y);
            }
            break;
        case 'mapData':
            if (App.screens.map && App.screens.map.setData) {
                App.screens.map.setData(m);
            }
            break;
        case 'mapPlayer':
            if (App.screens.map && App.screens.map.setPlayer) {
                App.screens.map.setPlayer(m);
            }
            break;
    }
});

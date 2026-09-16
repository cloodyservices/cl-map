App.screens.map = {
    centerHints: true,
    map: null,
    layers: {},
    style: 'atlas',
    dark: false,
    cfg: null,
    entries: [],
    rows: [],
    sel: 0,
    markers: {},
    youMarker: null,
    wpMarker: null,
    player: null,
    waypoint: null,
    night: false,
    filter: '',
    hoverTimer: 0,
    hovering: false,
    hoverInfo: null,
    initialised: false,

    init(data) {
        this.cfg = data.map || {};
        const search = App.el('map-search');
        search.value = '';
        search.oninput = () => { this.filter = search.value; this.sel = 0; this.renderList(); };
        if (!this.map) this.createMap();
    },

    createMap() {
        const t = this.cfg.transform || [0.01423702, 58.85859, -0.01424839, 119.4973];
        const CRS = L.extend({}, L.CRS.Simple, {
            projection: L.Projection.LonLat,
            scale: z => Math.pow(2, z),
            zoom: s => Math.log(s) / Math.LN2,
            distance: (a, b) => Math.hypot(b.lng - a.lng, b.lat - a.lat),
            transformation: new L.Transformation(t[0], t[1], t[2], t[3]),
            infinite: true,
        });
        this.zoomOffset = Math.log2(window.innerHeight / 1080);
        const minZoom = (Number(this.cfg.minZoom) || 3.25) + this.zoomOffset;
        const maxZoom = (this.cfg.maxZoom || 7) + this.zoomOffset;
        this.map = L.map('map', {
            crs: CRS,
            minZoom, maxZoom,
            zoomControl: false, attributionControl: false,
            zoomSnap: 0.25, zoomDelta: 0.5, wheelPxPerZoomLevel: 80,
            doubleClickZoom: false, keyboard: false,
            inertia: true, inertiaDeceleration: 2500,
            maxBounds: L.latLngBounds([-5000, -4200], [8400, 4700]), maxBoundsViscosity: 1.0,
            fadeAnimation: false, zoomAnimation: true, markerZoomAnimation: true,
        });
        const tiles = this.cfg.tiles || {};
        const bounds = L.latLngBounds([-5200, -4135], [8371, 4600]);
        const opts = { tileSize: 256, minNativeZoom: 0, maxNativeZoom: this.cfg.maxZoom || 7, noWrap: true, bounds, keepBuffer: 3, updateWhenZooming: false, errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' };
        this.layers.atlas = L.tileLayer(tiles.atlas || '', opts);
        this.layers.dark = L.tileLayer(tiles.dark || tiles.atlas || '', opts);
        this.layers.satellite = L.tileLayer(tiles.satellite || tiles.atlas || '', opts);
        this.layers.atlas.addTo(this.map);
        this.activeLayer = 'atlas';

        const updateBlipScale = () => {
            const z = this.map.getZoom() - this.zoomOffset;
            const scale = Math.max(0.55, Math.min(1.2, 0.55 + (z - 3.25) * 0.16));
            const mapEl = document.getElementById('map');
            if (mapEl) mapEl.style.setProperty('--blip-scale', scale.toFixed(2));
        };
        this.map.on('zoom', updateBlipScale);
        updateBlipScale();

        this.map.on('click', (e) => this.onMapClick(e));
        this.map.on('mousemove', (e) => this.onMouseMove(e));
        this.map.getContainer().addEventListener('mouseleave', () => { this.hovering = false; this.hoverInfo = null; this.renderZone(); });
        this.map.setView(this.toLL(0, 0), 4 + this.zoomOffset);
        window.addEventListener('resize', () => {
            const next = Math.log2(window.innerHeight / 1080);
            const zoom = this.map.getZoom() + next - this.zoomOffset;
            this.zoomOffset = next;
            this.map.setMinZoom((Number(this.cfg.minZoom) || 3.25) + next);
            this.map.setMaxZoom((this.cfg.maxZoom || 7) + next);
            this.map.setZoom(zoom, { animate: false });
        });
        this.initialised = true;
    },

    toLL(x, y) { return L.latLng(y, x); },

    applyTheme() {
        const theme = App.settings.map_theme || 'auto';
        const style = App.settings.map_style || 'atlas';
        const dark = theme === 'dark' || (theme === 'auto' && this.night);
        this.dark = dark; this.style = style;
        const screen = App.el('screen-map');
        screen.classList.toggle('dark', dark);
        screen.classList.toggle('satellite', style === 'satellite');
        let layer = style === 'satellite' ? 'satellite' : (dark ? 'dark' : 'atlas');
        if (layer !== this.activeLayer) {
            this.map.removeLayer(this.layers[this.activeLayer]);
            this.layers[layer].addTo(this.map);
            this.activeLayer = layer;
        }
    },

    enter(payload) {
        this.applyTheme();
        setTimeout(() => { if (this.map) this.map.invalidateSize(false); }, 30);
        if (!payload.back) {
            const z = (Number(App.settings.map_zoom) || 4) + this.zoomOffset;
            if (this.player) this.map.setView(this.toLL(this.player.x, this.player.y), z, { animate: false });
            else this.map.setZoom(z, { animate: false });
            this.sel = 0;
        }
        App.el('map-search').value = this.filter = '';
        this.renderList();
        this.renderZone();
    },

    leave() {
        App.el('map-search').blur();
    },

    hints() {
        return [
            { keys: [{ svg: 'mouse' }], pad: ['accept'], label: App.str('set_waypoint', 'Set Waypoint') },
            { keys: ['up'], pad: ['lb'], label: App.str('prev_blip', 'Prev Blip') },
            { keys: ['down'], pad: ['rb'], label: App.str('next_blip', 'Next Blip') },
            { keys: ['leftright'], pad: ['x'], label: App.str('cycle_blip', 'Cycle Blip') },
            { keys: ['PGUP', 'PGDN'], pad: ['rt'], label: App.str('zoom', 'Zoom') },
            { keys: ['T'], pad: ['y'], label: App.str('toggle_blip', 'Toggle Blip') },
            { keys: ['M', 'ESC'], pad: ['cancel'], join: '/', label: App.str('exit', 'Exit') },
        ];
    },

    setData(m) {
        if (!this.cfg) return;
        this.entries = (m.entries || []).map(e => ({
            ...e,
            name: e.name || App.prettySprite(e.sprite),
            idx: 0,
            hidden: !!e.hidden,
            points: e.points || [],
        }));
        this.waypoint = m.waypoint || null;
        this.night = !!m.night;
        if (m.player) this.player = m.player;
        if (!this.map) this.createMap();
        this.applyTheme();
        this.renderMarkers();
        this.renderYou();
        this.renderWaypoint();
        this.renderList();
        this.renderZone();
        if (this.player && !this._centered) {
            this._centered = true;
            this.map.setView(this.toLL(this.player.x, this.player.y), (Number(App.settings.map_zoom) || 4) + this.zoomOffset, { animate: false });
        }
    },

    setPlayer(m) {
        if (!this.cfg) return;
        this.player = m.player || this.player;
        const wp = m.waypoint || null;
        const changed = JSON.stringify(wp) !== JSON.stringify(this.waypoint);
        this.waypoint = wp;
        if (m.night !== undefined && m.night !== this.night) { this.night = !!m.night; if (this.map) this.applyTheme(); }
        if (!this.map) return;
        this.renderYou();
        if (changed) this.renderWaypoint();
        if (!this.hovering) this.renderZone();
    },

    markerIcon(entry, focus) {
        const c = entry.color || [255, 255, 255];
        const filterId = App.getBlipFilterId(c);
        const src = App.blipSrc(entry.sprite);
        return L.divIcon({
            className: 'blip-icon-wrap',
            html: `<div class="blip-marker${entry.hidden ? ' dim' : ''}${focus ? ' focus' : ''}" style="--c:rgb(${c[0]},${c[1]},${c[2]})"><img class="ic" src="${src}" style="filter:url(#${filterId})"></div>`,
            iconSize: [32, 32], iconAnchor: [16, 16],
        });
    },

    renderMarkers() {
        for (const k in this.markers) this.markers[k].forEach(mk => this.map.removeLayer(mk));
        this.markers = {};
        this.entries.forEach(entry => {
            const list = [];
            entry.points.forEach((p, i) => {
                const mk = L.marker(this.toLL(p.x, p.y), { icon: this.markerIcon(entry, false), riseOnHover: true });
                mk.on('click', (e) => { L.DomEvent.stopPropagation(e); this.selectEntry(entry, i, false); this.setWaypoint(p.x, p.y); });
                if (!entry.hidden) mk.addTo(this.map);
                list.push(mk);
            });
            this.markers[entry.key] = list;
        });
        this.refreshFocus();
    },

    refreshFocus() {
        const row = this.rows[this.sel];
        this.entries.forEach(entry => {
            const list = this.markers[entry.key] || [];
            list.forEach((mk, i) => {
                const focus = row && row.kind === 'entry' && row.entry === entry && entry.idx === i;
                mk.setIcon(this.markerIcon(entry, focus));
                if (focus) mk.setZIndexOffset(500); else mk.setZIndexOffset(0);
            });
        });
    },

    renderYou() {
        if (!this.player) return;
        const ll = this.toLL(this.player.x, this.player.y);
        if (!this.youMarker) {
            this.youMarker = L.marker(ll, {
                icon: L.divIcon({ className: 'you-icon', html: `<div class="you-marker"><div style="--h:0deg" class="arr">${SVG.arrow}</div></div>`, iconSize: [44, 44], iconAnchor: [22, 22] }),
                interactive: true, zIndexOffset: 1000,
            }).addTo(this.map);
            this.youMarker.on('click', (e) => { L.DomEvent.stopPropagation(e); this.sel = 0; this.renderList(); this.panTo(this.player.x, this.player.y); });
        } else {
            this.youMarker.setLatLng(ll);
        }
        const el = this.youMarker.getElement();
        if (el) { const svg = el.querySelector('svg'); if (svg) svg.style.setProperty('--h', `${-(this.player.heading || 0)}deg`); }
    },

    renderWaypoint() {
        if (this.wpMarker) { this.map.removeLayer(this.wpMarker); this.wpMarker = null; }
        if (!this.waypoint) return;
        this.wpMarker = L.marker(this.toLL(this.waypoint.x, this.waypoint.y), {
            icon: L.divIcon({ className: 'wp-icon', html: '<div class="wp-marker"><div class="ic"></div></div>', iconSize: [36, 36], iconAnchor: [18, 18] }),
            zIndexOffset: 900,
        }).addTo(this.map);
        this.wpMarker.on('click', (e) => { L.DomEvent.stopPropagation(e); this.removeWaypoint(); });
    },

    selectRow(index) {
        if (this.sel === index) return;
        this.sel = index;
        this.rows.forEach((row, i) => row.el?.classList.toggle('selected', i === index));
        this.refreshFocus();
    },

    renderList() {
        const box = App.el('map-list');
        box.innerHTML = '';
        const q = this.filter.trim().toLowerCase();
        this.rows = [];

        const you = document.createElement('div');
        you.className = 'map-you' + (this.sel === 0 ? ' selected' : '');
        you.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 3l7 18-7-4-7 4z"/></svg><span>${escapeHtml(App.str('you', 'You'))}</span>`;
        you.onmouseenter = () => this.selectRow(0);
        you.onclick = () => { this.sel = 0; this.renderList(); if (this.player) this.panTo(this.player.x, this.player.y); };
        box.appendChild(you);
        this.rows.push({ kind: 'you', el: you });

        const order = this.cfg.categories || [];
        const cats = {};
        this.entries.forEach(e => {
            if (q && !(e.name.toLowerCase().includes(q) || (e.category || '').toLowerCase().includes(q))) return;
            (cats[e.category || 'Locations'] = cats[e.category || 'Locations'] || []).push(e);
        });
        const catNames = Object.keys(cats).sort((a, b) => {
            const ia = order.indexOf(a), ib = order.indexOf(b);
            return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.localeCompare(b);
        });
        catNames.forEach(cat => {
            const h = document.createElement('div'); h.className = 'map-cat'; h.textContent = cat;
            box.appendChild(h);
            cats[cat].sort((a, b) => a.name.localeCompare(b.name)).forEach(entry => {
                const i = this.rows.length;
                const c = entry.color || [255, 255, 255];
                const r = c[0] !== undefined ? c[0] : (c.r !== undefined ? c.r : 255);
                const g = c[1] !== undefined ? c[1] : (c.g !== undefined ? c.g : 255);
                const b = c[2] !== undefined ? c[2] : (c.b !== undefined ? c.b : 255);
                const el = document.createElement('div');
                el.className = 'map-row' + (i === this.sel ? ' selected' : '') + (entry.hidden ? ' off' : '');
                el.style.setProperty('--rowc', `rgb(${r},${g},${b})`);
                const ico = document.createElement('div'); ico.className = 'ico';
                const filterId = App.getBlipFilterId(c);
                const src = App.blipSrc(entry.sprite);
                const img = document.createElement('img');
                img.src = src;
                img.alt = '';
                img.style.filter = `url(#${filterId})`;
                ico.appendChild(img);
                const name = document.createElement('div'); name.className = 'name'; name.textContent = entry.name;
                el.appendChild(ico); el.appendChild(name);
                if (entry.points.length > 1) {
                    const pg = document.createElement('div'); pg.className = 'pager';
                    const l = document.createElement('i'); l.innerHTML = SVG.chevL;
                    const r = document.createElement('i'); r.innerHTML = SVG.chevR;
                    const s = document.createElement('span'); s.textContent = `${entry.idx + 1}/${entry.points.length}`;
                    l.onclick = (e) => { e.stopPropagation(); this.selectEntry(entry, (entry.idx - 1 + entry.points.length) % entry.points.length, true); };
                    r.onclick = (e) => { e.stopPropagation(); this.selectEntry(entry, (entry.idx + 1) % entry.points.length, true); };
                    pg.appendChild(l); pg.appendChild(s); pg.appendChild(r);
                    el.appendChild(pg);
                }
                const chk = document.createElement('div'); chk.className = 'check' + (entry.hidden ? '' : ' on'); chk.innerHTML = SVG.check;
                chk.onclick = (e) => { e.stopPropagation(); this.toggleEntry(entry); };
                el.appendChild(chk);
                el.onmouseenter = () => this.selectRow(i);
                el.onclick = () => { this.selectEntry(entry, entry.idx, true); };
                box.appendChild(el);
                this.rows.push({ kind: 'entry', entry, el });
            });
        });
        if (this.rows.length === 1 && q) {
            const e = document.createElement('div'); e.className = 'map-empty'; e.textContent = App.str('no_results', 'No results');
            box.appendChild(e);
        }
        if (this.sel >= this.rows.length) this.sel = 0;
        App.el('map-search-count').textContent = `${this.filter.length}/250`;
        const row = this.rows[this.sel];
        if (row && row.el) App.scrollIntoView(row.el, box);
        this.refreshFocus();
    },

    selectEntry(entry, idx, pan) {
        entry.idx = idx;
        const i = this.rows.findIndex(r => r.kind === 'entry' && r.entry === entry);
        if (i >= 0) this.sel = i;
        this.renderList();
        const p = entry.points[entry.idx];
        if (pan && p) this.panTo(p.x, p.y);
    },

    toggleEntry(entry) {
        entry.hidden = !entry.hidden;
        App.sfx('TOGGLE_ON');
        (this.markers[entry.key] || []).forEach(mk => { if (entry.hidden) this.map.removeLayer(mk); else mk.addTo(this.map); });
        App.post('mapToggle', { key: entry.key, hidden: entry.hidden });
        this.renderList();
    },

    panTo(x, y) {
        const ll = this.toLL(x, y);
        const z = Math.max(this.map.getZoom(), 5);
        this.map.flyTo(ll, z, { duration: 0.45 });
    },

    renderZone() {
        const info = (this.hovering && this.hoverInfo) ? this.hoverInfo : this.player;
        const z1 = App.el('map-zone-1'), z2 = App.el('map-zone-2'), z3 = App.el('map-zone-3');
        if (!info) { z1.textContent = ''; z2.textContent = ''; z3.textContent = ''; return; }
        z1.textContent = info.zone || '';
        z2.textContent = info.street ? (info.cross ? `${info.street} / ${info.cross}` : info.street) : '';
        if (App.data && App.data.debug) {
            const c = this.hovering && this.hoverInfo ? this.hoverInfo : this.player;
            z3.textContent = c && c.x !== undefined ? `x ${c.x.toFixed(1)}  y ${c.y.toFixed(1)}` : '';
        }
    },

    onMouseMove(e) {
        this.hovering = true;
        const x = e.latlng.lng, y = e.latlng.lat;
        this._hoverXY = { x, y };
        if (this.hoverTimer) return;
        this.hoverTimer = setTimeout(async () => {
            this.hoverTimer = 0;
            const xy = this._hoverXY;
            const r = await App.post('mapHover', xy);
            if (r && this.hovering) { this.hoverInfo = { ...r, x: xy.x, y: xy.y }; this.renderZone(); }
        }, 180);
    },

    onMapClick(e) {
        this.setWaypoint(e.latlng.lng, e.latlng.lat);
    },

    async setWaypoint(x, y) {
        App.sfx('SELECT');
        const wp = await App.post('mapWaypoint', { x, y });
        this.waypoint = wp && wp.x !== undefined ? wp : { x, y };
        this.renderWaypoint();
    },

    async removeWaypoint() {
        App.sfx('BACK');
        await App.post('mapRemoveWaypoint');
        this.waypoint = null;
        this.renderWaypoint();
    },

    pan(ax, ay) {
        if (!this.map) return;
        const speed = 18;
        this.map.panBy([ax * speed, ay * speed], { animate: false });
    },

    input(action, raw) {
        const inSearch = document.activeElement === App.el('map-search');
        const n = this.rows.length;
        const move = (d) => {
            if (!n) return;
            this.sel = (this.sel + d + n) % n;
            App.sfx('NAV_UP_DOWN');
            this.renderList();
            const row = this.rows[this.sel];
            if (row.kind === 'you' && this.player) this.panTo(this.player.x, this.player.y);
            else if (row.kind === 'entry') { const p = row.entry.points[row.entry.idx]; if (p) this.panTo(p.x, p.y); }
        };
        const cycle = (d) => {
            const row = this.rows[this.sel];
            if (!row || row.kind !== 'entry' || row.entry.points.length < 2) return;
            const e = row.entry;
            App.sfx('NAV_LEFT_RIGHT');
            this.selectEntry(e, (e.idx + d + e.points.length) % e.points.length, true);
        };
        switch (action) {
            case 'up': case 'lb': move(-1); break;
            case 'down': case 'rb': move(1); break;
            case 'left': if (!inSearch) cycle(-1); break;
            case 'right': if (!inSearch) cycle(1); break;
            case 'x': cycle(1); break;
            case 'rt': this.map.zoomIn(0.5); break;
            case 'lt': this.map.zoomOut(0.5); break;
            case 'y': {
                const row = this.rows[this.sel];
                if (row && row.kind === 'entry') this.toggleEntry(row.entry);
                break;
            }
            case 'accept': {
                if (inSearch) { App.el('map-search').blur(); }
                const row = this.rows[this.sel];
                if (row && row.kind === 'entry') { const p = row.entry.points[row.entry.idx]; if (p) this.setWaypoint(p.x, p.y); }
                else if (row && row.kind === 'you' && this.player) this.panTo(this.player.x, this.player.y);
                break;
            }
            case 'tab': App.el('map-search').focus(); break;
            case 'm':
                App.sfx('BACK');
                App.close();
                break;
            case 'cancel':
                App.back();
                break;
        }
    },
};

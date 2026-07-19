/*
 * hilver Atlas – Wix Custom Element
 * -------------------------------------------------
 * Bindet den hilver-Atlas als <hilver-atlas>-Element ein (kein sichtbarer
 * iFrame-Rahmen, passt die Höhe automatisch an).
 *
 * Wix: Hinzufügen ▸ Einbetten ▸ Benutzerdefiniertes Element
 *   - Server-URL / Quelle:  https://<dein-host>/hilver-atlas.js
 *   - Tag-Name:             hilver-atlas
 *
 * Attribute (optional, per Velo setzbar):
 *   daten-url   Live-CMS-Endpoint (Standard unten)
 *   atlas-url   URL der gehosteten atlas.html (Standard unten)
 */
(function () {
  var DEFAULT_ATLAS = 'https://rynqsvalt-dev.github.io/hilver-maps/atlas.html';
  var DEFAULT_DATEN = 'https://www.hilver.de/_functions/kommunen';

  if (customElements.get('hilver-atlas')) return;

  class HilverAtlas extends HTMLElement {
    static get observedAttributes() { return ['daten-url', 'atlas-url']; }

    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this.style.display = 'block';
      this.style.width = '100%';

      var frame = document.createElement('iframe');
      frame.setAttribute('title', 'hilver Atlas – Teilnehmende Kommunen');
      frame.setAttribute('loading', 'lazy');
      frame.setAttribute('allow', 'fullscreen; geolocation');
      frame.setAttribute('allowfullscreen', '');
      frame.style.cssText = 'width:100%;border:0;display:block;height:760px;transition:height .2s ease;';
      this._frame = frame;
      this.appendChild(frame);
      this._render();

      var self = this;
      this._onMsg = function (e) {
        var d = e.data;
        if (!d || e.source !== frame.contentWindow) return;
        if (d.type === 'hilver:height' && d.height) { if (!self._full) frame.style.height = d.height + 'px'; }
        else if (d.type === 'hilver:fullscreen') { self._setFull(!!d.on); }
        else if (d.type === 'hilver:reveal') { try { frame.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (x) { try { window.scrollTo(0, frame.getBoundingClientRect().top + window.pageYOffset - 8); } catch (y) {} } }
      };
      window.addEventListener('message', this._onMsg);
    }

    _setFull(on) {
      var f = this._frame; if (!f) return;
      this._full = on;
      if (on) {
        this._prevH = f.style.height;
        f.style.position = 'fixed'; f.style.left = '0'; f.style.top = '0'; f.style.right = '0'; f.style.bottom = '0';
        f.style.width = '100%'; f.style.height = '100vh'; f.style.zIndex = '2147483647';
        try { document.documentElement.style.overflow = 'hidden'; } catch (x) {}
      } else {
        f.style.position = ''; f.style.left = ''; f.style.top = ''; f.style.right = ''; f.style.bottom = '';
        f.style.zIndex = ''; f.style.width = '100%'; f.style.height = this._prevH || '760px';
        try { document.documentElement.style.overflow = ''; } catch (x) {}
      }
    }

    disconnectedCallback() { if (this._onMsg) window.removeEventListener('message', this._onMsg); }

    attributeChangedCallback() { if (this._built) this._render(); }

    _render() {
      var atlas = this.getAttribute('atlas-url') || DEFAULT_ATLAS;
      var daten = this.getAttribute('daten-url');
      if (daten === null) daten = DEFAULT_DATEN;
      var src = atlas;
      if (daten) src += (atlas.indexOf('?') > -1 ? '&' : '?') + 'daten=' + encodeURIComponent(daten);
      if (this._frame && this._frame.src !== src) this._frame.src = src;
    }
  }

  customElements.define('hilver-atlas', HilverAtlas);
})();

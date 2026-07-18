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

      this._onMsg = function (e) {
        var d = e.data;
        if (d && d.type === 'hilver:height' && d.height && e.source === frame.contentWindow) {
          frame.style.height = d.height + 'px';
        }
      };
      window.addEventListener('message', this._onMsg);
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

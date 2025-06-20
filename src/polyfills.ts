/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
 *
 * Learn more in https://angular.io/guide/browser-support
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/** IE11 requires the following for NgClass support on SVG elements */
// import 'classlist.js';  // Run `npm install --save classlist.js`.

/**
 * Web Animations `@angular/animations`
 * Only required if AnimationBuilder is used within the application and using IE/Edge or Safari.
 * Standard animation support in Angular DOES NOT require any polyfills (as of Angular 6.0).
 */
// import 'web-animations-js';  // Run `npm install --save web-animations-js`.

/**
 * By default, zone.js will patch all possible macroTask and DomEvents
 * user can disable parts of macroTask/DomEvents patch by setting following flags
 * because those flags need to be set before `zone.js` being loaded, and webpack
 * will put import in the top of bundle, so user need to create a separate file
 * in this directory (for example: zone-flags.ts), and put the following flags
 * into that file, and then add the following code before importing zone.js.
 * import './zone-flags';
 *
 * The flags allowed in zone-flags.ts are listed here.
 *
 * The following flags will disable zone.js patching completely. This will break Angular
 * components and directives that rely on zone.js for change detection.
 */

// (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
// (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
// (window as any).__Zone_disable_geolocation = true; // disable patch geolocation
// (window as any).__Zone_disable_file = true; // disable patch file
// (window as any).__Zone_disable_fs = true; // disable patch fs

/***************************************************************************************************
 * LEGACY BROWSER POLYFILLS
 * These polyfills are needed for Internet Explorer 11, older versions of Safari, and other legacy browsers
 */
import 'zone.js';
// Core-js polyfills for ES6+ features
import 'core-js/es/symbol';
import 'core-js/es/object';
import 'core-js/es/function';
import 'core-js/es/parse-int';
import 'core-js/es/parse-float';
import 'core-js/es/number';
import 'core-js/es/date';
import 'core-js/es/string';
import 'core-js/es/array';
import 'core-js/es/regexp';
import 'core-js/es/map';
import 'core-js/es/weak-map';
import 'core-js/es/set';
import 'core-js/es/promise';

// ES6 Array methods
import 'core-js/es/array/find';
import 'core-js/es/array/find-index';
import 'core-js/es/array/includes';

// ES6 String methods
import 'core-js/es/string/includes';
import 'core-js/es/string/starts-with';
import 'core-js/es/string/ends-with';

// ES6 Object methods
import 'core-js/es/object/assign';
import 'core-js/es/object/keys';
import 'core-js/es/object/values';
import 'core-js/es/object/entries';

// DOM polyfills
import 'core-js/web/dom-collections';

// Fetch API polyfill for older browsers
import 'whatwg-fetch';

// IntersectionObserver polyfill
import 'intersection-observer';

// ResizeObserver polyfill
(window as any).global = window;

// Custom Element polyfill for older browsers
import '@webcomponents/custom-elements';

// SVG polyfills for IE
import 'svg4everybody';

// CSS Object Model polyfill
if (!('CSS' in window)) {
  (window as any).CSS = {};
  (window as any).CSS.supports = function() { return false; };
}

// Viewport units polyfill for older iOS and Android
if (typeof window !== 'undefined') {
  // Detect if viewport units are buggy
  const viewportUnitsBuggy = function() {
    const ua = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua);
    const webkitVersion = parseFloat((ua.match(/AppleWebKit\/([.\d]+)/) || [])[1]);
    const webkitVersionBuggy = webkitVersion < 537;
    const androidVersion = parseFloat((ua.match(/Android ([.\d]+)/) || [])[1]);
    const androidVersionBuggy = androidVersion < 4.4;
    
    return iOS && webkitVersionBuggy || androidVersionBuggy;
  };

  if (viewportUnitsBuggy()) {
    // Add viewport units fix if needed
    const viewportUnitsFix = document.createElement('script');
    viewportUnitsFix.src = 'https://cdn.jsdelivr.net/gh/rodneyrehm/viewport-units-buggyfill@0.6.2/viewport-units-buggyfill.min.js';
    viewportUnitsFix.onload = function() {
      if ((window as any).viewportUnitsBuggyfill) {
        (window as any).viewportUnitsBuggyfill.init();
      }
    };
    document.head.appendChild(viewportUnitsFix);
  }
}

// Element.matches polyfill
if (!Element.prototype.matches) {
  Element.prototype.matches = 
    (Element.prototype as any).msMatchesSelector || 
    Element.prototype.webkitMatchesSelector;
}

// Element.closest polyfill
if (!Element.prototype.closest) {
  Element.prototype.closest = function(s: string) {
    let el: Element | null = this;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode as Element;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

// Array.from polyfill
if (!Array.from) {
  Array.from = function<T>(arrayLike: ArrayLike<T>): T[] {
    return Array.prototype.slice.call(arrayLike);
  };
}

// NodeList.forEach polyfill - Fixed type compatibility
if (typeof window !== 'undefined' && window.NodeList && !NodeList.prototype.forEach) {
  (NodeList.prototype as any).forEach = function(callback: (value: Node, index: number, list: NodeList) => void, thisArg?: any) {
    thisArg = thisArg || window;
    for (let i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

// CustomEvent polyfill for IE
if (typeof window !== 'undefined' && typeof (window as any).CustomEvent !== 'function') {
  function CustomEvent(event: string, params: any) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  (window as any).CustomEvent = CustomEvent;
}

// Remove polyfill for IE
if (!Element.prototype.remove) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

// Scroll behavior polyfill
if (!('scrollBehavior' in document.documentElement.style)) {
  import('smoothscroll-polyfill').then(smoothscroll => {
    smoothscroll.polyfill();
  });
}

// CSS variables polyfill for IE
if (typeof window !== 'undefined' && !window.CSS?.supports?.('color', 'var(--test)')) {
  import('css-vars-ponyfill').then(cssVars => {
    cssVars.default({
      watch: true,
      variables: {
        // Add your CSS variables here for IE fallback
        '--color-primary': '#3b82f6',
        '--bg-primary': '#ffffff',
        '--text-primary': '#1f2937'
      }
    });
  });
}

/***************************************************************************************************
 * APPLICATION IMPORTS
 */

/**
 * Date, currency, decimal and percent pipes.
 * Needed for: All but Chrome, Firefox, Edge, IE11 and Safari 10
 */
// import 'intl';  // Run `npm install --save intl`.
/**
 * Need to import at least one locale-data with intl.
 */
// import 'intl/locale-data/jsonp/en';

// Zone JS is required by default for Angular itself.
// Included with Angular CLI.

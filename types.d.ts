// React 19 eliminó el namespace global JSX (ahora vive en React.JSX). El proyecto
// usa `JSX.Element` en ~230 firmas, así que lo reexponemos globalmente en vez de
// tocar 219 ficheros. Se puede retirar migrando esas firmas a React.JSX.Element.
import type { JSX as ReactJSX } from 'react';

// El import de arriba convierte este fichero en un módulo, así que Window
// también tiene que declararse dentro de `global` para seguir siendo ambiental.
declare global {
  namespace JSX {
    type Element = ReactJSX.Element;
    type IntrinsicElements = ReactJSX.IntrinsicElements;
    type ElementClass = ReactJSX.ElementClass;
    type ElementAttributesProperty = ReactJSX.ElementAttributesProperty;
    type ElementChildrenAttribute = ReactJSX.ElementChildrenAttribute;
  }

  interface Window {
    analytics: any;
    gtag: any;
    _mtm: any;
    snigelPubConf: any;
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, { action: string }) => Promise<string>;
    };
    dataLayer: Record<string, any>[];
  }
}

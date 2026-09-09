import { NextResponse } from 'next/server';

const excludedPaths: string[] = [
  `/_next/static`,
  `/badges`,
  `/fonts`,
  `/images`,
  `/icons`,
  `/img`,
  `/logos`,
  `/js`,
  '/inxt-library',
  `DPA.pdf`,
];

const REFERRAL_COOKIE_LIFESPAN_DAYS = 2;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

// Antes se hacía en getServerSideProps de 98 páginas, lo que las obligaba a ser SSR.
// Aquí corre en cada request, así que las páginas pueden ser estáticas.
const setReferralCookie = (req, response) => {
  // El matcher excluye /api, pero Next invoca igualmente el proxy en algunas
  // rutas internas, así que lo comprobamos también aquí.
  if (req.nextUrl.pathname.startsWith('/api')) return;

  const referralId = req.nextUrl.searchParams.get('ref');

  if (!referralId) return;

  response.cookies.set('REFERRAL', referralId, {
    domain: process.env.NODE_ENV === 'production' ? '.internxt.com' : 'localhost',
    expires: new Date(Date.now() + REFERRAL_COOKIE_LIFESPAN_DAYS * MILLISECONDS_PER_DAY),
    path: '/',
    // httpOnly must be false in order to be accesible by JavaScript
    httpOnly: false,
  });
};

const proxy = (res) => {
  const isExcludedPath = excludedPaths.findIndex((path) => res.nextUrl.pathname.includes(path)) !== -1;
  if (isExcludedPath) return NextResponse.next();
  if (res.nextUrl.pathname !== res.nextUrl.pathname.toLowerCase() || res.nextUrl.pathname.includes('%20')) {
    const url = res.nextUrl.clone();
    if (url.pathname.includes('%20')) {
      const replaced = decodeURIComponent(url.pathname).replace(/\s/, '-');
      url.pathname = replaced.toLowerCase();
      const redirect = NextResponse.redirect(decodeURIComponent(url));
      setReferralCookie(res, redirect);
      return redirect;
    } else {
      url.pathname = url.pathname.toLowerCase();
      const redirect = NextResponse.redirect(url);
      setReferralCookie(res, redirect);
      return redirect;
    }
  }
  const response = NextResponse.next();
  setReferralCookie(res, response);
  return response;
};

export const config = {
  // Antes era '/:lang/:path*', que sólo capturaba rutas con prefijo de idioma
  // y dejaba fuera las de inglés sin prefijo (p. ej. /pricing), perdiendo la
  // atribución de referidos.
  //
  // `locale: false` es imprescindible: sin él, el i18n de Next antepone un
  // segmento de locale obligatorio al patrón y /pricing deja de coincidir.
  matcher: [
    {
      source: '/((?!api|_next|.*\\..*).*)',
      locale: false,
    },
  ],
};

export default proxy;

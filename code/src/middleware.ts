import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = process.env.JWT_SECRET;

const protectedRoutes = ['/dashboard', '/expenses', '/profile'];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (protectedRoutes.some((path) => pathname.startsWith(path))) {
    const token = req.cookies.get('token')?.value;

    console.log('mid path:', pathname);
    console.log('mid token:', token);

    if (!token) {
      console.log('mid no token, redir to login');
      const url = new URL(`/login`, req.url);
      url.searchParams.set('callbackUrl', encodeURI(req.url));
      return NextResponse.redirect(url);
    }

    try {
      if (!secret) {
        throw new Error('JWT_SECRET is not defined');
      }

      await jwtVerify(token, new TextEncoder().encode(secret));

      console.log('mid jwt ver successful');
      return NextResponse.next();
    } catch (error) {
      console.error('JWT Verification Failed:', error);
      const url = new URL(`/login`, req.url);
      url.searchParams.set('callbackUrl', encodeURI(req.url));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/expenses', '/profile'],
};
import { userLogin } from "../users/route.js";
import { cookies } from 'next/headers';

export async function POST(req) {
    const { username, password } = await req.json();

    const loginResult = await userLogin(username, password);

    if (loginResult.status === 0) {
        const cookieStore = await cookies();
        cookieStore.set('token', loginResult.token, {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 3600,
        });
      }
    
      return new Response(
        JSON.stringify({
          result: loginResult.status,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
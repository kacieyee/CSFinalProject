import { cookies } from 'next/headers';

async function userLogin(username, password) {
  try {
      const user = await User.findOne({username});
      if (!user) {
          return {status: 2}; 
      } else if (user.password != password) {
          return {status: 1};
      } else {
          const token = jwt.sign(
              {username: user.username},
              SECRET_KEY,
              {expiresIn: "1h"}
          );

          return {status: 0, token};
      }
  } catch(err) {
      console.log(err);
      return -1;
  }
}

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
import { userLogin } from "../users/route.js";

export async function POST(req) {
    const { username, password } = await req.json();

    const loginResult = await userLogin(username, password);

    return new Response(JSON.stringify({
        result: loginResult.status,
        token: loginResult.token
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
import type { RequestHandler } from "@sveltejs/kit";
import { parseHTML } from "linkedom";

const BASE_HEADERS = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-DK,en;q=0.9',
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Linux"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Safari/537.36',
}

export const GET: RequestHandler = async ({ request }) => {
    const school = request.headers.get("school");
    const username = request.headers.get("username");
    const password = request.headers.get("password");
    if (!school || !username || !password) {
        return new Response("Missing school, username or password", { status: 400 });
    }

    let response: Response;
    let body: string;
    let document: Document;

    response = await fetch(`https://www.lectio.dk/lectio/${school}/login.aspx`, { headers: BASE_HEADERS });
    if (!response.ok) {
        return new Response("Failed to fetch login page", { status: 500 });
    }
    body = await response.text();
    document = parseHTML(body).document;
    const inputs = document.querySelectorAll("input[type=hidden]");

    const payload = Object.fromEntries(Array.from(inputs).map(input => [input.getAttribute("name"), input.getAttribute("value")]).filter((arr) => arr[0] != "query")) as Record<string, string>;
    payload["__EVENTTARGET"] = "m$Content$submitbtn2"
    payload["m$Content$username"] = username
    payload["m$Content$password"] = password
    payload["m$Content$AutologinCbx"] = "on"
    payload["LectioPostbackId"] = ""

    response = await fetch(`https://www.lectio.dk/lectio/${school}/login.aspx`, {
        method: "POST", headers: {
            'content-type': 'application/x-www-form-urlencoded', 'origin': 'https://www.lectio.dk',
            'referer': `https://www.lectio.dk/lectio/${school}/login.aspx`, 'cache-control': 'max-age=0', ...BASE_HEADERS
        }, body: JSON.stringify(payload)
    });
    if (!response.ok) {
        return new Response("Failed to login", { status: 500 });
    }
    body = await response.text();
    document = parseHTML(body).document;

    let loggedIn = false;
    document.querySelectorAll('meta[name="msapplication-starturl"]').forEach(meta => {
        const content = meta.getAttribute('content');
        console.log(content)
        if (content && content.includes(`/lectio/${school}/forside.aspx`)) {
            loggedIn = true;
        }
    });
    if (!loggedIn) {
        return new Response("Failed to login (wrong credentials)", { status: 500 });
    }

    const cookies = response.headers.getSetCookie()
    return new Response(cookies.toString(), { status: 200 });
};
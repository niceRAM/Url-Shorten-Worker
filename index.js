const html404 = `<!DOCTYPE html>
<body>
  <h1>404 Not Found.</h1>
  <p>The url you visit is not found.</p>
</body>`

async function randomString(len) {
  len = len || 6;
  // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
  let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  let maxPos = $chars.length;
  let result = '';
  for (i = 0; i < len; i++) {
    result += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

async function checkURL(URL) {
  let str = URL;
  let Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
  let objExp = new RegExp(Expression);
  if (objExp.test(str) == true) {
    if (str[0] == 'h')
      return true;
    else
      return false;
  } else {
    return false;
  }
}

async function save_url(URL) {
  const key = await REVERSE_LINKS.get(URL)
  if (key != null) { return "undefined", key }

  let random_key = await randomString()
  let is_exist = await LINKS.get(random_key)
  console.log(is_exist)
  if (is_exist == null) {
    const stat1 = await LINKS.put(random_key, URL)
    const stat2 = await REVERSE_LINKS.put(URL, random_key)
    if (typeof (stat1) != "undefined" && REVERSE_LINKS.get(URL) != null) {
      await REVERSE_LINKS.delete(URL)
    }
    if (typeof (stat2) != "undefined" && LINKS.get(random_key) != null) {
      await LINKS.delete(random_key)
    }
    return stat1 && stat2, random_key
  } else {
    save_url(URL)
  }
}
async function handleRequest(request) {
  console.log(request)
  const { searchParams } = new URL(request.url)
  const to_shorten_url = searchParams.get('url')
  const apikey = searchParams.get('apikey')
  if (request.method === "GET" && to_shorten_url != null) {
    if (apikey != APIKEY) {
      return new Response(`{"status":200,"error":"APIKEY is required."}`, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
        },
      })
    }
    let stat, random_key = await save_url(to_shorten_url)
    if (typeof (stat) == "undefined") {
      return new Response(`{"status":200,"shortened_url":"https://` + (new URL(request.url)).hostname + `/` + random_key + `"}`, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
        },
      })
    }
  }

  if (request.method === "POST") {
    let req = await request.json()
    console.log(req["url"])
    if (!await checkURL(req["url"])) {
      return new Response(`{"status":500,"key":": Error: Url illegal."}`, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
        },
      })
    }
    let stat, random_key = await save_url(req["url"])
    console.log(stat)
    if (typeof (stat) == "undefined") {
      return new Response(`{"status":200,"key":"/` + random_key + `"}`, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
        },
      })
    } else {
      return new Response(`{"status":200,"key":": Error:Reach the KV write limitation."}`, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
        },
      })
    }
  } else if (request.method === "OPTIONS") {
    return new Response(``, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
    })
  }

  const requestURL = new URL(request.url)
  const path = requestURL.pathname.split("/")[1]
  console.log(path)
  if (!path) {

    const html = await fetch("https://cdn.jsdelivr.net/gh/xyTom/Url-Shorten-Worker@gh-pages/index.html")

    return new Response(await html.text(), {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    })
  }
  const value = await LINKS.get(path)
  console.log(value)


  const location = value
  if (location) {
    return Response.redirect(location, 301)
  }
  // If request not in kv, return 404
  return new Response(html404, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
    status: 404
  })
}

async function handleScheduled(event) {
  // TODO: delete expired urls
}

addEventListener("fetch", async event => {
  event.respondWith(handleRequest(event.request))
})

addEventListener("scheduled", event => {
  event.waitUntil(handleScheduled(event))
})

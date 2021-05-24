# Url-Shorten-Worker
A URL Shortener created using Cloudflare Worker

# Getting start
### 去Workers KV中创建两个命名空间

Go to Workers KV and create two namespaces.

<img src="https://cdn.jsdelivr.net/npm/imst@0.0.4/20201205232805.png">

### 去Worker的Settings选选项卡中绑定KV Namespace

Bind an instance of a KV Namespace to access its data in a Worker.

<img src="https://cdn.jsdelivr.net/npm/imst@0.0.4/20201205232536.png">

#### 第一个 Variable name 填写`LINKS`, KV namespace填写你刚刚创建的第一个命名空间

Where Variable name should set as `LINKS` and KV namespace is the namespace you just created firstly in the first step.

#### 再添加另一个 Variable name 填写`REVERSE_LINKS`, KV namespace填写你刚刚创建的第二个命名空间

And the other one set as `REVERSE_LINKS` and KV namespace is the namespace you just created secondly in the first step.

<img src="https://cdn.jsdelivr.net/npm/imst@0.0.4/20201205232704.png">

### 创建环境变量，Variable name 填写 APIKEY，值随意填写

create a ENVIRONMENT, where Variable name should set as `APIKEY`, value can be anything you like.

### 复制本项目中的`index.js`的代码到Cloudflare Worker 

Copy the `index.js` code from this project to Cloudflare Worker. 

### 点击Save and Deploy

Click Save and Deploy


# API 调用示例

假设：
1. worker 路由是 `s.example.workers.dev`
2. 要缩短的链接是 `https://example.com/?kw=dgysuaindjusiafgaj`
3. 环境变量 APIKEY 的值是 `asecretapikey`

那么访问 API 的方式如下：

```bash
curl -X GET https://s.example.workers.dev/?url=https://example.com/?kw=dgysuaindjusiafgaj&apikey=asecretapikey
```

# GUDO

- [ ] 开放不加 APIKEY 访问 API 的方式并限制单 IP 每日调用次数
- [ ] 为短链接增加过期时间，定期清理过期的链接（能减少存储空间的使用，但会增加 KV 的调用次数）

const koa = require('koa'),
    body = require('koa-body'),
    Router = require('koa-router'),
    sqliteServer = require('sqlite3').verbose(),
    fs = require('fs');

const app = new koa();
const router = new Router();
const db = new sqliteServer.Database(__dirname + "/zamasu.db");

const login_page = fs.readFileSync("./HTML/login.html");
const accueil_page = fs.readFileSync("./HTML/accueil.html");
const register_page = fs.readFileSync("./HTML/register.html");

app.listen(80, function() {
    console.log("L'API est prêt sur le port 80");
});

router.get("/api", function(ctx, next) {
    ctx.type = "text/json";
    ctx.body = {method: "GET", api: "http://zamasu.tk:9999/api/:endpoint", end_point: ["mod", "pdp"]};
})

router.get("/api/mod", function(ctx, next) {
    const insulte_regex = /s(-|\/|_|,|;|:|'|\(|\)|\*| )*[aà@â](-|\/|_|,|;|:|'|\(|\)|\*| )*l(-|\/|_|,|;|:|'|\(|\)|\*| )*[ôoò0°](-|\/|_|,|;|:|'|\(|\)|\*| )*p(-|\/|_|,|;|:|'|\(|\)|\*| )*[éeèê€]?|[eéèê€](-|\/|_|,|;|:|'|\(|\)|\*| )*n(-|\/|_|,|;|:|'|\(|\)|\*| )*c(-|\/|_|,|;|:|'|\(|\)|\*| )*[ûùu](-|\/|_|,|;|:|'|\(|\)|\*| )*l(-|\/|_|,|;|:|'|\(|\)|\*| )*[éeèê€]|b(-|\/|_|,|;|:|'|\(|\)|\*| )*[âaà@](-|\/|_|,|;|:|'|\(|\)|\*| )*t(-|\/|_|,|;|:|'|\(|\)|\*| )*[a@âà](-|\/|_|,|;|:|'|\(|\)|\*| )*r(-|\/|_|,|;|:|'|\(|\)|\*| )*d/i

    const message = ctx.query.message;
    if(message == null) {
        ctx.type = "text/json";
        return ctx.body = {error: "message missing", code: "400"};
    }
    if(insulte_regex.test(message)) {
        ctx.type = "text/json"
        return ctx.body = {true: "a vulgarity was detected", code: "200"}
    } else {
        ctx.type = "text/json"
        return ctx.body = {false: "no vulgarity was detected", code: "200"}
    }
})

router.get("/api/pdp", function(ctx, next) {
    const pdp_array = ["https://wallpaperaccess.com/full/839959.jpg", "https://images3.alphacoders.com/695/695428.jpg", "https://i.pinimg.com/originals/e0/68/86/e068864952e8ad84968084c893323a45.jpg", "https://i.ytimg.com/vi/VM6dJXVDn2c/maxresdefault.jpg", "https://image.winudf.com/v2/image/Y29tLmFuZHJvbW8uZGV2Njg5MDM1LmFwcDcxNDMxMV9zY3JlZW5fNF8xNTEzNzE1MzQ5XzAwOQ/screen-4.jpg?h=355&fakeurl=1&type=.jpg", "https://images8.alphacoders.com/605/thumb-350-605504.png", "https://wallpaperaccess.com/full/236984.jpg", "https://images2.alphacoders.com/644/644168.jpg", "http://getwallpapers.com/wallpaper/full/3/c/5/1380725-konan-wallpaper-1640x2453-full-hd.jpg", "https://i.pinimg.com/originals/52/74/0f/52740f7a75720a4576d1bd0613e3a3a1.jpg", "https://images4.alphacoders.com/985/thumb-1920-985839.jpg", "https://vignette.wikia.nocookie.net/swordartonline/images/6/67/Kirito_SAO.png/revision/latest?cb=20140228021241", "https://i.ytimg.com/vi/JCUtv9CtEVo/maxresdefault.jpg", "https://www.elsetge.cat/myimg/f/92-927564_download-luffy-pop-luffy-profile-picture-wallpaper-one.jpg", "http://cdn.wallpaperhi.com/1280x800/20120307/one%20piece%20luffy%20monkey%20d%20luffy%201280x800%20wallpaper_www.wallpaperhi.com_73.jpg", "https://wallup.net/wp-content/uploads/2015/12/10872-Monkey_D._Luffy-One_Piece-anime.jpg", "https://i.pinimg.com/1200x/f5/7a/24/f57a24611edcaafa4eb2f4246a04b1a7.jpg", "https://pm1.narvii.com/6954/fc14e243c8cd45862f609e78786b4de7449726e2r1-640-360v2_hq.jpg"];
    const pdp = pdp_array[Math.floor(Math.random() * pdp_array.length)];
    ctx.type = "text/json";
    ctx.body = {url: `${pdp}`};
})

router.post("/api/users/login", body(), async function(ctx, next) {

    const email_Regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;

    const email = ctx.request.body.email;
    const password = ctx.request.body.password;

    if(email === undefined|| password === undefined) {
        ctx.type = "text/json";
        return ctx.body = {error: "Some parameters are missing", code: "400"};
    }
    if(!email_Regex.test(email)) {
        ctx.type = "text/json";
        return ctx.body = {error: "Some parameters are incorrect", code: "400"};
    }
    const getUsers = (email) => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM User WHERE user_email='${email}';`, (err, res) => {
                if(err) {
                  reject(err);
                } else {
                  resolve(res)
                }
            })
        })
    }
    const users = await getUsers(email)
    if (users.length === 0) {
        ctx.status = 403
        ctx.type = "text/json";
        ctx.body = {error: "cannot found account", code: 403}
    } else if(password !== users[0].user_password) {
        ctx.status = 403
        ctx.type = "text/json";
        ctx.body = {error: "incorrect values", code: 403}
    } else {
            ctx.status = 200
            ctx.type = "text/json";
            ctx.body = {message: "verify", user_email: `${users[0].user_email}`, user_name: `${users[0].user_name}`, user_id: `${users[0].user_id}`, user_iconURL: `${users[0].user_iconURL}`, code: 200}
        }
})

router.post("/api/users/register",body(), async function(ctx, next) {
    const email_Regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    const password_Regex = /^(?=.*\d).{4,15}$/i

    const user_name = ctx.request.body.user_name;
    const user_email = ctx.request.body.user_email;
    const user_password = ctx.request.body.user_password;
    const user_iconURL = ctx.request.body.user_iconURL;

    if(user_name === undefined || user_email === undefined || user_password === undefined || user_iconURL === undefined) {
        ctx.status = 400;
        ctx.type = "text/json";
        ctx.body = {error: "Some parameters are missing", code: 400};
    }
    if(!email_Regex.test(user_email) || !password_Regex.test(user_password)) {
        ctx.status = 403;
        ctx.type = "text/json";
        ctx.body = {error: "Incorrect values", code: 403};
    }
    const getUsers = (user_email) => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM User WHERE user_email = '${user_email}';`, (err, res) => {
                if(err) {
                  reject(err);
                } else {
                  resolve(res)
                }
            })
        })
    }
    const users = await getUsers(user_email);
    console.log(users);
})

router.get("/login", async function(ctx, next) {
    ctx.type = "text/html"
    ctx.body = login_page;
})

router.get("/register", async function(ctx, next) {
    ctx.type = "text/html"
    ctx.body = register_page;
})

router.get("/", async function(ctx, next) {
    ctx.type = "text/html";
    ctx.body = accueil_page;
})

app.use(router.routes());

app.use(async (ctx, next) => {
    if(!ctx.url.includes(router.routes())) {
        ctx.status = 404;
        ctx.body = new Object({error: "Page Not Found", code: "404"});
    }
}) 
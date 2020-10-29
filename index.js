const path = require("path");
const fs = require("fs/promises");
const fastify = require("fastify").fastify({
    logger: true
});
const static = require("fastify-static");
const db = require("./db");

const PORT = process.env.PORT || 3000;

fastify.register(static, {
    root: path.join(__dirname,'public'),
    prefix: "/"
});

fastify.route({
    method: "GET",
    url: '/',
    handler: async (req,res) => {
        const index = await fs.readFile("./public/index.html");
        res.header("Content-type","text/html");
        res.send(index);
    }
})

fastify.listen(PORT, (err,address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`server listening on ${address}`)
})
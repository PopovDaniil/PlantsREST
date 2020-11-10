const path = require("path");
const fs = require("fs");
const fastify = require("fastify").fastify({
    logger: true
});
const static = require("fastify-static");
const Model = require("./model");
const model = new Model();

const onNotFound = (err,req,res) => res.code(404).send(err);

const PORT = process.env.PORT || 3000;

fastify
    .register(static, {
        root: path.join(__dirname, 'public'),
        prefix: "/"
    })
    .route({
        method: "GET",
        url: '/',
        handler: async (req, res) => {
            const index = fs.readFileSync("./public/index.html");
            res.header("Content-type", "text/html");
            res.send(index);
        }
    })
    .route({
        method: "GET",
        url: '/api',
        handler: async (req, res) => {
            const text = "<h1>Plants REST API</h1>"
            res.header("Content-type", "text/html")
                .code(200)
                .send(text);
        }
    })
    .route({
        method: "GET",
        url: "/api/plants",
        handler: async (req,res) => {
            const json = await model.plants.get();
            res.send(json);
        }
    })
    .route({
        method: "GET",
        url: "/api/plants/:latin",
        handler: async (req,res) => {
            const json = await model.plants.get(req.params.latin);
            res.send(json);
        },
        errorHandler: onNotFound
    })
    .listen(PORT, "0.0.0.0", (err, address) => {
        console.info(PORT);
        fastify.log.info(`server listening on ${address}`)
    })

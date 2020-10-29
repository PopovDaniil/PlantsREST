const { default: fastify } = require("fastify");
const static = require("fastify-static");

module.exports = async (fastify,opts) => {
    fastify
    fastify.get('/', async (req,res) => {
        return {hello: "22"}
    })
}
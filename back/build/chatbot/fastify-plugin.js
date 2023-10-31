"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
exports.default = (chatbot) => (0, fastify_plugin_1.default)(async (app) => {
    app.decorateRequest('chatbot', null);
    app.addHook('preHandler', (req, _, done) => {
        req.chatbot = chatbot;
        done();
    });
});

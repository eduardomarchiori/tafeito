"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const querybuilder_1 = __importDefault(require("../shared/querybuilder"));
exports.default = (0, fastify_plugin_1.default)(async (app) => {
    app.decorateRequest('uow', null);
    app.addHook('preHandler', (req, _, done) => {
        querybuilder_1.default.transaction(trx => {
            req.uow = trx;
            done();
        });
    });
    app.addHook('onSend', async (req) => {
        if (req.uow && !req.uow.isCompleted()) {
            console.log('commit');
            await req.uow.commit();
        }
    });
    app.addHook('onError', async (req) => {
        console.log('rollback');
        await req.uow.rollback();
    });
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fastify_file_upload_1 = __importDefault(require("fastify-file-upload"));
const cors_1 = __importDefault(require("@fastify/cors"));
const uow_1 = __importDefault(require("./core/uow"));
const openai_1 = __importDefault(require("./chatbot/openai"));
const fastify_plugin_1 = __importDefault(require("./chatbot/fastify-plugin"));
const model_1 = require("./usuarios/model");
const router_1 = __importDefault(require("./usuarios/router"));
const router_2 = __importDefault(require("./tarefas/router"));
const router_3 = __importDefault(require("./etiquetas/router"));
const router_4 = __importDefault(require("./categorias/router"));
const erros_1 = require("./shared/erros");
const app = (0, fastify_1.default)({ logger: true });
app.register(cors_1.default, {
    origin: true
});
app.setNotFoundHandler((req, resp) => {
    resp.status(404).send({ erro: 'Rota não encontrada' });
});
app.removeContentTypeParser('text/plain');
app.setErrorHandler((err, req, resp) => {
    if (err instanceof erros_1.ErroNoProcessamento) {
        resp.status(err.statusCode).send(err.toJSON());
    }
    else {
        resp.send(err); // isso delega o tratamento de erro para o handler padrão do Fastify
    }
});
app.decorateRequest('usuario', null);
app.register((0, fastify_plugin_1.default)(openai_1.default));
// app.register(chatbotPlugin(papagaio));
app.register(uow_1.default);
app.register(fastify_file_upload_1.default, {
    debug: true,
    limits: { fileSize: 50 * 1024 * 1024 },
});
app.addHook('preHandler', async (req, resp) => {
    const { authorization } = req.headers;
    if (authorization !== undefined) {
        const token = authorization.replace('Bearer ', '');
        const usuario = await (0, model_1.recuperarUsuarioAutenticado)(token, req.uow);
        req.usuario = usuario;
    }
    // não queremos disparar um erro se o usuário não estiver autenticado neste ponto,
    // pois algumas rotas podem ser públicas
});
app.register(router_1.default, { prefix: '/usuarios' });
app.register(router_2.default, { prefix: '/tarefas' });
app.register(router_3.default, { prefix: '/etiquetas' });
app.register(router_4.default, { prefix: '/categorias' });
async function main() {
    try {
        await app.listen({ port: 3000, host: '0.0.0.0' });
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}
main();

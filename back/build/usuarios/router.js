"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const erros_1 = require("../shared/erros");
const model_1 = require("./model");
exports.default = async (app) => {
    const loginSchema = {
        body: {
            type: 'object',
            properties: {
                login: { type: 'string' },
                senha: { type: 'string' },
            },
            required: ['login', 'senha'],
            additionalProperties: false,
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    token: { type: 'string' },
                },
                required: ['token'],
            },
        },
    };
    app.post('/login', { schema: loginSchema }, async (req, resp) => {
        const { login, senha } = req.body;
        const id = await (0, model_1.autenticar)(login, senha, req.uow);
        return { token: id };
    });
    app.get('/autenticado', async (req, resp) => {
        if (!req.usuario) {
            throw new erros_1.UsuarioNaoAutenticado();
        }
        return {
            usuario: {
                nome: req.usuario.nome,
                login: req.usuario.login,
                admin: req.usuario.admin,
            }
        }; // por que não retornamos o objeto req.usuario diretamente?
    });
    const putNomeSchema = {
        body: {
            type: 'object',
            properties: {
                nome: { type: 'string' },
            },
            required: ['nome'],
            additionalProperties: false,
        },
        response: {
            204: {
                type: 'null',
            },
        },
    };
    app.put('/autenticado/nome', { schema: putNomeSchema }, async (req, resp) => {
        const { nome } = req.body;
        await (0, model_1.alterarNome)(req.usuario, nome, req.uow);
        resp.status(204);
    });
};

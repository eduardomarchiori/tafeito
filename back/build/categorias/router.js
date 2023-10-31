"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("./model");
exports.default = async (app) => {
    app.get('/', async (req) => {
        const categorias = await (0, model_1.buscarCategorias)(req.uow);
        return categorias;
    });
};

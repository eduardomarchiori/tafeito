"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("./model");
exports.default = async (app) => {
    app.get('/', async (req) => {
        const etiquetas = await (0, model_1.buscarEtiquetas)(req.uow);
        return etiquetas;
    });
};

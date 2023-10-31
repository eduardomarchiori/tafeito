"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarCategorias = void 0;
async function buscarCategorias(uow) {
    return await uow('categorias')
        .select('id', 'descricao');
}
exports.buscarCategorias = buscarCategorias;

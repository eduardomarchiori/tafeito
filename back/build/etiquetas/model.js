"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cadastrarEtiquetaSeNecessario = exports.removerEtiquetaSeObsoleta = exports.buscarIdDaEtiquetaPelaDescricao = exports.buscarEtiquetas = void 0;
const erros_1 = require("../shared/erros");
async function buscarEtiquetas(uow) {
    return await uow('etiquetas')
        .select('descricao', 'cor');
}
exports.buscarEtiquetas = buscarEtiquetas;
async function buscarIdDaEtiquetaPelaDescricao(descricao, uow) {
    const res = await uow('etiquetas')
        .select('id')
        .where('descricao', descricao)
        .first();
    if (res === undefined) {
        throw new erros_1.DadosOuEstadoInvalido('Etiqueta não encontrada', {
            codigo: 'ETIQUETA_NAO_ENCONTRADA'
        });
    }
    return res.id;
}
exports.buscarIdDaEtiquetaPelaDescricao = buscarIdDaEtiquetaPelaDescricao;
async function removerEtiquetaSeObsoleta(id, uow) {
    // pequena dependência circular aqui
    // visto que o conceito de etiquetas
    // está dependendo do conceito de tarefas
    const res = await uow('tarefa_etiqueta')
        .count('id_tarefa')
        .where('id_etiqueta', id)
        .first();
    // infelizmente esse count é uma string e não um number
    if (res === undefined || res.count === '0') {
        await uow('etiquetas')
            .where('id', id)
            .delete();
    }
}
exports.removerEtiquetaSeObsoleta = removerEtiquetaSeObsoleta;
async function cadastrarEtiquetaSeNecessario(etiqueta, uow) {
    const res = await uow('etiquetas')
        .select('id')
        .where('descricao', etiqueta)
        .first();
    let id;
    if (res !== undefined) {
        id = res.id;
    }
    else {
        const res = await uow('etiquetas')
            .insert({
            descricao: etiqueta,
            cor: gerarCorAleatoria()
        })
            .returning('id');
        id = res[0].id;
    }
    return id;
}
exports.cadastrarEtiquetaSeNecessario = cadastrarEtiquetaSeNecessario;
function gerarCorAleatoria() {
    const num = Math.round(0xffffff * Math.random());
    const r = num >> 16;
    const g = num >> 8 & 255;
    const b = num & 255;
    return [r, g, b];
}

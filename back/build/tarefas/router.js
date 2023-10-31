"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const model_1 = require("./model");
exports.default = async (app) => {
    const postSchema = {
        body: {
            type: 'object',
            properties: {
                descricao: { type: 'string' },
                id_categoria: { type: 'number' },
            },
            required: ['descricao', 'id_categoria'],
            additionalProperties: false,
        },
        response: {
            201: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                },
                required: ['id'],
            },
        },
    };
    app.post('/', { schema: postSchema }, async (req, resp) => {
        const dados = req.body;
        const id = await (0, model_1.cadastrarTarefa)(req.usuario, dados, req.uow);
        resp.status(201);
        return { id };
    });
    app.get('/', async (req, resp) => {
        const { termo } = req.query;
        const tarefas = await (0, model_1.consultarTarefas)(req.usuario, termo, req.uow);
        return tarefas;
    });
    app.get('/:id', async (req, resp) => {
        const { id } = req.params;
        const idTarefa = Number(id);
        const tarefa = await (0, model_1.consultarTarefaPeloId)(req.usuario, idTarefa, req.uow);
        return {
            descricao: tarefa.descricao,
            data_conclusao: tarefa.data_conclusao,
            id_categoria: tarefa.id_categoria,
            etiquetas: tarefa.etiquetas,
        };
    });
    app.patch('/:id', async (req, resp) => {
        const { id } = req.params;
        const idTarefa = Number(id);
        const alteracoes = req.body;
        await (0, model_1.alterarTarefa)(req.usuario, idTarefa, alteracoes, req.uow);
        resp.status(204);
    });
    app.post('/:id/concluir', async (req, resp) => {
        const { id } = req.params;
        const idTarefa = Number(id);
        await (0, model_1.concluirTarefa)(req.usuario, idTarefa, req.uow);
        resp.status(204);
    });
    app.post('/:id/reabrir', async (req, resp) => {
        const { id } = req.params;
        const idTarefa = Number(id);
        await (0, model_1.reabrirTarefa)(req.usuario, idTarefa, req.uow);
        resp.status(204);
    });
    app.delete('/:id', async (req, resp) => {
        const { id } = req.params;
        const idTarefa = Number(id);
        await (0, model_1.excluirTarefa)(req.usuario, idTarefa, req.uow);
        resp.status(204);
    });
    app.post('/:id/etiquetas/:etiqueta', async (req, resp) => {
        const { id, etiqueta } = req.params;
        const idTarefa = Number(id);
        await (0, model_1.vincularEtiquetaNaTarefa)(req.usuario, idTarefa, etiqueta, req.uow);
        resp.status(204);
    });
    app.delete('/:id/etiquetas/:etiqueta', async (req, resp) => {
        const { id, etiqueta } = req.params;
        const idTarefa = Number(id);
        await (0, model_1.desvincularEtiquetaDaTarefa)(req.usuario, idTarefa, etiqueta, req.uow);
        resp.status(204);
    });
    const planejarProjetoSchema = {
        body: {
            type: 'object',
            properties: {
                descricao: { type: 'string' },
            },
            required: ['descricao'],
        },
    };
    app.post('/planejar-projeto', { schema: planejarProjetoSchema }, async (req) => {
        const { descricao } = req.body;
        const sugestoesDeTarefa = await (0, model_1.planejarTarefasDoProjeto)(descricao, req.chatbot);
        return sugestoesDeTarefa;
    });
    app.post('/sugerir-proxima', async (req) => {
        const sugestaoDeTarefa = await (0, model_1.sugerirProximaTarefa)(req.usuario, req.uow, req.chatbot);
        return {
            descricao: sugestaoDeTarefa,
        };
    });
    app.post('/:id/estimar-textual', async (req, resp) => {
        const { id } = req.params;
        const idTarefa = Number(id);
        const estimativa = await (0, model_1.estimarTextual)(req.usuario, idTarefa, req.uow, req.chatbot);
        return { estimativa };
    });
    app.post('/:id/estimar', async (req, resp) => {
        const { id } = req.params;
        const idTarefa = Number(id);
        return await (0, model_1.estimar)(req.usuario, idTarefa, req.uow, req.chatbot);
    });
    app.post('/:id/anexos', async (req, resp) => {
        const { id } = req.params;
        const idTarefa = Number(id);
        const arquivo = req.raw.files.arquivo; // suporte TypeScript da biblioteca está incompleto
        const idAnexo = await (0, model_1.cadastrarAnexo)(req.usuario, idTarefa, arquivo.name, arquivo.size, arquivo.mimetype, req.uow);
        await (0, promises_1.mkdir)('uploads', { recursive: true }); // recursive faz com que ignore se já existir
        await arquivo.mv(`uploads/${idAnexo}`);
        return { id: idAnexo };
    });
    app.delete('/:id/anexos/:idAnexo', async (req, resp) => {
        const { id, idAnexo } = req.params;
        const idTarefa = Number(id);
        await (0, model_1.excluirAnexo)(req.usuario, idTarefa, idAnexo, req.uow);
        await (0, promises_1.rm)(`uploads/${idAnexo}`);
        resp.status(204);
    });
    app.get('/:id/anexos/:idAnexo', async (req, resp) => {
        const { id, idAnexo } = req.params;
        const idTarefa = Number(id);
        const anexo = await (0, model_1.consultarAnexoPeloId)(req.usuario, idTarefa, idAnexo, req.uow);
        resp.header('Content-Type', anexo.mime_type);
        resp.header('Content-Length', anexo.tamanho);
        await resp.send((0, fs_1.createReadStream)(`uploads/${idAnexo}`)); // a documentação pede o await aqui
    });
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultarAnexoPeloId = exports.excluirAnexo = exports.cadastrarAnexo = exports.estimar = exports.estimarTextual = exports.sugerirProximaTarefa = exports.planejarTarefasDoProjeto = exports.desvincularEtiquetaDaTarefa = exports.vincularEtiquetaNaTarefa = exports.excluirTarefa = exports.reabrirTarefa = exports.concluirTarefa = exports.alterarTarefa = exports.consultarTarefaPeloId = exports.consultarTarefas = exports.cadastrarTarefa = void 0;
const uuid_1 = require("uuid");
const erros_1 = require("../shared/erros");
const model_1 = require("../etiquetas/model");
async function cadastrarTarefa(usuario, dados, uow) {
    if (usuario === null) {
        throw new erros_1.UsuarioNaoAutenticado();
    }
    const res = await uow('tarefas')
        .insert(Object.assign(Object.assign({}, dados), { id_usuario: usuario.id }))
        .returning('id');
    if (res.length === 0) {
        throw new Error('Erro ao cadastrar a tarefa. res === undefined');
    }
    return res[0].id;
}
exports.cadastrarTarefa = cadastrarTarefa;
async function consultarTarefas(usuario, termo, uow) {
    if (usuario === null) {
        throw new erros_1.UsuarioNaoAutenticado();
    }
    let query = uow('tarefas')
        .select('id', 'descricao', 'id_categoria', 'id_usuario', 'data_conclusao', 'descricao'); // sem o await!
    if (!usuario.admin) {
        query = query.where('id_usuario', usuario.id);
    }
    if (termo) {
        query = query.where('descricao', 'ilike', `%${termo}%`);
    }
    const tarefas = await query;
    const idTarefas = tarefas.map(x => x.id);
    const tarefaEtiquetas = await uow('tarefa_etiqueta')
        .join('etiquetas', 'etiquetas.id', 'tarefa_etiqueta.id_etiqueta')
        .select('id_tarefa', 'descricao')
        .whereIn('id_tarefa', idTarefas);
    const anexos = await uow('anexos')
        .select('id', 'nome', 'tamanho', 'mime_type', 'id_tarefa')
        .whereIn('id_tarefa', idTarefas);
    return tarefas.map(x => (Object.assign(Object.assign({}, x), { etiquetas: tarefaEtiquetas
            .filter(y => y.id_tarefa === x.id)
            .map(y => y.descricao), anexos: anexos
            .filter(y => y.id_tarefa === x.id)
            .map(y => (Object.assign(Object.assign({}, y), { id_tarefa: undefined }))) })));
}
exports.consultarTarefas = consultarTarefas;
async function consultarTarefaPeloId(usuario, id, uow) {
    if (usuario === null) {
        throw new erros_1.UsuarioNaoAutenticado();
    }
    const res = await uow('tarefas')
        .select('id', 'descricao', 'id_categoria', 'id_usuario', 'data_conclusao', 'descricao')
        .where('id', id);
    const tarefa = res[0];
    if (tarefa === undefined) {
        throw new erros_1.DadosOuEstadoInvalido('Tarefa não encontrada', {
            codigo: 'TAREFA_NAO_ENCONTRADA'
        });
    }
    if (!usuario.admin && usuario.id !== res[0].id_usuario) {
        throw new erros_1.AcessoNegado();
    }
    const registrosDeEtiqueta = await uow('tarefa_etiqueta')
        .join('etiquetas', 'etiquetas.id', 'tarefa_etiqueta.id_etiqueta')
        .select('descricao')
        .where('id_tarefa', id);
    return Object.assign(Object.assign({}, tarefa), { etiquetas: registrosDeEtiqueta.map(x => x.descricao) });
}
exports.consultarTarefaPeloId = consultarTarefaPeloId;
async function asseguraExistenciaDaTarefaEAcessoDeEdicao(usuario, id, uow) {
    const res = await uow('tarefas')
        .select('id_usuario')
        .where('id', id)
        .first();
    if (res === undefined) {
        throw new erros_1.DadosOuEstadoInvalido('Tarefa não encontrada', {
            codigo: 'TAREFA_NAO_ENCONTRADA'
        });
    }
    if (!usuario.admin && usuario.id !== res.id_usuario) {
        throw new erros_1.AcessoNegado();
    }
}
async function alterarTarefa(usuario, id, alteracoes, uow) {
    if (usuario === null) {
        throw new erros_1.UsuarioNaoAutenticado();
    }
    await asseguraExistenciaDaTarefaEAcessoDeEdicao(usuario, id, uow);
    if (Object.keys(alteracoes).length > 0) {
        await uow('tarefas')
            .update({
            descricao: alteracoes.descricao,
            id_categoria: alteracoes.id_categoria,
        })
            .where('id', id);
    }
}
exports.alterarTarefa = alterarTarefa;
async function concluirTarefa(usuario, id, uow) {
    if (usuario === null) {
        throw new erros_1.UsuarioNaoAutenticado();
    }
    await asseguraExistenciaDaTarefaEAcessoDeEdicao(usuario, id, uow);
    await uow('tarefas')
        .update('data_conclusao', new Date())
        .where('id', id);
}
exports.concluirTarefa = concluirTarefa;
async function reabrirTarefa(usuario, id, uow) {
    if (usuario === null) {
        throw new erros_1.UsuarioNaoAutenticado();
    }
    await asseguraExistenciaDaTarefaEAcessoDeEdicao(usuario, id, uow);
    await uow('tarefas')
        .update('data_conclusao', null)
        .where('id', id);
}
exports.reabrirTarefa = reabrirTarefa;
async function excluirTarefa(usuario, id, uow) {
    if (usuario === null) {
        throw new erros_1.UsuarioNaoAutenticado();
    }
    await asseguraExistenciaDaTarefaEAcessoDeEdicao(usuario, id, uow);
    await uow('tarefa_etiqueta')
        .delete()
        .where('id_tarefa', id);
    await uow('tarefas')
        .delete()
        .where('id', id);
}
exports.excluirTarefa = excluirTarefa;
async function vincularEtiquetaNaTarefa(usuario, id, etiqueta, uow) {
    if (usuario === null) {
        throw new erros_1.UsuarioNaoAutenticado();
    }
    await asseguraExistenciaDaTarefaEAcessoDeEdicao(usuario, id, uow);
    const idEtiqueta = await (0, model_1.cadastrarEtiquetaSeNecessario)(etiqueta, uow);
    await uow('tarefa_etiqueta')
        .insert({
        id_tarefa: id,
        id_etiqueta: idEtiqueta,
    })
        .onConflict(['id_tarefa', 'id_etiqueta']).ignore();
}
exports.vincularEtiquetaNaTarefa = vincularEtiquetaNaTarefa;
async function desvincularEtiquetaDaTarefa(usuario, id, etiqueta, uow) {
    if (usuario === null) {
        throw new erros_1.UsuarioNaoAutenticado();
    }
    await asseguraExistenciaDaTarefaEAcessoDeEdicao(usuario, id, uow);
    const idEtiqueta = await (0, model_1.buscarIdDaEtiquetaPelaDescricao)(etiqueta, uow);
    await uow('tarefa_etiqueta')
        .delete()
        .where({
        id_tarefa: id,
        id_etiqueta: idEtiqueta,
    });
    await (0, model_1.removerEtiquetaSeObsoleta)(idEtiqueta, uow);
}
exports.desvincularEtiquetaDaTarefa = desvincularEtiquetaDaTarefa;
async function planejarTarefasDoProjeto(descricao, chatbot) {
    return await chatbot.perguntarListaDeFrases({
        contexto: `Tafeito é um sistema de gestão de tarefas (TODO) individual.
      Você é um gerador de tarefas para o Tafeito. Uma tarefa do Tafeito é uma
      simples frase com no máximo 150 caracteres. Entenda a frase do usuário como
      o projeto/objetivo que ele deseja atingir e escreva 1 ou mais tarefas para
      o Tafeito.`,
        entrada: descricao,
    });
}
exports.planejarTarefasDoProjeto = planejarTarefasDoProjeto;
async function sugerirProximaTarefa(usuario, uow, chatbot) {
    const historico = await uow('tarefas')
        .select('descricao')
        .where('id_usuario', usuario.id)
        .orderBy('id', 'desc')
        .limit(10);
    return await chatbot.perguntarFraseUnica({
        contexto: `Tafeito é um sistema de gestão de tarefas (TODO) individual.
      Você é um gerador de tarefas para o Tafeito. Uma tarefa do Tafeito é uma
      simples frase com no máximo 150 caracteres. Você vai sugerir a tarefa que 
      faria mais sentido ser a próxima para este usuário, baseando-se nas seguintes
      tarefas presentes no seu histórico:

      ${historico.map(x => x.descricao).join('\n')}`,
    });
}
exports.sugerirProximaTarefa = sugerirProximaTarefa;
async function estimarTextual(usuario, idTarefa, uow, chatbot) {
    const res = await uow('tarefas')
        .select('id_usuario', 'descricao')
        .where('id', idTarefa)
        .first();
    if (res === undefined) {
        throw new erros_1.DadosOuEstadoInvalido('Tarefa não encontrada', {
            codigo: 'TAREFA_NAO_ENCONTRADA'
        });
    }
    if (!usuario.admin && usuario.id !== res.id_usuario) {
        throw new erros_1.AcessoNegado();
    }
    return await chatbot.perguntarFraseUnica({
        contexto: `Tafeito é um sistema de gestão de tarefas (TODO) individual. Você é um
      estimador de tempo de execução das tarefas do usuário do Tafeito. Sua resposta
      deve ser uma frase simples e única com a quantidade estimada em horas e minutos.
      Você deve estimar quanto tempo o usuário provavelmente vai demorar para
      executar a seguinte tarefa: ${res.descricao}`,
    });
}
exports.estimarTextual = estimarTextual;
async function estimar(usuario, idTarefa, uow, chatbot) {
    const res = await uow('tarefas')
        .select('id_usuario', 'descricao')
        .where('id', idTarefa)
        .first();
    if (res === undefined) {
        throw new erros_1.DadosOuEstadoInvalido('Tarefa não encontrada', {
            codigo: 'TAREFA_NAO_ENCONTRADA'
        });
    }
    if (!usuario.admin && usuario.id !== res.id_usuario) {
        throw new erros_1.AcessoNegado();
    }
    return await chatbot.perguntarDuracaoDeTempo({
        contexto: `Responda a quantidade aproximada de minutos que alguém levaria para executar a seguinte tarefa: ${res.descricao}`
    });
}
exports.estimar = estimar;
async function cadastrarAnexo(usuario, idTarefa, nome, tamanho, mimeType, uow) {
    await asseguraExistenciaDaTarefaEAcessoDeEdicao(usuario, idTarefa, uow);
    const id = (0, uuid_1.v4)();
    await uow('anexos')
        .insert({
        id,
        id_tarefa: idTarefa,
        nome,
        tamanho,
        mime_type: mimeType,
    });
    return id;
}
exports.cadastrarAnexo = cadastrarAnexo;
async function excluirAnexo(usuario, idTarefa, idAnexo, uow) {
    await asseguraExistenciaDaTarefaEAcessoDeEdicao(usuario, idTarefa, uow);
    const res = await uow('anexos')
        .select('id_tarefa')
        .where('id', idAnexo)
        .first();
    if (res === undefined || res.id_tarefa !== idTarefa) {
        throw new erros_1.DadosOuEstadoInvalido('Anexo não encontrado', {
            codigo: 'ANEXO_NAO_ENCONTRADO'
        });
    }
    await uow('anexos')
        .delete()
        .where('id', idAnexo);
}
exports.excluirAnexo = excluirAnexo;
async function consultarAnexoPeloId(usuario, idTarefa, idAnexo, uow) {
    await asseguraExistenciaDaTarefaEAcessoDeEdicao(usuario, idTarefa, uow);
    const res = await uow('anexos')
        .select('id', 'id_tarefa', 'nome', 'tamanho', 'mime_type')
        .where('id', idAnexo)
        .first();
    if (res === undefined || res.id_tarefa !== idTarefa) {
        throw new erros_1.DadosOuEstadoInvalido('Anexo não encontrado', {
            codigo: 'ANEXO_NAO_ENCONTRADO'
        });
    }
    return res;
}
exports.consultarAnexoPeloId = consultarAnexoPeloId;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcessoNegado = exports.AutenticacaoInvalida = exports.UsuarioNaoAutenticado = exports.DadosOuEstadoInvalido = exports.ErroNoProcessamento = void 0;
class ErroNoProcessamento extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
    toJSON() {
        return {
            mensagem: this.message
        };
    }
}
exports.ErroNoProcessamento = ErroNoProcessamento;
class DadosOuEstadoInvalido extends ErroNoProcessamento {
    constructor(descricao, extra) {
        super(descricao, 422);
        this.extra = extra;
    }
    toJSON() {
        return Object.assign(Object.assign({}, super.toJSON()), { extra: this.extra });
    }
}
exports.DadosOuEstadoInvalido = DadosOuEstadoInvalido;
class UsuarioNaoAutenticado extends ErroNoProcessamento {
    constructor() {
        super('Usuário não autenticado.', 401);
    }
}
exports.UsuarioNaoAutenticado = UsuarioNaoAutenticado;
class AutenticacaoInvalida extends ErroNoProcessamento {
    constructor() {
        super('Token inválido.', 401);
    }
}
exports.AutenticacaoInvalida = AutenticacaoInvalida;
class AcessoNegado extends ErroNoProcessamento {
    constructor() {
        super('Acesso ao recurso solicitado foi negado.', 403);
    }
}
exports.AcessoNegado = AcessoNegado;

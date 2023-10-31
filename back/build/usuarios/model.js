"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alterarNome = exports.recuperarUsuarioAutenticado = exports.autenticar = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const erros_1 = require("../shared/erros");
const JWT_SECRET = (() => {
    const env = process.env.JWT_SECRET;
    if (env === undefined || env === '') {
        throw new Error('Env JWT_SECRET não definida.');
    }
    return env;
})();
async function autenticar(login, senha, uow) {
    const usuario = await uow('usuarios')
        .select('senha')
        .where({ login })
        .first();
    if (usuario === undefined || (await senhaInvalida(senha, usuario.senha))) {
        throw new erros_1.DadosOuEstadoInvalido('Login ou senha inválidos', {
            codigo: 'CREDENCIAIS_INVALIDAS'
        });
    }
    return jsonwebtoken_1.default.sign({
        login,
        exp: Math.floor(new Date().getTime() / 1000) + 10 * 24 * 60 * 60 /* 10 dias */
    }, JWT_SECRET);
}
exports.autenticar = autenticar;
async function senhaInvalida(senha, hash) {
    const hashCompativel = await bcrypt_1.default.compare(senha, hash);
    return !hashCompativel;
}
async function recuperarUsuarioAutenticado(token, uow) {
    let login;
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        login = payload.login;
    }
    catch (e) {
        if (!['jwt expired', 'invalid signature'].includes(e.message)) {
            console.warn(e);
        }
        throw new erros_1.AutenticacaoInvalida();
    }
    const usuario = await uow('usuarios')
        .select('id', 'login', 'senha', 'nome', 'admin')
        .where('login', login)
        .first();
    if (usuario === undefined) {
        throw new erros_1.AutenticacaoInvalida();
    }
    return usuario;
}
exports.recuperarUsuarioAutenticado = recuperarUsuarioAutenticado;
async function alterarNome(usuario, novoNome, uow) {
    if (usuario === null) {
        throw new erros_1.UsuarioNaoAutenticado();
    }
    await uow('usuarios')
        .update({ nome: novoNome })
        .where({ id: usuario.id });
}
exports.alterarNome = alterarNome;

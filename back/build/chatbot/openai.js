"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(configuration);
async function perguntar(modeladorDeResposta, opcoesDePergunta) {
    var _a;
    const messages = [
        { role: 'system', content: modeladorDeResposta }
    ];
    if (opcoesDePergunta.contexto) {
        messages.push({
            role: 'system',
            content: opcoesDePergunta.contexto,
        });
    }
    if (opcoesDePergunta.entrada) {
        messages.push({
            role: 'user',
            content: opcoesDePergunta.entrada,
        });
    }
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages,
    });
    const answer = response.data.choices[0];
    const answerContent = (_a = answer.message) === null || _a === void 0 ? void 0 : _a.content;
    if (answerContent === undefined) {
        throw new Error('Não foi possível gerar uma resposta.');
    }
    return answerContent;
}
const chatbot = {
    async perguntarListaDeFrases(opcoesDePergunta) {
        return JSON.parse(await perguntar('A saída deve obrigatoriamente ser um vetor de strings formatado em JSON. Exemplo da saída: ["1. tarefa 1", "2. tarefa 2", "3. tarefa 3"]', opcoesDePergunta));
    },
    async perguntarFraseUnica(opcoesDePergunta) {
        return await perguntar('A saída deve obrigatoriamente ser uma única frase.', opcoesDePergunta);
    },
    async perguntarDuracaoDeTempo(opcoesDePergunta) {
        return JSON.parse(await perguntar('O formato esperado da resposta é um JSON com os atributos horas e minutos da estimativa.', opcoesDePergunta));
    }
};
exports.default = chatbot;

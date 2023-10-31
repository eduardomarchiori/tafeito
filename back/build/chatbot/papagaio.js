"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chatbot = {
    perguntarListaDeFrases: async () => {
        return [
            'Frase 1',
            'Frase 2',
            'Frase 3',
        ];
    },
    perguntarFraseUnica: async () => 'Frase única',
    perguntarDuracaoDeTempo: async () => ({
        horas: 1,
        minutos: 30,
    }),
};
exports.default = chatbot;

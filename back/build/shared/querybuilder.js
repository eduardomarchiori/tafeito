"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const run_mode_1 = __importDefault(require("./run_mode"));
const knex = (0, knex_1.default)({
    client: 'pg',
    connection: `postgres://postgres:postgres@${run_mode_1.default == 'dockerized' ? 'postgres' : '127.0.0.1'}:5432/postgres`,
    debug: true
});
exports.default = knex;

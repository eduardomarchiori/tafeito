"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runMode = process.env.API_RUN_MODE == 'dockerized' ? 'dockerized' : 'other';
exports.default = runMode;

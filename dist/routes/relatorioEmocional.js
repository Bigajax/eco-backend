"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const relatorioEmocionalController_1 = require("../controllers/relatorioEmocionalController");
const router = express_1.default.Router();
router.get('/relatorio-emocional', relatorioEmocionalController_1.relatorioEmocionalHandler);
exports.default = router;
//# sourceMappingURL=relatorioEmocional.js.map
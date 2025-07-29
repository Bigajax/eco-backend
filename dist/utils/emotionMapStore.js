"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEmotionCoordinates = loadEmotionCoordinates;
exports.saveEmotionCoordinates = saveEmotionCoordinates;
exports.generateConsistentPastelColor = generateConsistentPastelColor;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const filePath = path_1.default.join(__dirname, '../data/emotionCoordinates.json');
function loadEmotionCoordinates() {
    try {
        const raw = fs_1.default.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
    }
    catch (err) {
        console.error('⚠️ Erro lendo emotionCoordinates.json', err);
        return {};
    }
}
function saveEmotionCoordinates(data) {
    try {
        fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
    catch (err) {
        console.error('⚠️ Erro escrevendo emotionCoordinates.json', err);
    }
}
/**
 * Gera uma cor pastel consistente com base no nome
 */
function generateConsistentPastelColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 50%, 80%)`;
}
//# sourceMappingURL=emotionMapStore.js.map
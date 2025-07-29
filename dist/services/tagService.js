"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarTagsAutomaticasViaIA = gerarTagsAutomaticasViaIA;
// src/services/tagService.ts
const axios_1 = __importDefault(require("axios"));
async function gerarTagsAutomaticasViaIA(texto) {
    try {
        const prompt = `
Analise o texto abaixo e gere de 2 a 5 palavras-chave (tags) mais relevantes, no formato JSON puro.

Texto:
"""
${texto}
"""

Retorne neste formato JSON puro:

{
  "tags": ["tag1", "tag2", "tag3"]
}
`;
        const { data } = await axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'openai/gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 200,
        }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        const raw = data?.choices?.[0]?.message?.content ?? '';
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) {
            console.warn('⚠️ Nenhum JSON com tags retornado.');
            return [];
        }
        const parsed = JSON.parse(match[0]);
        if (!Array.isArray(parsed.tags))
            return [];
        console.log(`🏷️ Tags automáticas geradas: ${parsed.tags.join(', ')}`);
        return parsed.tags;
    }
    catch (err) {
        console.warn('⚠️ Erro ao gerar tags automáticas:', err.message || err);
        return [];
    }
}
//# sourceMappingURL=tagService.js.map
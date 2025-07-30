"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mixpanel_1 = __importDefault(require("mixpanel"));
const mixpanelInstance = mixpanel_1.default.init(process.env.MIXPANEL_SERVER_TOKEN, {
    protocol: 'https',
});
exports.default = mixpanelInstance;
//# sourceMappingURL=mixpanel.js.map
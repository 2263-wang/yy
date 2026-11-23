// These are the user's defaults, not a general definition of motion graphics.
import {renderPolicy} from './flat-policy.mjs';
export const TEXT_ACTIONS = new Set(['T09','F06','X01','X02','X03','X04','X05','X06','X07','X08']);
export const TEXT_RECIPES = new Set(['R06','R07','R08']);
export function screenPolicy(text='brand-only') {
  if (!['brand-only','product-name','explicit'].includes(text)) throw new Error('text must be brand-only, product-name or explicit; any exception requires a current user request');
  return {
    text,
    textOverrideRequiresCurrentUserRequest: text!=='brand-only',
    approach:'flat-mg-or-purposeful-image-montage-not-slide-layouts',
    rendering:renderPolicy(),
    allowedText:text==='brand-only'?['native-logo-wordmarks']:text==='product-name'?['native-logo-wordmarks','explicitly-requested-real-product-name']:['current-user-request-scope-only'],
    narration:'off',
    ttsForTiming:false,
    note:text==='brand-only'
      ?'成片只允许Logo原生字标；标题、字幕、名单、标签、数值、英文装饰和口号不出现。有内容与节奏组织的图片快切允许，禁止PPT式版式巡览；不朗读文案、不生成配音、不用TTS估时。'
      :text==='product-name'?'仅Logo原生字标与用户本次明确要求的真实产品名称允许；不得扩展到说明、标题、字幕或参数。不朗读、不配音、不用TTS计时。'
      :'仅本次用户明确要求的文字可以启用，范围以用户原文为准；仍不以PPT式版式巡览代替动画，不朗读文案或TTS估时。',
  };
}

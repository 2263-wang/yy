// Current user scope. Tool choice does not reopen synthetic depth.
export const DISABLED_DEPTH_ACTIONS=new Set(['T08']);
export const methodIsFlat=m=>m.rendering==='flat-2d';
export function renderPolicy(){
 return {mode:'flat-2d',synthetic3D:false,css3D:false,
  referenceScope:'flat-mg-photo-montage-graphic-storytelling',
  existingProductImages:'allowed-as-flat-assets-with-their-original-perspective',
  allowedTransforms:['translateXY','uniform-scale','rotateZ','crop','mask','flat-shape-morph','2d-camera'],
  note:'当前只做二维动画／图片蒙太奇；关闭三维建模、材质打光与CSS透视／rotateX/Y／translateZ立体表演。真实照片与官方静态渲染可作平面素材，大画布二维取景仍允许。'};
}
export function flatQuery(query){return `${query} 2D flat motion graphics photo montage -3D -CGI -Blender -Cinema4D -Octane`;}

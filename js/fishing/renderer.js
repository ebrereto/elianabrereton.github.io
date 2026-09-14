import { catches, spriteURL, living } from './catches.js';
const INK = '#304e60', CREAM = '#fff5dc';
const loadImage = src => new Promise((resolve, reject) => {
  const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('a fishing image could not load. please refresh.')); image.src = src;
});
export async function loadArt() {
  const images = await Promise.all(catches.map(item => loadImage(spriteURL(item.id))));
  return { base: await loadImage(spriteURL('dock-base')), sprites: Object.fromEntries(catches.map((item, i) => [item.id, images[i]])) };
}
function rect(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
// Bresenham lines stay on the pixel grid, including during rod animation.
function line(ctx, x0, y0, x1, y1, color, thickness = 1) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1-x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1-y0), sy = y0 < y1 ? 1 : -1;
  let error = dx+dy;
  for (;;) { rect(ctx,x0,y0,thickness,thickness,color); if (x0===x1 && y0===y1) break; const e2=2*error; if(e2>=dy){error+=dy;x0+=sx;} if(e2<=dx){error+=dx;y0+=sy;} }
}
export class Renderer {
  constructor(canvas, aquarium, art) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.aquarium = aquarium; this.aq = aquarium.getContext('2d'); this.art = art;
    this.ctx.imageSmoothingEnabled = this.aq.imageSmoothingEnabled = false;
  }
  dock(game, save, time, reduced) {
    const ctx = this.ctx, state = game.state, t = reduced ? 0 : time;
    ctx.clearRect(0,0,384,216); ctx.drawImage(this.art.base,0,0,384,216);
    if (!reduced) {
      for(let i=0;i<19;i++) {
        const x=(i*53+t*(2+i%3))%384, y=94+(i*11)%65;
        rect(ctx,x,y,3+(i%4),1,Math.sin(t*1.5+i)>.2?'#ade0d3':'#78c7c5');
      }
      const birdX = (time*5+230)%430-20;
      for(let i=0;i<2;i++) { const y=40+i*7+Math.sin(time*2+i)*2; line(ctx,birdX+i*13,y,birdX+3+i*13,y+2,INK); line(ctx,birdX+3+i*13,y+2,birdX+6+i*13,y,INK); }
    }
    let tipX=180,tipY=106,bobX=176,bobY=141+Math.sin(t*3)*.8;
    if (state==='casting') {
      const progress=Math.min(1,game.elapsed/.8);
      tipX=180+Math.sin(progress*Math.PI*2)*18; tipY=106-Math.sin(progress*Math.PI)*25;
      bobX=225-49*progress; bobY=186-45*progress-Math.sin(progress*Math.PI)*75;
    }
    if (state==='bite') bobY=144+(reduced?0:Math.sin(t*17)*2);
    if (state==='reeling') { const q=Math.min(1,game.elapsed/.65); bobX=176+51*q;bobY=141+37*q-Math.sin(q*Math.PI)*29;tipX-=Math.sin(q*Math.PI)*12; }
    const deployed=['casting','waiting','bite','timing','reeling'].includes(state);
    if (deployed) {
      if(state!=='casting' && state!=='reeling') {
        rect(ctx,bobX-9,bobY+5,18,1,'#b4e3d6');rect(ctx,bobX-6,bobY+7,12,1,'#b4e3d6');
        if(state==='waiting'&&game.elapsed<.5 || state==='bite') for(let i=0;i<4;i++) rect(ctx,bobX-12+i*8,bobY-4-Math.sin(t*12+i)*3,2,2,CREAM);
      }
      line(ctx,tipX,tipY,tipX-1,(tipY+bobY)/2,CREAM);line(ctx,tipX-1,(tipY+bobY)/2,bobX,bobY,CREAM);
      rect(ctx,bobX-3,bobY-3,6,7,INK);rect(ctx,bobX-2,bobY-4,4,4,'#ee8d82');rect(ctx,bobX-2,bobY,4,3,CREAM);
    } else { line(ctx,tipX,tipY,tipX-2,128,CREAM);rect(ctx,tipX-4,126,4,4,'#ee8d82');rect(ctx,tipX-4,130,4,3,CREAM); }
    const rodColor={driftwood:'#efc46f','sea-glass':'#62bfb3',ribbon:'#ee8d82'}[save.rod];
    line(ctx,239,216,214,172,INK,4);line(ctx,214,172,tipX+14,tipY+20,INK,3);line(ctx,tipX+14,tipY+20,tipX,tipY,INK,2);
    line(ctx,240,216,215,172,rodColor,2);line(ctx,215,172,tipX+15,tipY+20,rodColor);line(ctx,tipX+15,tipY+20,tipX+1,tipY,rodColor);
    line(ctx,234,202,240,212,CREAM,3);rect(ctx,228,203,5,6,INK);rect(ctx,229,204,3,3,rodColor);
    if(state==='bite') { rect(ctx,172,120,9,14,CREAM);rect(ctx,175,122,3,6,INK);rect(ctx,175,130,3,2,INK); }
    if(state==='caught'&&!reduced&&game.elapsed<1.8) for(let i=0;i<12;i++) {
      const angle=i*Math.PI/6, distance=12+game.elapsed*36;
      rect(ctx,176+Math.cos(angle)*distance,120+Math.sin(angle)*distance+game.elapsed*10,2,2,i%2?'#efc46f':CREAM);
    }
  }
  tank(save,time,reduced) {
    const ctx=this.aq,t=reduced?0:time;
    rect(ctx,0,0,384,180,'#bddfdb');rect(ctx,0,22,384,147,'#78bfbe');rect(ctx,0,85,384,84,'#64adb1');rect(ctx,0,165,384,15,'#dfcea5');
    for(let i=0;i<11;i++) rect(ctx,i*37,9,23,1,'#f0f0d7');
    for(let i=0;i<5;i++) {
      const x=17+i*84;
      for(let j=0;j<5;j++) rect(ctx,x+Math.sin(j+t)*2,164-j*6,3,8,i%2?'#4d9690':'#448582');
      rect(ctx,x-5,163,14,5,'#bcac8b');
    }
    for(let i=0;i<7;i++) {
      const x=30+i*51,y=156-((t*(7+i%3)+i*19)%123);
      rect(ctx,x,y,2,1,'#c5e5dc');rect(ctx,x-1,y+1,1,2,'#c5e5dc');rect(ctx,x+2,y+1,1,2,'#c5e5dc');rect(ctx,x,y+3,2,1,'#c5e5dc');
    }
    const entries=catches.filter(item=>living(item)&&save.collection[item.id]);
    let index=0;
    entries.forEach(item=>{
      const count=Math.min(save.collection[item.id].count,3);
      for(let n=0;n<count;n++) {
        const i=index++,period=660,travel=((t*(7+i%5)+i*71)%period),right=travel<330;
        const x=right?travel:660-travel, y=27+(i*31)%103+(reduced?0:Math.sin(t*1.4+i)*3);
        ctx.save();ctx.translate(Math.round(x+(right?0:32)),Math.round(y));ctx.scale(right?1:-1,1);ctx.drawImage(this.art.sprites[item.id],0,0,32,32);ctx.restore();
      }
    });
  }
}

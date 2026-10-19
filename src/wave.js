// Wave treatment reconstructed from the supplied Uncoded reference.
// Sources and decorative-asset provenance: docs/reference-assets.md.
const fragment = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float u_time, u_seed, u_waveSpeed, u_waveFreqX, u_waveFreqY, u_waveAngle, u_waveAmplitude, u_maskSoftness, u_blendAmount;
uniform int u_colors_length;
uniform vec4 u_colors[4];

#define S(a,b,t) smoothstep(a,b,t)

mat2 Rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

vec2 hash(vec2 p) {
    float s = u_seed;
    vec2 k1 = vec2(2127.1 + s * 13.37, 81.17 + s * 7.31);
    vec2 k2 = vec2(1269.5 + s * 11.13, 283.37 + s * 5.79);
    p = vec2(dot(p, k1), dot(p, k2));
    return fract(sin(p) * (43758.5453 + s * 1.618));
}

float noise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float n = mix(
        mix(dot(-1.0 + 2.0 * hash(i), f),
            dot(-1.0 + 2.0 * hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
        mix(dot(-1.0 + 2.0 * hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
            dot(-1.0 + 2.0 * hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
        u.y
    );
    return 0.5 + 0.5 * n;
}

vec3 getColor(int idx) {
    if (u_colors_length < 1) return vec3(0.0);
    int safeIdx = clamp(idx, 0, u_colors_length - 1);
    return u_colors[safeIdx].rgb;
}

float seedF(float base) {
    return base * (1.0 + 0.5 * sin(u_seed * 3.17 + base));
}

vec2 warpUV(vec2 uv) {
    float t = u_time * u_waveSpeed;

    float angleOffset = sin(u_seed * 2.73) * 30.0;
    mat2 dirRot = Rot(radians(u_waveAngle + angleOffset));
    vec2 ruv = dirRot * uv;

    float fxMod = seedF(u_waveFreqX);
    float fyMod = seedF(u_waveFreqY);

    float phaseX = fract(sin(u_seed * 7.19) * 437.58) * 6.2832;
    float phaseY = fract(cos(u_seed * 3.41) * 291.37) * 6.2832;

    // Core wave with seed-dependent harmonics
    float harmonic = sin(u_seed * 1.23) * 0.5;
    float a = fyMod * ruv.y - sin(ruv.x * fxMod + ruv.y - t + phaseX);
    a += harmonic * sin(ruv.x * fxMod * 2.0 + ruv.y * 0.5 + t * 0.7 + phaseY);

    // Smoothstep mask (unchanged)
    a = smoothstep(
        cos(a) * u_maskSoftness,
        sin(a) * u_maskSoftness + 3.,
        cos(a - fyMod * ruv.y) - sin(a - fxMod * ruv.x)
    );

    a *= u_waveAmplitude;

    uv = cos(a) * uv + sin(a) * vec2(-uv.y, uv.x);
    return uv;
}

void main() {
    vec2 fragCoord = v_uv * u_resolution;
    vec2 uv = fragCoord / u_resolution.xy;
    float ratio = u_resolution.x / u_resolution.y;
    float t = u_time * u_waveSpeed;

    vec2 tuv = uv - 0.5;

    vec2 seedShift = vec2(sin(u_seed * 4.37), cos(u_seed * 5.91)) * 100.0;
    float degree = noise(vec2(t * 0.1, tuv.x * tuv.y) + seedShift);
    tuv.y *= 1.0 / ratio;
    tuv *= Rot(radians((degree - 0.5) * 720.0 + 180.0));
    tuv.y *= ratio;

    // Seed-rotate uv2 before warping
    vec2 uv2 = (fragCoord * 2.0 - u_resolution.xy) / (u_resolution.x + u_resolution.y) * 2.0;
    float preRotAngle = fract(sin(u_seed * 5.63) * 173.29) * 6.2832;
    uv2 *= Rot(preRotAngle);
    vec2 warped = warpUV(uv2) * 0.5 + 0.5;

    vec2 blendUV = mix(tuv, warped - 0.5, u_blendAmount);

    float layerRot1 = -5.0 + sin(u_seed * 1.83) * 20.0;
    float layerRot2 = 10.0 + cos(u_seed * 2.47) * 20.0;

    vec3 c0 = getColor(0);
    vec3 c1 = getColor(1);
    vec3 c2 = getColor(2);
    vec3 c3 = getColor(3);

    vec3 layer1 = mix(c0, c2, S(-0.3, 0.3, (blendUV * Rot(radians(layerRot1))).x));
    vec3 layer2 = mix(c3, c1, S(-0.3, 0.3, (blendUV * Rot(radians(layerRot2))).x));
    vec3 col = mix(layer1, layer2, S(0.3, -0.3, blendUV.y));

    col = mix(col, col * col + 0.5 * sqrt(col), 0.3);

    fragColor = vec4(col, 1.0);
}
`;
const vertex = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main(){v_uv = a_position * 0.5 + 0.5; gl_Position=vec4(a_position,0.0,1.0);}`;
export function initWave(canvas,options={}){
  if(!canvas) return {setPaused(){}};
  let paused=false, visible=true, frame=0, last=0, elapsed=5;
  let gl;
  try { gl=canvas.getContext('webgl2',{alpha:false,antialias:false,powerPreference:'low-power'}); } catch { return initSoftwareWave(canvas,'webgl2-context-error',options); }
  if(!gl) return initSoftwareWave(canvas,'webgl2-unavailable',options);
  function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw new Error(gl.getShaderInfoLog(shader)||'Wave shader unavailable');}return shader;}
  let program;
  try {
    program=gl.createProgram();
    gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));
    gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Wave program link failed');
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const attr=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
    const settings={u_seed:14,u_waveSpeed:options.speed??.6,u_waveFreqX:options.frequency??6,u_waveFreqY:.1,u_waveAngle:options.angle??-78,u_waveAmplitude:1.08,u_maskSoftness:.53,u_blendAmount:.8};
    Object.entries(settings).forEach(([key,value])=>gl.uniform1f(gl.getUniformLocation(program,key),value));
    const palette=options.colors||[[144,210,235],[27,41,56],[38,85,102],[27,41,56]];
    gl.uniform1i(gl.getUniformLocation(program,'u_colors_length'),palette.length);
    gl.uniform4fv(gl.getUniformLocation(program,'u_colors[0]'),new Float32Array(Array.from({length:4},(_,i)=>[...palette[Math.min(i,palette.length-1)].map(x=>x/255),1]).flat()));
  } catch {const replacement=canvas.cloneNode();canvas.replaceWith(replacement);return initSoftwareWave(replacement,'shader-compilation',options);}
  canvas.dataset.renderer='webgl2';
  const time=gl.getUniformLocation(program,'u_time'),resolution=gl.getUniformLocation(program,'u_resolution');
  function draw(){
    const rect=canvas.getBoundingClientRect(),ratio=Math.min(1,1400/rect.width);
    const width=Math.max(1,Math.round(rect.width*ratio)),height=Math.max(1,Math.round(rect.height*ratio));
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
    gl.uniform2f(resolution,width,height);gl.uniform1f(time,elapsed);gl.drawArrays(gl.TRIANGLES,0,6);
    if(gl.getError()===gl.NO_ERROR){canvas.classList.add('ready');canvas.dataset.frame=String(Math.round(elapsed*100));}
  }
  function tick(now){frame=0;if(paused||!visible||document.hidden)return;if(now-last>=33){elapsed+=Math.min((now-last)/1000,.05);draw();last=now;}frame=requestAnimationFrame(tick);}
  function resume(){if(!frame&&!paused&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)resume();else {cancelAnimationFrame(frame);frame=0;} });observer.observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resume();});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();canvas.classList.remove('ready');paused=true;cancelAnimationFrame(frame);});
  window.addEventListener('resize',()=>{if(paused)draw();},{passive:true});
  draw();resume();
  return {setPaused(value){paused=value;if(paused){cancelAnimationFrame(frame);frame=0;}else resume();}};
}

// Same shader equations on Canvas 2D when WebGL is unavailable (e.g. software-only browsers).
// This fallback evolves the wave field; it does not pan a still image.
function initSoftwareWave(canvas,reason,options={}){
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return {setPaused(){}};
  canvas.dataset.renderer='canvas2d';canvas.dataset.fallback=reason;
  const sin=Math.sin,cos=Math.cos,fract=x=>x-Math.floor(x),mix=(a,b,t)=>a+(b-a)*t;
  const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
  const seed=14,rad=Math.PI/180,shiftX=sin(seed*4.37)*100,shiftY=cos(seed*5.91)*100;
  const frequency=options.frequency??6;
  const fx=frequency*(1+.5*sin(seed*3.17+frequency)),fy=.1*(1+.5*sin(seed*3.17+.1));
  const phaseX=fract(sin(seed*7.19)*437.58)*6.2832,phaseY=fract(cos(seed*3.41)*291.37)*6.2832,harmonic=sin(seed*1.23)*.5;
  const angle=((options.angle??-78)+sin(seed*2.73)*30)*rad,ca=cos(angle),sa=sin(angle);
  const pre=fract(sin(seed*5.63)*173.29)*6.2832,cp=cos(pre),sp=sin(pre);
  const r1=(-5+sin(seed*1.83)*20)*rad,c1=cos(r1),s1=sin(r1),r2=(10+cos(seed*2.47)*20)*rad,c2=cos(r2),s2=sin(r2);
  const palette=options.colors||[[144,210,235],[27,41,56],[38,85,102],[27,41,56]];
  const colors=Array.from({length:4},(_,i)=>palette[Math.min(i,palette.length-1)].map(x=>x/255));
  function hash(x,y){return [fract(sin(x*(2127.1+seed*13.37)+y*(81.17+seed*7.31))*(43758.5453+seed*1.618))*2-1,fract(sin(x*(1269.5+seed*11.13)+y*(283.37+seed*5.79))*(43758.5453+seed*1.618))*2-1];}
  // At this scale the noise field spans only a few cells. Cache gradients, not the animation.
  const hashes=new Map();function h(x,y){const key=x+','+y;if(!hashes.has(key))hashes.set(key,hash(x,y));return hashes.get(key);}
  function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),a=h(ix,iy),b=h(ix+1,iy),c=h(ix,iy+1),d=h(ix+1,iy+1);return .5+.5*mix(mix(a[0]*fx+a[1]*fy,b[0]*(fx-1)+b[1]*fy,u),mix(c[0]*fx+c[1]*(fy-1),d[0]*(fx-1)+d[1]*(fy-1),u),v);}
  let frame=0,last=0,elapsed=5,paused=false,visible=true,pixels,coords,ratio=1;
  function resize(){
    const rect=canvas.getBoundingClientRect();ratio=Math.max(.2,rect.width/Math.max(1,rect.height));
    const width=Math.max(80,Math.min(320,Math.round(Math.sqrt(22000*ratio)))),height=Math.max(60,Math.round(width/ratio));
    if(canvas.width===width&&canvas.height===height&&pixels)return;
    canvas.width=width;canvas.height=height;pixels=ctx.createImageData(width,height);coords=new Float32Array(width*height*4);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const i=(y*width+x)*4,u=(x+.5)/width-.5,v=1-(y+.5)/height-.5;
      const xx=u*width*4/(width+height),yy=v*height*4/(width+height);
      coords[i]=u;coords[i+1]=v;coords[i+2]=xx*cp-yy*sp;coords[i+3]=xx*sp+yy*cp;
    }
  }
  function draw(){
    resize();const t=elapsed*(options.speed??(innerWidth<810?.62:.6)),data=pixels.data;hashes.clear();
    for(let i=0;i<data.length;i+=4){
      const u=coords[i],v=coords[i+1],ux=coords[i+2],uy=coords[i+3];
      const degree=(noise(t*.1+shiftX,u*v+shiftY)-.5)*Math.PI*4+Math.PI,c=cos(degree),s=sin(degree);
      const tx=u*c-v/ratio*s,ty=(u*s+v/ratio*c)*ratio;
      const rx=ca*ux+sa*uy,ry=-sa*ux+ca*uy;
      let a=fy*ry-sin(rx*fx+ry-t+phaseX)+harmonic*sin(rx*fx*2+ry*.5+t*.7+phaseY);
      a=smooth(cos(a)*.53,sin(a)*.53+3,cos(a-fy*ry)-sin(a-fx*rx))*1.08;
      const wx=(cos(a)*ux-sin(a)*uy)*.5,wy=(cos(a)*uy+sin(a)*ux)*.5;
      const bx=mix(tx,wx,.8),by=mix(ty,wy,.8),l1=smooth(-.3,.3,bx*c1-by*s1),l2=smooth(-.3,.3,bx*c2-by*s2),blend=smooth(.3,-.3,by);
      for(let k=0;k<3;k++){let col=mix(mix(colors[0][k],colors[2][k],l1),mix(colors[3][k],colors[1][k],l2),blend);col=mix(col,col*col+.5*Math.sqrt(col),.3);data[i+k]=Math.round(col*255);}data[i+3]=255;
    }
    ctx.putImageData(pixels,0,0);canvas.classList.add('ready');canvas.dataset.frame=String(Math.round(elapsed*100));
  }
  function tick(now){frame=0;if(paused||!visible||document.hidden)return;if(now-last>=50){elapsed+=Math.min((now-last)/1000,.1);last=now;draw();}frame=requestAnimationFrame(tick);}
  function resume(){if(!frame&&!paused&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}}
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)resume();else{cancelAnimationFrame(frame);frame=0;}}).observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resume();});
  addEventListener('resize',()=>{if(visible)draw();},{passive:true});draw();resume();
  return {setPaused(value){paused=value;if(paused){cancelAnimationFrame(frame);frame=0;}else resume();}};
}

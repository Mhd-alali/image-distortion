uniform sampler2D uTexture;
varying vec2 vUv;
uniform vec2 uOffset;

vec3 rgbShift(sampler2D texture,vec2 uv,vec2 offset){
    float r = texture2D(texture,uv ).r;
    float g = texture2D(texture,uv + offset).r;
    float b = texture2D(texture,uv + offset).r;
    
    return vec3(r,g,b);
}

void main() {
    vec3 texture = rgbShift(uTexture, vUv,uOffset);
    gl_FragColor = vec4(texture,1.0);
}
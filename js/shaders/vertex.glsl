varying vec2 vUv;
uniform vec2 uOffset;

float PI = 3.141529;

vec3 deformationCurve(vec3 pos,vec2 uv,vec2 offset){
    pos.x += sin(uv.y * PI) * offset.x;
    pos.y += sin(uv.x * PI) * offset.y;

    return pos;
}

void main() {
    vec3 newPosition = deformationCurve(position,uv,uOffset);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    vUv = uv;
}
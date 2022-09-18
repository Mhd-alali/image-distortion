import { Renderer, Vec2, Camera, Transform,Texture, TextureLoader, Program, Mesh, Plane } from 'ogl';

{
    const renderer = new Renderer();
    renderer.alpha = false
    const gl = renderer.gl;
    document.body.appendChild(gl.canvas);

    const camera = new Camera(gl);
    camera.position.z = 5;

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.perspective({
            aspect: gl.canvas.width / gl.canvas.height,
        });
    }
    window.addEventListener('resize', resize, false);
    resize();

    const scene = new Transform();

    const geometry = new Plane(gl);

    const program = new Program(gl, {
        vertex: /* glsl */ `
            attribute vec3 position;

            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;

            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragment: /* glsl */ `
            void main() {
                gl_FragColor = vec4(1.0);
            }
        `,
    });

    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);
    requestAnimationFrame(update);
    function update(t) {
        requestAnimationFrame(update);

        mesh.rotation.y -= 0.04;
        mesh.rotation.x += 0.03;
        renderer.render({ scene, camera });
    }
}
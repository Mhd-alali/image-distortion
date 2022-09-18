import { Renderer, Vec2, Camera, Transform,Texture, TextureLoader, Program, Mesh, Plane } from 'ogl';
import images from './images'


const scrollable = document.querySelector(".scrollable")
let current = 0
let target = 0
let ease = .075

const lerp = (start, end, t) => {
    return start * (1 - t) + end * t
}

function init() {
    document.body.style.height = `${scrollable.getBoundingClientRect().height}px`
}

function smoothScroll() {
    target = window.scrollY
    current = lerp(current, target, ease)
    scrollable.style.transform = `translate3d(0,${-current}px,0)`
}

class Effect {
    constructor() {
        this.container = document.querySelector("main")
        this.images = images
        this.meshes = []
        this.setCamera()
        this.createMeshes()
        this.render()
    }

    get ViewPort() {
        let width = innerWidth
        let height = innerHeight
        let aspectRatio = width / height

        return { width, height, aspectRatio }
    }

    setCamera() {
        addEventListener("resize", this.onWinowResize.bind(this))
        this.scene = new Transform()
        this.renderer = new Renderer()
        this.renderer.alpha = true
        this.renderer.setSize(this.ViewPort.width, this.ViewPort.height)
        this.gl = this.renderer.gl
        this.container.appendChild(this.gl.canvas)

        this.camera = new Camera(this.gl)

        let perspective = 1000 * 2
        const fov = (180 * (2 * Math.atan(innerHeight / 2 / perspective))) / Math.PI

        this.camera.fov = fov
        this.camera.aspect = this.ViewPort.aspectRatio
        this.camera.near = 1
        this.camera.far = perspective
        this.camera.position.set(0, 0, perspective)
    }

    onWinowResize() {
        init()
        this.camera.aspect = this.ViewPort.aspectRatio
        this.camera.updateMatrixWorld()
        this.renderer.setSize(this.ViewPort.width, this.ViewPort.height)
    }

    createMeshes() {
        this.scene = new Transform()
        this.images.forEach(image => {
            const offset = new Vec2(
                image.left - innerWidth / 2 + image.width / 2,
                - image.top + innerHeight / 2 - image.height / 2
            )
            const sizes = new Vec2(image.width,image.height)

            const texture = new Texture(this.gl);
            texture.img = image.img

            const geometry = new Plane(this.gl,{width:1,height:1,widthSegments:32,heightSegemnts:32});

            const program = new Program(this.gl, {
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

            const mesh = new Mesh(this.gl, { geometry, program });

            mesh.position.set(offset.x,offset.y,0)
            mesh.scale.set(sizes.x,sizes.y,0)

            mesh.setParent(this.scene);

            this.meshes.push(mesh)
        })
    }

    render() {
        this.renderer.render({ scene: this.scene, camera: this.camera })
        smoothScroll()
        requestAnimationFrame(this.render.bind(this))
    }
}

init()
new Effect()
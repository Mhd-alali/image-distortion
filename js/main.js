import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

const scrollable = document.querySelector(".scrollable")
let current = 0
let target = 0
let ease = .05

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
        this.images = [...document.querySelectorAll("img")]
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
        this.scene = new THREE.Scene()
        this.renderer = new THREE.WebGL1Renderer({antialias:true,alpha:true})
        this.renderer.setSize(this.ViewPort.width, this.ViewPort.height)
        this.container.appendChild(this.renderer.domElement)

        
        let perspective = 1000 * 2
        const fov = (180 * (2 * Math.atan(innerHeight / 2 / perspective))) / Math.PI
        this.camera = new THREE.PerspectiveCamera(fov,this.ViewPort.aspectRatio,1,perspective * 1.5)

        this.camera.position.set(0, 0, perspective)
    }

    onWinowResize() {
        init()
        this.camera.aspect = innerWidth/innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(innerWidth,innerHeight)
    }

    createMeshes() {
        this.images.forEach(image => {
            let mesh = new MeshItem(image,this.scene)
            this.meshes.push(mesh)
        })
    }

    render() {
        smoothScroll()
        this.meshes.forEach(mesh => {mesh.render()})
        this.renderer.render(this.scene,this.camera)
        requestAnimationFrame(this.render.bind(this))
    }
}

class MeshItem{
    // Pass in the scene as we will be adding meshes to this scene.
    constructor(element, scene){
        this.element = element;
        this.scene = scene;
        this.offset = new THREE.Vector2(0,0); // Positions of mesh on screen. Will be updated below.
        this.sizes = new THREE.Vector2(0,0); //Size of mesh on screen. Will be updated below.
        this.createMesh();
    }

    getDimensions(){
        const {width, height, top, left} = this.element.getBoundingClientRect();
        this.sizes.set(width, height);
        this.offset.set(left - innerWidth / 2 + width / 2, -top + innerHeight / 2 - height / 2); 
    }

    createMesh(){
        this.geometry = new THREE.PlaneGeometry(1,1,100,100);
        this.imageTexture = new THREE.TextureLoader().load(this.element.src);
        this.uniforms = {
            uTexture: {
                //texture data
                value: this.imageTexture
              },
              uOffset: {
                //distortion strength
                value: new THREE.Vector2(0.0, 0.0)
              },
              uAlpha: {
                //opacity
                value: 1.
              }
        };
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
        })
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.getDimensions(); // set offsetand sizes for placement on the scene
        this.mesh.position.set(this.offset.x, this.offset.y, 0);
		this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);
        this.scene.add(this.mesh);
    }

    render(){
        // this function is repeatidly called for each instance in the aboce 
        this.getDimensions();
        this.mesh.position.set(this.offset.x, this.offset.y, 0)
		this.mesh.scale.set(this.sizes.x, this.sizes.y, 1)
        this.uniforms.uOffset.value.set(0,-(target- current) * 0.0002 )
    }
}

init()
new Effect()
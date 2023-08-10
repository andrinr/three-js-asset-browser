import { WebGLRenderer, PerspectiveCamera, Vector2, Scene, OrthographicCamera } from "three";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

export abstract class ThreeAnimation {
    
    static threeAnimations : ThreeAnimation[] = [];

    private lastTime : number = 0;
    private startTime : number = 0;
    public secondsPassed : number = 0;

    public renderer : WebGLRenderer;
    public camera : OrthographicCamera | PerspectiveCamera;
    public canvas : HTMLCanvasElement;
    public wrapper : HTMLElement;
    protected scene : Scene;
    protected controls : OrbitControls;

    protected mouseOnScreen : boolean = false;
    protected mousePosition : Vector2 = new Vector2(0, 0);
    protected portraitMode : boolean = false;
    protected orthographicCamera : boolean = false;

    constructor(canvas : HTMLCanvasElement, wrapper : HTMLElement, orthographicCamera : boolean = false) {
        ThreeAnimation.threeAnimations.push(this);

        this.canvas = canvas;
        this.wrapper = wrapper;
        this.loop = this.loop.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.resize = this.resize.bind(this);
        this.orthographicCamera = orthographicCamera;

        canvas.addEventListener( 'mousedown', this.onMouseDown );
        canvas.addEventListener( 'mousemove', this.onMouseMove );
        canvas.addEventListener( 'mouseup', this.onMouseUp );
        canvas.addEventListener( 'mouseover', this.onMouseOver );
        canvas.addEventListener( 'mouseleave', this.onMouseLeave );

        this.start();
    }

    public abstract init() : void;

    public abstract update(delta : number) : void;

    public abstract onMouseMove(event : MouseEvent) : void;
    public abstract onMouseDown(event : MouseEvent) : void;
    public abstract onMouseUp(event : MouseEvent) : void;

    public onMouseLeave(event: MouseEvent): void {
        this.mouseOnScreen = false;
        return;
    }

    private onMouseOver(event: MouseEvent): void {
        this.mouseOnScreen = true;
        return;
    }

    private start () {
        this.renderer = new WebGLRenderer(
            {
                antialias: true,
                powerPreference: "high-performance",
                canvas: this.canvas as HTMLCanvasElement,
                logarithmicDepthBuffer: false
            }
        );
        this.scene = new Scene();
            
        if (!this.orthographicCamera) {
            this.camera = new PerspectiveCamera( 45, this.wrapper.clientWidth / this.wrapper.clientHeight, 0.001, 1000 );
        }
        else {
            this.camera = new OrthographicCamera(1, 1, 1, 1);
        }
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.init();
        this.startTime = Date.now();
        this.secondsPassed = 0;
        this.resize(this.wrapper);
        this.loop();
    }

    private loop () {
		requestAnimationFrame( this.loop );
        const time : number = performance.now();
        const dt : number = Date.now() - this.lastTime;
		this.lastTime = Date.now();
        this.secondsPassed = (Date.now() - this.startTime) / 1000;
        this.update(dt);
        this.renderer.render( this.scene, this.camera );
    }

    public resize(element : HTMLElement) {
        if (!this.orthographicCamera) 
            (this.camera as PerspectiveCamera).aspect = element.offsetWidth / element.offsetHeight;

        this.camera.updateProjectionMatrix();
        this.renderer.setSize( element.offsetWidth, element.offsetHeight );
        this.portraitMode = element.offsetHeight > element.offsetWidth;
    }
}
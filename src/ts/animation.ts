import { 
    WebGLRenderer, 
    PerspectiveCamera, 
    Vector2, 
    Mesh,
    Color,
    Raycaster,
    Scene, 
    VSMShadowMap,
    sRGBEncoding,
    OrthographicCamera} from "three";
    
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import { setMeshColor } from "./helpers";

export abstract class ThreeAnimation {
    
    static threeAnimations : ThreeAnimation[] = [];

    private lastTime : number = 0;
    private startTime : number = 0;
    private needsUpdate : boolean = false;
    public secondsPassed : number = 0;

    public renderer : WebGLRenderer;
    public camera : OrthographicCamera | PerspectiveCamera;
    public canvas : HTMLCanvasElement;
    public wrapper : HTMLElement;
    public scene : Scene;
    protected controls : OrbitControls;

    protected mouseOnScreen : boolean;
    protected mouseDown : boolean;
    protected click : boolean;
    protected mousePosition : Vector2;

    protected portraitMode : boolean;
    protected orthographicMode : boolean;
    protected orbitMode : boolean;
    protected selectionMode : boolean;
    protected posProcessingMode : boolean;


    constructor(
        orthographicMode : boolean = false,
        orbitMode : boolean = true,
        posProcessingMode : boolean = false) {
        ThreeAnimation.threeAnimations.push(this);

        this.loop = this.loop.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.update = this.update.bind(this);
        this.resize = this.resize.bind(this);

        this.mouseOnScreen = false;
        this.mouseDown = false;
        this.click = false;
        this.mousePosition = new Vector2(0, 0);

        this.orthographicMode = orthographicMode;
        this.orbitMode = orbitMode;
        this.posProcessingMode = posProcessingMode;
    }

    public abstract init() : void;

    public abstract update(delta : number) : void;

    public setElements(canvas : HTMLCanvasElement, wrapper : HTMLElement) : void {
        this.canvas = canvas;
        this.wrapper = wrapper;

        canvas.addEventListener( 'mousemove', this.onMouseMove );
        canvas.addEventListener( 'mousedown', this.onMouseDown );
        canvas.addEventListener( 'mouseup', this.onMouseUp );
        canvas.addEventListener( 'wheel', this.onScroll );
        canvas.addEventListener( 'mouseover', this.onMouseOver );
        canvas.addEventListener( 'mouseleave', this.onMouseLeave );

        this.start();
    }

    private start () {
        this.renderer = new WebGLRenderer(
            {
                antialias: true,
                powerPreference: "high-performance",
                canvas: this.canvas as HTMLCanvasElement,
                logarithmicDepthBuffer: false,
                alpha: true
            }
        );
        this.renderer.setClearColor( 0x000000, 0 );

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = VSMShadowMap; // 
        this.renderer.outputEncoding = sRGBEncoding;
        //this.renderer.toneMapping = ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.40;

        this.scene = new Scene();
            
        if (!this.orthographicMode)
            this.camera = new PerspectiveCamera( 75, this.wrapper.clientWidth / this.wrapper.clientHeight, 1, 10000 );
        else 
            this.camera = new OrthographicCamera( 
                this.wrapper.clientWidth / - 2, 
                this.wrapper.clientWidth / 2, 
                this.wrapper.clientHeight / 2, 
                this.wrapper.clientHeight / - 2, 
                1, 100 );
        
        if (this.orbitMode)
            this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        
        
        this.init();
        this.startTime = Date.now();
        this.secondsPassed = 0;
        this.resize(this.wrapper);
        this.loop();
    }

    private loop () {
		requestAnimationFrame( this.loop );

        const dt : number = Date.now() - this.lastTime;
		this.lastTime = Date.now();
        this.secondsPassed = (Date.now() - this.startTime) / 1000;

        this.needsUpdate = false;
        this.update(dt);
        this.renderer.render( this.scene, this.camera );
        
        this.click = false;
    }

    public onMouseMove(event : MouseEvent) : void {
        this.mousePosition = this.documentToCanvasPosition(new Vector2(event.clientX, event.clientY));

        if (this.mousePosition.x < -1 || 
            this.mousePosition.x > 1 ||
            this.mousePosition.y < -1 ||
            this.mousePosition.y > 1) {
            this.mouseOnScreen = false;
        }
        else {
            this.mouseOnScreen = true;
        }

        this.needsUpdate = true;
    }

    public onMouseDown(event : MouseEvent) : void {
        this.mouseDown = true;
        this.click = true;

        this.needsUpdate = true;
    };

    public onMouseUp(event : MouseEvent) : void {
        this.mouseDown = false;

        this.needsUpdate = true;
    };

    public onScroll(event : WheelEvent) : void {};

    public onMouseLeave(event: MouseEvent): void {
        this.mouseOnScreen = false;

        this.needsUpdate = true;
    }

    private onMouseOver(event: MouseEvent): void {
        this.mouseOnScreen = true;

        this.needsUpdate = true;
    }

    public resize(element : HTMLElement) {

        if (!this.orthographicMode) 
            (this.camera as PerspectiveCamera).aspect = element.offsetWidth / element.offsetHeight;
        else{
            (this.camera as OrthographicCamera).left = element.offsetWidth / - 2;
            (this.camera as OrthographicCamera).right = element.offsetWidth / 2;
            (this.camera as OrthographicCamera).top = element.offsetHeight / 2;
            (this.camera as OrthographicCamera).bottom = element.offsetHeight / - 2;
        }

        this.camera.updateProjectionMatrix();
        this.renderer.setSize( element.offsetWidth, element.offsetHeight );
        this.portraitMode = element.offsetHeight > element.offsetWidth;

        this.needsUpdate = true;
    }

    public documentToCanvasPosition(vec : Vector2) : Vector2 {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = (vec.x - rect.left) / this.canvas.clientWidth * 2 - 1;
        const canvasY = - (vec.y - rect.top) / this.canvas.clientHeight * 2 + 1;

        return new Vector2(canvasX, canvasY);
    }
}
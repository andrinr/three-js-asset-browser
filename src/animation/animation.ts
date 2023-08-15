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
    protected mouseDown : boolean = false;
    protected click : boolean = false;
    protected mousePosition : Vector2 = new Vector2(0, 0);

    protected portraitMode : boolean = false;
    protected orthographicCamera : boolean = false;
    protected useOrbitControls : boolean = false;

    constructor(
        canvas : HTMLCanvasElement,
        wrapper : HTMLElement, 
        orthographicCamera : boolean = false,
        useOrbitControls : boolean = true) {
        ThreeAnimation.threeAnimations.push(this);

        this.canvas = canvas;
        this.wrapper = wrapper;
        this.loop = this.loop.bind(this);

        this.onMouseMove = this.onMouseMove.bind(this);
        canvas.addEventListener( 'mousemove', this.onMouseMove );

        this.onMouseDown = this.onMouseDown.bind(this);
        canvas.addEventListener( 'mousedown', this.onMouseDown );

        this.onMouseUp = this.onMouseUp.bind(this);
        canvas.addEventListener( 'mouseup', this.onMouseUp );

        this.onScroll = this.onScroll.bind(this);
        canvas.addEventListener( 'wheel', this.onScroll );

        this.onMouseOver = this.onMouseOver.bind(this);
        canvas.addEventListener( 'mouseover', this.onMouseOver );

        this.onMouseLeave = this.onMouseLeave.bind(this);
        canvas.addEventListener( 'mouseleave', this.onMouseLeave );

        this.update = this.update.bind(this);

        this.resize = this.resize.bind(this);
        
        this.orthographicCamera = orthographicCamera;
        this.useOrbitControls = useOrbitControls;

        this.mouseOnScreen = false;
        this.mousePosition = new Vector2(0, 0);

        this.start();
    }

    public abstract init() : void;

    public abstract update(delta : number) : void;

    public onMouseMove(event : MouseEvent) : void {
        const rect = this.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		this.mousePosition.x = ( x / this.canvas.clientWidth ) * 2 - 1;
        this.mousePosition.y = - ( y / this.canvas.clientHeight ) * 2 + 1;
    }

    public onMouseDown(event : MouseEvent) : void {
        this.mouseDown = true;
        this.click = true;
    };

    public onMouseUp(event : MouseEvent) : void {
        this.mouseDown = false;
    };

    public onScroll(event : WheelEvent) : void {};

    public onMouseLeave(event: MouseEvent): void {
        this.mouseOnScreen = false;
    }

    private onMouseOver(event: MouseEvent): void {
        this.mouseOnScreen = true;
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
        this.scene = new Scene();
            
        if (!this.orthographicCamera)
            this.camera = new PerspectiveCamera( 45, this.wrapper.clientWidth / this.wrapper.clientHeight, 1, 100 );
        else 
            this.camera = new OrthographicCamera( 
                this.wrapper.clientWidth / - 2, 
                this.wrapper.clientWidth / 2, 
                this.wrapper.clientHeight / 2, 
                this.wrapper.clientHeight / - 2, 
                1, 100 );
        
        if (this.useOrbitControls)
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

        //if (this.useOrbitControls)
            //this.controls.update();

        this.update(dt);

        this.click = false;

        this.renderer.render( this.scene, this.camera );
    }

    public resize(element : HTMLElement) {

        if (!this.orthographicCamera) 
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
    }
}
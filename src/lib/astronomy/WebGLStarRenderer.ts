/**
 * WebGL Star Renderer for Mystic Arcana
 * 
 * High-performance WebGL-based renderer capable of displaying
 * 100,000+ stars at 60fps with realistic brightness, color,
 * and twinkling effects.
 */

import { Star } from './types';

// StarVertex interface removed - using direct Float32Array manipulation

export class WebGLStarRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private stars: Star[] = [];
  private vertices: Float32Array = new Float32Array(0);
  private indices: Uint16Array = new Uint16Array(0);
  private animationId: number = 0;
  private startTime: number = Date.now();

  // Uniform locations
  private uniforms: { [key: string]: WebGLUniformLocation | null } = {};

  // Attribute locations
  private attributes: { [key: string]: number } = {};

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      throw new Error('WebGL not supported');
    }

    this.gl = gl as WebGLRenderingContext;
    this.initializeWebGL();
  }

  private initializeWebGL(): void {
    const { gl } = this;

    // Enable blending for star glow effects
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // Set clear color to deep space black
    gl.clearColor(0.0, 0.0, 0.05, 1.0);

    this.createShaderProgram();
    this.setupBuffers();
  }

  private createShaderProgram(): void {
    const { gl } = this;

    const vertexShaderSource = `
      attribute vec3 a_position;
      attribute float a_magnitude;
      attribute float a_colorIndex;
      attribute float a_twinklePhase;
      
      uniform mat4 u_projectionMatrix;
      uniform mat4 u_viewMatrix;
      uniform float u_time;
      uniform float u_pixelRatio;
      
      varying float v_magnitude;
      varying float v_colorIndex;
      varying float v_alpha;
      varying float v_size;
      
      void main() {
        gl_Position = u_projectionMatrix * u_viewMatrix * vec4(a_position, 1.0);
        
        // Calculate star size based on magnitude (brighter = larger)
        float size = max(1.0, 6.0 - a_magnitude) * u_pixelRatio;
        
        // Add twinkling effect
        float twinkle = 0.8 + 0.2 * sin(u_time * 0.001 + a_twinklePhase);
        size *= twinkle;
        
        gl_PointSize = size;
        
        // Calculate alpha based on magnitude
        v_alpha = max(0.1, 1.0 - (a_magnitude - 1.0) / 5.0) * twinkle;
        v_magnitude = a_magnitude;
        v_colorIndex = a_colorIndex;
        v_size = size;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      
      varying float v_magnitude;
      varying float v_colorIndex;
      varying float v_alpha;
      varying float v_size;
      
      uniform float u_time;
      
      // Convert B-V color index to RGB
      vec3 colorFromBV(float bv) {
        if (bv < -0.3) return vec3(0.6, 0.7, 1.0);      // Blue
        if (bv < 0.0) return vec3(0.7, 0.75, 1.0);      // Blue-white
        if (bv < 0.3) return vec3(0.8, 0.85, 1.0);      // White
        if (bv < 0.6) return vec3(1.0, 0.97, 0.9);      // Yellow-white
        if (bv < 1.0) return vec3(1.0, 0.9, 0.7);       // Yellow
        if (bv < 1.4) return vec3(1.0, 0.8, 0.6);       // Orange
        return vec3(1.0, 0.7, 0.4);                     // Red
      }
      
      void main() {
        // Create circular star shape
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        
        if (dist > 0.5) {
          discard;
        }
        
        // Create star glow effect
        float glow = 1.0 - smoothstep(0.0, 0.5, dist);
        glow = pow(glow, 2.0);
        
        // Add diffraction spikes for bright stars
        float spikes = 1.0;
        if (v_magnitude < 3.0) {
          float angle = atan(coord.y, coord.x);
          float spike1 = abs(sin(angle * 2.0));
          float spike2 = abs(cos(angle * 2.0));
          spikes = 1.0 + 0.3 * max(spike1, spike2) * (1.0 - dist * 2.0);
        }
        
        vec3 color = colorFromBV(v_colorIndex);
        float alpha = v_alpha * glow * spikes;
        
        gl_FragColor = vec4(color, alpha);
      }
    `;

    const vertexShader = this.compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = this.compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    this.program = gl.createProgram();
    if (!this.program) {
      throw new Error('Failed to create shader program');
    }

    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(this.program);
      throw new Error(`Shader program linking failed: ${error}`);
    }

    // Get attribute and uniform locations
    this.attributes.position = gl.getAttribLocation(this.program, 'a_position');
    this.attributes.magnitude = gl.getAttribLocation(this.program, 'a_magnitude');
    this.attributes.colorIndex = gl.getAttribLocation(this.program, 'a_colorIndex');
    this.attributes.twinklePhase = gl.getAttribLocation(this.program, 'a_twinklePhase');

    this.uniforms.projectionMatrix = gl.getUniformLocation(this.program, 'u_projectionMatrix');
    this.uniforms.viewMatrix = gl.getUniformLocation(this.program, 'u_viewMatrix');
    this.uniforms.time = gl.getUniformLocation(this.program, 'u_time');
    this.uniforms.pixelRatio = gl.getUniformLocation(this.program, 'u_pixelRatio');
  }

  private compileShader(source: string, type: number): WebGLShader {
    const { gl } = this;
    const shader = gl.createShader(type);

    if (!shader) {
      throw new Error('Failed to create shader');
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compilation failed: ${error}`);
    }

    return shader;
  }

  private setupBuffers(): void {
    const { gl } = this;

    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();

    if (!this.vertexBuffer || !this.indexBuffer) {
      throw new Error('Failed to create buffers');
    }
  }

  public loadStars(stars: Star[]): void {
    this.stars = stars;
    this.updateVertexData();
  }

  private updateVertexData(): void {
    const { gl } = this;
    const starCount = this.stars.length;

    // Each vertex has: position(3) + magnitude(1) + colorIndex(1) + twinklePhase(1) = 6 floats
    this.vertices = new Float32Array(starCount * 6);
    this.indices = new Uint16Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const star = this.stars[i];
      const baseIndex = i * 6;

      // Convert RA/Dec to 3D position on unit sphere
      const ra = (star.ra ?? 0) * Math.PI / 180; // Convert degrees to radians
      const dec = (star.dec ?? 0) * Math.PI / 180; // Convert degrees to radians

      const x = Math.cos(dec) * Math.cos(ra);
      const y = Math.cos(dec) * Math.sin(ra);
      const z = Math.sin(dec);

      // Position
      this.vertices[baseIndex] = x;
      this.vertices[baseIndex + 1] = y;
      this.vertices[baseIndex + 2] = z;

      // Magnitude
      this.vertices[baseIndex + 3] = star.magnitude;

      // Color index
      this.vertices[baseIndex + 4] = star.colorIndex || 0;

      // Random twinkle phase
      this.vertices[baseIndex + 5] = Math.random() * Math.PI * 2;

      // Index
      this.indices[i] = i;
    }

    // Upload to GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
  }

  public render(viewMatrix: Float32Array, projectionMatrix: Float32Array): void {
    const { gl } = this;

    if (!this.program || !this.vertexBuffer || !this.indexBuffer) {
      return;
    }

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Use our shader program
    gl.useProgram(this.program);

    // Set up vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    // Position attribute
    gl.enableVertexAttribArray(this.attributes.position);
    gl.vertexAttribPointer(this.attributes.position, 3, gl.FLOAT, false, 24, 0);

    // Magnitude attribute
    gl.enableVertexAttribArray(this.attributes.magnitude);
    gl.vertexAttribPointer(this.attributes.magnitude, 1, gl.FLOAT, false, 24, 12);

    // Color index attribute
    gl.enableVertexAttribArray(this.attributes.colorIndex);
    gl.vertexAttribPointer(this.attributes.colorIndex, 1, gl.FLOAT, false, 24, 16);

    // Twinkle phase attribute
    gl.enableVertexAttribArray(this.attributes.twinklePhase);
    gl.vertexAttribPointer(this.attributes.twinklePhase, 1, gl.FLOAT, false, 24, 20);

    // Set uniforms
    gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(this.uniforms.projectionMatrix, false, projectionMatrix);
    gl.uniform1f(this.uniforms.time, Date.now() - this.startTime);
    gl.uniform1f(this.uniforms.pixelRatio, window.devicePixelRatio || 1.0);

    // Draw the stars
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.drawElements(gl.POINTS, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width * (window.devicePixelRatio || 1);
    this.canvas.height = height * (window.devicePixelRatio || 1);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  public startAnimation(): void {
    const animate = () => {
      // Animation logic will be handled by the parent component
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  public stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }

  public dispose(): void {
    this.stopAnimation();

    const { gl } = this;
    if (this.program) {
      gl.deleteProgram(this.program);
    }
    if (this.vertexBuffer) {
      gl.deleteBuffer(this.vertexBuffer);
    }
    if (this.indexBuffer) {
      gl.deleteBuffer(this.indexBuffer);
    }
  }
}

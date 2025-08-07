"use client";

import React, { useRef, useEffect, useState } from "react";
export default function SimpleStarsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      setStatus("Getting WebGL context...");

      // Get WebGL2 context
      const gl = canvas.getContext("webgl2");
      if (!gl) {
        setStatus("❌ WebGL2 not supported");
        return;
      }
      setStatus("✅ WebGL2 context created");
      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
      setStatus(`✅ Canvas sized: ${canvas.width}x${canvas.height}`);
      // Simple vertex shader
      const vertexShaderSource = `#version 300 es
        precision highp float;
        in vec2 a_position;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
          gl_PointSize = 3.0;
        }
      `;
      // Simple fragment shader
      const fragmentShaderSource = `#version 300 es
        precision highp float;
        out vec4 fragColor;
        void main() {
          fragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
      `;
      // Compile shaders
      const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
      gl.shaderSource(vertexShader, vertexShaderSource);
      gl.compileShader(vertexShader);
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        setStatus(
          `❌ Vertex shader error: ${gl.getShaderInfoLog(vertexShader)}`,
        );
        return;
      }
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(fragmentShader, fragmentShaderSource);
      gl.compileShader(fragmentShader);
      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        setStatus(
          `❌ Fragment shader error: ${gl.getShaderInfoLog(fragmentShader)}`,
        );
        return;
      }
      // Create program
      const program = gl.createProgram()!;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        setStatus(`❌ Program link error: ${gl.getProgramInfoLog(program)}`);
        return;
      }
      setStatus("✅ Shaders compiled and linked");
      // Create some test star positions
      const starPositions = new Float32Array([
        0.0,
        0.0, // Center
        0.5,
        0.5, // Top right
        -0.5,
        0.5, // Top left
        0.5,
        -0.5, // Bottom right
        -0.5,
        -0.5, // Bottom left
        0.0,
        0.8, // Top center
        0.0,
        -0.8, // Bottom center
        0.8,
        0.0, // Right center
        -0.8,
        0.0, // Left center
      ]);
      // Create buffer
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, starPositions, gl.STATIC_DRAW);
      setStatus(`✅ Created ${starPositions.length / 2} test stars`);
      // Set up rendering
      gl.clearColor(0.0, 0.0, 0.1, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      // Set up vertex attribute
      const positionLocation = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      // Draw the stars
      gl.drawArrays(gl.POINTS, 0, starPositions.length / 2);
      setStatus(`✅ Rendered ${starPositions.length / 2} stars successfully!`);
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
      console.error("WebGL Error:", error);
    }
  }, []);
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "#000",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "white",
          fontFamily: "monospace",
          fontSize: "14px",
          background: "rgba(0,0,0,0.7)",
          padding: "10px",
          borderRadius: "5px",
          zIndex: 10,
          maxWidth: "400px",
        }}
      >
        <h2>🌟 Simple WebGL Star Test</h2>
        <p>
          <strong>Status:</strong> {status}
        </p>
        <p>This should show 9 white dots if WebGL is working.</p>
      </div>
    </div>
  );
}

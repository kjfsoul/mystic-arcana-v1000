#!/usr/bin/env node

/**
 * MCP Design Server
 * Specialized MCP server for design elements, UI components, and development tasks
 */

const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Design system data
const designSystem = {
  colors: {
    primary: {
      mystic: "#6B46C1",
      cosmic: "#8B5CF6",
      ethereal: "#A78BFA",
      celestial: "#C4B5FD",
    },
    secondary: {
      gold: "#F59E0B",
      silver: "#6B7280",
      copper: "#D97706",
    },
    backgrounds: {
      dark: "#0F0F23",
      midnight: "#1E1B4B",
      space: "#312E81",
    },
  },
  typography: {
    fonts: {
      heading: "Cinzel, serif",
      body: "Inter, sans-serif",
      mystical: "Uncial Antiqua, cursive",
    },
    sizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
  },
  components: {
    tarotCard: {
      width: "280px",
      height: "480px",
      borderRadius: "12px",
      shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      animation: "hover:scale-105 transition-transform duration-300",
    },
    cosmicButton: {
      background: "linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%)",
      padding: "12px 24px",
      borderRadius: "8px",
      color: "white",
      fontWeight: "600",
    },
  },
};

// UI component templates
const componentTemplates = {
  tarotCard: `
<div className="tarot-card group cursor-pointer transform transition-all duration-300 hover:scale-105">
  <div className="relative w-70 h-120 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl shadow-2xl overflow-hidden">
    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
    <div className="relative z-10 p-6 h-full flex flex-col">
      <div className="text-center mb-4">
        <h3 className="text-gold text-lg font-cinzel">{cardName}</h3>
        <p className="text-purple-200 text-sm">{cardSuit}</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <img src="{cardImage}" alt="{cardName}" className="max-w-full max-h-full object-contain" />
      </div>
      <div className="text-center mt-4">
        <p className="text-purple-100 text-sm">{cardMeaning}</p>
      </div>
    </div>
  </div>
</div>`,

  cosmicButton: `
<button className="cosmic-button relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95">
  <span className="relative z-10">{buttonText}</span>
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transform -skew-x-12 -translate-x-full hover:translate-x-full transition-all duration-700"></div>
</button>`,

  astrologyChart: `
<div className="astrology-chart relative w-96 h-96 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-full shadow-2xl">
  <div className="absolute inset-4 border-2 border-gold rounded-full">
    <div className="absolute inset-4 border border-purple-300 rounded-full">
      <div className="absolute inset-8 bg-gradient-to-br from-purple-800 to-indigo-800 rounded-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-gold text-xl font-cinzel">{chartTitle}</h3>
          <p className="text-purple-200">{birthDate}</p>
        </div>
      </div>
    </div>
  </div>
  {/* Zodiac signs around the circle */}
  <div className="absolute inset-0">
    {zodiacSigns.map((sign, index) => (
      <div key={sign} className="absolute text-gold text-sm font-semibold" style={{
        transform: \`rotate(\${index * 30}deg) translateY(-180px) rotate(-\${index * 30}deg)\`,
        transformOrigin: '50% 180px'
      }}>
        {sign}
      </div>
    ))}
  </div>
</div>`,
};

// Design endpoints
app.post("/design/colors", async (req, res) => {
  try {
    const { category } = req.body;
    const colors = category
      ? designSystem.colors[category]
      : designSystem.colors;
    res.json({ success: true, colors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/design/typography", async (req, res) => {
  try {
    const { type } = req.body;
    const typography = type
      ? designSystem.typography[type]
      : designSystem.typography;
    res.json({ success: true, typography });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/design/component", async (req, res) => {
  try {
    const { name, props = {} } = req.body;

    if (!componentTemplates[name]) {
      return res
        .status(404)
        .json({ success: false, error: `Component ${name} not found` });
    }

    let template = componentTemplates[name];

    // Replace template variables
    Object.entries(props).forEach(([key, value]) => {
      template = template.replace(new RegExp(`{${key}}`, "g"), value);
    });

    res.json({ success: true, component: template, props });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/design/generate-css", async (req, res) => {
  try {
    const { component, customizations = {} } = req.body;

    const baseCss = {
      tarotCard: `
.tarot-card {
  width: ${customizations.width || "280px"};
  height: ${customizations.height || "480px"};
  background: ${
    customizations.background ||
    "linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%)"
  };
  border-radius: ${customizations.borderRadius || "12px"};
  box-shadow: ${customizations.shadow || "0 20px 25px -5px rgba(0, 0, 0, 0.1)"};
  transition: transform 0.3s ease;
}
.tarot-card:hover {
  transform: scale(1.05);
}`,

      cosmicButton: `
.cosmic-button {
  background: ${
    customizations.background ||
    "linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%)"
  };
  padding: ${customizations.padding || "12px 24px"};
  border-radius: ${customizations.borderRadius || "8px"};
  color: ${customizations.color || "white"};
  font-weight: ${customizations.fontWeight || "600"};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.cosmic-button:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(107, 70, 193, 0.3);
}`,
    };

    const css = baseCss[component];
    if (!css) {
      return res
        .status(404)
        .json({ success: false, error: `CSS for ${component} not found` });
    }

    res.json({ success: true, css });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Development task endpoints
app.post("/dev/create-component", async (req, res) => {
  try {
    const { name, type, props = {} } = req.body;

    const componentCode = `
import React from 'react';
import styles from './${name}.module.css';

interface ${name}Props {
${Object.entries(props)
  .map(([key, value]) => `  ${key}: ${typeof value};`)
  .join("\n")}
}

const ${name}: React.FC<${name}Props> = ({ ${Object.keys(props).join(
      ", "
    )} }) => {
  return (
    <div className={styles.${name.toLowerCase()}}>
      {/* Component content */}
    </div>
  );
};

export default ${name};
`;

    const cssCode = `
.${name.toLowerCase()} {
  /* Add your styles here */
}
`;

    res.json({
      success: true,
      files: {
        component: componentCode,
        styles: cssCode,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/dev/analyze-project", async (req, res) => {
  try {
    const { path: projectPath = "." } = req.body;

    // Analyze project structure
    const srcPath = path.join(projectPath, "src");
    const analysis = {
      components: [],
      pages: [],
      styles: [],
      assets: [],
    };

    try {
      const srcContents = await fs.readdir(srcPath, { withFileTypes: true });

      for (const item of srcContents) {
        if (item.isDirectory()) {
          const dirPath = path.join(srcPath, item.name);
          const files = await fs.readdir(dirPath);

          switch (item.name) {
            case "components":
              analysis.components = files.filter(
                (f) => f.endsWith(".tsx") || f.endsWith(".jsx")
              );
              break;
            case "app":
            case "pages":
              analysis.pages = files.filter(
                (f) => f.endsWith(".tsx") || f.endsWith(".jsx")
              );
              break;
            case "styles":
              analysis.styles = files.filter(
                (f) => f.endsWith(".css") || f.endsWith(".scss")
              );
              break;
          }
        }
      }
    } catch (error) {
      // If src doesn't exist or can't be read
    }

    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "mcp-design-server",
    timestamp: new Date().toISOString(),
    capabilities: [
      "design-system",
      "component-generation",
      "development-tasks",
    ],
  });
});

// API documentation
app.get("/", (req, res) => {
  res.json({
    name: "MCP Design Server",
    version: "1.0.0",
    description:
      "Specialized MCP server for design elements and development tasks",
    endpoints: {
      design: [
        "POST /design/colors - Get design system colors",
        "POST /design/typography - Get typography settings",
        "POST /design/component - Generate component template",
        "POST /design/generate-css - Generate CSS for components",
      ],
      development: [
        "POST /dev/create-component - Create React component",
        "POST /dev/analyze-project - Analyze project structure",
      ],
      system: ["GET /health - Health check", "GET / - This documentation"],
    },
    examples: {
      getColors: {
        url: "POST /design/colors",
        body: { category: "primary" },
      },
      generateComponent: {
        url: "POST /design/component",
        body: {
          name: "tarotCard",
          props: {
            cardName: "The Fool",
            cardSuit: "Major Arcana",
            cardMeaning: "New beginnings",
          },
        },
      },
      createComponent: {
        url: "POST /dev/create-component",
        body: {
          name: "CosmicButton",
          type: "button",
          props: { text: "string", onClick: "function" },
        },
      },
    },
  });
});

const port = process.env.PORT || 3001;
app.listen(port, "0.0.0.0", () => {
  console.log(`🎨 MCP Design Server running on port ${port}`);
  console.log(`📋 API Documentation: http://localhost:${port}/`);
  console.log(`❤️  Health Check: http://localhost:${port}/health`);
  console.log(
    `🎯 Capabilities: design-system, component-generation, development-tasks`
  );
});

module.exports = app;

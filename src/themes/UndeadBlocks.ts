// src/themes/UndeadBlocks.ts
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: true,
};

const UndeadBlocks = extendTheme({
  config,

  /* =========================
   * TOKENS DE COLOR
   * ========================= */
  colors: {
    brand: { 500: "#DF1E33" },        // Primary
    secondary: { 500: "#111114" },    // Dark surface
    tertiary: { 500: "#FFFFFF" },     // White
    quaternary: { 500: "#BFBFBF" },   // Gray light
    quinary: { 500: "#888888" },      // Gray mid
  },
  semanticTokens: {
    colors: {
      primary:   { default: "brand.500" },
      onPrimary: { default: "white" },
      surface:   { default: "secondary.500" },
      text:      { default: "tertiary.500" },
      subtle:    { default: "quinary.500" },
    },
  },

  /* =========================
   * GRADIENTES REUSABLES
   * ========================= */
  layerStyles: {
    // Rojo "glass"
    gradientRed: {
      bgGradient:
        "radial-gradient(531.76% 50% at 50% 50%, rgba(223,30,51,0.70) 0%, rgba(169,23,39,0.70) 62.02%, rgba(86,0,0,0.70) 100%)",
    },
    // Gris/steel
    gradientGray: {
      bgGradient:
        "radial-gradient(196.62% 50% at 50% 50%, rgba(191,191,191,0.27) 0%, rgba(104,104,106,0.35) 69.53%, rgba(17,17,20,0.40) 100%)",
    },
  },

  /* =========================
   * COMPONENTS
   * ========================= */
  components: {
    Button: {
      baseStyle: {
        fontWeight: 700,
        letterSpacing: "0.02em",
        position: "relative",
        _focusVisible: { boxShadow: "0 0 0 2px rgba(147,112,255,0.8)" }, // outline accesible
      },
      sizes: {
        // Botón 1 (CTA)
        cta:  { h: "36px", px: "20px", minW: "180px" },
        // Botón 2 (Attributes)
        attr: { h: "30px", px: "20px", minW: "200px" },
      },
      variants: {
        /* --------------------------------------------------
         * BOTÓN 1 — CTA (UN SOLO VARIANT, 3 ESTADOS)
         * default: textura roja profunda
         * hover:   más brillo (resalta)
         * active:  rojo más claro + borde menos intenso
         * -------------------------------------------------- */
        cta: {
          borderRadius: "10px",
          color: "white",
          // Usá tu textura; si no la tenés aún, funciona igual
          bgImage: "url('/textures/cta-red.png')",
          bgSize: "cover",
          bgPos: "50% 50%",
          bgRepeat: "no-repeat",

          border: "1px solid rgba(223,30,51,0.75)",   // #DF1E33 75%
          boxShadow: "0 4px 4px rgba(0,0,0,0.50)",     // sombra marcada
          transition:
            "filter .15s ease, background-image .15s ease, border-color .15s ease, transform .05s ease, box-shadow .15s ease",

          // HOVER: resalta (look intermedio de tu imagen)
          _hover: {
            filter: "brightness(1.06)",
            borderColor: "rgba(223,30,51,0.75)",
            boxShadow: "0 6px 8px rgba(0,0,0,0.45)",
          },

          // ACTIVE: tono más claro, borde menos intenso
          _active: {
            transform: "translateY(1px)",
            filter: "brightness(1.12)",               // sube brillo (tu click es más claro)
            borderColor: "rgba(223,30,51,0.42)",      // 42% como en Figma
            boxShadow: "0 4px 4px rgba(0,0,0,0.25)",
            textShadow: "0 1px 2px rgba(0,0,0,0.50)",
          },
        },

        /* --------------------------------------------------
         * BOTÓN 2 — ATTRIBUTES (UN SOLO VARIANT, 3 ESTADOS)
         * default: steel (gris)
         * hover:   rojo "glass" (gradient-red)
         * active:  rojo sólido + borde 2px
         * -------------------------------------------------- */
        attributes: {
          borderRadius: "8px",
          color: "white",
          textTransform: "uppercase",
          fontSize: "12px",
          transition:
            "filter .15s ease, background-image .15s ease, border-color .15s ease, border-width .15s ease, transform .05s ease",

          // DEFAULT (steel/negro)
          bgGradient:
            "radial-gradient(196.62% 50% at 50% 50%, rgba(191,191,191,0.27) 0%, rgba(104,104,106,0.35) 69.53%, rgba(17,17,20,0.40) 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 4px 4px rgba(0,0,0,0.25)",

          // HOVER (red glass)
          _hover: {
            bgGradient:
              "radial-gradient(531.76% 50% at 50% 50%, rgba(223,30,51,0.70) 0%, rgba(169,23,39,0.70) 62.02%, rgba(86,0,0,0.70) 100%)",
            borderColor: "#DF1E33",
            filter: "brightness(1.03)",
          },

          // ACTIVE (rojo sólido + borde 2px)
          _active: {
            transform: "translateY(1px)",
            filter: "brightness(0.98)",
            bg: "brand.500",             // #DF1E33 sólido
            borderWidth: "2px",
            borderColor: "#DF1E33",
          },
        },
      },

      // Defaults globales (cámbialos si querés)
      defaultProps: { variant: "cta", size: "cta" },
    },
  },

  /* =========================
   * ESTILO GLOBAL (fondo oscuro)
   * ========================= */
  styles: {
    global: {
      "html, body": {
        bg: "surface",
        color: "text",
      },
    },
  },

  // (Opcional) usar Chakra Petch global
  // fonts: { heading: "'Chakra Petch', sans-serif", body: "'Chakra Petch', sans-serif" },
});

export default UndeadBlocks;


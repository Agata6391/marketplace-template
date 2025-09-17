// src/themes/UndeadBlocks.ts
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { BiBorderRadius } from "react-icons/bi";

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
   * LAYER STYLES REUSABLES
   * ========================= */
  layerStyles: {
    gradientRed: {
      bgGradient:
        "radial-gradient(531.76% 50% at 50% 50%, rgba(223,30,51,0.70) 0%, rgba(169,23,39,0.70) 62.02%, rgba(86,0,0,0.70) 100%)",
    },
    gradientGray: {
      bgGradient:
        "radial-gradient(196.62% 50% at 50% 50%, rgba(191,191,191,0.27) 0%, rgba(104,104,106,0.35) 69.53%, rgba(17,17,20,0.40) 100%)",
    },
    cardsGrid: {
      display: "flex",
      alignItems: "center",
      gap: "24px",
      alignSelf: "stretch",
      flexWrap: "wrap",
    },
    itemImage: {
      w: "full",
      h: "200px",
      borderRadius: "12px",
      overflow: "hidden",
      bgSize: "contain, cover",
      bgPos: "50% 50%, 50% 50%",
      bgRepeat: "no-repeat, no-repeat",
      boxShadow: "0 4px 4px rgba(0,0,0,0.25)",
    },
    itemSummary: {
      w: "204px",
      px: "16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "4px",
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
        _focusVisible: { boxShadow: "0 0 0 2px rgba(147,112,255,0.8)" },
      },
      sizes: {
        cta:  { h: "36px", px: "20px", minW: "180px" },
        attr: { h: "30px", px: "20px", minW: "200px" },
      },
      variants: {
        // Botón 1 — CTA (un solo variant, 3 estados)
        cta: {
          borderRadius: "0px",
          color: "white",
          bgImage: "url('/textures/cta-red.png')",
          bgSize: "cover",
          bgPos: "50% 50%",
          bgRepeat: "no-repeat",
          border: "1px solid rgba(223,30,51,0.75)",
          boxShadow: "0 4px 4px rgba(0,0,0,0.50)",
          transition:
            "filter .15s ease, background-image .15s ease, border-color .15s ease, transform .05s ease, box-shadow .15s ease",
          _hover: {
            filter: "brightness(1.06)",
            borderColor: "rgba(223,30,51,0.75)",
            boxShadow: "0 6px 8px rgba(0,0,0,0.45)",
          },
          _active: {
            transform: "translateY(1px)",
            filter: "brightness(1.12)",
            borderColor: "rgba(223,30,51,0.42)",
            boxShadow: "0 4px 4px rgba(0,0,0,0.25)",
            textShadow: "0 1px 2px rgba(0,0,0,0.50)",
          },
        },

        // Botón 2 — Attributes (un solo variant, 3 estados)
        attributes: {
          borderRadius: "8px",
          color: "white",
          textTransform: "uppercase",
          fontSize: "12px",
          BorderRadius:"0",
          transition:
            "filter .15s ease, background-image .15s ease, border-color .15s ease, border-width .15s ease, transform .05s ease",
          // Default: steel
          bgGradient:
            "radial-gradient(196.62% 50% at 50% 50%, rgba(191,191,191,0.27) 0%, rgba(104,104,106,0.35) 69.53%, rgba(17,17,20,0.40) 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 4px 4px rgba(0,0,0,0.25)",
          _hover: {
            // Red glass
            bgGradient:
              "radial-gradient(531.76% 50% at 50% 50%, rgba(223,30,51,0.70) 0%, rgba(169,23,39,0.70) 62.02%, rgba(86,0,0,0.70) 100%)",
            borderColor: "#DF1E33",
            filter: "brightness(1.03)",
          },
          _active: {
            // Rojo sólido + borde 2px
            transform: "translateY(1px)",
            filter: "brightness(0.98)",
            bg: "brand.500",
            borderWidth: "2px",
            borderColor: "#DF1E33",
          },
        },
      },
      defaultProps: { variant: "cta", size: "cta" },
    },

    Card: {
      variants: {
        // Card normal
        item: {
          container: {
            display: "flex",
            padding: "0px",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "16px",
            alignSelf: "stretch",
            borderRadius: "16px",
            borderWidth: "1px",
            borderColor: "rgba(255,255,255,0.94)",
            bg: "#111114",
            boxShadow: "2px 4px 10px rgba(0,0,0,0.60)",
            overflow:"hidden",
            transition:
              "border-color .15s ease, transform .1s ease, box-shadow .15s ease",
            _hover: { borderColor: "rgba(223,30,51,0.50)", overflow:"hidden", },
            _active: {
              transform: "translateY(1px)",
              borderColor: "rgba(223,30,51,0.50)",
              overflow:"hidden",
            },
          },
          body: { p: "0px", display:"flex", flexDirection:"column", gap:"16px" },
        },

        // Card seleccionada
        itemSelected: {
          container: {
            display: "flex",
            padding: "0px",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "16px",
            alignSelf: "stretch",
            borderRadius: "16px",
            borderWidth: "1px",
            borderColor: "rgba(223,30,51,0.50)",
            bg: "#111114",
            boxShadow: "2px 4px 12px rgba(0,0,0,0.65)",
            overflow:"hidden",
            transition:
              "border-color .15s ease, transform .1s ease, box-shadow .15s ease",
            _hover: { borderColor: "rgba(223,30,51,0.60)", overflow:"hidden",},
            _active: {
              transform: "translateY(1px)",
              borderColor: "rgba(223,30,51,0.60)",
              overflow:"hidden",
            },
          },
          body: { p: "0px", display:"flex", flexDirection:"column", gap:"16px" },
        },
      },
    },
  },

  /* =========================
   * TEXT STYLES
   * ========================= */
  textStyles: {
    itemTitle: {
      color: "#FFF",
      fontFamily: "'Chakra Petch', sans-serif",
      fontSize: "16px",
      fontWeight: 700,
      lineHeight: "normal",
    },
    itemInfo: {
      color: "var(--Quaternary, #BFBFBF)",
      fontFamily: "'Chakra Petch', sans-serif",
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "normal",
    },
  },

  /* =========================
   * ESTILO GLOBAL
   * ========================= */
  styles: {
    global: {
      "html, body": {
        bg: "surface",
        color: "text",
      },
    },
  },
});

export default UndeadBlocks;

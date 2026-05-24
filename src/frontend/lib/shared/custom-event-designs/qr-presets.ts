export const QR_DESIGN_PRESETS = [
    { id: "basic", label: "Basic", brief: "Current default square style" },
    { id: "rounded", label: "Rounded", brief: "Rounded modules, cleaner look" },
    { id: "frame", label: "Frame", brief: "Adds a soft outer frame" },
    { id: "bold", label: "Bold", brief: "Higher-weight modules for print" },
  ] as const;
  
  export type QrDesignPresetId = (typeof QR_DESIGN_PRESETS)[number]["id"];
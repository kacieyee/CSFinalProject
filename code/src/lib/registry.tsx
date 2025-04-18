"use client";

import React, { useState } from "react";
import { StyleSheetManager } from "styled-components";

export function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  const [styledComponentsStyleSheet] = useState(() => require("styled-components").ServerStyleSheet);

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}

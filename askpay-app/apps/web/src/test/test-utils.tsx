import React from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { LanguageProvider } from "@/hooks/useLanguage";
import { NotificationProvider } from "@/lib/notification-context";

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </NotificationProvider>
  );
}

function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return rtlRender(ui, { wrapper: AllProviders, ...options });
}

export * from "@testing-library/react";
export { customRender as render };

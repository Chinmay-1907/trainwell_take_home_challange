/// <reference types="vite/client" />

declare module "lodash" {
  export interface DebounceSettings {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  }

  export interface DebouncedFunc<T extends (...args: any[]) => unknown> {
    (...args: Parameters<T>): ReturnType<T>;
    cancel(): void;
    flush(): ReturnType<T>;
    pending(): boolean;
  }

  export function debounce<T extends (...args: any[]) => unknown>(
    func: T,
    wait?: number,
    options?: DebounceSettings
  ): DebouncedFunc<T>;
}

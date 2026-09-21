/// <reference types="nativewind/types" />

// Declare CSS modules so TypeScript allows importing .css files
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

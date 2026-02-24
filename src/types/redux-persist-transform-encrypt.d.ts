// src/types/redux-persist-transform-encrypt.d.ts
declare module 'redux-persist-transform-encrypt' {
  export function encryptTransform(options: { secretKey: string; onError?: (error: any) => void }): any;
}

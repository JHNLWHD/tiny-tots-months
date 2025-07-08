declare module 'heic2any' {
  interface ConvertOptions {
    blob: File | Blob;
    toType: string;
    quality?: number;
  }

  function heic2any(options: ConvertOptions): Promise<Blob | Blob[]>;
  
  export default heic2any;
} 
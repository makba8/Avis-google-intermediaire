/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PUBLIC_URL: string;
    readonly REACT_APP_API_URL: string;
    readonly REACT_APP_EMAILJS_SERVICE_ID?: string;
    readonly REACT_APP_EMAILJS_TEMPLATE_ID?: string;
    readonly REACT_APP_EMAILJS_USER_ID?: string;
  }
}


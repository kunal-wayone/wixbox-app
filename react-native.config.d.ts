declare module 'react-native-config' {
  interface Env {
    API_BASE_URL: string;
    API_TIMEOUT: string;
    APP_ENV: 'development' | 'production' | 'staging';
  }

  const config: Env;
  export default config;
}

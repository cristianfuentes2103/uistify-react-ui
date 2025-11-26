const API_URL_ENV = "${API_URL}";
export const API_BASE_URL = API_URL_ENV.startsWith("$") ? "https://apidev.uistify.site/api" : API_URL_ENV;
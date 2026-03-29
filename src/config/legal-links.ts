/** URL tuyệt đối production phục vụ Google OAuth / branding. Dev: đường dẫn tương đối. */

export const privacyPolicyUrl =
  import.meta.env.VITE_PRIVACY_POLICY_URL ||
  (import.meta.env.DEV ? '/privacy-policy' : 'https://orcavietnam.com/privacy-policy');

export const termsOfServiceUrl =
  import.meta.env.VITE_TERMS_OF_SERVICE_URL ||
  (import.meta.env.DEV ? '/terms-of-service' : 'https://orcavietnam.com/terms-of-service');

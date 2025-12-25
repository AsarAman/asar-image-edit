
export default {
  providers: [
    {
      domain: process.env.OIDC_AUTHORITY,
      applicationID: process.env.OIDC_CLIENT_ID,
    },
  ],
};








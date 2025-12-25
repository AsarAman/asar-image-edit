

export default {
  providers: [
    {
      authority: import.meta.env.VITE_OIDC_AUTHORITY,
      client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: "code",
      scope: "openid profile email",
    },
  ],
};




// export default {
//   providers: [
//     {
//       domain: process.env.GOOGLE_AUTHORITY,
//       applicationID: process.env.GOOGLE_CLIENT_ID,
//     },
//   ],
// };



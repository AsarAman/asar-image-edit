

export default {
  providers: [
    {
      domain: import.meta.env.VITE_OIDC_AUTHORITY,
      applicationID: import.meta.env.VITE_OIDC_CLIENT_ID,
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



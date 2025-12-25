
export default {
  providers: [
    {
      domain: process.env.OIDC_AUTHORITY,
      applicationID: process.env.OIDC_CLIENT_ID,
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



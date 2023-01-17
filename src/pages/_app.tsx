import { type AppType } from "next/dist/shared/lib/utils";
import env from '../env.mjs'

import "../styles/globals.css";

console.log('_app', env)

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default MyApp;

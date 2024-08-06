import React, { FC, useEffect } from 'react';
import GoogleTagContext from '@Common/services/gtag-manager/GoogleTagContext';
import { useRouter } from 'next/router';
import { GOOGLE_ANALYTICS_ID } from '@App/config/constants';

const URL_GOOGLE_ANALYTICS = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
export const GGT_HEAD_SCRIPT = (
  <>
    <script src={URL_GOOGLE_ANALYTICS} async />
    <script
      dangerouslySetInnerHTML={{
        __html: `function gtag(){dataLayer.push(arguments)}window.dataLayer=window.dataLayer||[],gtag("js",new Date),gtag("config","${GOOGLE_ANALYTICS_ID}");`,
      }}
    />
  </>
);

export const GGT_BODY_SCRIPT = (
  <noscript>
    <iframe
      src={`https://www.googletagmanager.com/ns.html?id=${GOOGLE_ANALYTICS_ID}`}
      height="0"
      width="0"
      style={{ display: 'none', visibility: 'hidden' }}
    ></iframe>
  </noscript>
);

export const GoogleTagProvider: FC<any> = (props) => {
  const router = useRouter();

  useEffect(() => {
    router.events.on('routeChangeComplete', (url) => {
      callEvent('config', GOOGLE_ANALYTICS_ID, {
        page_path: url,
      });
    });
  }, []);

  const logError = (error: Error) => {
    const data = JSON.stringify(error.stack) ?? JSON.stringify(error);

    callEvent({
      event: 'errorLog',
      logging: { message: error.message, data },
    });
  };

  const logInfo = (msg: string, data: any) => {
    callEvent({
      event: 'infoLog',
      logging: { message: msg, data: JSON.stringify(data) },
    });
  };

  const callEvent =
    typeof window !== 'undefined'
      ? window.gtag
      : () => {
          //
        };

  return (
    <GoogleTagContext.Provider
      value={{
        callEvent,
        logError,
        logInfo,
      }}
      {...props}
    />
  );
};

export default GoogleTagProvider;

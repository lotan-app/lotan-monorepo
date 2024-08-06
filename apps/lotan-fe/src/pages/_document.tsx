import {
  GGT_BODY_SCRIPT,
  GGT_HEAD_SCRIPT,
} from '@App/common/services/gtag-manager/GoogleTagProvider';
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>Lotan</title>
        <meta name="description" content="Lotan" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Lotan" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`/images/logo/logoImg.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`/images/logo/logoImg.png`}
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta property="og:image" content={`/images/logo/logoImg.png`} />
        <meta name="thumbnail" content={`/images/logo/logoImg.png`} />
        <meta name="twitter:card" content="player" />
        <meta property="og:description" content="Lotan" />
        <meta property="og:site_name" content="Lotan" />
        <meta property="og:url" content="https://lotan.app/" />
        {GGT_HEAD_SCRIPT}
      </Head>
      <body>
        {GGT_BODY_SCRIPT}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

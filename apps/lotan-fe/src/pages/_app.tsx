import 'reflect-metadata';
import React, { FC } from 'react';
import { AppProps } from 'next/app';
import { wrapper } from '@App/rootStores';
import '@Style/main.scss';
import '@Style/theme.scss';
import '@mysten/dapp-kit/dist/index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createNetworkConfig, SuiClientProvider } from '@mysten/dapp-kit';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { ApolloProvider } from '@apollo/client';
import client from '@App/common/services/graphql';
import RootLayout from '@App/view/layout/components/RootLayout';
import GoogleTagProvider from '@App/common/services/gtag-manager/GoogleTagProvider';

const WalletProvider = dynamic(
  () => import('@mysten/dapp-kit').then((module) => module.WalletProvider),
  { ssr: false }
);

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

const queryClient = new QueryClient();

const MyApp: FC<AppProps> | any = (props: AppProps | any) => {
  const { Component, pageProps, router } = props;

  const getLayout: any = Component.getLayout || ((page: FC) => page);

  const NoSSRComponent: any = dynamic(
    () => import('@View/layout/components/NoSSRComponent'),
    {
      ssr: false,
    }
  );

  return (
    <div className="body-wrapper" id="body-wrapper">
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork={'mainnet'}>
          <WalletProvider
            autoConnect={true}
            stashedWallet={{
              name: 'Lotan',
            }}
          >
            <NoSSRComponent>
              <GoogleTagProvider>
                <ApolloProvider client={client}>
                  <RootLayout>
                    {getLayout(
                      <motion.div
                        key={router.route}
                        initial="initial"
                        animate="animate"
                        variants={{
                          initial: {
                            opacity: 0,
                          },
                          animate: {
                            opacity: 1,
                          },
                        }}
                      >
                        <Component {...pageProps} />
                      </motion.div>
                    )}
                  </RootLayout>
                </ApolloProvider>
              </GoogleTagProvider>
            </NoSSRComponent>
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </div>
  );
};

export default wrapper.withRedux(MyApp);

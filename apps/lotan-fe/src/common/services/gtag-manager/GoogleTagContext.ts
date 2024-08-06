import React, {FC} from 'react';

interface GoogleTagContextProps {
  callEvent: (...arg: any) => void;
  logError: (error: Error) => void;
  logInfo: (msg: string, data: any) => void;
  GoogleAnalyticsComponents: FC<any>;
}

const GoogleTagContext = React.createContext<GoogleTagContextProps>({
  callEvent: undefined,
  logError: undefined,
  logInfo: undefined,
  GoogleAnalyticsComponents: undefined,
});

export default GoogleTagContext;

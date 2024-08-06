import React from 'react';
import GoogleTagContext from '@Common/services/gtag-manager/GoogleTagContext';

const useGoogleTag = () => React.useContext(GoogleTagContext);

export default useGoogleTag;

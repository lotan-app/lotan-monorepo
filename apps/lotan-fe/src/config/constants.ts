import {
  IC_ACCESS_CONTROL,
  IC_ANALYTICS,
  IC_API_KEY,
  IC_FILES,
  IC_GATEWAY,
  IC_MORE_NAV,
} from '@App/common/icons';

export const NAV_LIST = [
  {
    title: '',
    nested: [
      {
        title: 'Files',
        link: '/app/',
        path: 'app',
        icon: IC_FILES(),
      },
      {
        title: 'Gateways',
        path: 'gateways',
        coming: true,
        icon: IC_GATEWAY(),
      },
      {
        title: 'Analytics',
        path: 'analytics',
        coming: true,
        icon: IC_ANALYTICS(),
      },
    ],
  },
  {
    title: 'Developers',
    nested: [
      {
        title: 'API Keys',
        path: 'api-key',
        coming: true,
        icon: IC_API_KEY(),
      },
      {
        title: 'Access Controls',
        path: 'access-controls',
        coming: true,
        icon: IC_ACCESS_CONTROL(),
      },
    ],
  },
];

export const NAV_LIST_MOBILE = [
  { title: 'File', link: '/app/', path: 'app', icon: IC_FILES() },
  {
    title: 'More',
    icon: IC_MORE_NAV(),
    nested: [
      {
        title: '',
        nested: [
          {
            title: 'Gateways',
            path: 'gateways',
            coming: true,
            icon: IC_GATEWAY(),
          },
          {
            title: 'Analytics',
            path: 'analytics',
            coming: true,
            icon: IC_ANALYTICS(),
          },
        ],
      },
      {
        title: 'Developers',
        nested: [
          {
            title: 'API Keys',
            path: 'api-key',
            coming: true,
            icon: IC_API_KEY(),
          },
          {
            title: 'Access Controls',
            path: 'access-controls',
            coming: true,
            icon: IC_ACCESS_CONTROL(),
          },
        ],
      },
    ],
  },
];

export const DEFAULT_PER_PAGE = 10;

export const ROW_PER_PAGE = [5, 10];

export enum STATUS_FILE_UPLOAD {
  PROCESS = 'process',
  FINISH = 'finish',
  FAIL = 'fail',
}

export enum VIEW_FILE {
  ADD = 'add',
  UPLOAD = 'upload',
  MANAGE = 'manage',
}

export const WALRUS_URL = process.env.NEXT_PUBLIC_WALRUS_URL;

export const GOOGLE_ANALYTICS_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

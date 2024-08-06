import { IC_BOOK, IC_LAUNCH_APP, IC_LOGO } from '@App/common/icons';
import styles from '@View/landing/assets/index.module.scss';
import { getLayout } from '@View/layout/components/MasterLayout';
import React from 'react';
import CustomButton from '../layout/components/CustomButton';
import Text from '../layout/components/Text';
import { useRouter } from 'next/router';
import Link from 'next/link';
const Landing = () => {
  const router = useRouter();
  return (
    <div className={styles.landing}>
      <div className={styles.left}>
        <div className={styles.header}>{IC_LOGO()}</div>
        <div className={styles.body}>
          <img
            src="/images/icon/ic_circle.png"
            alt="Circle"
            width={34}
            height={34}
          />
          <Text size={18} color="neutral-n7" className={styles.page_title}>
            Home Page
          </Text>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.header}>
          <div className={styles.launch_app}>
            <div className={styles.logo_text}>
              <img src="/images/logo/logo_text_light.png" alt="Logo Text" />
            </div>
            <CustomButton onClick={() => router.push('/app')}>
              <div className={styles.icon}>{IC_LAUNCH_APP()}</div>
              <Text size={16} fontWeight={500}>
                Launch App
              </Text>
            </CustomButton>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.content}>
            <Text className={styles.title} color="neutral-n10">
              Ship your <span>dApps</span> Faster
            </Text>
            <Text size={20} color="neutral-n8" className={styles.description}>
              Experience seamless interaction with decentralized through Lotan
              storage, gateway, and CDN services, all designed to be
              cost-effective and maintenance-free.
            </Text>
            <div className={styles.border} />
            <div className={styles.group_btn}>
              <CustomButton
                onClick={() => router.push('/app')}
                className={styles.btn_launch_app}
              >
                <div className={styles.icon}>{IC_LAUNCH_APP()}</div>
                <Text size={16} fontWeight={500}>
                  Launch App
                </Text>
              </CustomButton>
              <Link href={'/'} className={styles.learn_more}>
                <div className={styles.icon}>{IC_BOOK()}</div>
                <Text size={16} fontWeight={500} color="neutral-n9">
                  Learn More
                </Text>
              </Link>
            </div>
            <div className={styles.manage_file}>
              <img src="/images/icon/manage_file.png" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
Landing.getLayout = getLayout;
export default Landing;

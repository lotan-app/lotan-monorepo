import dynamic from "next/dynamic";
import { getLayout } from "@App/view/layout/components/MasterLayout";

const File: any = dynamic(() => import("@App/view/files"), {
  ssr: false,
});

File.getLayout = getLayout;
export default File;

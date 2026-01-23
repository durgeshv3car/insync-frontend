import UserPage from "./components/User";
import { checkPermissions } from "../checkPermissions";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import PageHeaderDate from "@/components/shared/pageHeader/PageHeaderDate";

export default async function Page() {
  const isSuperAdmin = await checkPermissions();

  if (!isSuperAdmin) {
    return <div className="text-center text-danger mt-5">Access Denied</div>;
  }

  return (
    <>
      {" "}
      <PageHeader>
        <PageHeaderDate />
      </PageHeader>
      <UserPage />
    </>
  );
}

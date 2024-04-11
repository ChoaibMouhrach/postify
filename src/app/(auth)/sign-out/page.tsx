import { SignOut } from "./sign-out";

const Page = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Yerapos</h1>
        <span className="text-muted-foreground">
          Click the &apos;Sign Out&apos; button to log out of your account.
        </span>
      </div>
      <SignOut />
    </div>
  );
};

export default Page;

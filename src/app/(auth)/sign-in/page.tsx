import { SignIn } from "./sign-in";

const Page = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center flex flex-col gap-1">
        <h1 className="text-2xl font-bold">YeraPos</h1>
        <span className="text-muted-foreground">
          Please login with your email to continue
        </span>
      </div>
      <SignIn />
    </div>
  );
};

export default Page;

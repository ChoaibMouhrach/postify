import { Setup } from "./setup";

const Page = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Setup</h1>
        <span className="text-muted-foreground">
          You can setup this application by clicking the setup button.
        </span>
      </div>
      <Setup />
    </div>
  );
};

export default Page;

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Business } from "./business";

const Settings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          You can manage your settings from here.
        </CardDescription>
      </CardHeader>
      <Business />
    </Card>
  );
};

export default Settings;

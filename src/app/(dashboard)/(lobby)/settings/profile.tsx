import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { ProfileForm } from "./profile-form";
import { rscAuth } from "@/server/lib/action";

export const Profile = async () => {
  const user = await rscAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          You can manage your profile from here.
        </CardDescription>
      </CardHeader>
      <ProfileForm user={user} />
    </Card>
  );
};

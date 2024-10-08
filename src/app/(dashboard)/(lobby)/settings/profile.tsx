import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { ProfileForm } from "./profile-form";
import { validateRequest } from "@/server/lib/auth";
import { redirect } from "next/navigation";

export const Profile = async () => {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/sign-in");
  }

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

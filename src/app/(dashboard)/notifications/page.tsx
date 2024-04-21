import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";

const Notifications = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          You can manage your Notifications from here.
        </CardDescription>
      </CardHeader>
      <CardContent>Notifications</CardContent>
    </Card>
  );
};

export default Notifications;

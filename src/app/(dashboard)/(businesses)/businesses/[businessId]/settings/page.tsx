import React from "react";
import { Business } from "./business";

interface SettingsProps {
  params: {
    businessId: string;
  };
}

const Settings: React.FC<SettingsProps> = ({ params }) => {
  return <Business businessId={params.businessId} />;
};

export default Settings;

import AccountClient from "@/components/account/AccountClient";

export const metadata = {
  title: "Account Settings",
  description: "Update your profile, name, location and email address.",
  robots: { index: false, follow: false }, // Private page — never index
};

export default function AccountPage() {
  return <AccountClient />;
}

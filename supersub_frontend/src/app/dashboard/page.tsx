import WelcomeCard from "../../components/WelcomeCard";
import AllOffers from "../../components/AllOffers";

export default function DashboardPage() {
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <WelcomeCard />
      <div style={{ marginTop: "40px" }}>
        <AllOffers />
      </div>
    </div>
  );
}
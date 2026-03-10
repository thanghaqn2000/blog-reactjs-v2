import GoldBtmc from "@/components/GoldBtmc";
import MainLayout from "@/layouts/MainLayout";

const GoldPrice = () => {
  return (
    <MainLayout>
      <div className="container py-16 pt-28">
        <GoldBtmc />
      </div>
    </MainLayout>
  );
};

export default GoldPrice;

import { Plane, RefreshCw, Phone } from "lucide-react";

const ReliableSafeSection = () => {
  const features = [
    {
      icon: Plane,
      text: "Our drivers monitor flights and always arrive on time"
    },
    {
      icon: RefreshCw,
      text: "Cancel up to 24 hours before the pickup and get an 80% refund"
    },
    {
      icon: Phone,
      text: "24/7 customer support"
    }
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-5 max-w-6xl">
        <h2 className="text-3xl font-semibold text-[#2c3e50] mb-12 text-left">
          Reliable and safe
        </h2>
        
        <div className="flex flex-row justify-between items-start gap-8 flex-wrap">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-5 flex-1 min-w-0">
              <div className="w-15 h-15 bg-[#ffdfcc] rounded-full flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-[#ff6b35]" />
              </div>
              <p className="text-[#5a6c7d] text-base leading-relaxed">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReliableSafeSection;
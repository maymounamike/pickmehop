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
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-[#0D2C54]/5 to-[#FFB400]/5 rounded-2xl p-8 lg:p-12">
          <div className="max-w-5xl mx-auto">
            {/* Centered Title */}
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-[#0D2C54] leading-tight">
                Reliable and safe
              </h2>
            </div>
            
            {/* Features grid - centered */}
            <div className="flex items-start justify-center gap-8 flex-wrap">
              {features.map((feature, index) => (
                <div key={index} className="text-center max-w-[200px]">
                  <div className="w-16 h-16 bg-[#ffdfcc] rounded-full flex items-center justify-center mb-4 mx-auto">
                    <feature.icon className="w-8 h-8 text-[#ff6b35]" />
                  </div>
                  <p className="text-sm text-[#0D2C54] font-semibold leading-tight">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReliableSafeSection;
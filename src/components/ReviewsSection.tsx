import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const ReviewsSection = () => {
  const reviews = [
    {
      text: "I have used this service several times before for airport to Pireaus transfers and vice versa. Yesterday I booked them from Pireaus to a central Athens private address. The service is always great: yesterday my driver Mr Kontzialis was prompt,...",
      author: "Jon O",
      date: "May 2021"
    },
    {
      text: "I have used this service on two trips back and forth from the airport to central Athens in the last few months (and have another one booked for later this month). On each occasion, the taxi has been punctual to...",
      author: "barryincrete",
      date: "May 2021"
    },
    {
      text: "I booked airport transfers for my first visit to Athens. Booking was very easy and straightforward. As soon as I got to the airport arrivals hall, my driver Angelos Chronis was waiting for me with a warm welcome. In addition...",
      author: "C2394ICtomw",
      date: "December 2020"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Travelers love Welcome Pickups
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-muted-foreground">4,144 reviews</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.map((review, index) => (
            <Card key={index} className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  "{review.text}"
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{review.author}</span>
                  <span className="text-muted-foreground">{review.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
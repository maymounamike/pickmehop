import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const ReviewsSection = () => {
  const reviews = [
    {
      text: "Michael was friendly and professional and we had a great ride to the airport. There was even great reading material supplied - a guide book to Paris written by Mike himself! Would definitely recommend a ride with Michael.",
      author: "Jane O.",
      date: "July 2025"
    },
    {
      text: "The best welcome to Paris, professional personable and truly such an amazing person to meet anytime - especially straight off a flight! 100/10.",
      author: "Kris W",
      date: "June 2025"
    },
    {
      text: "I had the pleasure of having Michael as my driver from the airport, and I couldn't be more impressed! Not only was he professional and friendly, but he also went above and beyond by acting as an impromptu tour guide. I felt welcomed and well taken care of throughout the trip in Paris.",
      author: "Angielyn M",
      date: "March 2025"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Travelers love Pick Me Hop
          </h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-muted-foreground">846 reviews</span>
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
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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Travelers love Pick Me Hop
          </h2>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-xl font-semibold text-primary">4.9</span>
          </div>
          <p className="text-muted-foreground text-lg">
            Over <span className="font-semibold text-primary">846 five-star reviews</span> from happy travelers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {reviews.map((review, index) => (
            <Card key={index} className="border border-border shadow-card hover:shadow-elegant transition-all duration-300 group bg-card animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground mb-6 leading-relaxed">
                  "{review.text}"
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="font-semibold text-foreground text-sm">{review.author}</span>
                  <span className="text-muted-foreground text-xs">{review.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Call to action */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground text-lg">
            Join hundreds of satisfied travelers. 
            <span className="text-primary font-semibold"> Book your ride today!</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
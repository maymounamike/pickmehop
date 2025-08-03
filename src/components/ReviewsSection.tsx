import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <section className="py-20 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.1),transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 animate-bounce-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400 animate-bounce-in" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-slate-800 mb-4 leading-tight">
            What our <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">customers</span> say
          </h2>
          <p className="text-slate-600 text-lg mb-8 font-medium">
            Join over 846 satisfied customers who trust us with their journeys
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 animate-slide-up">
          {reviews.map((review, index) => (
            <Card key={index} className="p-6 hover:shadow-glow transition-all duration-500 border-2 hover:border-primary hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5 rounded-2xl group animate-glow-pulse">
              <CardContent className="p-0">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4 leading-relaxed group-hover:text-slate-800 transition-colors duration-300">"{review.text}"</p>
                <div className="text-sm">
                  <p className="font-semibold text-slate-800 group-hover:text-primary transition-colors duration-300">{review.author}</p>
                  <p className="text-slate-500 group-hover:text-slate-600 transition-colors duration-300">{review.date}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center animate-bounce-in">
          <h3 className="font-display text-2xl lg:text-3xl font-bold text-slate-800 mb-4">
            Ready to book your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ride?</span>
          </h3>
          <p className="text-slate-600 text-lg mb-8 font-medium">
            Join our satisfied customers and experience the difference
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-3 rounded-2xl font-semibold text-lg shadow-glow hover:shadow-elegant hover:scale-105 transition-all duration-500 animate-glow-pulse"
            onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Book Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
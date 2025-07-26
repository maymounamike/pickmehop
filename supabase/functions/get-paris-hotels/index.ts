import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive Paris hotel database
const parisHotels = [
  // Luxury Hotels (5-star)
  "The Ritz Paris, 15 Place Vendôme, 75001 Paris",
  "Le Bristol Paris, 112 Rue du Faubourg Saint-Honoré, 75008 Paris",
  "Hotel Plaza Athénée, 25 Avenue Montaigne, 75008 Paris",
  "Four Seasons Hotel George V Paris, 31 Avenue George V, 75008 Paris",
  "Le Meurice, 228 Rue de Rivoli, 75001 Paris",
  "Shangri-La Hotel Paris, 10 Avenue d'Iéna, 75116 Paris",
  "La Réserve Paris Hotel and Spa, 42 Avenue Gabriel, 75008 Paris",
  "Hotel de Crillon, 10 Place de la Concorde, 75008 Paris",
  "The Peninsula Paris, 19 Avenue Kléber, 75116 Paris",
  "Mandarin Oriental Paris, 251 Rue Saint-Honoré, 75001 Paris",
  "Grand Hotel du Palais Royal, 4 Rue de Valois, 75001 Paris",
  "Hôtel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Bulgari Hotel Paris, 30 Avenue George V, 75008 Paris",
  "Cheval Blanc Paris, 8 Quai du Louvre, 75001 Paris",

  // Boutique Hotels (4-star)
  "Hotel Particulier Montmartre, 23 Avenue Junot, 75018 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Malte Opera, 63 Rue de Richelieu, 75002 Paris",
  "Hotel Fabric, 31 Rue de la Folie Méricourt, 75011 Paris",
  "Hotel Montalembert, 3 Rue de Montalembert, 75007 Paris",
  "Hotel Bel Ami, 7-11 Rue Saint-Benoît, 75006 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel National Des Arts et Métiers, 243 Rue Saint-Martin, 75003 Paris",
  "Hotel Jeanne d'Arc, 3 Rue de Jarente, 75004 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",

  // Mid-range Hotels (3-star)
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Malte Opera, 63 Rue de Richelieu, 75002 Paris",
  "Best Western Premier Opera Diamond, 4 Rue de la Pépinière, 75008 Paris",
  "Hotel R de Paris, 19 Rue Geoffroy Marie, 75009 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Prince Albert Wagram, 28 Avenue de Wagram, 75008 Paris",
  "Hotel Vivienne, 40 Rue Vivienne, 75002 Paris",
  "Hotel Chopin, 10 Boulevard Montmartre, 75009 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel La Nouvelle République, 19 Rue Saint-Sulpice, 75006 Paris",

  // Historic Hotels
  "Hotel des Invalides, 129 Rue de Grenelle, 75007 Paris",
  "Hotel du Louvre, 1 Place André Malraux, 75001 Paris",
  "InterContinental Paris Le Grand, 2 Rue Scribe, 75009 Paris",
  "Hotel Scribe Paris Opera, 1 Rue Scribe, 75009 Paris",
  "Hotel Ambassador, 16 Boulevard Haussmann, 75009 Paris",
  "Grand Hotel Opera, 2 Rue Scribe, 75009 Paris",
  "Hotel Normandy, 7 Rue de l'Échelle, 75001 Paris",
  "Hotel Regina Louvre, 2 Place des Pyramides, 75001 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Brighton, 218 Rue de Rivoli, 75001 Paris",

  // Chain Hotels
  "Hyatt Paris Madeleine, 24 Boulevard Malesherbes, 75008 Paris",
  "Hilton Paris Opera, 108 Rue Saint-Lazare, 75008 Paris",
  "Marriott Paris Champs Elysees, 70 Avenue des Champs-Élysées, 75008 Paris",
  "Sheraton Paris Airport Hotel, Tremblay-en-France 95700",
  "Novotel Paris Gare de Lyon, 2 Rue Hector Malot, 75012 Paris",
  "Ibis Paris Opéra La Fayette, 34 Rue La Fayette, 75009 Paris",
  "Mercure Paris Centre Tour Eiffel, 20 Rue Jean Rey, 75015 Paris",
  "Radisson Blu Ambassador Hotel Paris Opera, 16 Boulevard Haussmann, 75009 Paris",
  "Crowne Plaza Paris République, 10 Place de la République, 75011 Paris",
  "Holiday Inn Paris Gare de Lyon Bastille, 11 Rue de Lyon, 75012 Paris",

  // Montmartre Hotels
  "Hotel Particulier Montmartre, 23 Avenue Junot, 75018 Paris",
  "Hotel des Arts Montmartre, 5 Rue Tholozé, 75018 Paris",
  "Relais Montmartre, 6 Rue Constance, 75018 Paris",
  "Hotel Villa Royale, 2 Rue Duperré, 75009 Paris",
  "Hotel Ermitage Sacré-Coeur, 24 Rue Lamarck, 75018 Paris",
  "Hotel des Arts, 5 Rue Tholozé, 75018 Paris",
  "Hotel Regyn's Montmartre, 18 Place du Tertre, 75018 Paris",
  "Hotel Utrillo, 7 Rue Aristide Bruant, 75018 Paris",
  "Hotel Prima Lepic, 29 Rue Lepic, 75018 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",

  // Saint-Germain Hotels
  "Hotel Bel Ami, 7-11 Rue Saint-Benoît, 75006 Paris",
  "Hotel d'Aubusson, 33 Rue Dauphine, 75006 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Left Bank Saint Germain, 9 Rue de l'Ancienne Comédie, 75006 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Villa Madame, 44 Rue Madame, 75006 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Artus, 34 Rue de Buci, 75006 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Madison, 143 Boulevard Saint-Germain, 75006 Paris",

  // Marais Hotels
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Jeanne d'Arc, 3 Rue de Jarente, 75004 Paris",
  "Hotel National Des Arts et Métiers, 243 Rue Saint-Martin, 75003 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Bastille de Launay, 42 Rue Amelot, 75011 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel des Deux Îles, 59 Rue Saint-Louis en l'Île, 75004 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Malte Opera, 63 Rue de Richelieu, 75002 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",

  // Business Hotels
  "Pullman Paris Montparnasse, 19 Rue du Commandant René Mouchotte, 75014 Paris",
  "Hotel Concorde La Fayette, 3 Place du Général Koenig, 75017 Paris",
  "Novotel Paris La Défense, 2 Boulevard de Neuilly, 92081 Paris La Défense",
  "Hotel Mercure Paris Centre Tour Eiffel, 20 Rue Jean Rey, 75015 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Renaissance Paris Vendôme Hotel, 4 Rue du Mont Thabor, 75001 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Park Hyatt Paris-Vendôme, 5 Rue de la Paix, 75002 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Sofitel Paris Le Faubourg, 15 Rue Boissy d'Anglas, 75008 Paris",

  // Budget Hotels
  "Hotel de Nevers, 53 Rue de Malte, 75011 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Chopin, 10 Boulevard Montmartre, 75009 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Vivienne, 40 Rue Vivienne, 75002 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel des Arts, 5 Rue Tholozé, 75018 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Best Western Premier Opera Diamond, 4 Rue de la Pépinière, 75008 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",

  // Additional Popular Hotels
  "Hotel Costes, 239 Rue Saint-Honoré, 75001 Paris",
  "Hotel Amour, 8 Rue Navarin, 75009 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Thoumieux, 79 Rue Saint-Dominique, 75007 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Saint-James Paris, 43 Avenue Bugeaud, 75116 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Molitor Paris - MGallery, 13 Rue Nungesser et Coli, 75016 Paris",
  "Hotel des Grands Boulevards, 17 Boulevard Poissonnière, 75002 Paris",
  "Hotel Lutetia, 45 Boulevard Raspail, 75006 Paris"
];

// Remove duplicates and sort alphabetically
const uniqueHotels = [...new Set(parisHotels)].sort();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let query = '';
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      query = url.searchParams.get('query')?.toLowerCase() || '';
    } else if (req.method === 'POST') {
      const body = await req.json();
      query = body.query?.toLowerCase() || '';
    }

    if (query.length < 2) {
      return new Response(
        JSON.stringify({ hotels: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter hotels based on query
    const filteredHotels = uniqueHotels.filter(hotel => 
      hotel.toLowerCase().includes(query)
    ).slice(0, 10); // Limit to 10 results

    return new Response(
      JSON.stringify({ hotels: filteredHotels }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-paris-hotels function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', hotels: [] }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const fetchSeller = async (uid: string | undefined) => {
    if(uid){
        try{
            const response = await fetch(`${API_URL}/sellers/fetch-seller?id=${uid}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`Error fetching seller: ${response.status}`);
            }

            const data = await response.json();
            return data.seller;
        }catch(error){
            console.log('Cannont fetch seller', error)
        }
    }

    return null;
}

export const fetchRandomListings = async (sellerId: string | undefined, category: string | undefined, listingId: string | undefined, numListings: number | undefined, active: boolean | undefined) => {
    
    try {
        const response = await fetch(`${API_URL}/listings/fetch-random-listings?sellerId=${sellerId}&category=${category}&listingId=${listingId}&numListings=${numListings}&active=${active}`, {
            method: 'GET',
        });
    
        if (!response.ok) {
            throw new Error(`Error fetching listings: ${response.status}`);
        }
    
        const data = await response.json();
        
        return data.listings;
    } catch (error) {
        console.log('Cannot fetch listings', error);
    } 
    

    return null;
}

export const fetchReviews = async (ownerUID: string | undefined) => {
    if (ownerUID) {
      try {
          const response = await fetch(`${API_URL}/listings/fetch-reviews?sellerId=${ownerUID}`, {
              method: 'GET',
          });
  
          if (!response.ok) {
              throw new Error(`Error fetching reviews: ${response.status}`);
          }
  
          const data = await response.json();
          
          return data.reviews;

      } catch (error) {
          console.error('Cannot fetch reviews:', error);
      } 
    }

    return null;
  };
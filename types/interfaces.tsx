export interface Listing {
    images: string[];
    title: string;
    description: string;
    price: number;
    quantity: number;
    category?: string;
    athlete?: string;
    team?: string;
    year?: number;
    brand?: string;
    set?: string;
    features?: string[];
    parallel?: string;
    printRun?: number;
    cardsInLot?: number;
    athletes?: string[];
    teams?: string[];
    listingType: 'fixed' | 'auction';
    bids?: number;
    duration?: string;
    offerable?: boolean;
    scheduled?: boolean;
    date?: string;
    time?: string;
    shippingType?: 'flat' | 'variable';
    weight?: number;
    shippingProfile?: string;
    shippingCost?: number;
    likes: number;
    ownerUID?: string;
    createdAt?: RawTimestamp;
    random?: number;
    id: string;
}
  
export interface RawTimestamp {
    _seconds: string;
    _nanoseconds: string;
}

export interface Seller {
    username: string;
    name: string;
    description: string;
    pfp: string;
    banner: string;
    rating: number;
    numberOfFollowers: number;
    numberOfFollowing: number;
    itemsSold: number;
    listings: string[];
    id: string;
}

export interface Review {
    reviewerId: string;
    sellerId: string;
    rating: number;
    description: string;
    createdAt: string;
    reviewerPfp: string;
    reviewerUsername: string;
}

export interface Layout {
    height: number;
    width: number;
}  
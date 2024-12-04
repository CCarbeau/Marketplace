import { User } from "firebase/auth";

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
    seller: Seller;
    bidCount: number;
    bids: Bid;
    endDate: RawTimestamp;

}

export interface Bid {

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

export interface ActiveUser {
    address: {};
    banner: string;
    bids: string[];
    collection: string[];
    description: string;
    firstName: string;
    following: string[];
    id: string;
    itemsSold: number;
    interests: string[];
    lastName: string;
    listings: string[];
    liked: string[];
    name: string;
    numberOfFollowers: number;
    numberOfFollowing: number;
    payment: {};
    pfp: string;
    rating: number;
    recentSearches: RecentSearch[]; 
    seller: boolean;
    username: string;
    conversations: Conversation[];
}
  
  
export type RecentSearch =
    | { type: "seller", seller: Seller }
    | { type: "searchTerm", term: string };
  

export interface Message {
    sender: string,
    message: string,
    sentAt: RawTimestamp,
}

export interface Conversation {
    id: string,
    interlocutor: Interlocutor,
    lastMessage: string, 
    messageHistory: Message[],
    createdAt: RawTimestamp,
    updatedAt: RawTimestamp,
}

export interface Interlocutor {
    username: string, 
    pfp: string, 
    id: string,
}

export interface AuthContextProps {
    user: User | null;
    profile: ActiveUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, firstName: string, lastName: string, username: string, interests: string[]) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (updatedData: Partial<ActiveUser>) => void;
}
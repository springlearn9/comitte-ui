export interface Bid {
  id: string;
  committeeId: number;
  committeeName?: string;
  committeeNumber?: number;
  finalBidderId: number;
  finalBidderName?: string;
  amount: number; // finalBidAmt
  monthlyShare?: number;
  bidDate?: string; // bidDate
  createdAt?: string;
  updatedAt?: string;
  bidItems?: any[];
  receiversList?: any[];
}

// Backend DTOs (single bid shape and used in lists)
export interface BidResponseDTO {
  bidId: number;
  comitteId: number;
  comitteName?: string;
  comitteNumber?: number;
  finalBidderId: number;
  finalBidderName?: string;
  finalBidAmt: number;
  monthlyShare?: number;
  bidDate?: string;
  bidItems?: any[];
  receiversList?: any[];
  createdTimestamp?: string;
  updatedTimestamp?: string;
}

// Request DTO for creating/updating bids
export interface BidRequest {
  comitteId: number;
  finalBidder?: number;
  finalBidAmt?: number;
  bidDate?: string; // ISO string for LocalDateTime
  receiversList?: number[];
}

export const mapBidResponse = (r: BidResponseDTO): Bid => ({
  id: String(r.bidId),
  committeeId: r.comitteId,
  committeeName: r.comitteName,
  committeeNumber: r.comitteNumber,
  finalBidderId: r.finalBidderId,
  finalBidderName: r.finalBidderName,
  amount: r.finalBidAmt,
  monthlyShare: r.monthlyShare,
  bidDate: r.bidDate,
  createdAt: r.createdTimestamp,
  updatedAt: r.updatedTimestamp,
  bidItems: r.bidItems,
  receiversList: r.receiversList,
});

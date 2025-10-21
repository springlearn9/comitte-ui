export interface Bid {
  id: string;
  committeeId: number;
  committeeName?: string;
  committeeNumber?: number;
  finalBidderId: number;
  finalBidderName?: string;
  amount: number; // finalBidAmt
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
  bidDate?: string;
  bidItems?: any[];
  receiversList?: any[];
  createdTimestamp?: string;
  updatedTimestamp?: string;
}

export const mapBidResponse = (r: BidResponseDTO): Bid => ({
  id: String(r.bidId),
  committeeId: r.comitteId,
  committeeName: r.comitteName,
  committeeNumber: r.comitteNumber,
  finalBidderId: r.finalBidderId,
  finalBidderName: r.finalBidderName,
  amount: r.finalBidAmt,
  bidDate: r.bidDate,
  createdAt: r.createdTimestamp,
  updatedAt: r.updatedTimestamp,
  bidItems: r.bidItems,
  receiversList: r.receiversList,
});

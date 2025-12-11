import { api, ApiResponse, ApiError } from "../../utils/api";

export interface SubscribeRequest {
  offer_id: number;
}

export interface SubscribeResponse {
  message: string;
  user_id: number;
  offer_id: number;
  offer_title: string;
}

export interface UnsubscribeRequest {
  offer_id: number;
}

export interface UnsubscribeResponse {
  message: string;
  user_id: number;
  previous_offer_id: number;
  previous_offer_title: string;
}

export class SubscriptionService {
  /**
   * Subscribe to an offer
   */
  static async subscribeTo(offerId: number): Promise<ApiResponse<SubscribeResponse>> {
    try {
      const response = await api.post<SubscribeResponse>("/subscription/subscribeTo", {
        offer_id: offerId,
      });
      return response;
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * Unsubscribe from an offer
   */
  static async unsubscribeFrom(offerId: number): Promise<ApiResponse<UnsubscribeResponse>> {
    try {
      const response = await api.post<UnsubscribeResponse>("/subscription/unsubscribeTo", {
        offer_id: offerId,
      });
      return response;
    } catch (error) {
      throw error as ApiError;
    }
  }
}

export default SubscriptionService;
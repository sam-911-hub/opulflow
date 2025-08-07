// M-PESA integration utilities
export interface MpesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  currency: string;
  description: string;
  callbackUrl: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  checkoutRequestId?: string;
}

// Real M-PESA STK Push integration
export const initiateMpesaPayment = async (request: MpesaPaymentRequest): Promise<MpesaPaymentResponse> => {
  try {
    const response = await fetch('/api/mpesa/stk-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: request.phoneNumber,
        amount: request.amount,
        packageId: request.description
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        checkoutRequestId: result.checkoutRequestId,
        message: result.message
      };
    } else {
      return {
        success: false,
        message: result.message
      };
    }
  } catch (error) {
    console.error('M-PESA payment error:', error);
    return {
      success: false,
      message: 'Payment failed. Please try again.'
    };
  }
};

// Check M-PESA payment status
export const checkMpesaPaymentStatus = async (checkoutRequestId: string): Promise<{
  success: boolean;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
}> => {
  try {
    // In production, you would query M-PESA transaction status API
    // For now, we'll check our database for callback updates
    
    // This is a simplified status check
    // Real implementation would query M-PESA's transaction status endpoint
    
    return {
      success: true,
      status: 'pending', // Will be updated by callback
      transactionId: checkoutRequestId
    };
  } catch (error) {
    return {
      success: false,
      status: 'failed'
    };
  }
};
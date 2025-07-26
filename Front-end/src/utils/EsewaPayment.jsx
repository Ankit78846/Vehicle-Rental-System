import { useEffect, useRef, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

// Helper function to generate signature (simplified version)
const generateSignature = (message) => {
  // For testing, we'll use a simple hash or just return empty
  // In production, this should be done on the backend
  return ""; // eSewa test environment might work without signature
};

export default function EsewaPayment({
  amount = 100,
  productCode = "veh123",
  merchantCode = "EPAYTEST", // default for sandbox
  backendVerifyURL = "http://localhost:5000/api/payment/esewa/verify"
}) {
  const formRef = useRef();
  const location = useLocation();
  const [params] = useSearchParams();
  const [statusMessage, setStatusMessage] = useState("");

  const successUrl = "http://localhost:5173/payment/esewa/success";
  const failureUrl = "http://localhost:5173/payment/failure";

  const uniqueOrderId = "ORDER" + Date.now();

  // Generate signature for eSewa v2
  const message = `total_amount=${amount},transaction_uuid=${uniqueOrderId},product_code=${productCode}`;
  const signature = generateSignature(message);
  const signedFieldNames = "total_amount,transaction_uuid,product_code";

  // Redirected back from eSewa - handle verification
  useEffect(() => {
    const query = Object.fromEntries([...params]);
    
    console.log('eSewa callback received:', query);

    if (query.status === "success" && query.oid && query.refId && query.amt) {
      console.log('Verifying payment with backend...');
      // Call backend to verify
      fetch(backendVerifyURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amt: query.amt,
          refId: query.refId,
          oid: query.oid
        })
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('Verification response:', data);
          if (data.verified) {
            setStatusMessage("✅ Payment Verified and Completed.");
          } else {
            setStatusMessage(`❌ Payment verification failed: ${data.message || 'Unknown error'}`);
          }
        })
        .catch((error) => {
          console.error('Verification error:', error);
          setStatusMessage("❌ Error verifying payment.");
        });
    } else if (query.status === "failure") {
      setStatusMessage("❌ Payment Failed.");
    } else if (Object.keys(query).length > 0) {
      console.log('Unrecognized callback format:', query);
      setStatusMessage("❌ Invalid payment callback format.");
    }
  }, [location, backendVerifyURL, params]);

  // Function to handle payment initiation with proper backend transaction creation
  const handlePayment = async () => {
    try {
      console.log('Creating transaction in backend before eSewa redirect...');
      
      // First create transaction in backend
      const createResponse = await fetch('http://localhost:5000/api/payment/esewa/test-initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          productCode: productCode,
          merchantCode: merchantCode,
          uniqueOrderId: uniqueOrderId
        })
      });
      
      if (createResponse.ok) {
        const result = await createResponse.json();
        console.log('Transaction created:', result);
        
        // Now submit the form to eSewa
        formRef.current.submit();
      } else {
        console.error('Failed to create transaction in backend');
        setStatusMessage("❌ Failed to initiate payment. Please try again.");
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setStatusMessage("❌ Error initiating payment. Please try again.");
    }
  };

  if (statusMessage) {
    return (
      <div className="p-6 text-xl text-center">
        <h2>{statusMessage}</h2>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Pay with eSewa</h2>
      <form
        ref={formRef}
        method="POST"
        action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
      >
        <input type="hidden" name="amount" value={amount} />
        <input type="hidden" name="tax_amount" value="0" />
        <input type="hidden" name="total_amount" value={amount} />
        <input type="hidden" name="service_charge" value="0" />
        <input type="hidden" name="product_delivery_charge" value="0" />
        <input type="hidden" name="merchant_code" value={merchantCode} />
        <input type="hidden" name="product_code" value={productCode} />
        <input type="hidden" name="success_url" value={successUrl} />
        <input type="hidden" name="failure_url" value={failureUrl} />
        <input type="hidden" name="signature" value={signature} />
        <input type="hidden" name="signed_field_names" value={signedFieldNames} />
        <input type="hidden" name="transaction_uuid" value={uniqueOrderId} />
        <input type="hidden" name="payment_merchant_url" value="" />
        <input type="hidden" name="oid" value={uniqueOrderId} />

        <button
          type="button"
          onClick={handlePayment}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Pay Rs. {amount} with eSewa
        </button>
      </form>
    </div>
  );
}

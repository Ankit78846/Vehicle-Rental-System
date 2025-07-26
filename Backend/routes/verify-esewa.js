import express from "express";
import axios from "axios";
import Transaction from "../models/Transaction.js";
import Booking from "../models/Booking.js";

const router = express.Router();

router.post("/verify-esewa", async (req, res) => {
  const { amt, refId, oid } = req.body;

  try {
    const params = new URLSearchParams({
      amt,
      pid: oid,
      rid: refId,
      scd: "EPAYTEST", // sandbox merchant code
    });

    const { data } = await axios.get(
      `https://rc-epay.esewa.com.np/api/epay/verify/v1?${params}`
    );

    if (data.status === "COMPLETE") {
      // Update transaction status
      const transaction = await Transaction.findOne({ uuid: oid })
        .populate('vehicleData.vehicleId');

      if (transaction) {
        transaction.status = 'completed';
        transaction.transactionCode = refId;
        transaction.completedAt = new Date();
        await transaction.save();

        // Create booking automatically
        try {
          const existingBooking = await Booking.findOne({ transactionId: transaction.uuid });
          
          if (!existingBooking) {
            const bookingData = {
              // User information
              userId: transaction.userId,
              userName: transaction.userInfo.name,
              userEmail: transaction.userInfo.email || transaction.userEmail,
              userPhone: transaction.userInfo.phone,

              // Vehicle information
              vehicleId: transaction.vehicleData.vehicleId._id,
              vehicleName: transaction.vehicleData.name,
              vehicleModel: transaction.vehicleData.model,
              vehicleType: transaction.vehicleData.type,
              vehicleLocation: transaction.vehicleData.location,
              vehicleImage: transaction.vehicleData.image,
              pricePerDay: transaction.vehicleData.price,

              // Booking period
              startDate: new Date(transaction.bookingData.startDate),
              endDate: new Date(transaction.bookingData.endDate),
              startTime: transaction.bookingData.startTime,
              endTime: transaction.bookingData.endTime,

              // Pricing details
              pricing: {
                basePrice: transaction.amount * 0.85,
                serviceFee: transaction.amount * 0.10,
                taxes: transaction.amount * 0.05,
                totalAmount: transaction.amount
              },

              // Billing information
              billingAddress: transaction.billingAddress,

              // Payment information
              paymentMethod: transaction.paymentMethod,
              paymentStatus: 'completed',
              transactionId: transaction.uuid,
              esewaTransactionCode: refId,
              paymentDate: new Date(),

              // Booking status
              bookingStatus: 'confirmed'
            };

            const booking = new Booking(bookingData);
            await booking.save();
            
            console.log('Booking created automatically for transaction:', transaction.uuid);
          }
        } catch (bookingError) {
          console.error('Error creating booking:', bookingError);
        }
      }

      return res.json({ verified: true, data });
    } else {
      return res.json({ verified: false, data });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;

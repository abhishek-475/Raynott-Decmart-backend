const crypto = require("crypto");
const razorpay = require("../services/razorpayService");
const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const { orderId } = req.body; 

    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user._id 
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Razorpay amount
    const options = {
      amount: order.totalPrice * 100,
      currency: "INR",
      receipt: "rb_" + Date.now(),
    };

    const razorOrder = await razorpay.orders.create(options);

    // Update order with razorpay order ID
    order.paymentInfo.razorpay_order_id = razorOrder.id;
    await order.save();

    res.json({ razorOrder, order });

  } catch (err) {
    console.error("CREATE PAYMENT ORDER ERROR:", err);
    res.status(500).json({ message: "Payment order creation failed" });
  }
};


exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Verify signature first
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expected !== razorpay_signature)
      return res.status(400).json({ message: "Invalid signature" });

    // Verify order belongs to user
    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user._id 
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order
    await Order.findByIdAndUpdate(orderId, {
      paymentInfo: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        status: "Paid",
      },
      orderStatus: "Processing"
    });

    res.json({ message: "Payment verified" });

  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};
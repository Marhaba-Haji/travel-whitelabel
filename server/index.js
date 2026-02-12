import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, ".env"), silent: true, override: true });
import express from "express";
import cors from "cors";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// PayU credentials - NEVER expose these to the frontend
const PAYU_KEY = process.env.PAYU_KEY;
const PAYU_SALT = process.env.PAYU_SALT_32 || process.env.PAYU_SALT; // Use 32-bit salt; set PAYU_SALT_256 if your account uses 256-bit
const PAYU_SALT_256 = process.env.PAYU_SALT_256;
// Production key 5iAP6W requires production URL - using secure.payu.in
const PAYU_ACTION = "https://secure.payu.in/_payment";

function generatePayUHash(params, salt) {
  const hashString = [
    params.key,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 || "",
    params.udf2 || "",
    params.udf3 || "",
    params.udf4 || "",
    params.udf5 || "",
    "",
    "",
    "",
    "",
    "",
    salt,
  ].join("|");
  return crypto.createHash("sha512").update(hashString).digest("hex");
}

app.post("/api/create-payment", (req, res) => {
  try {
    const salt = PAYU_SALT_256 || PAYU_SALT;
    if (!PAYU_KEY || !salt) {
      return res.status(200).json({
        demo: true,
        redirect: "/signup-success",
      });
    }

    const body = req.body || {};
    const { fullName, email, phone, city } = body;

    if (!email || !fullName || !phone) {
      return res.status(400).json({ error: "Missing required fields: fullName, email, phone" });
    }

    const amount = "18799.00"; // ₹18,799 - PayU expects amount in INR
  const txnid = `TXN${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
  const productinfo = "Travel Agency White-Label Platform - Annual Subscription";
  const firstname = fullName.split(" ")[0] || fullName;

  const baseUrl = process.env.BASE_URL || "http://localhost:8080";
  const surl = `${baseUrl}/signup-success`;
  const furl = `${baseUrl}/signup?payment=failed`;

  const params = {
    key: PAYU_KEY,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone: (phone || "").replace(/\D/g, "").slice(-10),
    surl,
    furl,
    udf1: city || "",
    udf2: fullName,
    udf3: "",
    udf4: "",
    udf5: "",
  };

  const hash = generatePayUHash(params, salt);
  params.hash = hash;

    res.json({
      action: PAYU_ACTION,
      params,
    });
  } catch (err) {
    console.error("create-payment error:", err);
    res.status(500).json({
      error: "Server error",
      message: err?.message || "Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`PayU API server running on http://localhost:${PORT}`);
  console.log(`PayU: ${PAYU_ACTION}`);
});

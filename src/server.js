const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

/* ================= DB CONNECTION ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

/* ================= SCHEMAS ================= */
const userSchema = new mongoose.Schema(
  {
    tblregister: [
      {
        id: Number,
        fname: String,
        uname: String,
        email: String,
        mobile: String,
        gender: String,
        dob: String,
        password: String
      }
    ]
  },
  { collection: "register" }
);

const planSchema = new mongoose.Schema(
  {
    tblplan: [
      {
        planid: Number,
        plan_name: String,
        Data: String,
        amount: Number,
        validity: String,
        description: String
      }
    ]
  },
  { collection: "plans" }
);

const wifiSchema = new mongoose.Schema(
  {
    tblwifi: [
      {
        wifiid: Number,
        plan_name: String,
        data: String,
        amount: Number,
        validity: String,
        description: String
      }
    ]
  },
  { collection: "wifi" }
);

const mpaySchema = new mongoose.Schema(
  {
    tblpayment: [
      {
        pid: Number,
        id: String,
        planid: Number,
        amount: Number,
        method: String,
        tid: Number,
        rechargeat: String
      }
    ]
  },
  { collection: "p_payment" }
);

const wpaySchema = new mongoose.Schema(
  {
    tblwifipayment: [
      {
        pid: Number,
        id: String,
        wifiid: Number,
        amount: Number,
        method: String,
        tid: Number,
        rechargeat: String
      }
    ]
  },
  { collection: "w_payment" }
);

const feedbackSchema = new mongoose.Schema(
  {
    tblfeedback: [
      {
        id: Number,
        userEmail: String,
        rating: Number,
        mood: String,
        comment: String,
        createdAt: String
      }
    ]
  },
  { collection: "feedback" }
);

/* ================= MODELS ================= */
const User = mongoose.model("User", userSchema);
const Mobile = mongoose.model("Mobile", planSchema);
const Wifi = mongoose.model("Wifi", wifiSchema);
const Mpay = mongoose.model("Mpay", mpaySchema);
const Wpay = mongoose.model("Wpay", wpaySchema);
const Feedback = mongoose.model("Feedback", feedbackSchema);

/* ================= AUTH ================= */
app.post("/signup", async (req, res) => {
  await User.updateOne(
    {},
    { $push: { tblregister: { ...req.body, id: Date.now() } } },
    { upsert: true }
  );
  res.json({ message: "Signup successful" });
});

app.post("/login", async (req, res) => {
  const doc = await User.findOne({ "tblregister.email": req.body.email });
  if (!doc) return res.status(400).json({ message: "User not found" });

  const user = doc.tblregister.find(u => u.email === req.body.email);
  if (user.password !== req.body.password)
    return res.status(400).json({ message: "Wrong password" });

  res.json({ message: "Login success", user });
});

/* ================= PROFILE ================= */
app.get("/user", async (req, res) => {
  const docs = await User.find({});
  res.json(docs[0]?.tblregister || []);
});
app.get("/update", async (req, res) => {
  const doc = await User.findOne({ "tblregister.email": req.query.email });
  if (!doc) return res.status(404).json({ message: "User not found" });

  res.json(doc.tblregister.find(u => u.email === req.query.email));
});

app.put("/edit", async (req, res) => {
  await User.updateOne(
    { "tblregister.email": req.query.email },
    { $set: { "tblregister.$": req.body } }
  );
  res.json({ message: "Profile updated" });
});

/* ================= MOBILE ================= */
app.get("/mobile", async (req, res) => {
  const docs = await Mobile.find({});
  res.json(docs[0]?.tblplan || []);
});

app.post("/minsert", async (req, res) => {
  await Mobile.updateOne({}, { $push: { tblplan: req.body } }, { upsert: true });
  res.json({ message: "Mobile plan added" });
});

app.put("/medit/:planid", async (req, res) => {
  await Mobile.updateOne(
    { "tblplan.planid": Number(req.params.planid) },
    { $set: { "tblplan.$": req.body } }
  );
  res.json({ message: "Mobile plan updated" });
});

app.delete("/mdelete/:planid", async (req, res) => {
  await Mobile.updateOne(
    {},
    { $pull: { tblplan: { planid: Number(req.params.planid) } } }
  );
  res.json({ message: "Mobile plan deleted" });
});

/* ================= WIFI ================= */
app.get("/wifi", async (req, res) => {
  const docs = await Wifi.find({});
  res.json(docs[0]?.tblwifi || []);
});

app.post("/winsert", async (req, res) => {
  await Wifi.updateOne({}, { $push: { tblwifi: req.body } }, { upsert: true });
  res.json({ message: "Wifi plan added" });
});

app.put("/wedit/:wifiid", async (req, res) => {
  await Wifi.updateOne(
    { "tblwifi.wifiid": Number(req.params.wifiid) },
    { $set: { "tblwifi.$": req.body } }
  );
  res.json({ message: "Wifi plan updated" });
});

app.delete("/wdelete/:wifiid", async (req, res) => {
  await Wifi.updateOne(
    {},
    { $pull: { tblwifi: { wifiid: Number(req.params.wifiid) } } }
  );
  res.json({ message: "Wifi plan deleted" });
});


app.get("/wifi/:wifiid", async (req, res) => {
  try {
    const docs = await Wifi.find({});
    const plans = docs[0]?.tblwifi || [];

    const plan = plans.find(
      p => String(p.wifiid) === String(req.params.wifiid)
    );

    if (!plan) {
      return res.status(404).json({ message: "WiFi plan not found" });
    }

    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ================= PAYMENTS ================= */
app.get("/mpay", async (req, res) => {
  const docs = await Mpay.find({});
  res.json(docs[0]?.tblpayment || []);
});
app.post("/p_payment", async (req, res) => {
  await Mpay.updateOne({}, { $push: { tblpayment: req.body } }, { upsert: true });
  res.json({ message: "Payment success" });
});

app.get("/wpay", async (req, res) => {
  const docs = await Wpay.find({});
  res.json(docs[0]?.tblwifipayment || []);
});
app.post("/w_payment", async (req, res) => {
  await Wpay.updateOne({}, { $push: { tblwifipayment: req.body } }, { upsert: true });
  res.json({ message: "Payment success" });
});

/* ================= FEEDBACK ================= */
app.get("/feed", async (req, res) => {
  const docs = await Feedback.find({});
  res.json(docs[0]?.tblfeedback || []);
});
app.post("/feedback", async (req, res) => {
  await Feedback.updateOne(
    {},
    { $push: { tblfeedback: req.body } },
    { upsert: true }
  );
  res.json({ message: "Feedback added" });
});

/* ================= DASHBOARD ================= */
app.get("/dashboard", async (req, res) => {
  const users = await User.find({});
  const mobile = await Mobile.find({});
  const wifi = await Wifi.find({});
  const mpay = await Mpay.find({});
  const wpay = await Wpay.find({});
  const fb = await Feedback.find({});

  res.json({
    usersCount: users[0]?.tblregister.length || 0,
    mobilePlans: mobile[0]?.tblplan.length || 0,
    wifiPlans: wifi[0]?.tblwifi.length || 0,
    mobileProfit: mpay[0]?.tblpayment.reduce((s, p) => s + Number(p.amount || 0), 0) || 0,
    wifiProfit: wpay[0]?.tblwifipayment.reduce((s, p) => s + Number(p.amount || 0), 0) || 0,
    feedback: fb[0]?.tblfeedback.length || 0
  });
});

/* ================= SERVER ================= */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

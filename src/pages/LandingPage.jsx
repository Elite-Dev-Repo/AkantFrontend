import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DollarSign,
  ArrowRight,
  Zap,
  Users,
  BarChart3,
  Shield,
  Check,
  MessageSquare,
  Plus,
  CreditCard,
  ChevronDown,
  TrendingUp,
  Clock,
  Globe,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Users,
    title: "Group Expenses",
    desc: "Create groups for roommates, trips, or events. Everyone sees every split in real time.",
  },
  {
    icon: Zap,
    title: "Instant Paystack Pay",
    desc: "Pay debts in one click via card, bank transfer, or USSD. No back-and-forth.",
  },
  {
    icon: BarChart3,
    title: "Monthly Reports",
    desc: "Visual breakdowns of where your money goes every month, by category.",
  },
  {
    icon: Shield,
    title: "Fair Splitting",
    desc: "Equal, exact amounts, or percentages — you decide exactly how to split every bill.",
  },
];

const STEPS = [
  {
    icon: Plus,
    title: "Add your expense",
    desc: "Enter the amount and what it's for. Quick and simple.",
  },
  {
    icon: Users,
    title: "Select the group",
    desc: "Choose who was involved. We'll handle the math automatically.",
  },
  {
    icon: CreditCard,
    title: "Settle instantly",
    desc: "Pay your share or get paid back via Paystack — securely and instantly.",
  },
];

const STATS = [
  { value: "10K+", label: "Active groups", icon: Users },
  { value: "2B+", label: "Expenses tracked", icon: TrendingUp },
  { value: "50K+", label: "Happy users", icon: Globe },
  { value: "< 2 days", label: "Avg. time to settle", icon: Clock },
];

const TESTIMONIALS = [
  {
    quote:
      "No more awkward 'who owes what' texts after a night out. Akant is a lifesaver.",
    author: "Tunde O.",
    role: "Digital Nomad, Lagos",
  },
  {
    quote:
      "The Paystack integration makes settling up so much faster than bank transfers.",
    author: "Amaka J.",
    role: "Housemate, Abuja",
  },
  {
    quote:
      "We use it for our office lunch group. Everyone pays their share on time now.",
    author: "Chidi N.",
    role: "Software Engineer, Port Harcourt",
  },
  {
    quote:
      "Finally an app that understands how Nigerians split bills. The percentage split is genius.",
    author: "Fatima B.",
    role: "Event Planner, Kano",
  },
];

const PRICING = [
  {
    plan: "Free",
    price: "0",
    period: "forever",
    features: [
      "Up to 3 groups",
      "10 expenses/month",
      "Basic reports",
      "Email reminders",
      "Paystack payments",
    ],
    cta: "Get started free",
    highlight: false,
    paystackPlanCode: null,
  },
  {
    plan: "Pro",
    price: "2,500",
    period: "/month",
    features: [
      "Unlimited groups",
      "Unlimited expenses",
      "Advanced reports",
      "Priority support",
      "Custom categories",
      "Export to CSV",
    ],
    cta: "Start free trial",
    highlight: true,
    paystackPlanCode:
      typeof window !== "undefined"
        ? window.__ENV?.VITE_PAYSTACK_PRO_PLAN_CODE || null
        : null,
  },
];

const FAQS = [
  {
    q: "How does splitting work?",
    a: "When you add an expense, Akant automatically divides it among your group members. You can split equally, set exact amounts per person, or use percentages — whatever fits your situation.",
  },
  {
    q: "Is Paystack safe to use?",
    a: "Yes. Akant uses Paystack, Nigeria's most trusted payment infrastructure. Your card and bank details are never stored on our servers — all payment processing happens securely on Paystack's platform.",
  },
  {
    q: "What payment methods does Paystack support?",
    a: "Paystack supports debit/credit cards (Visa, Mastercard, Verve), bank transfers, USSD, QR codes, and mobile money. Most Nigerian banks are supported.",
  },
  {
    q: "Can I use Akant without paying?",
    a: "Absolutely. The Free plan lets you create up to 3 groups and track 10 expenses per month at no cost, forever. Upgrade to Pro only when you need more.",
  },
  {
    q: "How do group invites work?",
    a: "As a group admin, you enter your friend's email address and they receive an invite link. They click the link, create an account if they don't have one, and they're instantly added to your group.",
  },
  {
    q: "What happens if someone doesn't pay?",
    a: "You can send them an email reminder with one click from the Reminders page. Akant tracks all outstanding balances and shows exactly who owes what at all times.",
  },
  {
    q: "Can I delete an expense after adding it?",
    a: "Yes. The person who created the expense, or any group admin, can delete it. Balances are automatically recalculated the moment an expense is removed.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your expense data is only visible to members of your group. We do not sell or share your data with third parties.",
  },
];

const access = localStorage.getItem("access_token");

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false }}
      variants={itemVariants}
      className="border border-ink-100 rounded-xl overflow-hidden bg-white"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-ink-50 transition-colors"
      >
        <span className="font-display font-semibold text-ink-900 pr-4">
          {q}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-ink-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-ink-600 text-sm leading-relaxed border-t border-ink-50 pt-4">
          {a}
        </div>
      )}
    </motion.div>
  );
}

function handleProUpgrade(paystackPlanCode) {
  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  if (!paystackPublicKey) {
    window.location.href = "/register";
    return;
  }

  if (!paystackPlanCode) {
    window.location.href = "/register";
    return;
  }

  if (typeof window.PaystackPop === "undefined") {
    const email = window.prompt("Enter your email to continue with Pro:");
    if (!email) return;
    const url = `https://paystack.com/pay/${paystackPlanCode}?email=${encodeURIComponent(email)}`;
    window.open(url, "_blank");
    return;
  }

  const email = window.prompt("Enter your email to start your Pro trial:");
  if (!email) return;

  const handler = window.PaystackPop.setup({
    key: paystackPublicKey,
    email,
    plan: paystackPlanCode,
    currency: "NGN",
    callback: (response) => {
      window.location.href = `/register?ref=${response.reference}`;
    },
    onClose: () => {},
  });
  handler.openIframe();
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-body">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-ink-100 bg-brand-50/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <p className="text-white text-[1.2em]">₦</p>
            </div>
            <span className="text-xl font-display font-bold text-ink-900">
              Akant
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-600">
            <a
              href="#features"
              className="hover:text-ink-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-ink-900 transition-colors"
            >
              How it works
            </a>
            <a href="#pricing" className="hover:text-ink-900 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-ink-900 transition-colors">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            {access ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get started free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 to-white pt-20 pb-24">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #000 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto px-6 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Zap className="h-3.5 w-3.5" /> Powered by Paystack
          </div>
          <h1 className="text-5xl sm:text-6xl font-display font-bold text-ink-950 leading-tight text-balance mb-6">
            Split the bills.
            <br />
            <span className="text-brand-500">Not the vibe.</span>
          </h1>
          <p className="text-xl text-ink-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Akant makes shared expenses effortless. Track who owes what, settle
            up with Paystack, and never do mental maths after a group dinner
            again.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={access ? "/dashboard" : "/register"}>
              <Button variant="primary" size="lg" className="gap-2">
                {access ? "Go to Dashboard" : "Start splitting for free"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {!access && (
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Sign in to your account
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="py-12 bg-ink-950">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          className="max-w-5xl mx-auto px-6"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon }) => (
              <motion.div
                variants={itemVariants}
                key={label}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <Icon className="h-5 w-5 text-brand-400" />
                </div>
                <p className="text-3xl font-display font-bold text-white">
                  {value}
                </p>
                <p className="text-sm text-ink-400 mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          variants={itemVariants}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-display font-bold text-ink-900 mb-3">
            Everything you need to split fairly
          </h2>
          <p className="text-ink-500 text-lg">
            Built for roommates, travel groups, and anyone who shares expenses.
          </p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <motion.div
              variants={itemVariants}
              key={title}
              className="card-hover p-6 rounded-2xl"
            >
              <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="font-display font-semibold text-ink-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-brand-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            variants={itemVariants}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-display font-bold text-ink-900 mb-4">
              How it works
            </h2>
            <p className="text-ink-500 text-lg">
              Set up and settle in seconds.
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            className="grid md:grid-cols-3 gap-12"
          >
            {STEPS.map(({ icon: Icon, title, desc }, idx) => (
              <motion.div
                variants={itemVariants}
                key={title}
                className="relative flex flex-col items-center text-center"
              >
                <div className="h-16 w-16 rounded-2xl bg-white shadow-sm border border-brand-100 flex items-center justify-center mb-4 relative z-10">
                  <Icon className="h-8 w-8 text-brand-500" />
                </div>
                {idx !== STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-brand-200" />
                )}
                <div className="h-7 w-7 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center mb-3">
                  {idx + 1}
                </div>
                <h3 className="text-xl font-display font-bold text-ink-900 mb-3">
                  {title}
                </h3>
                <p className="text-ink-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-ink-950">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            variants={itemVariants}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-display font-bold text-white mb-3">
              Simple pricing
            </h2>
            <p className="text-ink-400">
              Start free, upgrade when you need more.
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto"
          >
            {PRICING.map((item) => (
              <motion.div
                variants={itemVariants}
                key={item.plan}
                className={`rounded-2xl p-8 ${item.highlight ? "bg-brand-500 text-white ring-2 ring-brand-400 ring-offset-2 ring-offset-ink-950" : "bg-white/5 text-white border border-white/10"}`}
              >
                <div className="mb-6">
                  <p
                    className={`text-sm font-medium mb-1 ${item.highlight ? "text-brand-100" : "text-ink-400"}`}
                  >
                    {item.plan}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-display font-bold">
                      {item.price === "0" ? "Free" : `₦${item.price}`}
                    </span>
                    <span
                      className={`text-sm mb-1 ${item.highlight ? "text-brand-100" : "text-ink-500"}`}
                    >
                      {item.period}
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {item.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check
                        className={`h-4 w-4 shrink-0 ${item.highlight ? "text-brand-100" : "text-brand-500"}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={item.highlight ? "secondary" : "outline"}
                  className="w-full"
                  onClick={() =>
                    item.highlight && handleProUpgrade(item.paystackPlanCode)
                  }
                >
                  {item.cta}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          className="grid sm:grid-cols-2 gap-6"
        >
          {TESTIMONIALS.map(({ quote, author, role }) => (
            <motion.div
              variants={itemVariants}
              key={author}
              className="bg-white p-8 rounded-2xl border border-ink-100 shadow-sm"
            >
              <MessageSquare className="h-6 w-6 text-brand-500 mb-4" />
              <p className="text-ink-800 italic mb-6">"{quote}"</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center font-display font-bold text-brand-700 text-sm">
                  {author[0]}
                </div>
                <div>
                  <p className="font-display font-bold text-ink-900 text-sm">
                    {author}
                  </p>
                  <p className="text-xs text-ink-400">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-ink-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: false }}
          className="max-w-4xl mx-auto bg-brand-600 rounded-3xl p-12 text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Ready to stop the awkward money talks?
          </h2>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-white text-brand-600 hover:bg-brand-50"
            >
              Create your free account
            </Button>
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-ink-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <span className="font-display font-semibold text-ink-700">Akant</span>
          <p className="text-sm text-ink-400">
            &copy; {new Date().getFullYear()} Akant.
          </p>
        </div>
      </footer>
    </div>
  );
}

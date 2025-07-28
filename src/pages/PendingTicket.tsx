import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type APITicket = {
  id: number;
  title: string;
  price: number;
  status: string;
};

type VerifiedUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

export default function PendingTicketPage() {
  const [tickets, setTickets] = useState<APITicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<Record<number, string>>(
    {}
  );

  const navigate = useNavigate();

  const user = useMemo<VerifiedUser | null>(() => {
    const stored = localStorage.getItem("verifiedUser");
    return stored ? JSON.parse(stored) : null;
  }, []);

  useEffect(() => {
    if (!user) {
      toast.error("Please verify your Ghana Card first.");
      navigate("/validate-user");
      return;
    }

    const fetchTickets = async () => {
      try {
        const response = await fetch(
          `https://nestjs.fasthosttech.com/ticket-system/get-user-tickets/${user.id}`
        );
        const json = await response.json();

        if (json.success && Array.isArray(json.data)) {
          setTickets(json.data);
        } else {
          toast.error("Failed to retrieve your tickets.");
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
        toast.error("Error fetching tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, navigate]);

  const handlePayment = async (ticketId: number) => {
    const method = paymentMethods[ticketId];
    if (!method) {
      toast.warning("Please select a payment method.");
      return;
    }

    setProcessing(ticketId);
    try {
      const response = await fetch(
        `https://nestjs.fasthosttech.com/ticket-system/make-payment/${ticketId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ method }), // send method if your backend accepts it
        }
      );
      const json = await response.json();

      if (json.success) {
        toast.success("Payment successful!");
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, status: "paid" } : ticket
          )
        );
      } else {
        toast.error(json.message || "Payment failed.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment request failed.");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">🎟️ My Dashboard</h1>
        <Button
          variant="ghost"
          onClick={() => {
            localStorage.removeItem("verifiedUser");
            navigate("/");
          }}
          className="flex items-center gap-2 text-red-500"
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            Pending Tickets
          </h2>
          <p className="text-gray-500 mt-1">
            You currently have <strong>{tickets.length}</strong> ticket
            {tickets.length !== 1 && "s"}.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg p-6 shadow text-center text-gray-500">
            No tickets found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-lg p-4 shadow border border-gray-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket size={20} className="text-blue-500" />
                    <h3 className="text-lg font-semibold">
                      {ticket.title.toUpperCase()} Ticket
                    </h3>
                  </div>
                  <div className="text-gray-700 text-sm space-y-1">
                    <p>
                      <strong>Amount:</strong> GHS {ticket.price}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={
                          ticket.status === "paid"
                            ? "text-green-500 capitalize"
                            : "text-yellow-500 capitalize"
                        }
                      >
                        {ticket.status}
                      </span>
                    </p>
                  </div>

                  {ticket.status === "pending" && (
                    <div className="mt-4">
                      <label className="block text-sm text-gray-600 mb-1">
                        Select Payment Method:
                      </label>
                      <select
                        className="w-full p-2 border rounded text-sm"
                        value={paymentMethods[ticket.id] || ""}
                        onChange={(e) =>
                          setPaymentMethods((prev) => ({
                            ...prev,
                            [ticket.id]: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- Select Payment Method --</option>
                        <option value="momo">Mobile Money</option>
                        <option value="visa">Visa Card</option>
                      </select>
                      <Button
                        onClick={() => handlePayment(ticket.id)}
                        className={`mt-3 w-full transition-all duration-200 ${
                          !paymentMethods[ticket.id]
                            ? "opacity-60 blur-[1px] cursor-not-allowed"
                            : ""
                        }`}
                        disabled={!paymentMethods[ticket.id] || processing === ticket.id}
                      >
                        {processing === ticket.id ? "Processing..." : "Pay Now"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

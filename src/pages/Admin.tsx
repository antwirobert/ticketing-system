import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket } from "lucide-react";
// import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

type APITicket = {
  id: number;
  title: string;
  first_name: string;
  last_name: string;
  email: string;
  price: number;
  status: string;
};

type VerifiedUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

export default function AdminPage() {
  const [tickets, setTickets] = useState<APITicket[]>([]);
  const [loading, setLoading] = useState(true);
  // const [processing, setProcessing] = useState<number | null>(null);
  // const [paymentMethods, setPaymentMethods] = useState<Record<number, string>>(
  //   {}
  // );

  const navigate = useNavigate();

  const user = useMemo<VerifiedUser | null>(() => {
    const stored = localStorage.getItem("verifiedUser");
    return stored ? JSON.parse(stored) : null;
  }, []);

  useEffect(() => {

    const fetchTickets = async () => {
      try {
        const response = await fetch(`https://nestjs.fasthosttech.com/ticket-system/get-all-users-with-tickets`);
        const json = await response.json();

        console.log("Fetched tickets:", json);

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

  const [filterStatus, setFilterStatus] = useState('all');

// Filter tickets based on status
const filteredTickets = tickets.filter((ticket) => {
  if (filterStatus === 'all') return true;
  return ticket.status === filterStatus;
});

  return (
    <div className="min-h-screen bg-gray-100">
      {/* <header className="bg-white shadow p-4 flex justify-between items-center">
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
      </header> */}

       <Navbar />

      <main className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            Admin Dashboard
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
          <div>
    {/* Status Filter */}
    <div className="mb-4 flex justify-between items-center">
      <label className="text-sm font-medium text-gray-700 mr-2">
        Filter by Status:
      </label>
      <select
        className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
      >
        <option value="all">All</option>
        <option value="paid">Paid</option>
        <option value="pending">Pending</option>
      </select>
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg border border-gray-200 shadow">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer Name
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer Email
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ticket Type
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredTickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Ticket size={20} className="text-blue-500" />
                  <h3 className="text-lg font-semibold">
                    {ticket.first_name} {" "} {ticket.last_name} 
                  </h3>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Ticket size={20} className="text-blue-500" />
                  <h3 className="text-lg font-semibold">
                    {ticket.email} 
                  </h3>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Ticket size={20} className="text-blue-500" />
                  <h3 className="text-lg font-semibold">
                    {ticket.title} Ticket
                  </h3>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                GHS {ticket.price}
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span
                  className={
                    ticket.status === "paid"
                      ? "text-green-500 capitalize"
                      : "text-yellow-500 capitalize"
                  }
                >
                  {ticket.status}
                </span>
              </td>
            </tr>
          ))}
          {filteredTickets.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                No tickets match the selected filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
        )}
      </main>
    </div>
  );
}

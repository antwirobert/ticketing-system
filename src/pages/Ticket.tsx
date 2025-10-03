import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateTicket } from "@/services";
import Navbar from "@/components/Navbar";
import PoliceGhanaCardVerificationForm from "@/components/PoliceGhanaCardVerificationForm";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Enter a valid email." }),
  ticket: z.string().min(1, { message: "Select a ticket option." }),
});

export default function TicketForm() {
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userFromState = location.state;
  const user = useMemo(() => {
    return (
      userFromState ||
      JSON.parse(localStorage.getItem("verifiedPolice") || "{}")
    );
  }, [userFromState]);

  const [checkGhanaCard, setCheckGhanaCard] = useState(false);
  const [tickets, setTickets] = useState<
    { id: number; title: string; price: number }[]
  >([]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      ticket: "",
    },
  });

  // console.log("User Data:", !user);

  useEffect(() => {
    if (user === null || Object.keys(user).length === 0) {
      toast.error("User data missing. Please verify your Ghana Card first.");
      navigate("/");
    } else {
      form.reset({
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        ticket: "",
      });
    }
    setCheckGhanaCard(false);
    fetchTickets()
  }, [user, navigate, form]);

  //*****Write a function to fetch for all tickets */
  const fetchTickets = async () => {
    try {
      const response = await fetch(
        `https://nestjs.fasthosttech.com/ticket-system/get-all-tickets`
      );
      const json = await response.json();

      // console.log(json.data);

      if (json.success && Array.isArray(json.data)) {
        console.log(json.data);
        setTickets(json.data);

        // return json.data;
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

  const ticketOptions = tickets || [
    { id: 1, title: "Standard", price: 50 },
    { id: 2, title: "Premium", price: 100 },
    { id: 3, title: "VIP", price: 200 },
  ];

  const getTicketDetails = (value: number) =>
    ticketOptions.find((t) => t.price === value);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      toast.error("User ID missing. Cannot proceed.");
      return;
    }

  
    const ticketDetails = getTicketDetails(parseInt(values.ticket));
    if (!ticketDetails) {
      toast.error("Invalid ticket type selected.");
      return;
    }

    console.log("Values:", ticketDetails);

    setLoading(true);

    try {
      const result = await generateTicket({
        userId: user.id,
        ticketId: ticketDetails.id,
      });

      if (result.status !== 200) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      navigate("/");
    } catch (error) {
      console.error("Error generating ticket:", error);
      toast.error("Failed to generate ticket.");
    } finally {
      setLoading(false);
    }
  };

  const changeGhanaCard = () => {
    setCheckGhanaCard(true);
  }

  // console.log("Selected Ticket:", selectedTicket);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 relative">
     <Navbar />

    {checkGhanaCard === false ? 
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-md bg-white shadow-lg rounded-xl p-8"
        >
          <div className="text-center mb-6">
            <img
              src="/profile_img.jpg"
              alt="Profile image"
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-gray-300 shadow"
            />
            <h1 className="text-2xl font-bold text-gray-800">
              Generate Event Ticket
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Your details have been verified. Choose your ticket type.
            </p>
          </div>

          {/* First Name */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} disabled readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ticket Select */}
          <FormField
            control={form.control}
            name="ticket"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Select Ticket</FormLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    setSelectedTicket(val);
                  }}
                  value={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose ticket type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ticketOptions.map((ticket) => (
                      <SelectItem key={ticket.price} value={ticket.price.toString()}>
                        {ticket.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ticket Preview */}
          {selectedTicket && (
            <div className="mt-6 border rounded-lg bg-gray-100 p-4 text-center">
              <p className="text-lg font-semibold">
                {ticketOptions.find(t => t.price.toString() === selectedTicket)?.title} Ticket
              </p>
              <p className="text-gray-600 mt-1">
                Amount: GHS {selectedTicket}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={loading || !selectedTicket}
            style={{ backgroundColor: "#048000FF", color: "white" }}
          >
            {loading ? "Generating Ticket..." : "Generate Ticket"}
          </Button>

          {/* Submit Button */}
          <Button
            onClick={changeGhanaCard}
            className="w-full mt-6"
            disabled={loading}
            style={{ backgroundColor: "#460080FF", color: "white" }}
          >
            {loading ? "Loading..." : "Validate Another Ghana Card"}
          </Button>

          <div className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Your data is securely processed
          </div>
        </form>
      </Form> 
    : 
    
    <PoliceGhanaCardVerificationForm />
    }
      
    </div>
  );
}

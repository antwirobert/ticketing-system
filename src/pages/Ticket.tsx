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

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Enter a valid email." }),
  ticket: z.string().min(1, { message: "Select a ticket option." }),
});

const ticketOptions = [
  {
    label: "Over Speeding - GHS 1",
    value: "overspeeding",
    amount: 1,
    ticketId: 1,
  },
];

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      ticket: "",
    },
  });

  useEffect(() => {
    if (!user) {
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
  }, [user, navigate, form]);

  const getTicketDetails = (value: string) =>
    ticketOptions.find((t) => t.value === value);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      toast.error("User ID missing. Cannot proceed.");
      return;
    }

    const ticketDetails = getTicketDetails(values.ticket);
    if (!ticketDetails) {
      toast.error("Invalid ticket type selected.");
      return;
    }

    setLoading(true);

    try {
      const result = await generateTicket({
        userId: user.id,
        ticketId: ticketDetails.ticketId,
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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 relative">
      <div className="absolute top-4 right-4 flex gap-2">
        <Button onClick={() => navigate("/ticket")} variant="outline">
          Dashboard
        </Button>
        <Button
          onClick={() => {
            localStorage.removeItem("verifiedPolice");
            navigate("/");
          }}
          variant="ghost"
        >
          Sign Out
        </Button>
      </div>

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
                      <SelectItem key={ticket.value} value={ticket.value}>
                        {ticket.label}
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
                {getTicketDetails(selectedTicket)?.label.split(" - ")[0]} Ticket
              </p>
              <p className="text-gray-600 mt-1">
                Amount: GHS {getTicketDetails(selectedTicket)?.amount}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={loading || !selectedTicket}
          >
            {loading ? "Generating Ticket..." : "Generate Ticket"}
          </Button>

          <div className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Your data is securely processed
          </div>
        </form>
      </Form>
    </div>
  );
}

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
import { useState } from "react";
import { toast } from "sonner";
import { verifyGhanaCard } from "@/services";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  ghana_card: z.string().min(8, {
    message: "Please enter a valid Ghana Card number.",
  }),
});

export default function UserGhanaCardVerificationForm() {
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ghana_card: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setVerifying(true);

    verifyGhanaCard(values, "user")
      .then((res) => {
        if (res.status !== 200) {
          toast.error(res.message);
        } else {
          toast.success(res.message);
          localStorage.setItem("verifiedUser", JSON.stringify(res.user));
          navigate("/pending-ticket", { state: res.user });
        }

        setVerifying(false);
      })
      .catch((error) => {
        console.error(`Invalid Ghana card entered: ${error}`);
        toast.error("Invalid Ghana card entered. Please try again later.");
        setVerifying(false);
      });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex justify-center items-center min-h-screen bg-gray-50 px-4"
      >
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Ghana Card Verification
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Enter your Ghana Card number to proceed to ticket selection.
            </p>
          </div>

          <FormField
            control={form.control}
            name="ghana_card"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Ghana Card Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="GHA-XXXXXXXXX-X"
                    {...field}
                    className="mt-2 mb-1"
                    disabled={verifying}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-6" disabled={verifying}>
            {verifying ? "Verifying..." : "Verify & Continue"}
          </Button>

          <div className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Your identity is securely verified
          </div>
        </div>
      </form>
    </Form>
  );
}

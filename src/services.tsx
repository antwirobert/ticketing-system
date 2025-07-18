export type GhanaCardFormValues = {
  ghana_card: string;
};

export type GhanaCardUser = {
  id: number;
  ghana_card: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  createdAt: string;
  updatedAt: string;
};

export const verifyGhanaCard = async (
  values: GhanaCardFormValues,
  role: "user" | "police"
) => {
  const API_BASE_URL = "https://nestjs.fasthosttech.com";

  const endpoint =
    role === "police"
      ? `${API_BASE_URL}/ticket-system/validate`
      : `${API_BASE_URL}/ticket-system/user-validate`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        status: 422,
        message: data.message || "Verification failed.",
        user: null,
      };
    }

    return {
      status: 200,
      message: "Ghana card verified successfully",
      user: data.data as GhanaCardUser,
    };
  } catch (err) {
    return {
      status: 500,
      message: "Network or server error",
      user: null,
    };
  }
};

interface GenerateTicketPayload {
  userId: number;
  ticketId: number;
}

export const generateTicket = async (payload: GenerateTicketPayload) => {
  const API_BASE_URL = "https://nestjs.fasthosttech.com";
  const endpoint = `${API_BASE_URL}/ticket-system/generate-ticket`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        status: 422,
        message: data.message || "Ticket generation failed.",
      };
    }

    return {
      status: 200,
      message: "Ticket successfully generated!",
    };
  } catch (err) {
    return {
      status: 500,
      message: "Network or server error",
    };
  }
};

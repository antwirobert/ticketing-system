import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <>
      <div className="absolute top-4 left-10 text-center flex items-center gap-2">
        <img
          src="/police_image.jpeg"
          alt="Profile image"
          className="w-20 h-15 rounded-full object-cover border-2 border-gray-300 shadow"
        />
        <Button
          variant="ghost"
          className="text-lg font-bold bg-no-repeat bg-cover bg-gray-50 rounded-full"
        >
          Ghana Police Service
        </Button>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        {/* <Button onClick={() => navigate("/ticket")} variant="outline">
          Dashboard
        </Button> */}

        <Button  variant="outline">
          Dashboard
        </Button>
        <Button
          onClick={() => {
            localStorage.removeItem("verifiedPolice");
            navigate("/");
          }}
          variant="ghost"
          style={{ color: "red", backgroundColor: "#ffe5e5" }}
        >
          Sign Out
        </Button>
      </div>
    </>
  );
}

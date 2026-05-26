import { useQuery } from "react-query";
import axios from "axios";

// Stryker disable next-line BlockStatement
export function useSystemInfo() {
  return useQuery(
    "systemInfo",
    async () => {
      try {
        const response = await axios.get("/api/systemInfo");
        return response.data;
      } catch (e) {
        console.error("Error invoking axios.get: ", e);
        return {};
      }
    },
    // Stryker disable next-line ObjectLiteral
    {
      initialData: {
        initialData: true,
        springH2ConsoleEnabled: false,
        // Stryker disable next-line BooleanLiteral
        showSwaggerUILink: false,
      },
    },
  );
}

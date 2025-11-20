import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { toast } from "react-toastify";

export function useBackend(queryKey, axiosParameters, initialData) {
  return useQuery(
    queryKey,
    async () => {
      try {
        const response = await axios(axiosParameters);
        return response.data;
      } catch (e) {
        const status = e.response?.status;
        const url = axiosParameters.url;

        if (url.includes("/api/diningcommons") && status == 500) {
          const parts = url.split("/");
          const date = parts[3];
          const diningCommon = parts[4];

          const errorMessage = `${diningCommon} is closed on ${date}. Please select another date or dining common.`;
          toast(errorMessage);
          console.error("Dining Commons API Error:", e);
          throw e;
        }

        const errorMessage = `Error communicating with backend via ${axiosParameters.method} on ${axiosParameters.url}`;
        console.error(errorMessage, e);
        toast(errorMessage);
        throw e;
      }
    },
    {
      initialData,
    },
  );
}

const reportAxiosError = (error) => {
  console.error("Axios Error:", error);
  toast(`Axios Error: ${error}`);
  return null;
};

const wrappedParams = async (params) => {
  try {
    return await (
      await axios(params)
    ).data;
  } catch (rejectedValue) {
    reportAxiosError(rejectedValue);
    throw rejectedValue;
  }
};

export function useBackendMutation(
  objectToAxiosParams,
  useMutationParams,
  queryKey = null,
) {
  const queryClient = useQueryClient();

  return useMutation((object) => wrappedParams(objectToAxiosParams(object)), {
    onError: (data) => {
      toast(`${data}`);
    },
    // Stryker disable all: Not sure how to set up the complex behavior needed to test this
    onSettled: () => {
      if (queryKey !== null) queryClient.invalidateQueries(queryKey);
    },
    // Stryker restore all
    retry: false,
    ...useMutationParams,
  });
}

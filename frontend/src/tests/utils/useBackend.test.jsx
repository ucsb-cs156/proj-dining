import { QueryClient, QueryClientProvider } from "react-query";
import { renderHook, waitFor, act } from "@testing-library/react";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { vi } from "vitest";

vi.mock("react-router");

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    toast: (x) => mockToast(x),
  };
});

describe("utils/useBackend tests", () => {
  beforeEach(() => {
    vi.spyOn(console, "error");
    console.error.mockImplementation(() => null);
  });

  afterEach(() => {
    console.error.mockRestore();
    mockToast.mockClear();
  });

  describe("utils/useBackend useBackend tests", () => {
    test("useBackend handles 404 error correctly", async () => {
      // See: https://react-query.tanstack.com/guides/testing#turn-off-retries
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            // ✅ turns retries off
            retry: false,
          },
        },
      });
      const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      var axiosMock = new AxiosMockAdapter(axios);

      axiosMock.onGet("/api/admin/users").reply(404, {});

      const { result } = renderHook(
        () =>
          useBackend(
            ["/api/admin/users"],
            { method: "GET", url: "/api/admin/users" },
            ["initialData"],
          ),
        { wrapper },
      );

      await waitFor(() => result.current.isError);

      expect(result.current.data).toEqual(["initialData"]);
      await waitFor(() => expect(console.error).toHaveBeenCalled());
      const errorMessage = console.error.mock.calls[0][0];
      expect(errorMessage).toMatch(
        "Error communicating with backend via GET on /api/admin/users",
      );
    });
  });
  describe("utils/useBackend useBackendMutation tests", () => {
    test("useBackendMutation handles success correctly", async () => {
      // See: https://react-query.tanstack.com/guides/testing#turn-off-retries
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            // ✅ turns retries off
            retry: false,
          },
        },
      });
      const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      var axiosMock = new AxiosMockAdapter(axios);

      axiosMock.onPost("/api/recommendationrequest/post").reply(202, {
        id: 17,
        professorName: "test",
        professorEmail: "testemail@ucsb.edu",
        requesterName: "testname1",
        submissionDate: "2022-02-02T12:00",
        completionDate: "2022-02-02T12:00",
        status: "PENDING",
        details: "test details",
        recommendationTypes: "test",
      });

      const objectToAxiosParams = (request) => ({
        url: "/api/recommendationrequest/post",
        method: "POST",
        params: {
          professorName: request.professorName,
          professorEmail: request.professorEmail,
          requesterName: request.requesterName,
          submissionDate: request.submissionDate,
          completionDate: request.completionDate,
          status: request.status,
          details: request.details,
          recommendationTypes: request.recommendationTypes,
        },
      });

      const onSuccess = vi.fn().mockImplementation((request) => {
        mockToast(
          `New recommendation Created - id: ${request.id} requester name: ${request.requesterName}`,
        );
      });

      const { result } = renderHook(
        () =>
          useBackendMutation(objectToAxiosParams, { onSuccess }, [
            "/api/recommendationrequest/all",
          ]),
        { wrapper },
      );

      const mutation = result.current;
      act(() =>
        mutation.mutate({
          professorName: "test",
          professorEmail: "testemail@ucsb.edu",
          requesterName: "testname1",
          submissionDate: "2022-02-02T12:00",
          completionDate: "2022-02-02T12:00",
          status: "PENDING",
          details: "test details",
          recommendationTypes: "test",
        }),
      );

      await waitFor(() => expect(onSuccess).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "New recommendation Created - id: 17 requester name: testname1",
      );
    });
    test("useBackendMutation handles error correctly", async () => {
      // See: https://react-query.tanstack.com/guides/testing#turn-off-retries
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            // ✅ turns retries off
            retry: false,
          },
        },
      });
      const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const axiosMock = new AxiosMockAdapter(axios);
      axiosMock.onPost("/api/recommendationrequest/post").reply(404);

      const objectToAxiosParams = (request) => ({
        url: "/api/recommendationrequest/post",
        method: "POST",
        params: {
          professorName: request.professorName,
          professorEmail: request.professorEmail,
          requesterName: request.requesterName,
          submissionDate: request.submissionDate,
          completionDate: request.completionDate,
          status: request.status,
          details: request.details,
          recommendationTypes: request.recommendationTypes,
        },
      });

      const onSuccess = vi.fn().mockImplementation((request) => {
        mockToast(
          `New recommendation Created - id: ${request.id} requester name: ${request.requesterName}`,
        );
      });

      const { result } = renderHook(
        () => useBackendMutation(objectToAxiosParams, { onSuccess }),
        { wrapper },
      );

      const mutation = result.current;

      mutation.mutate(
        {
          professorName: "test",
          professorEmail: "testemail@ucsb.edu",
          requesterName: "testname1",
          submissionDate: "2022-02-02T12:00",
          completionDate: "2022-02-02T12:00",
          status: "PENDING",
          details: "test details",
          recommendationTypes: "test",
        },
        {
          onError: (e) =>
            console.error(
              "onError from mutation.mutate called!",
              String(e).substring(0, 199),
            ),
        },
      );

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledTimes(2);
      expect(mockToast).toHaveBeenCalledWith(
        "Axios Error: Error: Request failed with status code 404",
      );
      expect(mockToast).toHaveBeenCalledWith(
        "Error: Request failed with status code 404",
      );

      expect(console.error).toHaveBeenCalledTimes(3);
      const errorMessage0 = console.error.mock.calls[0][0];
      expect(errorMessage0).toMatch(/Axios Error:/);
      const errorMessage1 = console.error.mock.calls[1][0];
      expect(errorMessage1.message).toMatch(
        /Request failed with status code 404/,
      );
      const errorMessage2 = console.error.mock.calls[2][0];
      expect(errorMessage2).toMatch(/onError from mutation.mutate called!/);
    });
  });
});

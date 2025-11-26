import {
  cellToAxiosParamsApprove,
  cellToAxiosParamsReject,
  onModerateSuccess,
} from "main/utils/Aliases";
import mockConsole from "tests/testutils/mockConsole";
import { vi } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("Aliases Utils", () => {
  describe("cellToAxiosParamsApprove", () => {
    test("returns the correct params for APPROVED", () => {
      const cell = {
        row: {
          original: {
            id: 42,
            proposedAlias: "vn_test",
          },
        },
      };

      const result = cellToAxiosParamsApprove(cell);

      expect(result).toEqual({
        url: "/api/currentUser/updateAliasModeration",
        method: "PUT",
        params: {
          id: 42,
          approved: true,
          proposedAlias: "vn_test",
        },
      });
    });
  });

  describe("cellToAxiosParamsReject", () => {
    test("returns the correct params for REJECTED", () => {
      const cell = {
        row: {
          original: {
            id: 42,
            proposedAlias: "vn_test",
          },
        },
      };

      const result = cellToAxiosParamsReject(cell);

      expect(result).toEqual({
        url: "/api/currentUser/updateAliasModeration",
        method: "PUT",
        params: {
          id: 42,
          approved: false,
          proposedAlias: "vn_test",
        },
      });
    });
  });

  describe("onModerateSuccess", () => {
    test("It puts the message on console.log and in a toast", () => {
      const restoreConsole = mockConsole();

      onModerateSuccess();

      expect(console.log).toHaveBeenCalledWith("Moderation success");
      expect(mockToast).toHaveBeenCalledWith("Moderation success");

      restoreConsole();
    });
  });
});

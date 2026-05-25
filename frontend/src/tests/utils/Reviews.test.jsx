import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
  cellToAxiosParamsModerate,
  onModerateSuccess,
} from "main/utils/Reviews";
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

describe("Reviews", () => {
  describe("onDeleteSuccess", () => {
    test("It puts the message on console.log and in a toast", () => {
      // arrange
      const restoreConsole = mockConsole();

      // act
      onDeleteSuccess("abc");

      // assert
      expect(mockToast).toHaveBeenCalledWith("abc");
      expect(console.log).toHaveBeenCalled();
      const message = console.log.mock.calls[0][0];
      expect(message).toMatch("abc");

      restoreConsole();
    });
  });
  describe("cellToAxiosParamsDelete", () => {
    test("It returns the correct params", () => {
      const cell = {
        row: {
          original: {
            id: 42,
          },
        },
      };

      const result = cellToAxiosParamsDelete(cell);

      expect(result).toEqual({
        url: "/api/reviews/reviewer",
        method: "DELETE",
        params: {
          id: 42,
        },
      });
    });
  });

  describe("cellToAxiosParamsModerate", () => {
    test("It returns the correct params for APPROVED with comments", () => {
      const cell = {
        row: {
          original: {
            id: 42,
          },
        },
      };

      const result = cellToAxiosParamsModerate(cell, "APPROVED", "Looks good!");

      expect(result).toEqual({
        url: "/api/reviews/moderate",
        method: "PUT",
        params: {
          id: 42,
          status: "APPROVED",
          moderatorComments: "Looks good!",
        },
      });
    });

    test("It returns the correct params for REJECTED with comments", () => {
      const cell = {
        row: {
          original: {
            id: 99,
          },
        },
      };

      const result = cellToAxiosParamsModerate(
        cell,
        "REJECTED",
        "Inappropriate content",
      );

      expect(result).toEqual({
        url: "/api/reviews/moderate",
        method: "PUT",
        params: {
          id: 99,
          status: "REJECTED",
          moderatorComments: "Inappropriate content",
        },
      });
    });
  });

  describe("onModerateSuccess", () => {
    test("It puts the message on console.log and in a toast", () => {
      const restoreConsole = mockConsole();

      onModerateSuccess();

      expect(console.log).toHaveBeenCalled();
      const message = console.log.mock.calls[0][0];
      expect(message).toMatch("Moderation success");
      restoreConsole();
    });
  });
});

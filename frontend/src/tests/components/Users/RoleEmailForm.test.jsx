import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import RoleEmailForm from "main/components/Users/RoleEmailForm";
import { vi } from "vitest";

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    useNavigate: () => mockNavigate,
  };
});

describe("RoleEmailForm tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders email input and default Create button", () => {
    const submitAction = vi.fn();

    render(
      <MemoryRouter>
        <RoleEmailForm submitAction={submitAction} />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  test("renders a custom button label", () => {
    const submitAction = vi.fn();

    render(
      <MemoryRouter>
        <RoleEmailForm
          submitAction={submitAction}
          buttonLabel="Add Moderator"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Add Moderator")).toBeInTheDocument();
  });

  test("submits the email when it is valid", async () => {
    const submitAction = vi.fn();

    render(
      <MemoryRouter>
        <RoleEmailForm submitAction={submitAction} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@ucsb.edu" },
    });
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith(
        { email: "test@ucsb.edu" },
        expect.anything(),
      );
    });
  });

  test("requires a valid email", async () => {
    const submitAction = vi.fn();

    render(
      <MemoryRouter>
        <RoleEmailForm submitAction={submitAction} />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByText("Create"));

    expect(
      await screen.findByText("A valid email is required."),
    ).toBeInTheDocument();
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("cancel navigates back", () => {
    const submitAction = vi.fn();

    render(
      <MemoryRouter>
        <RoleEmailForm submitAction={submitAction} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Cancel"));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});

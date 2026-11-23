import { fireEvent, render, screen } from "@testing-library/react";
import { HelpDrawer } from "../HelpDrawer";

describe("HelpDrawer", () => {
  it("opens from the header and explains storage and the backup contract", async () => {
    render(<HelpDrawer />);

    fireEvent.click(screen.getByRole("button", { name: "Help" }));

    expect(await screen.findByText("Storage and limitations")).toBeInTheDocument();
    expect(screen.getByText("JSON backup contract")).toBeInTheDocument();
    expect(screen.getByText(/Clearing site data removes projects and tasks/)).toBeInTheDocument();
    expect(screen.getByText(/"version": 1/)).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import BuildingDetails, { type BuildingOption } from "./BuildingDetails";

const buildings: BuildingOption[] = [
  { id: "1", label: "Bygning A", buildingNumber: "101" },
  { id: "2", label: "Bygning B", buildingNumber: "102" },
];

describe("BuildingDetails", () => {
  it("renders one button per building", () => {
    render(<BuildingDetails buildings={buildings} />);
    expect(screen.getByRole("button", { name: /Bygning A/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Bygning B/ })).toBeInTheDocument();
  });

  it("sets aria-pressed=true and reveals details when a building is selected", () => {
    render(<BuildingDetails buildings={buildings} />);

    const button = screen.getByRole("button", { name: /Bygning A/ });
    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("region", { name: /Bygningsinfo/i })).toBeInTheDocument();
  });

  it("collapses details when the active building is clicked again", () => {
    render(<BuildingDetails buildings={buildings} />);

    const button = screen.getByRole("button", { name: /Bygning A/ });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("region", { name: /Bygningsinfo/i })).not.toBeInTheDocument();
  });
});

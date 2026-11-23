import { act, render, screen } from "@testing-library/react";

import { OptimizedImage } from "../OptimizedImage";

class FakeImage {
  static instances: FakeImage[] = [];
  onload: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  decoding = "";
  naturalWidth = 400;
  naturalHeight = 300;
  src = "";

  constructor() {
    FakeImage.instances.push(this);
  }
}

describe("OptimizedImage", () => {
  const OriginalImage = global.Image;
  const originalCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    FakeImage.instances = [];
    global.Image = FakeImage as unknown as typeof Image;
    jest
      .spyOn(document, "createElement")
      .mockImplementation(((tagName: string) => {
        if (tagName === "canvas") {
          return {
            width: 0,
            height: 0,
            getContext: () => ({ drawImage: jest.fn() }),
            toDataURL: () => "data:image/jpeg;base64,optimized",
          };
        }
        return originalCreateElement(tagName);
      }) as typeof document.createElement);
  });

  afterEach(() => {
    global.Image = OriginalImage;
    jest.restoreAllMocks();
  });

  it("optimizes the image and uses the generated source", async () => {
    render(
      <OptimizedImage
        src="https://example.com/ok.jpg"
        alt="Task image"
        width={400}
        height={300}
      />
    );

    act(() => {
      FakeImage.instances[0].onload?.(new Event("load"));
    });

    expect(await screen.findByAltText("Task image")).toHaveAttribute(
      "src",
      "data:image/jpeg;base64,optimized"
    );
  });

  it("shows a sized fallback when the image fails", async () => {
    render(
      <OptimizedImage
        src="https://example.com/broken.jpg"
        alt="Broken image"
        width={400}
        height={300}
      />
    );

    act(() => {
      FakeImage.instances[0].onerror?.(new Event("error"));
    });

    const fallback = await screen.findByRole("img", { name: "Broken image" });
    expect(fallback).toHaveTextContent("Failed to load image");
    expect(fallback).toHaveStyle({ width: "240px", height: "180px" });
  });
});

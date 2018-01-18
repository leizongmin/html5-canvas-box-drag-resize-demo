namespace LCB {
  export class ImageBox extends Box {
    public imageSrc: string;
    private image: HTMLImageElement;

    constructor() {
      super();
      this.setFunction((ctx, rect, box) => {
        const img = this.image;
        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          rect.left,
          rect.top,
          rect.width,
          rect.height
        );
      });
    }

    public setImage(src: string): void {
      this.imageSrc = src;
      this.image = document.createElement("img");
      this.image.src = src;
      this.image.onload = () => {
        this.isReady = true;
      };
    }
  }
}

namespace LCB {
  export class TextBox extends Box {
    public text: string;
    public font: string;
    public color: string;

    constructor() {
      super();
      this.setFunction((ctx, rect, box) => {
        const center = Utils.getRectCenter(rect);
        ctx.font = this.font;
        ctx.textAlign = "center";
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, center.left, center.top, rect.width);
      });
    }

    public setText(text: string): void {
      this.text = text;
      this.isReady = true;
    }

    public setFont(font: string): void {
      this.font = font;
    }

    public setColor(color: string): void {
      this.color = color;
    }
  }
}

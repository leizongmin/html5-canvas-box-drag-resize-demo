namespace LCB {
  export interface Point {
    left: number;
    top: number;
  }

  export interface Rect extends Point {
    width: number;
    height: number;
  }

  export interface Border {
    width: number;
    color: string;
    style: string;
  }

  export interface BoxProps {
    rect: Rect;
    border: Border;
  }

  export function getInitialBoxProps(): BoxProps {
    return {
      rect: { top: 10, left: 10, width: 100, height: 100 },
      border: { width: 1, color: "rgb(0,0,255)", style: "line" }
    };
  }

  export type BoxRenderFunction = (
    ctx: Context2D,
    rect: Rect,
    box: Box
  ) => void;

  export type Context2D = CanvasRenderingContext2D;

  export function emptyBoxRenderFunction(): void {}

  export function getLineDash(style: string): number[] {
    switch (style) {
      case "dash":
        return [4, 2];
      default:
        return [];
    }
  }

  export class Box {
    private props: BoxProps = getInitialBoxProps();
    private renderFn: BoxRenderFunction = emptyBoxRenderFunction;
    private isEditing: boolean = false;

    public getRect(): Rect {
      return this.props.rect;
    }

    public setRect(rect: Partial<Rect>): void {
      if ("left" in rect) this.props.rect.left = rect.left as number;
      if ("top" in rect) this.props.rect.top = rect.top as number;
      if ("width" in rect) this.props.rect.width = rect.width as number;
      if ("height" in rect) this.props.rect.height = rect.height as number;
    }

    public setBorder(border: Partial<Border>): void {
      if ("width" in border) this.props.border.width = border.width as number;
      if ("color" in border) this.props.border.color = border.color as string;
      if ("style" in border) this.props.border.style = border.style as string;
    }

    public setFunction(fn: BoxRenderFunction): void {
      this.renderFn = fn;
    }

    private drawEditableBorder(ctx: Context2D) {
      const rect = this.props.rect;
      const border = this.props.border;

      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = 'black';
      ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
      ctx.globalAlpha = 1;

      Utils.drawRectLine(
        ctx,
        rect.left,
        rect.top,
        rect.width,
        rect.height,
        "black"
      );
      const pw = 6;
      const pwh = pw / 2;
      ctx.fillStyle = "black";
      ctx.fillRect(rect.left - pwh, rect.top - pwh, pw, pw);
      ctx.fillRect(rect.left + rect.width - pwh, rect.top - pwh, pw, pw);
      ctx.fillRect(rect.left - pwh, rect.top + rect.height - pwh, pw, pw);
      ctx.fillRect(
        rect.left + rect.width - pwh,
        rect.top + rect.height - pwh,
        pw,
        pw
      );

      ctx.restore();
    }

    public setEditable(ctx: Context2D) {
      this.isEditing = true;
      this.drawEditableBorder(ctx);
    }

    public setNormal() {
      this.isEditing = false;
    }

    public render(ctx: Context2D) {
      const rect = this.props.rect;
      const border = this.props.border;
      ctx.save();
      this.renderFn(ctx, rect, this);
      ctx.restore();
    }
  }
}

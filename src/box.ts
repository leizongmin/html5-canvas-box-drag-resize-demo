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
    corners: Corners;
  }

  export interface Corners {
    leftTop: Rect;
    rightTop: Rect;
    leftBottom: Rect;
    rightBottom: Rect;
  }

  export type CornerName = keyof Corners;

  export function getInitialBoxProps(): BoxProps {
    const rect = { top: 10, left: 10, width: 100, height: 100 };
    return {
      rect,
      border: { width: 1, color: "rgb(0,0,255)", style: "line" },
      corners: getRectCorners(rect)
    };
  }

  export function getRectCorners(rect: Rect): Corners {
    const pw = 6;
    const pwh = pw / 2;
    return {
      leftTop: {
        left: rect.left - pwh,
        top: rect.top - pwh,
        width: pw,
        height: pw
      },
      rightTop: {
        left: rect.left + rect.width - pwh,
        top: rect.top - pwh,
        width: pw,
        height: pw
      },
      leftBottom: {
        left: rect.left - pwh,
        top: rect.top + rect.height - pwh,
        width: pw,
        height: pw
      },
      rightBottom: {
        left: rect.left + rect.width - pwh,
        top: rect.top + rect.height - pwh,
        width: pw,
        height: pw
      }
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
    public isReady: boolean = false;

    private props: BoxProps = getInitialBoxProps();
    private renderFn: BoxRenderFunction = emptyBoxRenderFunction;
    private isEditing: boolean = false;

    public getRect(): Rect {
      return this.props.rect;
    }

    public getCorners(): Corners {
      return this.props.corners;
    }

    public setRect(rect: Partial<Rect>): void {
      if ("left" in rect) this.props.rect.left = rect.left as number;
      if ("top" in rect) this.props.rect.top = rect.top as number;
      if ("width" in rect) this.props.rect.width = rect.width as number;
      if ("height" in rect) this.props.rect.height = rect.height as number;
      this.props.corners = getRectCorners(this.props.rect);
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
      const corners = this.props.corners;
      const border = this.props.border;

      ctx.save();
      // ctx.globalAlpha = 0.05;
      // ctx.fillStyle = 'black';
      // ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
      // ctx.globalAlpha = 1;

      Utils.drawRectLine(
        ctx,
        rect.left,
        rect.top,
        rect.width,
        rect.height,
        "black",
        0.5
      );
      ctx.fillStyle = "black";
      const fillRect = (r: Rect) => {
        ctx.fillRect(r.left, r.top, r.width, r.height);
      };
      fillRect(corners.leftTop);
      fillRect(corners.leftBottom);
      fillRect(corners.rightTop);
      fillRect(corners.rightBottom);

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
      if (this.isEditing) {
        this.drawEditableBorder(ctx);
      }
    }

    public getControlTypeByPoint(left: number, top: number) {
      const rect = this.props.rect;
    }
  }
}
